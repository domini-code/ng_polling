---
name: testing-unitario-angular-jest
description: Guia para escribir y revisar tests unitarios en Angular usando Jest. Use cuando el usuario pida tests unitarios, testing unitario, Jest o archivos .spec.ts en proyectos Angular.
---

# Testing unitario Angular con Jest

## Enfoque
Aplica esta guia para crear o mejorar pruebas unitarias en Angular con Jest. Prioriza aislamiento, determinismo y cobertura de casos relevantes.

## Checklist rapido
- [ ] **Unidad clara**: prueba una clase/componente/servicio por archivo.
- [ ] **AAA**: Arrange, Act, Assert en ese orden.
- [ ] **Aislamiento**: reemplaza dependencias con mocks (`jest.fn()`).
- [ ] **DOM estable**: para componentes usa `TestBed` y `fixture.detectChanges()`.
- [ ] **Async controlado**: usa `fakeAsync` + `tick` o `async/await` + `whenStable`.
- [ ] **HTTP simulado**: `HttpClientTestingModule` o `provideHttpClientTesting`.
- [ ] **Routing simulado**: `RouterTestingModule` o un mock de `Router`.
- [ ] **Observables**: limita emisiones con `take(1)` o `firstValueFrom`.
- [ ] **Errores**: cubre al menos un caso de error relevante.
- [ ] **Determinismo**: evita timers reales, fecha real o random sin control.

## Flujo recomendado
1. Identifica la unidad y su API publica.
2. Lista 2-5 escenarios clave (exito, error, borde).
3. Prepara mocks y datos de prueba.
4. Escribe el test minimo que falle.
5. Ajusta la implementacion o el test y verifica.

## Plantilla de salida
Usa este formato al responder:

```markdown
## Archivos
- `ruta/al/archivo.spec.ts`

## Casos de prueba
- `it('descripcion del caso', ...)`: objetivo y expectativas clave.

## Mocks
- `ServicioX`: `jest.fn()` / `jest.spyOn` con comportamiento definido.

## Notas
- Consideraciones de async, http o routing.
- Suposiciones relevantes.

## Ejecutar tests
- Usa el script de tests definido en `package.json`.
```

## Buenas practicas especificas
- Prefiere probar la API publica; evita tocar miembros privados.
- En componentes, valida cambios en el template con `fixture.nativeElement`.
- Para servicios, prueba efectos en dependencias y valores de retorno.
- Si usas `jest.spyOn`, restaura o reinicia mocks en `afterEach`.

## Evitar
- Tests que dependen de tiempo real o de orden de ejecucion.
- Mocking excesivo que oculte la logica real.
- Repeticion de setup: extrae helpers solo cuando se repite 3+ veces.
