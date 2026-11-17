# Contexto Académico y Funcional del Proyecto

## Datos Institucionales
*   **Universidad:** Global University
*   **Materia:** Estructuras de Datos y Compiladores
*   **Docente:** Dra. Blanca Guadalupe Estrada Rentería
*   **Estudiante:** Karina Patricia Ibarra Morales
*   **Carrera:** Ingeniería en Desarrollo de Software y Seguridad Informática
*   **Evaluación:** Proyecto Integrador Parcial 02 (100% Práctico)

## Objetivo Principal
Desarrollar una aplicación web interactiva que demuestre el proceso educativo de evaluación de expresiones aritméticas. El sistema debe procesar una expresión de entrada, construir dinámicamente un Árbol Binario de Expresión, realizar los tres recorridos recursivos (Inorden, Preorden, Posorden) y evaluar matemáticamente la expresión utilizando una Pila (Stack) real, basándose exclusivamente en el recorrido Posorden.

## Rúbrica de Evaluación y Distribución de Puntos (100 pts)
*   **Evaluación mediante Pila (21 pts):** Funciones PUSH, POP, TOP y evaluación en posorden correctos. Visualización de resultados parciales.
*   **Recorridos Recursivos (18 pts):** Generación de los tres recorridos lógicamente correctos y visualizados.
*   **Construcción del Árbol (17 pts):** Nodos dinámicos, enlaces y agrupación correcta respetando la precedencia.
*   **Visualización Gráfica (15 pts):** Árbol, recorridos, pila y operaciones en curso deben ser claros paso a paso.
*   **Demostración y Dominio (8 pts):** El código debe ser limpio y estar justificado.
*   **Funcionamiento y Pruebas (8 pts):** Resolución exacta de casos base y expresiones ingresadas en vivo.
*   **Calidad del Código (7 pts):** Arquitectura modular (algoritmos base separados de interfaz).
*   **Validaciones (6 pts):** Intercepción de estados inválidos y errores matemáticos sin cierre inesperado de la app.

## Casos de Prueba Críticos (A Garantizar)
El sistema será evaluado obligatoriamente con las siguientes expresiones:
1. `5+3` (Operación sencilla)
2. `(5+3)*2` (Agrupación explícita mediante paréntesis)
3. `7+3*2` (Precedencia de operadores)
4. `((8+2)*3)-(12/4)` (Árbol profundo de varios niveles)
5. `(18-6)/(2+1)` (División y orden riguroso de POPs)
6. `9/(3-3)` (División entre cero controlada por lógica propia)
7. `(5+3` (Paréntesis no balanceados interceptados)