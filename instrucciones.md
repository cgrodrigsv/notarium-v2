Actúa como un arquitecto senior de software, analista funcional, diseñador de experiencia de usuario y desarrollador full stack especializado en plataformas educativas y sistemas de evaluación profesional.

Necesito que diseñes y construyas el concepto funcional, técnico y estructural de una aplicación web especializada para la preparación de abogados que desean presentar el examen de notariado.

La aplicación no debe ser planteada como un simple cuestionario, sino como una plataforma jurídica especializada de entrenamiento, evaluación y administración de un banco de preguntas profesionales.

## 1. Objetivo general del sistema

Desarrollar una aplicación web que permita:

- administrar un banco de preguntas jurídicas,
- generar exámenes aleatorios de 20 preguntas,
- permitir inicio de sesión con roles diferenciados,
- registrar resultados e historial de intentos,
- ofrecer un entorno serio, profesional y claro para la práctica de aspirantes al examen de notariado.

## 2. Contexto del dominio

El sistema estará orientado a abogados que se preparan para un examen técnico-profesional de notariado. Por tanto:

- las preguntas suelen ser extensas,
- los enunciados pueden estar redactados como casos jurídicos,
- las opciones de respuesta también pueden ser largas,
- el sistema debe priorizar legibilidad, claridad, orden y experiencia de estudio.

## 3. Estructura real del banco de preguntas

El banco de preguntas ya existe y cada registro tiene esta estructura:

- id_pregunta
- enunciado
- base_legal
- opcion_a
- respuesta_a
- opcion_b
- respuesta_b
- opcion_c
- respuesta_c
- opcion_d
- respuesta_d

### Regla de interpretación

- respuesta_a, respuesta_b, respuesta_c y respuesta_d contienen valores numéricos:
  - 1.0 = correcta
  - 0.0 = incorrecta

### Regla obligatoria de esta versión

- cada pregunta tendrá una sola respuesta correcta
- por cada registro solo uno de los campos respuesta_a, respuesta_b, respuesta_c o respuesta_d debe tener valor 1.0

## 4. Ejemplo de pregunta real

Ejemplo del patrón de datos:

id_pregunta: P001

enunciado:
Se presentan a su oficina los hijos de Jesús María de la Cruz a aceptar la herencia de su madre, quien los instituyó herederos a ambos bajo la condición de que, para honrar su memoria, acepten sin beneficio de inventario; uno de ellos está de acuerdo, el otro no. Usted les explica:

opcion_a:
Que podría aceptar con beneficio de inventario hasta el límite del cincuenta por ciento de sus bienes.
respuesta_a: 0.0

opcion_b:
Que ambos deberán aceptar con beneficio de inventario, ya que la condición testamentaria no tiene ningún valor.
respuesta_b: 1.0

opcion_c:
Que tramitará las diligencias para uno con beneficio de inventario y para el otro sin él, ya que lo importante es la decisión de ellos.
respuesta_c: 0.0

opcion_d:
Que al aceptar sin beneficio de inventario, honrarán la memoria de su madre, pero podría incluso terminar con todos sus bienes.
respuesta_d: 0.0

## 5. Enfoque de producto requerido

Quiero que propongas la solución como una plataforma jurídica especializada y no como una app básica de trivia.

El diseño debe contemplar:

- seriedad visual,
- lectura cómoda de textos extensos,
- estructura profesional,
- preparación técnica del usuario,
- potencial de crecimiento futuro.

## 6. Roles del sistema

El sistema debe manejar como mínimo dos roles:

### Administrador

Puede:

- iniciar sesión,
- gestionar preguntas,
- importar preguntas,
- editar preguntas,
- activar o desactivar preguntas,
- administrar usuarios,
- consultar resultados,
- ver estadísticas básicas.

### Usuario

Puede:

- iniciar sesión,
- presentar exámenes,
- responder preguntas,
- consultar historial de resultados,
- ver retroalimentación según configuración.

## 7. Módulos funcionales obligatorios

Diseña la solución con estos módulos:

### Módulo de autenticación

- login
- cierre de sesión
- control de acceso por roles
- recuperación de contraseña si lo consideras conveniente

### Módulo de administración de preguntas

- crear pregunta
- editar pregunta
- eliminar o desactivar pregunta
- listar preguntas
- buscar preguntas
- filtrar preguntas
- importar preguntas desde CSV o Excel

### Módulo de generación de exámenes

- generar examen aleatorio de 20 preguntas
- tomar solo preguntas activas
- no repetir preguntas dentro del mismo examen
- registrar el examen generado para cada intento

### Módulo de presentación del examen

- mostrar una pregunta por bloque o pantalla
- interfaz legible para enunciados largos
- opciones tipo selección única
- navegación clara
- indicador de progreso
- confirmación antes de enviar

### Módulo de calificación

