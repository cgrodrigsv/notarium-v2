# Diseño Conceptual y Arquitectura: Plataforma de Entrenamiento Notarial

## 1. Resumen ejecutivo del sistema
La solución propuesta es una plataforma web jurídica, robusta y especializada, diseñada específicamente para abogados que se preparan para el examen de notariado. No se trata de una aplicación genérica de trivias, sino de un entorno profesional centrado en la lectura profunda, el análisis de casos y la evaluación rigurosa. El sistema permite la administración centralizada de un banco de conocimientos (preguntas y casos prácticos) y ofrece a los usuarios un espacio estructurado para medir y mejorar su nivel de preparación a través de simulacros estandarizados.

## 2. Objetivo del producto
Desarrollar un sistema de entrenamiento y evaluación que garantice una experiencia de estudio cómoda, seria y orientada al detalle, facilitando la comprensión de enunciados extensos y registrando el progreso de los abogados aspirantes mediante la generación dinámica de simulacros con reglas de negocio estrictas.

## 3. Alcance funcional
La versión inicial abarcará:
- Gestión segura de identidades y accesos (Administradores y Usuarios).
- Administración completa (CRUD) e importación en bloque del banco de preguntas.
- Generación automatizada de simulacros (20 preguntas) garantizando la no repetición de ítems en una misma sesión.
- Motor de presentación de exámenes optimizado para lectura de alto enfoque.
- Motor de calificación automática e historial de progreso por usuario.

## 4. Roles y permisos
### Administrador
- **Gestión de Preguntas**: Crear, leer, actualizar, desactivar e importar (CSV/Excel).
- **Gestión de Usuarios**: Alta, baja, modificación y asignación de roles.
- **Auditoría**: Visualización de estadísticas básicas y métricas globales.

### Usuario (Aspirante)
- **Evaluación**: Generación y resolución de simulacros.
- **Seguimiento**: Consulta de su historial de intentos, puntuaciones y revisión de respuestas.

## 5. Módulos del sistema
1. **Módulo de Autenticación**: Login, logout, control de acceso por roles usando JWT.
2. **Módulo de Administración de Preguntas**: Interfaz de gestión del banco de preguntas, integrador de importación de archivos y control de estado (activo/inactivo).
3. **Módulo de Generación de Exámenes**: Motor aleatorio para la extracción de las 20 preguntas activas por intento.
4. **Módulo de Presentación del Examen**: UI enfocada en legibilidad (una pregunta por pantalla), paginación y confirmación de envío.
5. **Módulo de Calificación**: Algoritmo que contrasta selecciones con el valor de la opción correcta (1.0) y emite un porcentaje de éxito.
6. **Módulo de Historial y Resultados**: Almacenamiento y despliegue del récord del usuario (fecha, puntaje, respuestas correctas/incorrectas).
7. **Módulo de Administración de Usuarios**: Panel para la gestión centralizada de cuentas de acceso.

## 6. Reglas de negocio
- El sistema permite generar simulacros **solo si** hay al menos 20 preguntas en estado "activo".
- Cada examen constará de **exactamente 20 preguntas**.
- Cada registro de pregunta admite **solo una respuesta correcta** (valor 1.0).
- **Cero repetitividad**: En la generación de un examen, las 20 preguntas deben ser únicas.
- Solo los usuarios con rol *Administrador* tienen permisos de mutación sobre el banco de preguntas.
- Toda contraseña de usuario se almacenará cifrada (e.g., bcrypt).
- Rutas y recursos protegidos mediante validación de sesión activa y rol.

## 7. Modelo de datos propuesto
Se propone una base de datos relacional inicial.

**Tablas Principales:**

- **Usuario**: `id`, `nombre`, `email` (unique), `password_hash`, `rol` (ENUM: ADMIN, USER), `estado` (boolean), `fecha_registro`.
- **Pregunta**: `id`, `enunciado` (TEXT), `base_legal` (TEXT), `opcion_a` (TEXT), `respuesta_a` (DECIMAL), `opcion_b` (TEXT), `respuesta_b` (DECIMAL), `opcion_c` (TEXT), `respuesta_c` (DECIMAL), `opcion_d` (TEXT), `respuesta_d` (DECIMAL), `estado` (boolean), `creado_en`. (Futuro: `tema`, `dificultad`, `explicacion`).
- **Intento_Examen**: `id`, `id_usuario` (FK), `fecha_inicio`, `fecha_fin`, `puntaje_total`, `porcentaje`, `estado` (ENUM: EN_CURSO, FINALIZADO).
- **Detalle_Intento**: `id`, `id_intento` (FK), `id_pregunta` (FK), `opcion_seleccionada` (CHAR/VARCHAR e.g., 'A', 'B'), `es_correcta` (boolean).

