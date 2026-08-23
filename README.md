# Web Profesional - Compositor de Música Clásica

Sitio web oficial para un compositor de música clásica y contemporánea. Desarrollado con Angular 22, TypeScript y SCSS.

## Características

- **Diseño editorial y elegante** - Tipografía cuidada, espacio en blanco, estética atemporal
- **Arquitectura modular** - Feature-based routing, componentes standalone
- **SEO optimizado** - Meta tags dinámicos, Open Graph, JSON-LD, sitemap
- **Accesibilidad WCAG** - HTML semántico, navegación por teclado, contraste, ARIA
- **Responsive mobile-first** - Experiencia diseñada para móvil, tablet y desktop
- **Rendimiento** - Lazy loading, code splitting, optimización de imágenes

## Stack Tecnológico

- **Angular 22** (Standalone Components)
- **TypeScript 7**
- **SCSS** (Diseño system con variables CSS)
- **RxJS** (Gestión de datos reactiva)
- **Angular Router** (Lazy loading por features)

## Estructura del Proyecto

```
src/
├── app/
│   ├── core/
│   │   └── services/           # Servicios compartidos (CompositionService, etc.)
│   ├── features/               # Módulos por funcionalidad (lazy loaded)
│   │   ├── home/               # Página principal
│   │   ├── compositions/       # Catálogo de obras (listado + detalle)
│   │   ├── biography/          # Biografía profesional
│   │   ├── agenda/             # Conciertos y eventos
│   │   ├── multimedia/         # Grabaciones, vídeos, entrevistas
│   │   ├── gallery/            # Galería fotográfica
│   │   └── contact/            # Formulario de contacto
│   ├── layout/
│   │   ├── header/             # Navegación principal (responsive)
│   │   └── footer/             # Pie de página
│   ├── shared/                 # Componentes/pipes reutilizables
│   │   ├── components/
│   │   └── pipes/
│   ├── app.component.ts
│   ├── app.config.ts           # Configuración providers (HttpClient, Router)
│   └── app.routes.ts           # Rutas principales
├── assets/
│   ├── data/                   # JSON estático (compositions.json, etc.)
│   ├── images/
│   └── pdfs/                   # Partituras (referencias)
├── styles.scss                 # Design system global
└── index.html                  # SEO, fuentes, metadatos
```

## Modelo de Datos Principal

```typescript
Composition {
  id, slug, title, year, duration,
  instrumentation, category, description,
  premiere, files[], recordings[],
  videos[], images[], performers[], notes
}
```

## Desarrollo

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (puerto 4201)
npx ng serve --port 4201

# Build producción
npx ng build --configuration production

# Tests
npx ng test

# Linting
npx ng lint
```

## Requisitos

- **Node.js** ≥ 22.22.3 o ≥ 24.15.0 (Angular 22 requiere versiones LTS específicas)
- **npm** ≥ 10

## Despliegue

El build de producción genera archivos estáticos en `dist/` listos para:
- Netlify / Vercel / GitHub Pages
- Servidor web estático (Nginx, Apache)
- CDN + Cloud Functions para formularios

## Próximas Fases (Roadmap)

- [x] Fase 1-2: Base proyecto, layout, routing, header/footer
- [x] Fase 3: Home page
- [x] Fase 4: Obras (listado, filtros, detalle, descargas)
- [x] Fase 5: Biografía
- [x] Fase 6: Agenda
- [ ] Fase 7: Multimedia
- [ ] Fase 8: Galería
- [ ] Fase 9: Contacto
- [ ] Fase 10: SEO avanzado, sitemap, JSON-LD
- [ ] Fase 11: Optimización rendimiento, PWA
- [ ] Fase 12: Testing (unit + e2e)
- [ ] Fase 13: CI/CD, deployment

## Licencia

Proyecto privado - Todos los derechos reservados.