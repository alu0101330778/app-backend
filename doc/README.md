# Documentación de la API - app-back

## Índice

- [Introducción](#introducción)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Modelos de datos](#modelos-de-datos)
- [Rutas y endpoints](#rutas-y-endpoints)
- [Autenticación y seguridad](#autenticación-y-seguridad)
- [Gestión de imágenes](#gestión-de-imágenes)
- [Variables de entorno](#variables-de-entorno)
- [Testing y calidad de código](#testing-y-calidad-de-código)
- [Ejemplos de uso](#ejemplos-de-uso)
- [Notas y buenas prácticas](#notas-y-buenas-prácticas)

---

## Introducción

Este proyecto surge de la necesidad de trasladar al entorno digital una práctica emocional y reflexiva presente en varios libros del autor Felipe. En sus obras, cada página contiene una reflexión diseñada para invitar a una pausa emocional, y el lector es animado a abrir el libro aleatoriamente, confiando en que la “casualidad” conducirá a la frase adecuada para su momento vital.

Esta mecánica, basada en el concepto de sincronicidad y conexión emocional, ha sido adaptada y ampliada en una aplicación móvil. Además de permitir acceder a los contenidos de los libros desde la app, se incorpora una capa de inteligencia artificial capaz de sugerir frases basadas en el estado emocional del usuario. De este modo, se combina la experiencia de azar significativa con la personalización mediante IA.

El objetivo de la API es proporcionar los servicios necesarios para que la aplicación móvil permita al usuario acceder a reflexiones de los libros de Felipe, ya sea de forma aleatoria o mediante un sistema de recomendación personalizado basado en emociones. Además, la aplicación registra emociones mediante interacción inicial, genera gráficas de evolución emocional, muestra reflexiones acompañadas de imágenes generadas por IA, convierte las frases en audio y ofrece productos en base al perfil emocional del usuario.

La arquitectura de la API prioriza la escalabilidad, la seguridad y el cumplimiento normativo de privacidad, integrando literatura, inteligencia artificial y diseño emocional en una herramienta con potencial comercial, terapéutico y educativo.

---

## Estructura del proyecto

```
app-backend/
│
├── src/
│   ├── controllers/      # Lógica de negocio y controladores de rutas
│   ├── models/           # Definición de esquemas de Mongoose
│   ├── routes/           # Definición de rutas de la API
│   ├── middleware/       # Middlewares de autenticación y autorización
│   ├── config/           # Configuración de base de datos y emociones
│   └── index.ts          # Punto de entrada de la aplicación
│
├── tests/                # Tests unitarios y de integración (Jest + Supertest)
├── products.json         # Datos de ejemplo para la base de datos
├── images/               # Imágenes de productos (en repositorio público)
├── doc/
│   └── README.md         # Documentación detallada (este archivo)
├── README.md             # Documentación principal y guía rápida
└── ...
```

---

## Modelos de datos

### Producto

Los productos pueden ser de diferentes tipos (`book`, `suplement`, `tea`, `aromatherapy`) y comparten una estructura base:

```json
{
  "name": "The Power of Now",
  "description": "A book about the importance of living in the present.",
  "price": 18.99,
  "image": "https://raw.githubusercontent.com/alu0101330778/app-backend/main/images/power-of-now.jpg",
  "category": "book",
  "brand": "Gaia Editions",
  "stock": 10,
  "tags": ["self-help", "spirituality"],
  "isbn": "9788499089252",
  "author": "Eckhart Tolle",
  "publisher": "Gaia",
  "pages": 256,
  "language": "English"
}
```

Cada tipo de producto puede tener campos adicionales específicos (ver modelos en `src/models/products/`).

### Usuario

```json
{
  "username": "testuser",
  "email": "test@test.com",
  "password": "hashed_password",
  "favoriteSentences": [],
  "emotions": { "alegria": 2, "ira": 1 },
  "emotionsCount": 3,
  "emotionLogs": [
    { "emotions": ["alegria"], "timestamp": "2024-06-24T12:00:00Z" }
  ]
}
```

### Frase motivacional

```json
{
  "title": "Motivation",
  "body": "Keep going!",
  "end": "You can do it."
}
```

---

## Rutas y endpoints

### Productos (`/shop`)

- `GET /shop`  
  Lista todos los productos.
- `GET /shop/books`  
  Lista solo los libros.
- `GET /shop/teas`  
  Lista solo los tés.
- `GET /shop/aromatherapies`  
  Lista solo aromaterapia.
- `GET /shop/suplements`  
  Lista solo suplementos.
- `GET /shop/:id`  
  Obtiene un producto por su ID.

### Usuarios (`/users`)

- `GET /users`  
  Lista todos los usuarios.
- `POST /users`  
  Crea un usuario.
- `GET /users/info?id=USER_ID`  
  Obtiene información detallada de un usuario.
- `GET /users/last?id=USER_ID`  
  Última frase asignada al usuario.
- `POST /users/emotions`  
  Actualiza emociones del usuario.
- `POST /users/favorite`  
  Añade una frase a favoritos.
- `PUT /users/favorite`  
  Elimina una frase de favoritos.

### Frases (`/sentences`)

- `GET /sentences`  
  Lista frases.
- `GET /sentences/all`  
  Lista todas las frases.
- `POST /sentences`  
  Crea una frase.
- `POST /sentences/get`  
  Obtiene una frase por emociones.
- `POST /sentences/getByUser`  
  Obtiene una frase personalizada para un usuario.

### Autenticación (`/auth`)

- `POST /auth/register`  
  Registro de usuario.
- `POST /auth/login`  
  Login de usuario.
- `GET /auth/verify`  
  Verifica validez de token JWT.

---

## Autenticación y seguridad

- **JWT**: Los endpoints protegidos requieren un token JWT en el header `Authorization: Bearer <token>`.
- **API Key**: Alternativamente, se puede usar una API Key en el header `x-api-key`.
- **Middlewares**:  
  - `authMiddleware`: Verifica JWT o API Key.
  - `verifyUserId`: Asegura que el usuario autenticado solo accede a sus propios recursos.

---

## Gestión de imágenes

Las imágenes de los productos se almacenan como URLs públicas, preferentemente en el propio repositorio (`/images`).  
Ejemplo de campo en el producto:

```json
"image": "https://raw.githubusercontent.com/alu0101330778/app-backend/main/images/atomic-habits.jpg"
```

No se almacenan archivos binarios en la base de datos.

---

## Variables de entorno

- `MONGODB_URI` o `MONGO_URI`: Cadena de conexión a MongoDB.
- `PORT`: Puerto en el que se ejecuta la API.
- `JWT_SECRET`: Clave secreta para JWT.
- `API_KEYS`: Lista de API Keys válidas (separadas por coma).
- `EMOTIONS`: Array JSON de emociones válidas.

---

## Testing y calidad de código

- **Tests**:  
  El proyecto incluye tests unitarios y de integración usando Jest y Supertest.  
  Los tests cubren controladores, middlewares y rutas principales.

  - Ejecutar tests:
    ```sh
    npm test
    ```
  - Ver cobertura:
    ```sh
    npm run coverage
    ```

- **Linting y formato**:  
  Usa ESLint y Prettier para mantener la calidad y el formato del código.
  ```sh
  npm run lint
  npm run format
  ```

- **SonarCloud**:  
  El proyecto está preparado para análisis de calidad con SonarCloud.
  ```sh
  npm run sonar
  ```

---

## Ejemplos de uso

### Obtener todos los productos

```sh
curl http://localhost:3000/shop
```

### Crear un usuario

```sh
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -H "x-api-key: tu_api_key" \
  -d '{"username":"nuevo","email":"nuevo@test.com","password":"123456"}'
```

### Login de usuario

```sh
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nuevo@test.com","password":"123456"}'
```

---

## Notas y buenas prácticas

- Mantén las imágenes de prueba en el repositorio público o en un CDN.
- Usa el archivo `products.json` para cargar datos de ejemplo en la base de datos.
- Consulta el código fuente para detalles sobre validaciones y middlewares.
- Los tests cubren los principales flujos de la API y ayudan a garantizar la calidad del desarrollo.

---

¿Dudas o sugerencias?  
Contacta con el autor o abre un issue en GitHub.