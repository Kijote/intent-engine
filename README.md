# Intent Engine

Motor ultraliviano de interpretación de intenciones multilingüe, portable entre navegador y Node.js.

## Objetivo
Clasificar consultas simples en lenguaje natural sin depender de servicios externos, con modelos pequeños y ejecución local. Separar clasificación, extracción de entidades, diálogo y ejecución de acciones.

## Arquitectura prevista
- **Core JS**: normalización, vectorización TF-IDF de caracteres y clasificación.
- **Training JS**: entrenamiento reproducible y exportación de modelos.
- **Entities**: extractores desacoplados y configurables.
- **Dialog**: seguimiento de parámetros faltantes sin ejecutar acciones.
- **Adapters**: integración opcional con aplicaciones, sin dependencias de framework.
- **Demo y tests**: evaluación de frases en español, inglés y portugués.

## Estado
Repositorio inicializado. La prueba de concepto local ya cuenta con un modelo y código JavaScript; su incorporación completa al repositorio queda pendiente. No hay aún una versión publicada.

## Principios
1. Inferencia local, sin telemetría ni API obligatoria.
2. Modelo de tamaño reducido y rendimiento medible.
3. Umbrales calibrados con conjunto de evaluación independiente.
4. Las aplicaciones validan permisos y confirman operaciones antes de ejecutarlas.
5. La biblioteca no depende de un dominio particular (RR. HH. es el primer ejemplo).

## Próximos pasos
Ver los issues del repositorio para el plan de implementación.
