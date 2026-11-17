# Defensa — Árboles Binarios de Expresión y Pilas

Proyecto Integrador · Parcial 02 · Estructuras de Datos y Compiladores · Global University

La presentación completa (27 diapositivas, con el guion en las **notas del orador**) está en:
https://claude.ai/artifact/GW3BafoSXKbo8h4QbFrS5E

El vocabulario sigue los apuntes de la Unidad 5 (Cairo, cap. 6): raíz, hoja (nodo terminal), nodo interior,
grado, nivel, altura, subárbol, IZQ / INFO / DER, NIL, APNODO, pila implícita de recursión.

## Mapa de la presentación

| # | Diapositiva | Idea principal |
|---|---|---|
| — | Portada | Calcular (18 − 6) ÷ (2 + 1) sin `eval()` |
| 01 | ¿Qué hace el proyecto? | Diagrama: texto → léxico → sintáctico → posorden → pila |
| 02 | Conceptos de clase | Raíz = última operación; hojas = números; operadores = grado 2 |
| 03 | Analizador léxico | Separa el texto en piezas; los dígitos seguidos forman un número |
| 04 | Analizador sintáctico | Expresión → Término → Factor: así se respeta la precedencia |
| 05 | Paréntesis | Lo que está más abajo se calcula primero; N = 2ʰ − 1 no aplica |
| 06 | Memoria | Registro IZQ / INFO / DER; NIL = `null` |
| 07 | Números negativos | El − es signo si aparece donde se espera un número; −(x) = (−1) × x |
| 08 | Recorridos (5.2) | Algoritmos 6.2, 6.3 y 6.4: solo cambia dónde va «Visitar» |
| 09 | Posorden paso a paso | Llamadas pendientes (pila implícita de recursión) |
| 10 | ¿Por qué posorden? (5.3) | Usos de cada recorrido; el inorden pierde los paréntesis |
| 11 | Valor de cada recorrido | Prefija = posfija = 4; inorden sin paréntesis = 16 |
| 12 | La pila | PUSH, POP, TOPE, Vacía; lista enlazada |
| 13 | Algoritmo de evaluación | Número → PUSH; operador → DER ← POP, IZQ ← POP, PUSH |
| 14 | Seguimiento con la pila | Tabla completa de (18 − 6) ÷ (2 + 1) = 4 |
| 15 | Regla del primer POP | 9 − 5: el primero que sale es el derecho |
| 16 | Validaciones | Dónde se detecta cada error; 9 ÷ 0 = Infinity en JavaScript |
| 17 | ¿Dónde está el código? | Carpetas; TypeScript (.ts), TSX (.tsx), CSS/Tailwind, HTML |
| 18 | ¿Quién llama a quién? | Diagrama de capas: pantalla → hook → lógica |
| 19 | Cada archivo, una tarea | Qué recibe y qué entrega cada archivo de `src/core` |
| 20 | Cómo se conectan | Código real: `ExpressionTree.fromExpression` y `evaluatePostorder` |
| 21 | Léxico y sintáctico en código | El ciclo del Lexer y la función `termino` |
| 22 | Recorridos y pila reutilizada | `posorden` y `evaluatePrefix` (reutiliza `Stack`) |
| 23 | ¿Cómo usa React la lógica? | Clic → dispatch → reducer → estado → React vuelve a dibujar |
| 24 | Dentro de un componente | `App` reparte datos; `ResultBlock` solo dibuja |
| 25 | Casos de prueba | 7 casos de la rúbrica + 2 con negativos; 24 pruebas automáticas |
| 26 | Demostración | Orden sugerido para la demo en vivo |

## Preguntas que conviene tener preparadas

| Pregunta probable | Respuesta corta |
|---|---|
| ¿Por qué no se usa `eval()`? | Ejecuta texto como código: haría el cálculo sin árbol ni pila, y es un riesgo de seguridad. |
| ¿Qué es un nodo interior? | En Cairo, un nodo que no es raíz ni hoja. Aquí: los operadores que no son la raíz. |
| ¿Por qué el árbol es binario? | Las cuatro operaciones necesitan exactamente dos operandos: grado 2 en operadores, 0 en números. |
| ¿Por qué `8-2-1 = 5` y no `7`? | El ciclo de Expresión agrupa de izquierda a derecha: `(8-2)-1`. |
| ¿Cómo maneja negativos? | Si el − está donde se espera un número, es un signo. `-5` es una hoja con −5; `-(4+2)` se convierte en `(-1) × (4+2)`. |
| ¿Por qué no un nodo de “cambio de signo”? | Tendría un solo hijo (grado 1) y la pila necesitaría otra regla con un solo POP. |
| ¿Por qué el primer POP es el derecho? | El operando izquierdo entra primero y queda abajo; la pila saca primero lo último que entró. |
| ¿Qué pasa si se invierten los POP? | `(18-6)/(2+1)` daría −0.25. Con + y × no se nota porque son conmutativas. |
| ¿Qué pasa si APNODO = NIL? | La llamada termina y se regresa a la anterior, que continúa con la rama pendiente. |
| ¿Cuántas llamadas pendientes hay como máximo? | Tantas como la altura del árbol. |
| ¿Qué complejidad tiene? | Cada nodo se visita una vez y cada PUSH/POP es inmediato: el tiempo crece en proporción al número de nodos (O(n)). |
| ¿Y `0.1+0.2-0.3` como divisor? | Da un número muy pequeño pero no 0 (redondeo del punto flotante), así que no se considera división entre cero. |
| ¿Qué es un hook? | Una función de React que recuerda datos entre un dibujo y otro; aquí guarda el árbol, los pasos y el paso actual. |
| ¿La pantalla calcula algo? | No. Los componentes reciben los datos ya calculados (props) y solo los dibujan. |
| ¿Por qué el preorden se evalúa al revés? | El operador va antes que sus números; leído del final al inicio, el primer POP es el izquierdo. |
