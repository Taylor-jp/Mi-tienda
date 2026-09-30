# Mi Tienda — React + Vite + Supabase

## 1. Ejecutarla
1. Instala Node.js (nodejs.org, versión LTS).
2. En esta carpeta: `npm install` y luego `npm run dev`. Abre la dirección que aparece (http://localhost:5173).
Sin configurar nada funciona en **modo local** (datos en el navegador, contraseña admin `1234`).

## 2. Conectar la base de datos (recomendado)
1. Crea un proyecto gratis en supabase.com.
2. SQL Editor → pega y ejecuta `supabase/schema.sql`.
3. Authentication → Users → Add user (tu correo y contraseña: será el acceso de administrador). En Authentication → Sign In / Providers desactiva "Allow new users to sign up".
4. Copia `.env.example` a `.env` y pega Project URL y anon key (Project Settings → API). Reinicia `npm run dev`.

## 3. Cambios habituales (sin tocar código)
Entra a ⚙️ y usa tu correo/contraseña: **Configuración** (nombre, WhatsApp con código de país y sin +, logo, dirección, horario, Instagram, bienvenida) y **Productos** (crear, editar, precios, fotos, inventario, ofertas, agotados).
**Categorías:** edita `src/cats.js`.

## 4. Publicar en Internet
Sube la carpeta a GitHub → vercel.com o netlify.com → "Import project". Comando `npm run build`, carpeta `dist`. Agrega las dos variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en la configuración del sitio.

## 5. Preparado para crecer
`src/db.js` es la única capa de datos. Ahí se enchufan: clientes registrados (Supabase Auth), pagos online (función serverless + pasarela), delivery y seguimiento (`orders.status`), facturación, notificaciones (Supabase Edge Functions) y clientes frecuentes (tabla `customers` + `orders.customer_id`).
