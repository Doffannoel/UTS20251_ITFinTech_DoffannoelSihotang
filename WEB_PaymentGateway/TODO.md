# TODO: Fix Initial Page Rendering to Login and Navbar Visibility

## Tasks

- [x] Replace content of src/app/page.tsx with login page content from src/app/login/page.tsx
- [x] Update src/app/middleware.ts:
  - [x] For path "/", if authenticated, redirect to "/Homepage"; if not, allow rendering the login page
  - [x] Change redirects for protected routes from "/login" to "/" (since root is now login)
  - [x] Keep admin login at "/login/admin"
- [x] Create ConditionalLayout component to conditionally render Header and Footer only on user pages (not on login page)
- [ ] Test that unauthenticated users see the login page first without navbar
- [ ] Verify authenticated users are redirected to "/Homepage" with navbar
- [ ] Ensure admin login still works at "/login/admin" with admin navbar

Super Admin: email superadmin@hotkicks.com, password SuperAdmin123!, role super_admin
Admin Demo: email admin@hotkicks.com, password Admin123!, role admin
Staff Demo: email staff@hotkicks.com, password Staff123!, role staff