import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const API_URL = '/api/chat';
const USERS_URL = 'http://localhost:8081/api/users';
const WS_URL = '/ws';

let stompClient = null;
let currentUserId = null;

/**
 * Get auth headers with Bearer token
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

/**
 * Connect user to chat system (REST + WebSocket)
 */
export const connectUser = async (userId) => {
  try {
    currentUserId = userId;
    
    // 1. REST: Connect user and create RabbitMQ queue
    const response = await fetch(`${USERS_URL}/connect`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId })
    });

    if (!response.ok) {
      throw new Error('Failed to connect user');
    }

    const data = await response.json();
    
    // 2. WebSocket: Connect via SockJS + STOMP
    return new Promise((resolve, reject) => {
      const socket = new SockJS(WS_URL);
      stompClient = Stomp.over(socket);
      
      // Disable debug logging
      stompClient.debug = () => {};
      
      stompClient.connect({}, (frame) => {
        console.log('WebSocket connected');
        resolve({ success: true, data: { ...data, stompClient } });
      }, (error) => {
        console.error('WebSocket connection error:', error);
        reject({ success: false, error: 'Failed to connect WebSocket' });
      });
    });
  } catch (error) {
    console.error('Error connecting user:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Subscribe to incoming messages for current user
 */
export const subscribeToMessages = (userId, onMessageReceived) => {
  if (!stompClient || !stompClient.connected) {
    console.error('WebSocket not connected');
    return null;
  }

  const subscription = stompClient.subscribe(`/topic/messages/${userId}`, (message) => {
    const msg = JSON.parse(message.body);
    onMessageReceived(msg);
  });

  return subscription;
};

/**
 * Subscribe to status notifications
 */
export const subscribeToStatus = (userId, onStatusReceived) => {
  if (!stompClient || !stompClient.connected) {
    console.error('WebSocket not connected');
    return null;
  }

  const subscription = stompClient.subscribe(`/topic/status/${userId}`, (status) => {
    onStatusReceived(status.body);
  });

  return subscription;
};

/**
 * Send a message to another user
 */
export const sendMessage = async (senderId, receiverId, content) => {
  try {
    const response = await fetch(`${API_URL}/send`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ senderId, receiverId, content })
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get conversation history between two users
 */
export const getConversation = async (user1, user2) => {
  try {
    const response = await fetch(`${API_URL}/conversation?user1=${user1}&user2=${user2}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to get conversation');
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error getting conversation:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get user status
 */
export const getUserStatus = async (userId) => {
  try {
    const response = await fetch(`${USERS_URL}/status/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to get user status');
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error getting user status:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Disconnect user from chat system
 */
export const disconnectUser = async (userId, deleteQueue = false) => {
  try {
    // Disconnect WebSocket
    if (stompClient && stompClient.connected) {
      stompClient.disconnect();
      stompClient = null;
    }

    // Disconnect user via REST
    const response = await fetch(`${USERS_URL}/disconnect`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, deleteQueue })
    });

    if (!response.ok) {
      throw new Error('Failed to disconnect user');
    }

    currentUserId = null;
    return { success: true };
  } catch (error) {
    console.error('Error disconnecting user:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get current STOMP client (for debugging)
 */
export const getStompClient = () => stompClient;

/**
 * Get current connected user ID
 */
export const getCurrentUserId = () => currentUserId;
