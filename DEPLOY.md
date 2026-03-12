# 🚀 Guía de Despliegue — Notarium en Vercel + Neon PostgreSQL

## Paso 1: Crear la base de datos en Neon (gratis)

1. Ve a [neon.tech](https://neon.tech) y regístrate (gratis)
2. Crea un nuevo proyecto → dale un nombre (ej. `notarium`)
3. En "Connection Details" → copia la cadena de conexión
4. Tendrás dos URLs:
   - **DATABASE_URL** → la que dice "Pooled connection" (empieza con `postgresql://...@...pooler...`)
   - **DIRECT_URL** → la que dice "Direct connection"

---

## Paso 2: Subir código a GitHub

```bash
# Desde la carpeta d:\Notarium
git init
git add .
git commit -m "Initial commit"
```

Luego crea un repositorio en [github.com](https://github.com/new) y haz:

```bash
git remote add origin https://github.com/TU_USUARIO/notarium.git
git branch -M main
git push -u origin main
```

---

## Paso 3: Conectar a Vercel

1. Ve a [vercel.com](https://vercel.com) → "New Project"
2. Importa tu repositorio de GitHub
3. Antes de hacer deploy, en la sección **"Environment Variables"** agrega:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | La URL "Pooled" de Neon |
| `DIRECT_URL` | La URL "Direct" de Neon |
| `NEXTAUTH_SECRET` | Genera con: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://tu-proyecto.vercel.app` |

4. Haz clic en **"Deploy"**

---

## Paso 4: Inicializar la base de datos en producción

Una vez desplegado, en tu terminal local ejecuta:

```bash
# Apunta a la BD de producción temporalmente
$env:DATABASE_URL="postgresql://TU_URL_DE_NEON"
$env:DIRECT_URL="postgresql://TU_URL_DIRECTA_NEON"
npx prisma db push
npx prisma db seed  # para crear el usuario admin inicial
```

---

## Paso 5: ¡Listo! 🎉

Tu aplicación estará disponible en `https://tu-proyecto.vercel.app`

### Actualizaciones futuras

Para actualizar la app después de cambios:
```bash
git add .
git commit -m "descripción del cambio"
git push
```
Vercel detecta el push y hace el deploy automáticamente.

---

## Variables de entorno para desarrollo local

Crea un archivo `.env` (no se sube a GitHub) con:

```env
DATABASE_URL="file:./dev.db"
DIRECT_URL="file:./dev.db"
NEXTAUTH_SECRET="notarium_secret_key_for_local_dev"
NEXTAUTH_URL="http://localhost:3000"
```

<!-- deploy trigger -->
