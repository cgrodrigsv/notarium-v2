# Resumen de Trabajo - Plataforma Notarium

**Fecha de la última actualización:** 13 de marzo de 2026.

Este documento sirve como registro del trabajo realizado y como guía para retomar el desarrollo al cambiar entre entornos de trabajo (disco `I:`, `H:`, u otra letra).

---

## 🔄 Guía para Cambiar de Máquina

### Paso 1: Conectar el disco y abrir el proyecto
1. Conecta tu disco duro externo y verifica qué letra le asigna Windows (puede ser `I:`, `H:`, `E:`, etc.).
2. Abre VS Code (o tu editor) y abre la carpeta `[LETRA]:\Notarium`.

### Paso 2: Instalar dependencias
Abre una terminal en la carpeta del proyecto y ejecuta:
```bash
npm install
```
> Esto es necesario porque la carpeta `node_modules` puede no ser compatible entre máquinas distintas.

### Paso 3: Configurar las variables de entorno
El archivo `.env` ya debería estar en tu disco. Verifica que exista en la raíz del proyecto (`[LETRA]:\Notarium\.env`).

Si no existe, crea una copia de `.env.example` y renómbrala a `.env`:
```bash
copy .env.example .env
```
Luego edita `.env` con los valores reales:
```
DATABASE_URL="postgresql://...tu_cadena_de_neon..."
DIRECT_URL="postgresql://...tu_cadena_directa_de_neon..."
NEXTAUTH_SECRET="tu_secret_real"
NEXTAUTH_URL="https://notarium-v2.vercel.app"
```
> Los valores los puedes obtener desde [Neon Console](https://console.neon.tech) y el panel de Vercel.

### Paso 4: Generar el cliente de Prisma
```bash
npx prisma generate
```

### Paso 5: Levantar el servidor de desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`.

### Paso 6 (Opcional): Subir cambios a producción
Cuando hagas cambios y quieras desplegar en Vercel:
```bash
git add .
git commit -m "descripción de los cambios"
git push
```
Vercel detecta el push automáticamente y re-despliega.

---

## 📋 Credenciales de Prueba

| Rol       | Email                      | Contraseña    |
|-----------|----------------------------|---------------|
| Admin     | admin@notarium.com         | password123   |
| Usuario   | usuario02@notarium.com     | 123456        |

---

## 🌐 URLs Importantes

| Recurso                | URL                                                  |
|------------------------|------------------------------------------------------|
| App en producción      | https://notarium-v2.vercel.app                       |
| Repositorio GitHub     | https://github.com/cgrodrigsv/notarium               |
| Base de datos (Neon)   | https://console.neon.tech                            |
| Panel de Vercel        | https://vercel.com/dashboard                         |

---

## ✅ Trabajo Completado

### 1. Diseño y Conceptualización
Se generó el documento base de arquitectura **[`diseno_sistema.md`](./diseno_sistema.md)** con módulos funcionales, modelo de datos, arquitectura técnica (Next.js + PostgreSQL + Prisma) e interfaces Blueprint.

### 2. Revisión del Despliegue en Producción
Se validó la aplicación en Vercel incluyendo:
- Modo Oscuro/Claro y diseño responsivo.
- **Módulo Aspirante:** Dashboard, historial de intentos, flujo de exámenes (Práctica y Estricto).
- **Módulo Admin:** Métricas, Banco de Preguntas (importación CSV), Gestión de Usuarios.

### 3. Creación Individual de Preguntas (Nuevo ✨)
Se implementó la funcionalidad para crear preguntas una por una:
- **Dashboard Admin:** Botón "Nueva Pregunta" en Acciones Rápidas redirige al Banco de Preguntas y abre automáticamente el modal de creación.
- **Banco de Preguntas:** Botón "+ Nueva Pregunta" verde al lado de "Importar CSV".
- **Archivos modificados:**
  - `src/app/(admin)/dashboard/page.tsx`
  - `src/app/(admin)/questions/page.tsx`

---

## 📁 Estructura del Proyecto (Archivos Clave)

```
Notarium/
├── .env                    ← Variables de entorno (NO se sube a Git)
├── .env.example            ← Plantilla de variables de entorno
├── prisma/schema.prisma    ← Modelo de la base de datos
├── src/
│   ├── app/
│   │   ├── (admin)/        ← Vistas del administrador
│   │   │   ├── dashboard/  ← Panel principal admin
│   │   │   ├── questions/  ← Banco de preguntas
│   │   │   └── users/      ← Gestión de usuarios
│   │   ├── panel/          ← Dashboard del aspirante
│   │   ├── exam/           ← Interfaz de examen
│   │   └── api/            ← Endpoints del backend
│   └── lib/                ← Utilidades y configuración
├── diseno_sistema.md       ← Documento de diseño
├── RESUMEN_TRABAJO.md      ← Este archivo
└── DEPLOY.md               ← Instrucciones de despliegue
```
