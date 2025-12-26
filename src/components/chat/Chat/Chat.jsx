import { useState, useEffect, useRef } from 'react';
import './Chat.css';
import * as chatService from '../../../services/chatService';
import * as userService from '../../../services/userService';
import { getProfile } from '../../../services/profileService';

export default function Chat() {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);
  const messageSubscriptionRef = useRef(null);
  const selectedContactRef = useRef(null);

  // Keep ref in sync with state
  useEffect(() => {
    selectedContactRef.current = selectedContact;
  }, [selectedContact]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat system
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Check authentication
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Usuario no autenticado');
          setLoading(false);
          return;
        }

        // Get current user profile (includes ID)
        const profileResult = await getProfile();
        if (!profileResult.success) {
          throw new Error(profileResult.error);
        }

        const user = profileResult.data;
        setCurrentUser(user);

        // Usar email como userId para el sistema de chat
        const userId = user.email;
        console.log('Initializing chat for user:', userId);

        // Connect to chat system
        const connectResult = await chatService.connectUser(userId);
        if (!connectResult.success) {
          throw new Error(connectResult.error);
        }

        // Subscribe to incoming messages
        const subscription = chatService.subscribeToMessages(
          userId,
          (message) => {
            // Only add message if it's from/to the currently selected contact
            const currentContact = selectedContactRef.current;
            const messageSenderId = String(message.senderId || '');
            const messageReceiverId = String(message.receiverId || '');
            const currentContactId = currentContact ? currentContact.email : '';
            
            // Check if message involves the current conversation
            const isRelevant = currentContact && (
              (messageSenderId === currentContactId && messageReceiverId === userId) ||
              (messageSenderId === userId && messageReceiverId === currentContactId)
            );
            
            console.log('Message received:', { 
              messageSenderId, 
              messageReceiverId, 
              userId, 
              currentContactId, 
              isRelevant 
            });
            
            if (!isRelevant) {
              return; // Ignore messages from other conversations
            }
            
            setMessages((prev) => {
              // Avoid duplicates
              if (prev.some((m) => m.messageId === message.messageId)) {
                return prev;
              }
              // Add the message to the list
              return [...prev, message];
            });
          }
        );
        messageSubscriptionRef.current = subscription;

        // Load contacts list
        const usersResult = await userService.getAllUsers();
        if (!usersResult.success) {
          throw new Error(usersResult.error);
        }

        // Filter out current user from contacts (compare both as numbers and strings)
        const contactsList = usersResult.data.filter((u) => 
          u.id !== user.id && u.id.toString() !== user.id.toString() && u.email !== user.email
        );
        setContacts(contactsList);
        setFilteredContacts(contactsList);
        setLoading(false);
      } catch (err) {
        console.error('Error initializing chat:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    initializeChat();

    // Cleanup on unmount
    return () => {
      if (messageSubscriptionRef.current) {
        messageSubscriptionRef.current.unsubscribe();
      }
      
      if (currentUser) {
        chatService.disconnectUser(currentUser.email, false);
      }
    };
  }, []);

  // Handle contact search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter(
        (contact) =>
          contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredContacts(filtered);
    }
  }, [searchTerm, contacts]);

  // Load conversation history when contact is selected
  const handleContactClick = async (contact) => {
    if (!currentUser) return;

    setSelectedContact(contact);
    setLoadingMessages(true);
    setMessages([]);

    try {
      // Usar emails como identificadores de usuario
      const userId = currentUser.email;
      const contactId = contact.email;
      
      console.log('Loading conversation:', { userId, contactId });
      
      const result = await chatService.getConversation(userId, contactId);

      if (result.success) {
        setMessages(result.data);
      } else {
        console.error('Error loading conversation:', result.error);
      }
    } catch (err) {
      console.error('Error loading conversation:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedContact || !currentUser) return;

    const content = messageInput.trim();
    setMessageInput('');

    try {
      // Usar emails como identificadores de usuario
      const userId = currentUser.email;
      const contactId = selectedContact.email;
      
      console.log('Sending message:', { userId, contactId, content });
      
      const result = await chatService.sendMessage(userId, contactId, content);

      if (result.success) {
        // Add message to local state immediately
        setMessages((prev) => [...prev, result.data]);
      } else {
        console.error('Error sending message:', result.error);
        // Restore message input on error
        setMessageInput(content);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setMessageInput(content);
    }
  };

  // Get user initials for avatar
  const getInitials = (user) => {
    if (!user) return '?';
    const firstInitial = user.name?.[0] || '';
    const lastInitial = user.lastName?.[0] || '';
    return (firstInitial + lastInitial).toUpperCase();
  };

  // Format message timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render loading state
  if (loading) {
    return (
      <div className="chat-container">
        <div className="chat-sidebar">
          <div className="contacts-loading">Cargando contactos...</div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="chat-container">
        <div className="chat-error">
          <p>Error: {error}</p>
          <button
            className="btn-primary"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* Sidebar - Contacts List */}
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h2>Mensajes</h2>
          <input
            type="text"
            className="chat-search"
            placeholder="Buscar contactos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="contacts-list">
          {filteredContacts.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
              {searchTerm ? 'No se encontraron contactos' : 'No hay contactos disponibles'}
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className={`contact-item ${
                  selectedContact?.id === contact.id ? 'active' : ''
                }`}
                onClick={() => handleContactClick(contact)}
              >
                <div className="contact-avatar">{getInitials(contact)}</div>
                <div className="contact-info">
                  <div className="contact-name">
                    {contact.name} {contact.lastName}
                  </div>
                  <div className="contact-email">{contact.email}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        {!selectedContact ? (
          <div className="chat-empty">
            <div className="chat-empty-icon">💬</div>
            <p>Selecciona un contacto para comenzar a chatear</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-header-avatar">
                {getInitials(selectedContact)}
              </div>
              <div className="chat-header-info">
                <h3>
                  {selectedContact.name} {selectedContact.lastName}
                </h3>
                <p>{selectedContact.email}</p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="chat-messages">
              {loadingMessages ? (
                <div className="chat-messages-loading">
                  Cargando mensajes...
                </div>
              ) : messages.length === 0 ? (
                <div className="chat-messages-loading">
                  No hay mensajes aún. ¡Envía el primero!
                </div>
              ) : (
                <>
                  {messages.map((message) => {
                    // Comparar emails para determinar si el mensaje fue enviado o recibido
                    const messageSenderId = message.senderId;
                    const currentUserId = currentUser?.email;
                    const isSent = messageSenderId === currentUserId;
                    const messageUser = isSent ? currentUser : selectedContact;

                    return (
                      <div
                        key={message.messageId}
                        className={`message ${isSent ? 'sent' : 'received'}`}
                      >
                        <div className="message-avatar">
                          {getInitials(messageUser)}
                        </div>
                        <div className="message-content">
                          <div className="message-bubble">{message.content}</div>
                          <div className="message-time">
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="chat-input-container">
              <div className="chat-input-wrapper">
                <textarea
                  className="chat-input"
                  placeholder="Escribe un mensaje..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  rows={1}
                />
                <button
                  type="submit"
                  className="chat-send-btn"
                  disabled={!messageInput.trim()}
                >
                  ➤
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
