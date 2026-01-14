# Práctica 2 HTTPS - Docker Deployment

Este proyecto implementa un despliegue completo con Docker que incluye Backend (Express), Frontend (React+Vite), Base de Datos (MySQL) y Proxy Inverso (Nginx con HTTPS).

## Estructura del Proyecto

- `backend/`: Servidor Express.js
- `frontend/`: Aplicación React + Vite
- `docker-compose.yml`: Orquestación de contenedores

## 1. El "Fallo Preparado" (Bug del Proxy Inverso)

El error intencionado en esta práctica suele encontrarse en la configuración de Nginx (`frontend/nginx.conf`).

El problema ocurre al configurar el `proxy_pass`. Una configuración incorrecta común es:

```nginx
location /api/ {
    proxy_pass http://backend:5000/;  # <-- La barra final causa el error
}
```

**Explicación del fallo:**
Cuando Nginx tiene una barra al final (`/`) en `proxy_pass`, reemplaza la parte que coincide con `location` (`/api/`) por lo que hay después del host en `proxy_pass` (en este caso, la raíz `/`).
- Petición original: `https://localhost/api/saludo`
- Petición enviada al backend: `http://backend:5000/saludo`

Como el backend espera `/api/saludo` (definido en `index.js`), responde con **404 Not Found**.

**Solución Implementada:**
La configuración correcta debe preservar la ruta o mapearla explícitamente:
```nginx
location /api/ {
    proxy_pass http://backend:5000/api/;
    proxy_set_header Host $host;
}
```

## 2. Por qué no se inicia bien la aplicación (Docker Compose)

Al iniciar con `docker-compose up`, es común experimentar problemas de inicio o errores "502 Bad Gateway" los primeros minutos. Esto se debe a:

1.  **Tiempos de Instalación (`npm install`):**
    El contenedor del backend (y frontend en build) ejecuta `npm install` al arrancar. Esto puede tomar varios minutos dependiendo de la red y recursos. Durante este tiempo, el servidor Express NO está escuchando en el puerto 5000.
    
2.  **Nginx arranca inmediatamente:**
    Nginx inicia muy rápido. Si intentas acceder a `https://localhost` o a la API antes de que el backend termine de instalar dependencias e iniciar node, Nginx no podrá conectar con `http://backend:5000` y devolverá un error **502 Bad Gateway**.

3.  **Dependencia de Base de Datos:**
    Si el backend intentara conectar a MySQL al inicio (aunque en este código simplificado no lo hace explícitamente), fallaría porque MySQL tarda bastante en inicializarse ("ready for connections"). Docker `depends_on` solo espera a que el contenedor arranque, no a que la BD esté lista.

**Solución:**
- Esperar a que los logs del backend muestren `Backend escuchando en 5000`.
- Usar scripts de espera (`wait-for-it.sh`) o healthchecks en `docker-compose.yml` para controlar el orden de inicio real.

## 3. Uso de `dotenv`

`dotenv` es una librería fundamental para la gestión de configuración en entornos profesionales.

**¿Por qué se usa?**
Permite separar el código (lógica) de la configuración (credenciales, puertos, hosts).
- **Seguridad:** Evita subir contraseñas reales al repositorio (se sube un `.env.example`, no el `.env` real).
- **Flexibilidad:** Permite cambiar el comportamiento (Dev vs Prod) cambiando solo un archivo, sin tocar el código.
- **Estandardización:** Sigue la metodología "The Twelve-Factor App" para aplicaciones modernas.

En este proyecto, usamos `.env` para definir el puerto del servidor (`PORT`) y la conexión a la base de datos, cargándolos automáticamente en `process.env`.
