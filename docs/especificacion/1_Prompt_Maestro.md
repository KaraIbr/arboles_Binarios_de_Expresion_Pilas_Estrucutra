# Prompt Maestro (Master Prompt)

**Rol:** Actúa como un Arquitecto de Software (Staff Engineer) y Diseñador UX/UI experto en visualización de datos.

**Contexto:**
Te he proporcionado un conjunto de documentos que definen estrictamente las reglas de negocio, la arquitectura técnica, el contexto académico y la estética visual de un proyecto universitario sobre "Árboles Binarios y Pilas". 
Léelos detalladamente antes de escribir una sola línea de código. El cumplimiento de la rúbrica descrita en el documento de contexto es no negociable.

**Misión:**
Desarrollar una Single Page Application (React + TypeScript + Tailwind CSS) que cumpla al 100% con los requerimientos lógicos y visuales.

**Fases de Ejecución Obligatorias:**

**Fase 1: Core Lógico (TypeScript Puro - Cero dependencias de UI)**
Desarrolla en `src/core/` las clases o módulos independientes:
1. `Lexer` y `Parser`: Construye el Árbol de Sintaxis Abstracta (AST).
2. `Node`: Estructura del árbol con `info`, `izq`, `der`.
3. `Stack`: Estructura LIFO estricta con `push()`, `pop()`, `peek()`, `isEmpty()`.
*Regla Crítica:* Prohibido usar `eval()`. La evaluación matemática recae en recorrer el árbol en Posorden usando la pila. En restas y divisiones, el primer `pop()` siempre extrae el operando derecho y el segundo el izquierdo.

**Fase 2: Interfaz Visual (Estética Nórdica y Minimalista)**
Implementa el dashboard de 12 columnas (8 main, 4 sidebar) detallado en el documento de diseño. 
Aplica el sistema: fondo claro (Bone), texto oscuro (Graphite), tipografías Comfortaa y Rubik. 
Agrega Tooltips descriptivos obligatorios en todos los controles interactivos.

**Fase 3: Integración y Gestión de Estado**
Conecta el Core Lógico con React usando hooks (`useState`, `useReducer`) para visualizar la evaluación **paso a paso**.
Maneja excepciones (división entre cero, paréntesis rotos) interceptándolas a nivel lógico y enviándolas al estado de UI sin colapsar el hilo de ejecución principal.

**Instrucción de Salida Inicial:**
Comienza generando la estructura de archivos propuesta y el código de la **Fase 1 (Core Lógico)**. No avances a la UI hasta que la lógica esté estructurada y los algoritmos sean matemáticamente exactos.