*Relaciones:*
- Usuario (1) -> (N) Intento_Examen
- Intento_Examen (1) -> (N) Detalle_Intento
- Pregunta (1) -> (N) Detalle_Intento

## 8. Arquitectura tecnológica sugerida
**Stack Técnico:** Men stack moderno y escalable (NERN u optimizado).
- **Frontend**: **Next.js (React)** o **Vue (Nuxt.js)**. ¿Por qué? Ofrecen Server-Side Rendering (SSR) o Static Site Generation (SSG), excelente manejo del enrutamiento y una interfaz dinámica sin recargas completas de página. Para un diseño "serio", se acopla perfectamente con TailwindCSS y componentes tipo Shadcn/UI para una estética muy limpia y profesional.
- **Backend / API**: **Node.js con NestJS**. ¿Por qué? NestJS fuerza a una estructura modular muy similar a la de Angular, utilizando TypeScript por defecto. Es robusto, ideal para reglas de negocio estrictas, y facilita el trabajo en equipo gracias a la inyección de dependencias.
- **Base de Datos**: **PostgreSQL**. ¿Por qué? Es la base de datos relacional de código abierto más avanzada y confiable del mercado. En un sistema que requerirá integridad transaccional (guardar el intento y el detalle simultáneamente) es la mejor opción. Usaremos **Prisma ORM** para una DX (Developer Experience) ágil.
- **Autenticación**: **JWT (JSON Web Tokens)** gestionados vía HTTP-only cookies para mayor seguridad contra ataques XSS.

## 9. Diseño de pantallas e interfaces (UX/UI)
La estética debe emplear una paleta de colores sobrios (azules oscuros, blancos, grises, acentos sutiles en dorado o bordó). Tipografías serif para cuerpos de texto largos jurídicos (p. ej. *Merriweather* o *Lora*) combinadas con sans-serif elegantes (p. ej. *Inter* o *Roboto*) para botones y paneles.

- **Login**: Diseño minimalista, centrado, mensaje de bienvenida formal.
- **Dashboard Usuario**: Tarjetas resumen (intentos, puntaje promedio). Llamado a la acción claro: "Nuevo Simulacro".
- **Pantalla de Examen (Focus Mode)**: 
  - Cabecera mínima: Progreso (Pregunta X de 20), Timer (opcional).
  - Cuerpo: Enunciado ocupando la zona superior izquierda con buen interlineado y tamaño de fuente (mín. 16px).
  - Opciones de respuesta presentadas en tarjetas "clicables" que resalten al ser seleccionadas.
  - Pie flotante: Botón "Siguiente" o "Finalizar" solo activo cuando se ha seleccionado una opción.
- **Resultados**: Vista en dos bloques. Superior: Resumen circular del score (%). Inferior: Lista de preguntas con retroalimentación (verde/rojo según acierto).
- **Dashboard Admin**: Barra lateral de navegación. Tablas de datos con paginación para gestionar preguntas y usuarios. Vista previa estructurada del texto de las preguntas.

## 10. Flujo funcional de generación de examen
1. El usuario inicia un simulacro desde su panel.
2. El sistema (backend) valida si existen >= 20 preguntas activas en la BD.
3. Se realiza una consulta que selecciona 20 `id` de forma aleatoria (ej. `ORDER BY RANDOM() LIMIT 20`).
4. Se crea un registro en `Intento_Examen` con estado `EN_CURSO`.
5. Se devuelven las 20 preguntas al cliente, sin los indicadores de "cuál es la correcta" (se sanean los campos de respuesta_a/b/c/d en la respuesta del API).
6. Inicia el simulacro para el usuario.

