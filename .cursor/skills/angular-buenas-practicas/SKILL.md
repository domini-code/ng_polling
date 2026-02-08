---
name: angular-buenas-practicas
description: Buenas prácticas de arquitectura y rendimiento en Angular. Use cuando el usuario mencione Angular o pida mejoras/refactor relacionadas con arquitectura, organización o rendimiento.
---

# Buenas prácticas de Angular

## Enfoque
Aplica esta guía para revisar o mejorar arquitectura y rendimiento en proyectos Angular. Prioriza cambios con impacto claro en mantenibilidad y performance.

## Checklist de arquitectura
- [ ] **Límites de features**: cada feature con su carpeta propia; evita dependencias circulares.
- [ ] **Componentes delgados**: lógica de negocio y acceso a datos en servicios o facades.
- [ ] **Separación de responsabilidades**: componentes de presentación sin efectos; contenedores orquestan datos.
- [ ] **Routing por feature**: carga diferida con `loadChildren` o `loadComponent` cuando sea viable.
- [ ] **Reutilización consciente**: usa `shared` solo para componentes/pipes verdaderamente reutilizables.
- [ ] **Inyección de dependencias**: usa `providedIn: 'root'` o `providers` por feature según el ciclo de vida deseado.

## Checklist de rendimiento
- [ ] **Change detection**: `ChangeDetectionStrategy.OnPush` en componentes con entradas inmutables.
- [ ] **Listas eficientes**: `trackBy` en `*ngFor` o `@for` para evitar re-render.
- [ ] **Plantillas ligeras**: evita llamadas a funciones en templates; pre-calcula en el componente.
- [ ] **Pipes puros**: usa pipes puros y evita pipes con efectos secundarios.
- [ ] **Carga diferida de vistas**: considera `@defer`/deferrable views para contenido pesado.
- [ ] **Estado local**: usa `signals`/`computed` cuando ayuden a reducir suscripciones.

## Recomendaciones de salida
- Reporta hallazgos como checklist con prioridad (alto/medio/bajo).
- Propón cambios concretos y acotados (1–3 por iteración).
