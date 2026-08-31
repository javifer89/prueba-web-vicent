 # 1. PocketBase schema + environments + models
   git add pocketbase-schema.json src/environments/environment.ts src/environments/environment.prod.ts
 src/app/core/services/pocketbase/models.ts
   git commit -m "feat: Add PocketBase schema, environments and core models

   - pocketbase-schema.json: 9 collections (admins, categories, news, events, compositions, media, galleries, biography,
 site_settings)
   - Multi-locale fields (ca/es/en) for all editorial content
   - Access rules: public reads only 'published' status
   - Relations: category, cover, media, galleries
   - Dev/prod environment config with pocketbaseUrl
   - Complete TypeScript models: News, Event, Composition, Media, Gallery, Biography, SiteSettings, Category + FormData types"

   # 2. PocketBase core services
   git add src/app/core/services/pocketbase/ src/app/core/services/admin-auth.guard.ts src/app/core/services/auth.service.ts
   git commit -m "feat: Add PocketBase core services

   - PocketBaseService: CRUD, auth, file uploads, localized field helpers
   - AuthService: signals-based auth state, admin token refresh
   - adminAuthGuard / adminGuestGuard: route protection for admin section"

   # 3. Admin layout + login
   git add src/app/features/admin/layout/ src/app/features/admin/login/
   git commit -m "feat: Add admin layout and login

   - AdminLayoutComponent: collapsible sidebar, responsive header, user avatar/menu, logout
   - AdminLoginComponent: reactive form with validation, error handling, loading states"

   # 4. News admin CRUD
   git add src/app/features/admin/news/
   git commit -m "feat: Add news admin CRUD

   - AdminNewsListComponent: search, status filter, publish/unpublish/archive/delete, translation status badges
   - AdminNewsFormComponent: multi-locale tabs (ca/es/en), SEO fields, cover upload, slug generation, draft/publish actions
   - NewsAdminService: admin-specific news operations"

   # 5. Public news components + service
   git add src/app/features/public/news/
   git commit -m "feat: Add public news components and service

   - NewsListComponent: pagination, category filter, search, loading/error/empty states (fixed multiple subscriptions with
 shareReplay)
   - NewsDetailComponent: full article display, cover image, SEO meta, related news
   - NewsService: published-only queries, featured, latest, search, slug lookup, localized field access"

   # 6. Routes + locale updates + package.json + auth fix
   git add src/app/app.routes.ts src/locale/ca.json src/locale/es.json src/locale/en.json package.json package-lock.json
 src/app/core/services/auth.service.ts
   git commit -m "feat: Configure routes and update locales for news

   - Public routes: /noticias (list), /noticias/:slug (detail)
   - Admin routes: /admin/login, /admin/* protected by guards
   - Locale files: comprehensive news translations (ca/es/en)
   - Add pocketbase dependency to package.json
   - Fix AuthService: reset loading flag on successful login"

   # 7. Fix NewsListComponent: categories sort + signal-based rendering
   git add src/app/features/public/news/news-list.component.ts src/app/features/public/news/news-list.component.html
 src/app/features/admin/news/admin-news-form.component.ts
   git commit -m "fix: NewsListComponent rendering and categories sorting

   - Fix toObservable() usage in field initializer (NG0203)
   - Replace multiple async pipe subscriptions with signal + shareReplay(1)
   - Use computed signals for template: newsItems, totalPages, hasItems
   - Fix categories sort: 'order,name_ca' → 'name_ca' (field 'order' removed from schema)
   - Fix AdminNewsFormComponent categories sort similarly"

   # 8. Categories admin CRUD
   git add src/app/features/admin/categories/
   git commit -m "feat: Add categories admin CRUD

   - AdminCategoriesListComponent: search, type filter, table with type badges, order, color preview
   - AdminCategoriesFormComponent: multi-locale tabs (ca/es/en), slug generation, type select, order, color picker, preview card
   - CategoriesAdminService: CRUD, getByType, reorder, slug generation
   - Type system: CategoryType (news, events, compositions, media, gallery)"

   # 9. Events admin CRUD
   git add src/app/features/admin/events/
   git commit -m "feat: Add events admin CRUD

   - AdminEventsListComponent: search, status filter (upcoming/past), toggle status buttons, date/place/city display
   - AdminEventsFormComponent: multi-locale tabs, date/time/place/city/country, program/performers, image upload, category
 select, status select, featured checkbox
   - EventsAdminService: CRUD, setStatus (upcoming/past), image upload/delete
   - Type system: EventStatus (upcoming, past)"

   # 10. Compositions admin CRUD
   git add src/app/features/admin/compositions/
   git commit -m "feat: Add compositions admin CRUD

   - AdminCompositionsListComponent: search, status filter (draft/published/archived), status toggle buttons,
 year/instrumentation/category/files count display
   - AdminCompositionsFormComponent: multi-locale tabs, slug/year/duration/instrumentation, category, premiere details,
 files/recordings/videos/images/performers arrays, notes
   - CompositionsAdminService: CRUD, setStatus, getByCategory, expand relations
   - Type system: CompositionFormData with all fields"

   # 11. Media admin (list + service, form template pending)
   git add src/app/features/admin/media/admin-media-list.component.ts
 src/app/features/admin/media/admin-media-list.component.html src/app/features/admin/media/admin-media-list.component.scss
 src/app/features/admin/media/media-admin.service.ts
   git commit -m "feat: Add media admin list and service (form template pending)

   - AdminMediaListComponent: search, type filter (image/audio/video/pdf/document), platform filter
 (youtube/vimeo/soundcloud/custom/direct), media grid with thumbnails, external platform icons
   - MediaAdminService: CRUD, getByType, getByCategory, file upload/delete, type/platform labels
   - Type system: MediaType (image/audio/video/pdf/document), PlatformType (youtube/vimeo/soundcloud/custom/direct)" 