## 11. Flujo funcional de calificación
1. El usuario envía el array de sus respuestas (e.g., `[ { id_pregunta: 'P001', opcion: 'B' }, ... ]`).
2. El backend intercepta la solicitud, busca en la BD las respuestas correctas para esos 20 IDs.
3. El sistema itera comparando la selección con el campo de valor `1.0`.
4. Calcula aciertos totales y el porcentaje sobre 20.
5. Registra cada línea en `Detalle_Intento` y actualiza el `Intento_Examen` con el puntaje final y estado `FINALIZADO`.
6. Devuelve al frontend el resumen para renderizar los resultados.

## 12. Estrategia de importación del banco
Para facilitar la carga masiva (CSV/XLSX), se construirá un script en el backend:
- Un botón en la vista Admin permite subir el archivo.
- **Parseo**: El backend lee el archivo. Verifica cabeceras exactas (enunciado, base_legal, opcion_a, etc.).
- **Validaciones por fila**:
  - ¿Tiene todas las opciones de respuesta?
  - ¿Suma de campos de `respuesta` == 1.0 (garantiza una sola correcta)?
  - Si una fila falla, se ignora o se registra en un array de "Errores".
- **Vista previa** (Opcional pero recomendada): El sistema responde con "X válidas, Y con error" antes de insertar.
- **Inserción**: Inserción transaccional por bloques para evitar saturación de la DB.

## 13. Recomendaciones de seguridad
- Utilizar HTTPS obligatoriamente en todos los entornos.
- Sanitización profunda de las entradas y salidas de texto, vital ya que los textos jurídicos pueden tener caracteres especiales limitando p. ej. inyecciones NoSQL/SQL. Proteccion CSRF implícita con cookies configuradas SameSite.
- Rate limiting en la ruta de inicio de sesión para evitar fuerza bruta.
- Los endpoints de exámenes NO deben enviar el campo que indica la opción correcta al frontend. Toda la evaluación se hace en servidor.

## 14. Recomendaciones de escalabilidad
La plataforma tiene un volumen de lectura mayor que de inserción (usuarios leyendo exámenes).
- Añadir índices a la columna `estado` en la tabla de Preguntas para acelerar la generación de exámenes.
- A largo plazo se pueden cachear encuestas en un servicio como Redis si el banco es masivo.
- Diseñar el frontend sin acoplamiento estrecho, permitiendo transformarlo a una PWA o empaquetarlo con Capacitor si en el futuro se desea una App Móvil nativa.

## 15. Propuesta de roadmap por fases
- **Fase 1 (MVP - Actual)**: Autenticación básica, CRUD de preguntas vía admin, importación de CSV de la base heredada, módulo de evaluación y listado de resultados básico.
- **Fase 2 (Enriquecimiento)**: Agregar explicaciones adicionales por pregunta, módulo de Práctica libre (evalúa pregunta a pregunta en lugar de al final) e inclusión de "Tags/Temas" vinculados a las preguntas para que el sistema sugiera puntos débiles al usuario.
- **Fase 3 (Expansión)**: Subscripciones/pagos si se quiere monetizar, reportes analíticos para el administrador de "preguntas más difíciles".

## 16. Riesgos y consideraciones
- **Fatiga del aspirante**: Leer 20 casos largos en pantalla provoca cansancio visual; un fallo en el diseño UI/UX puede hacer que el producto se perciba como obsoleto. Solución: Tipografía excelente, modo oscuro opcional, buen espaciado.
- **Pérdida de progreso**: Durante la evaluación, si se corta internet y el estado es mantenido solo vía React State, todo se pierde al refrescar. Se recomienda un "draft auto-guardado" en LocalStorage cada vez que se avanza de pregunta.
- **Errores históricos en la BD heredada**: Si el CSV tiene preguntas con más de un "1.0" o ninguno, el importador debe rechazar estos items, reduciendo del volumen del banco.

## 17. Recomendación profesional final
El diferencial de este sistema no reside en su complejidad transaccional, sino en su **calidad de experiencia** como simulador. Priorizaría utilizar **Next.js + Prisma ORM + PostgreSQL** y construir desde el primer día una suite de componentes visuales con enfoque en accesibilidad e inteligibilidad (ej. *Shadcn UI*). Recomiendo enfáticamente la construcción de un motor intermedio (Middleware) en el backend que garantice que ningún usuario normal vea jamás los metadatos de las correcciones, garantizando la integridad de cada ensayo como si fuera un examen en un entorno real.
