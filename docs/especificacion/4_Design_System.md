# Especificaciones de Diseño UI/UX: Dashboard Nórdico Educativo

## Filosofía de Diseño
El producto es una herramienta de grado académico superior, sobria y orientada estrictamente a los datos. Está inspirada en la estética nórdica: se prioriza la claridad funcional, el uso del espacio vacío (whitespace) como delimitador estructural, y el contraste tipográfico. Se debe eliminar el ruido visual innecesario (nada de sombras pesadas, texturas, o neones).

## Paleta de Colores (Restricciones Absolutas)
*   **PROHIBIDO:** Uso de Blanco puro (#FFFFFF) y Negro puro (#000000).
*   **Fondo Base (Background):** `Bone` (#F4F1EA) o un color arena/marfil ultra claro y mate.
*   **Texto Principal / Líneas Estructurales:** `Graphite` (#1E2321) o un gris antracita muy oscuro.
*   **Acento de Interacción (Highlight):** `Brand Green` (#12A15F) o un azul/teal académico y profundo. Se utilizará exclusivamente para el botón primario o para resaltar un nodo activo en el árbol.
*   **Nodos Operadores (Requisito de rúbrica):** Turquesa desaturado/apagado.
*   **Feedback de Error:** Rojo terracota mate (tipo arcilla). Nunca rojo puro o colores de alerta brillantes.
*   **Delimitadores (Hairlines):** Bordes en gris cálido extremadamente tenue (ej. 1px solid rgba).

## Tipografía y Jerarquía
*   **Títulos, UI y Controles (Botones):** Familia `Comfortaa`. Aporta una geometría suave y amigable a la interfaz de control.
*   **Datos, Textos Técnicos, y Tooltips:** Familia `Rubik`. Garantiza la lectura precisa sin fatiga visual.
*   **Secuencias, Registros y Pilas:** Preferentemente `Rubik` tabulada o una variante Monoespaciada limpia para asegurar que los números del posorden y la pila se alineen visualmente.

## Estructura de Layout (Grid 12 Columnas)
Debe diseñarse como una Single-Page Application (SPA) que ocupe todo el viewport, dividida estratégicamente:

**1. Header (Top Bar - 12 Columnas):**
*   Título institucional de la aplicación (Comfortaa).
*   Barra central de captura (Input) muy amplia, con borde inferior únicamente.
*   Controles primarios ("Generar Árbol", "Evaluar", "Limpiar").
*   **Requisito UX Obligatorio (Info Tools / Tooltips):** Todo elemento interactivo (botones, inputs, toggles de velocidad) debe desplegar un *info tool* flotante y elegante al pasar el cursor (ej. "Avanza iterativamente al siguiente nodo de la estructura").

**2. Main Canvas (Lienzo Principal - Izquierda, 8 Columnas):**
*   Fondo completamente limpio (`Bone`).
*   Dibujo del árbol binario expansivo. Nodos con forma circular o rectangular de radio sutil, con un borde ultra fino (`1px`). Conectores jerárquicos (aristas) con grosor `1px`.

**3. Sidebar de Evaluación (Panel de Datos - Derecha, 4 Columnas):**
*   Secciones internas separadas por hairlines sutiles.
*   **Bloque A (Recorridos):** Textos claros con las secuencias resultantes en Preorden, Inorden, y Posorden.
*   **Bloque B (Visualizador LIFO - Pila):** Gráfico de un contenedor vertical (abierto arriba). Las cajas numéricas deben ingresar por arriba (`PUSH`) y salir por arriba (`POP`). Un marcador visual en gris debe indicar siempre dónde está el nivel `TOP`.
*   **Bloque C (Activity Log / Consola):** Un registro de una línea de alto contraste mostrando el paso de evaluación actual (ej. `POP(2), POP(8) -> 8 * 2 = 16 -> PUSH(16)`).
*   **Bloque D (Resultado de Salida):** Número impreso en una fuente de tamaño mayor al fondo del panel, que indique el valor absoluto del cálculo evaluado.