- comparar la opción seleccionada por el usuario con la opción correcta marcada con 1.0
- calcular puntaje
- calcular porcentaje
- guardar resultado final

### Módulo de historial y resultados

- listar intentos del usuario
- mostrar fecha, nota, porcentaje, aciertos y errores
- permitir visualización detallada del intento

### Módulo de administración de usuarios

- crear usuarios
- editar usuarios
- activar o desactivar usuarios
- asignar roles

## 8. Modos de uso recomendados

Propón dos modos de funcionamiento:

### Modo examen

- no muestra respuestas correctas durante la prueba
- no muestra base legal durante la prueba
- califica al finalizar

### Modo práctica

- puede mostrar retroalimentación al final
- puede mostrar base legal
- puede mostrar explicación si el sistema se amplía

## 9. Campos recomendados adicionales

Aunque el banco actual es simple, quiero que sugieras extensiones futuras sin romper la versión inicial. Propón incorporar en etapas posteriores campos como:

- tema
- subtema
- dificultad
- explicacion_respuesta
- estado
- fecha_creacion
- creado_por

Aclara cuáles serían obligatorios en una fase futura y cuáles opcionales.

## 10. Modelo de datos

Necesito que diseñes una propuesta de modelo de datos clara.

Como mínimo debes contemplar tablas para:

- usuarios
- preguntas
- intentos_examen
- detalle_intento

Y si lo consideras mejor, puedes proponer una evolución futura hacia un modelo más normalizado.

Debes explicar:

- qué tablas existirán,
- qué campos tendrá cada una,
- qué relaciones existirán,
- qué claves primarias y foráneas usarás,
- qué validaciones de integridad aplicarás.

## 11. Reglas de negocio obligatorias

Incluye estas reglas:

- el sistema solo genera examen si existen al menos 20 preguntas activas
- cada examen tendrá exactamente 20 preguntas
- cada pregunta tendrá exactamente una respuesta correcta en esta versión
- no puede repetirse una misma pregunta dentro del mismo examen
- solo los administradores pueden modificar el banco de preguntas
- las contraseñas deben almacenarse cifradas
- debe existir control de sesión y autorización por rol

## 12. Requerimientos no funcionales

Debes proponer requerimientos no funcionales relacionados con:

- seguridad
- usabilidad
- mantenibilidad
- rendimiento
- escalabilidad
- integridad de datos

## 13. Diseño de interfaz

Quiero que describas las pantallas clave del sistema:

### Públicas

- login
- recuperación de contraseña

### Usuario

- dashboard usuario
- iniciar examen
- resolver examen
- resultado
- historial

### Administrador

- dashboard admin
- listado de preguntas
- formulario de pregunta
- importación de preguntas
- listado de usuarios
- resultados y reportes

Incluye recomendaciones de UX para lectura de textos jurídicos largos.

## 14. Tecnología sugerida

Quiero que propongas una arquitectura tecnológica moderna y razonable.

Puedes sugerir una opción como:

- frontend: React o Vue
- backend: Node.js con Express o NestJS
- base de datos: PostgreSQL
- autenticación: JWT o sesiones seguras

Pero no te limites solo a nombrarlas. Explica:

- por qué serían adecuadas,
- qué ventajas ofrecen,
- qué stack elegirías para una primera versión robusta.

## 15. Importación del banco de preguntas

Diseña también la lógica de importación del banco desde CSV o Excel.

Debes contemplar:

- validación de columnas esperadas
- validación de datos obligatorios
- validación de una sola respuesta correcta
- manejo de errores de importación
- vista previa antes de confirmar carga
- estrategia para evitar duplicados

## 16. Reportes mínimos

El sistema debe contemplar al menos:

- resultados por usuario
- cantidad de exámenes realizados
- promedio de calificaciones
- preguntas más falladas en el futuro, si la estructura lo permite

## 17. Resultado esperado de tu trabajo

Quiero que entregues tu respuesta organizada en estas secciones:

1. Resumen ejecutivo del sistema
2. Objetivo del producto
3. Alcance funcional
4. Roles y permisos
5. Módulos del sistema
6. Reglas de negocio
7. Modelo de datos propuesto
8. Arquitectura tecnológica sugerida
9. Diseño de pantallas
10. Flujo funcional de generación de examen
11. Flujo funcional de calificación
12. Estrategia de importación del banco
13. Recomendaciones de seguridad
14. Recomendaciones de escalabilidad
15. Propuesta de roadmap por fases
16. Riesgos y consideraciones
17. Recomendación profesional final

## 18. Estilo de respuesta esperado

Tu respuesta debe ser:

- profesional
- técnica
- clara
- estructurada
- detallada
- orientada a implementación real

No respondas de forma genérica ni superficial. Quiero una propuesta seria, práctica y lista para usarse como base de desarrollo del sistema.
