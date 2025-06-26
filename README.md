<!-- Para README.md y doc/README.md -->

# app-back

Este proyecto nace de la necesidad de trasladar al entorno digital una práctica emocional y reflexiva inspirada en los libros de Felipe. En dichas obras, cada página invita a una pausa emocional mediante una reflexión, y el lector es animado a abrir el libro al azar, confiando en que la “casualidad” le brindará la frase adecuada para su momento vital.

La aplicación amplía este concepto, combinando la experiencia de azar significativa con inteligencia artificial para sugerir frases personalizadas según el estado emocional del usuario. Así, el usuario puede acceder a reflexiones de los libros de Felipe tanto de forma aleatoria como mediante un sistema de recomendación basado en emociones.

## Objetivo

Desarrollar una aplicación móvil multiplataforma que permita:

- Acceder a reflexiones de los libros de Felipe de forma aleatoria o personalizada.
- Registrar y analizar la evolución emocional del usuario mediante gráficas.
- Mostrar reflexiones acompañadas de imágenes generadas por IA.
- Convertir frases en audio.
- Ofrecer productos recomendados según el perfil emocional del usuario.

## Justificación

La aplicación integra literatura, inteligencia artificial, diseño emocional y recomendaciones personalizadas, creando una herramienta con potencial comercial, terapéutico y educativo. Se prioriza una interfaz emocionalmente amable, el cumplimiento normativo de privacidad y una arquitectura técnica escalable.

## Características principales

- **Gestión de productos**: libros, suplementos, tés y aceites esenciales.
- **Almacenamiento de imágenes**: mediante URLs externas (repositorio público).
- **Gestión de usuarios**: registro, login, favoritos y emociones.
- **Gestión de frases motivacionales**: CRUD y asignación personalizada por usuario.
- **Autenticación**: mediante JWT o API Key.
- **Filtros y búsquedas**: por categorías, etiquetas, autor, etc.
- **Cobertura de tests**: con Jest y Supertest.
- **Integración continua**: compatible con SonarCloud para análisis de calidad.

## Instalación y puesta en marcha

1. **Clona el repositorio:**
   ```sh
   git clone https://github.com/alu0101330778/app-backend.git
   cd app-backend
   ```

2. **Instala las dependencias:**
   ```sh
   npm install
   ```

3. **Configura las variables de entorno:**
   - Crea un archivo `.env` en la raíz con la cadena de conexión a MongoDB y otros parámetros necesarios.
   - Ejemplo:
     ```
     MONGODB_URI=mongodb://localhost:27017/tu_basededatos
     PORT=3000
     JWT_SECRET=tu_clave_secreta
     API_KEYS=tu_api_key
     EMOTIONS=["alegria","tristeza","ira","miedo"]
     ```

4. **Inicia la API:**
   ```sh
   npm start
   ```
   o en modo desarrollo:
   ```sh
   npm run dev
   ```

5. **La API estará disponible en** `http://localhost:3000` (o el puerto que configures).

## Tests y calidad de código

- **Ejecución de tests**:  
  Ejecuta todos los tests con:
  ```sh
  npm test
  ```
  Para ver la cobertura:
  ```sh
  npm run coverage
  ```

- **Linting y formato**:  
  ```sh
  npm run lint
  npm run format
  ```

- **Análisis de calidad con SonarCloud**:  
  ```sh
  npm run sonar
  ```

## Documentación completa

La documentación detallada de la API, modelos, endpoints, ejemplos de uso, estructura de carpetas y buenas prácticas está disponible en [`doc/README.md`](doc/README.md).

---

¿Dudas o sugerencias?  
Contacta con el autor o abre un issue en el repositorio.