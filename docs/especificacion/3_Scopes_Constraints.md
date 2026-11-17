# Restricciones Técnicas (Scopes & Constraints)

## Stack Tecnológico Requerido
*   **Frontend Framework:** React (Vite o Next.js App Router).
*   **Lenguaje:** TypeScript estricto. Todas las estructuras de datos (Nodo, Pila) deben estar formalmente tipadas.
*   **Estilos:** Tailwind CSS.
*   **Animaciones:** Framer Motion o transiciones nativas de CSS/Tailwind.
*   **Renderizado del Árbol:** SVG puro, HTML Canvas, o librerías gráficas (`react-flow`, `d3.js`) utilizadas **exclusivamente** para el renderizado de los nodos en pantalla, jamás para resolver el árbol algorítmicamente.
*   **Iconografía:** Lucide React (o equivalente minimalista).

## Limitaciones Estrictas (Prohibiciones)
1.  **Cero uso de `eval()`:** Está tajantemente prohibido usar `eval()`, `Function()`, `setTimeout(string)`, u otras utilidades nativas de ejecución de cadenas para evaluar la expresión matemática.
2.  **Sin dependencias matemáticas externas:** Prohibido usar librerías como `mathjs`. El Lexer, el Parser y la evaluación deben escribirse de forma manual.
3.  **Sin Frameworks UI Pesados:** Queda restringido el uso de Material-UI (MUI), Ant Design o Bootstrap. La interfaz debe construirse a medida con Tailwind para garantizar la ligereza y el diseño específico requerido.

## Alcance Operativo (Features)
*   **Operadores admitidos:** Suma (`+`), Resta (`-`), Multiplicación (`*`), División (`/`).
*   **Agrupación:** Paréntesis de apertura `(` y cierre `)`.
*   **Números:** Soporte para múltiples dígitos (ej. 124) y números decimales. (No se exige soporte para raíces o exponentes).
*   **Regla Crítica de Pila:** Durante la lectura en Posorden, al procesar un operador matemático, se deben hacer obligatoriamente DOS extracciones (`pop()`):
    1.  El primer dato extraído (`derecho = pop()`) pertenece a la derecha.
    2.  El segundo dato extraído (`izquierdo = pop()`) pertenece a la izquierda.
    3.  Se ejecuta: `resultado = izquierdo [operador] derecho`.
    4.  El resultado reingresa a la pila: `push(resultado)`.

## Separación de Responsabilidades (Separation of Concerns)
*   **Capa Base (`src/core/` o `src/lib/`):** Código puro TypeScript, 100% agnóstico de React. Aquí deben vivir la clase AST, el Tokenizer/Parser, la clase `Tree`, y la clase `Stack`. Este código no debe retornar fragmentos JSX.
*   **Capa UI (`src/components/`):** Exclusivamente responsable de consumir los resultados de la capa base e iterar sobre los estados de React para renderizar la pantalla.