# HIUHU — Author & Poet Literary Folio & CMS

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://hiuhu.org)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-5.20-2d3748)](https://www.prisma.io)
[![Vitest](https://img.shields.io/badge/Vitest-2.1-729b1a)](https://vitest.dev)

> **"Where Voices Echo Through Time"**  
> **HIUHU** is a focused, refined literary author website and content management system (CMS) belonging to author, poet, and essayist **HIUHU**.

---

## Overview

HIUHU has been thoughtfully designed to reduce platform clutter and cognitive overload, providing an intimate, serene author experience rather than a generic multi-tenant directory:

1. **Individual Author Focus**:
   - The platform is the dedicated home of author **HIUHU**.
   - All published books, collections, structural poems, essays, and short stories are authored by HIUHU.
   - The public experience highlights the author's biography, artistic manifesto, published books catalog, verse, and personal dispatches.
2. **Decluttered Editorial Navigation**:
   - Streamlined menu: **Books** (`/books`), **Poetry** (`/poems`), **Essays** (`/articles`), **Stories** (`/stories`), **About the Author** (`/about`), **Contact** (`/contact`).
   - Legacy author directory URLs seamlessly route to the author's official folio.
3. **Author Studio CMS (`/admin`)**:
   - Tailored personal publishing workspace for HIUHU to draft, edit, and publish manuscripts, catalog new book editions, manage reader discourse, and curate the site.

---

## Architecture & Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) App Router (React 18 Server Components & Route Handlers)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom literary palette (`parchment`, `ink`, `amber`, `crimson`)
- **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) (Neon Serverless) with [Prisma ORM](https://www.prisma.io/)
- **Authentication & Security**: Salted `bcryptjs` password hashing, stateless `jose` JWT session tokens in `HttpOnly` Secure cookies, and role-based access control (RBAC)
- **Validation**: Strict [Zod](https://zod.dev/) schemas
- **Testing**: [Vitest](https://vitest.dev/) automated test suite (21/21 passing)

---

## Author Experience & Folio Features

### Public Website
- **Author Masthead & Hero**: Elegant introduction to HIUHU's literary philosophy, quick search bar, and direct navigational pathways to books and poetry.
- **Author Spotlight**: Intimate profile section with portrait, location, literary background, and link to the author's full biography and manifesto.
- **Published Books Catalog (`/books` & `/books/[slug]`)**: Detailed volume listings with ISBN, publisher, publication date, synopsis, and purchase links.
- **Poetry Mode (`/poems` & `/poems/[slug]`)**: Dedicated verse typography that faithfully preserves line breaks and stanza structure without collapsing.
- **Long-Form Essays (`/articles` & `/articles/[slug]`)**: Philosophical prose with reading time estimates, author bio, and structured schema markup.
- **Fiction Stories (`/stories` & `/stories/[slug]`)**: Short stories and serialized fiction.
- **Biography & Manifesto (`/about`)**: Full author biography, artistic manifesto, press inquiries, and bibliography.
- **Reader Bookmarks (`/bookmarks`)**: Local reading list to save works for offline contemplation.
- **Reader Discourse**: Moderated comment system where readers can submit reflections on specific works.

### Author Studio CMS (`/admin`)
- **Dashboard & Readership Insights** (`/admin`, `/admin/analytics`): View count leaderboards, publication totals, and reading metrics.
- **Content Studio** (`/admin/content`, `/new`, `/[id]/edit`): Editorial editor for Articles, Poetry, and Stories with excerpt generators, tag selection, and SEO metadata.
- **Book Publishing Manager** (`/admin/books`, `/new`, `/[id]/edit`): Catalog management for published books and chapbooks.
- **Author Profile Folio** (`/admin/authors`): Edit HIUHU's personal bio, photo, location, and social links.
- **Reader Comments Queue** (`/admin/comments`): Review, approve, reject, or flag reader discourse.
- **Homepage Layout CMS** (`/admin/homepage`): Arrange homepage sections and toggle visibility.
- **Site Settings & SEO** (`/admin/settings`, `/admin/seo`, `/admin/navigation`): Fine-tune typography, OpenGraph cards, and navigational links.
- **Audit Governance Log** (`/admin/audit-logs`): Searchable audit trail recording publishing actions.

---

## Quick Start & Verification

### 1. Database Seeding (Author HIUHU Mode)
```bash
# Push schema and seed author catalog
npm run prisma:push
npm run db:seed
```

### 2. Run Automated Tests
```bash
npm test
```
*Result: 21 / 21 tests pass across auth, rbac, slug, and validation schemas.*

### 3. Build & Run
```bash
# Build optimized production bundle
npm run build

# Start production server
npm run start

# Or start development server
npm run dev
```

---

## Default Credentials

| Identity | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **HIUHU (Author & Administrator)** | `admin@hiuhu.org` | `AdminPassword2026!` | `SUPER_ADMIN` |

---

© 2026 **HIUHU**. All rights reserved.
