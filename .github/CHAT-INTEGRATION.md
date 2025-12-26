# WebSocket Chat Backend - Guía de Integración Frontend

## 🔌 Endpoints Disponibles

### REST API

#### 1. Conectar Usuario
```
POST /api/users/connect
Content-Type: application/json

{
  "userId": "user123"
}

Response:
{
  "status": "connected",
  "userId": "user123",
  "message": "Usuario conectado exitosamente"
}
```

#### 2. Enviar Mensaje
```
POST /api/chat/send
Content-Type: application/json

{
  "senderId": "user1",
  "receiverId": "user2",
  "content": "Hola, ¿cómo estás?"
}

Response:
{
  "messageId": "uuid-here",
  "senderId": "user1",
  "receiverId": "user2",
  "content": "Hola, ¿cómo estás?",
  "timestamp": "2025-12-19T19:30:00",
  "status": "DELIVERED"
}
```

#### 3. Obtener Historial de Conversación
```
GET /api/chat/conversation?user1=user1&user2=user2

Response: Array de mensajes
[
  {
    "messageId": "...",
    "senderId": "user1",
    "receiverId": "user2",
    "content": "Hola",
    "timestamp": "2025-12-19T19:30:00",
    "status": "READ"
  }
]
```

#### 4. Ver Estado de Usuario
```
GET /api/users/status/user123

Response:
{
  "userId": "user123",
  "connected": true,
  "queueName": "chat-queue-user123"
}
```

#### 5. Desconectar Usuario
```
POST /api/users/disconnect
Content-Type: application/json

{
  "userId": "user123",
  "deleteQueue": false
}
```

### WebSocket

#### Endpoint de Conexión
```
ws://localhost:8080/ws
```

#### Suscripciones (STOMP)

**Recibir mensajes:**
```
/topic/messages/{userId}
```

**Recibir notificaciones de estado:**
```
/topic/status/{userId}
```

## 💻 Ejemplo de Integración Frontend

### JavaScript (SockJS + STOMP)

```html
<!DOCTYPE html>
<html>
<head>
    <title>Chat App</title>
    <script src="https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/stompjs@2.3.3/lib/stomp.min.js"></script>
</head>
<body>
    <div id="chat">
        <input id="userId" placeholder="Tu ID" value="user1">
        <button onclick="connect()">Conectar</button>
        <br><br>
        <input id="receiverId" placeholder="ID destinatario" value="user2">
        <input id="message" placeholder="Mensaje">
        <button onclick="sendMessage()">Enviar</button>
        <div id="messages"></div>
    </div>

    <script>
        let stompClient = null;
        let currentUserId = null;

        function connect() {
            currentUserId = document.getElementById('userId').value;
            
            // 1. Conectar usuario via REST
            fetch('http://localhost:8080/api/users/connect', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({userId: currentUserId})
            })
            .then(response => response.json())
            .then(data => {
                console.log('Usuario conectado:', data);
                
                // 2. Conectar WebSocket
                const socket = new SockJS('http://localhost:8080/ws');
                stompClient = Stomp.over(socket);
                
                stompClient.connect({}, function(frame) {
                    console.log('WebSocket conectado');
                    
                    // 3. Suscribirse a mensajes
                    stompClient.subscribe('/topic/messages/' + currentUserId, function(message) {
                        const msg = JSON.parse(message.body);
                        showMessage(msg);
                    });
                    
                    // 4. Suscribirse a notificaciones
                    stompClient.subscribe('/topic/status/' + currentUserId, function(status) {
                        console.log('Status:', status.body);
                    });
                });
            });
        }

        function sendMessage() {
            const receiverId = document.getElementById('receiverId').value;
            const content = document.getElementById('message').value;
            
            fetch('http://localhost:8080/api/chat/send', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    senderId: currentUserId,
                    receiverId: receiverId,
                    content: content
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Mensaje enviado:', data);
                document.getElementById('message').value = '';
            });
        }

        function showMessage(message) {
            const div = document.createElement('div');
            div.innerHTML = `<strong>${message.senderId}:</strong> ${message.content}`;
            document.getElementById('messages').appendChild(div);
        }
    </script>
</body>
</html>
```

### React Example

```jsx
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

class ChatComponent {
  connectUser(userId) {
    // 1. REST: Conectar usuario
    fetch('http://localhost:8080/api/users/connect', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({userId})
    });

    // 2. WebSocket: Conectar
    const socket = new SockJS('http://localhost:8080/ws');
    this.stompClient = Stomp.over(socket);
    
    this.stompClient.connect({}, () => {
      // 3. Suscribirse a mensajes
      this.stompClient.subscribe(`/topic/messages/${userId}`, (message) => {
        const msg = JSON.parse(message.body);
        this.handleNewMessage(msg);
      });
    });
  }

  sendMessage(senderId, receiverId, content) {
    fetch('http://localhost:8080/api/chat/send', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({senderId, receiverId, content})
    });
  }
}
```

## 🔄 Flujo Completo

1. **Usuario se conecta:**
   - Frontend → `POST /api/users/connect` → Crea cola en RabbitMQ
   - Frontend → Conecta WebSocket → Suscribe a `/topic/messages/{userId}`

2. **Usuario envía mensaje:**
   - Frontend → `POST /api/chat/send`
   - Backend → Kafka (historial)
   - Backend → WebSocket (si destinatario conectado) o RabbitMQ (si desconectado)

3. **Usuario recibe mensaje:**
   - Backend → WebSocket → Frontend via `/topic/messages/{userId}`

4. **Usuario obtiene historial:**
   - Frontend → `GET /api/chat/conversation?user1=x&user2=y`

## 📦 Dependencias Frontend

```bash
npm install sockjs-client @stomp/stompjs
```

## 🚀 Para Probar

1. Levanta el backend: `./gradlew bootRun`
2. Abre el archivo HTML en dos navegadores diferentes
3. Conecta como user1 en uno y user2 en otro
4. ¡Envía mensajes!
