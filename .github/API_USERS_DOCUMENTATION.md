# Documentación API - Endpoints `/api/users`

## Información General

- **Base URL**: `/api/users`
- **Autenticación**: Requerida (Bearer Token JWT)
- **Content-Type**: `application/json`

---

## Endpoints Disponibles

### 1. Listar Todos los Usuarios

**Descripción**: Obtiene la lista completa de usuarios registrados en el sistema.

**Endpoint**: `GET /api/users`

**Autenticación**: Requerida (ADMIN o USER)

**Headers**:
```
Authorization: Bearer {token}
```

**Respuestas**:

- **200 OK**: Lista de usuarios obtenida exitosamente
  ```json
  [
    {
      "id": 1,
      "name": "Juan",
      "lastName": "Florez",
      "email": "juan.florez@gmail.com",
      "createdAt": "2025-01-15T10:30:00"
    },
    {
      "id": 2,
      "name": "María",
      "lastName": "García",
      "email": "maria.garcia@gmail.com",
      "createdAt": "2025-01-16T14:20:00"
    }
  ]
  ```

- **401 Unauthorized**: No autenticado
- **403 Forbidden**: No autorizado

---

### 2. Obtener Usuario por ID

**Descripción**: Obtiene los detalles de un usuario específico mediante su ID.

**Endpoint**: `GET /api/users/{id}`

**Autenticación**: Requerida (ADMIN o USER)

**Parámetros de URL**:
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | Long | ID del usuario (requerido) |

**Headers**:
```
Authorization: Bearer {token}
```

**Ejemplo de Solicitud**:
```
GET /api/users/1
```

**Respuestas**:

- **200 OK**: Usuario encontrado
  ```json
  {
    "id": 1,
    "name": "Juan",
    "lastName": "Florez",
    "email": "juan.florez@gmail.com",
    "createdAt": "2025-01-15T10:30:00"
  }
  ```

- **404 Not Found**: Usuario no encontrado
- **401 Unauthorized**: No autenticado
- **403 Forbidden**: No autorizado

---

### 3. Crear Usuario

**Descripción**: Crea un nuevo usuario en el sistema. Solo accesible para administradores.

**Endpoint**: `POST /api/users`

**Autenticación**: Requerida (solo ADMIN)

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body (JSON)**:
```json
{
  "name": "Juan",
  "lastName": "Florez",
  "email": "juan.florez@gmail.com",
  "password": "miPassword123"
}
```

**Campos del Body**:
| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| name | String | Nombre del usuario (requerido) | "Juan" |
| lastName | String | Apellido del usuario (requerido) | "Florez" |
| email | String | Email del usuario (requerido, único) | "juan.florez@gmail.com" |
| password | String | Contraseña (requerido, será hasheada con SHA-256) | "miPassword123" |

**Respuestas**:

- **201 Created**: Usuario creado exitosamente
  ```json
  {
    "id": 3,
    "name": "Juan",
    "lastName": "Florez",
    "email": "juan.florez@gmail.com",
    "createdAt": "2025-12-19T15:45:30"
  }
  ```

- **400 Bad Request**: Datos inválidos o email ya existe
  ```
  El email ya está registrado
  ```

- **401 Unauthorized**: No autenticado
- **403 Forbidden**: Solo ADMIN puede crear usuarios

---

### 4. Actualizar Usuario

**Descripción**: Actualiza los datos de un usuario existente. Solo accesible para administradores.

**Endpoint**: `PUT /api/users/{id}`

**Autenticación**: Requerida (solo ADMIN)

**Parámetros de URL**:
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | Long | ID del usuario a actualizar (requerido) |

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body (JSON)**:
```json
{
  "name": "Juan Carlos",
  "lastName": "Florez",
  "email": "juan.florez@gmail.com",
  "password": "nuevaPassword456"
}
```

**Campos del Body**:
| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| name | String | Nombre del usuario | "Juan Carlos" |
| lastName | String | Apellido del usuario | "Florez" |
| email | String | Email del usuario (único) | "juan.florez@gmail.com" |
| password | String | Nueva contraseña (será hasheada con SHA-256) | "nuevaPassword456" |

**Ejemplo de Solicitud**:
```
PUT /api/users/1
```

**Respuestas**:

- **200 OK**: Usuario actualizado exitosamente
  ```json
  {
    "id": 1,
    "name": "Juan Carlos",
    "lastName": "Florez",
    "email": "juan.florez@gmail.com",
    "createdAt": "2025-01-15T10:30:00"
  }
  ```

- **400 Bad Request**: Datos inválidos o usuario no encontrado
  ```
  Usuario no encontrado
  ```

- **401 Unauthorized**: No autenticado
- **403 Forbidden**: Solo ADMIN puede actualizar usuarios

---

### 5. Eliminar Usuario

**Descripción**: Elimina un usuario del sistema. Solo accesible para administradores.

**Endpoint**: `DELETE /api/users/{id}`

**Autenticación**: Requerida (solo ADMIN)

**Parámetros de URL**:
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | Long | ID del usuario a eliminar (requerido) |

**Headers**:
```
Authorization: Bearer {token}
```

**Ejemplo de Solicitud**:
```
DELETE /api/users/1
```

**Respuestas**:

- **200 OK**: Usuario eliminado exitosamente
  ```
  Usuario eliminado exitosamente
  ```

- **400 Bad Request**: Usuario no encontrado
  ```
  Usuario no encontrado
  ```

- **401 Unauthorized**: No autenticado
- **403 Forbidden**: Solo ADMIN puede eliminar usuarios

---

## Notas Importantes

### Autenticación
- Todos los endpoints requieren un token JWT válido en el header `Authorization`
- Formato: `Authorization: Bearer {token}`
- El token se obtiene del endpoint `/api/auth/login`

### Permisos
- **ADMIN**: Acceso completo a todos los endpoints
- **USER**: Solo puede listar usuarios y obtener usuarios por ID

### Seguridad
- Las contraseñas se hashean con SHA-256 antes de almacenarse
- El email debe ser único en el sistema
- Los endpoints de creación, actualización y eliminación están protegidos a nivel ADMIN

### Formato de Fechas
- Las fechas siguen el formato ISO 8601: `YYYY-MM-DDTHH:mm:ss`
- Ejemplo: `2025-12-19T15:45:30`

---

## Ejemplos de Uso

### Ejemplo con cURL - Listar Usuarios
```bash
curl -X GET "http://localhost:8080/api/users" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Ejemplo con cURL - Crear Usuario
```bash
curl -X POST "http://localhost:8080/api/users" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan",
    "lastName": "Florez",
    "email": "juan.florez@gmail.com",
    "password": "miPassword123"
  }'
```

### Ejemplo con cURL - Actualizar Usuario
```bash
curl -X PUT "http://localhost:8080/api/users/1" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Carlos",
    "lastName": "Florez",
    "email": "juan.florez@gmail.com",
    "password": "nuevaPassword456"
  }'
```

### Ejemplo con cURL - Eliminar Usuario
```bash
curl -X DELETE "http://localhost:8080/api/users/1" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Errores Comunes

| Código | Descripción | Solución |
|--------|-------------|----------|
| 401 | Token no válido o expirado | Obtener un nuevo token con `/api/auth/login` |
| 403 | Usuario no tiene permisos | Verificar que el usuario tenga rol ADMIN para operaciones de escritura |
| 400 | Email ya existe | Usar un email diferente |
| 404 | Usuario no encontrado | Verificar que el ID del usuario sea correcto |

---

**Fecha de actualización**: 19 de diciembre de 2025
