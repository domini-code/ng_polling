# NgPolling

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.1.3.

## Vídeo

[![Polling en Angular](https://img.youtube.com/vi/rBOoCgY5fpc/maxresdefault.jpg)](https://youtu.be/rBOoCgY5fpc)

## Cómo levantar el proyecto

### 1. Instalar dependencias

```bash
npm install
```

### 2. Levantar el backend (API de métricas)

En una terminal:

```bash
npm run server
```

El servidor Express quedará disponible en **http://localhost:3001** y expone:

- `GET /api/metrics` — métricas mock (CPU, memoria, conexiones, etc.)
- `GET /api/metrics?delay=7000` — misma respuesta con delay opcional (útil para probar timeouts)

### 3. Levantar el cliente (Angular)

En **otra** terminal:

```bash
npm start
```

o:

```bash
ng serve
```

Abre el navegador en **http://localhost:4200/**. La aplicación se recargará al modificar el código.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
