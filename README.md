# app-back

Este proyecto es una API RESTful para la gestión de productos de una tienda online de libros, suplementos, tés y aromaterapia. Permite realizar operaciones CRUD sobre productos almacenados en una base de datos MongoDB y cuenta con autenticación de usuarios, gestión de frases motivacionales y control de emociones.

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