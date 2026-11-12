## 🛠️ Admin Panel (Angular)

This repository contains an Admin Panel built with Angular.
The project is currently a work in progress and is being developed as the management interface for a Spa & Massage booking application.

The purpose of this admin panel is to allow administrators to view and manage bookings made through the customer-facing app.

## 🚀 Tech Stack

* Frontend
    * Angular
    * TypeScript
    * HTML
    * CSS
    * Backend (In Progress)
    * FastAPI (planned)
    * REST API

## ✨ Current Features

* Admin panel UI layout

* Bookings dashboard with live updates (server-sent events), search by name and status filtering

* Status changes (confirm / cancel / restore) and deletion, both behind a confirmation dialog

* Per-status statistics derived from the loaded bookings

* Lazy-loaded bookings feature, standalone components and OnPush change detection

## 🧱 Project Structure

The app is organized by feature, not by file type. One feature, one folder.

```text
src/app/
  app.component.ts / app.config.ts / app.routes.ts
  core/
    api/                     # ApiClient: base URL, SSE boundary, error mapping
  shared/
    ui/confirm-dialog/       # generic, reusable UI
  features/
    bookings/
      bookings.routes.ts     # lazy-loaded feature route + store provider
      api/                   # typed endpoints only (BookingApi)
      model/                 # domain types and pure selectors
      data/                  # BookingsStore (signal state)
      ui/                    # page + stats, filters, table, row components
      index.ts               # public surface of the feature
```

Rules enforced by ESLint (`import/no-restricted-paths`):

* `features/*` may import `core/*` and `shared/*`; features never import each other.
* `shared/*` and `core/*` must not depend on a feature.
* Path aliases (`@app`, `@core`, `@shared`, `@features`, `@env`, `@testing`) replace deep relative imports.

State lives in signals inside `BookingsStore`: server data, loading/error flags and
filter state, with `stats` and `filteredBookings` as `computed` values. Components
never call `markForCheck`, never subscribe to HTTP directly, and never recompute
derived lists by hand.

## 🛠️ Scripts

* `npm start` — dev server at http://localhost:4200/admin
* `npm run build` — production build (enforces bundle and component-style budgets)
* `npm test` — Karma/Jasmine unit tests
* `npm run lint` — ESLint, including the architectural boundaries

## 🔒 Planned Features

* Admin login and authentication

* Secure role-based access

* Integration with FastAPI backend

* View all bookings from the Spa & Massage app

* Edit and delete bookings

* Improved UI and data tables

## ⚙️ Setup & Installation

* Clone the repository

* git clone https://github.com/your-username/admin-panel-angular.git

* Install dependencies

* npm install

* Run the application

* ng serve

* Open in browser

* Navigate to http://localhost:4200/admin

## 🎯 Project Goal

* This admin panel is being built to:

* Manage bookings from the Spa & Massage customer app

* Practice Angular application structure at scale

* Integrate a frontend admin dashboard with a FastAPI backend

* Strengthen full-stack development skills

## 🚧 Status

This project is under active development
Features and structure are evolving as the backend API is completed.

## 🤝 Contributions

Suggestions and feedback are welcome. Feel free to open an issue or follow the project as it progresses.
