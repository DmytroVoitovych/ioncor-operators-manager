

# Ioncor Operators Manager

## Description

**Ioncor Operators Manager** is a modern web application for managing operators, stations, and shifts in a production environment. The project is built with Vue 3, Pinia, Vite, and Element Plus. It provides a flexible and scalable solution for production teams to efficiently manage personnel assignments, track operator activity, and maintain operational transparency.


## Features

- **Operator Management:** Add, edit, and remove operators. Assign operators to stations and manage their status.
- **Station Assignment:** Assign operators to stations, track current and historical assignments, and manage unassigned operators.
- **Shift and Status Tracking:** Monitor operator shifts, statuses (available, absent, etc.), and station visit history.
- **Unique Schedule Generation:** Automatically generate the most unique and non-repetitive operator schedules for stations, minimizing repeat assignments and maximizing rotation.
- **Authorization:** Secure login and access control for different user roles.
- **Notifications:** Real-time notifications for important events and errors.
- **Snapshots:** Save and restore station/operator states for shift changes or audits.
- **Screenshot Utility:** Capture interface screenshots for reporting or documentation.
- **Responsive UI:** Optimized for desktop and tablet devices.


## Technologies

- [Vue 3](https://vuejs.org/) — Progressive JavaScript framework
- [Vite](https://vitejs.dev/) — Fast build tool and dev server
- [Pinia](https://pinia.vuejs.org/) — State management
- [Element Plus](https://element-plus.org/) — UI component library
- [VueUse](https://vueuse.org/) — Collection of essential Vue Composition API utilities
- [Lodash](https://lodash.com/) — Utility library for working with arrays, objects, and functions
- [Supabase](https://supabase.com/) — Backend as a service (database, authentication)
- SCSS, TypeScript

## Project Structure

```
├── public/                # Static files (icons, SVGs)
├── src/
│   ├── assets/            # Fonts, images, global styles
│   ├── components/        # UI components (auth, common, layout, stations, workers)
│   ├── composables/       # Vue composables (useAuth, useScreenshot)
│   ├── maintypes/         # TypeScript types and interfaces
│   ├── modules/           # Pinia modules
│   ├── pages/             # Application pages (index.vue)
│   ├── store/             # Pinia stores (notifications, stations, workers)
│   ├── styles/            # SCSS styles (global, mixins, typography, variables)
│   └── utils/             # Utility functions (assignWorkers, helpers, supabase)
├── index.html             # Main HTML file
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
└── README.MD              # Documentation
```

## Main Modules

- **src/components/**  
   - `auth/` — Authentication forms and logic  
   - `common/` — Shared UI elements (logo, buttons)  
   - `layout/` — Page layout components (header, footer, preloader)  
   - `stations/` — Station management UI and logic  
   - `workers/` — Operator management UI and logic

- **src/store/**  
   - `workers.ts` — Operator state, actions, and mutations  
   - `stations.ts` — Station state and assignment logic  
   - `notifications.ts` — Notification system

- **src/utils/**  
   - `assignWorkers.ts` — Worker assignment logic  
   - `helpers.ts` — Utility functions  
   - `supabase.ts` — API integration

- **src/maintypes/types.ts**  
   - Centralized TypeScript types for operators, stations, statuses, etc.

## Usage

### Quick Start

1. Install dependencies:
    ```bash
    npm install
    ```
2. Start the development server:
    ```bash
    npm run dev
    ```
3. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

### Environment

- Node.js >= 18
- npm >= 9

## API & Data

- Uses Supabase for database and authentication.
- Operator and station data are stored in Supabase tables.
- All CRUD operations are performed via Supabase client in `src/utils/supabase.ts`.

## Contribution

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature`
3. Make your changes and commit: `git commit -m 'Add your feature'`
4. Push to your branch: `git push origin feature/your-feature`
5. Open a pull request.

Please write clear commit messages and document your code.

## License

This project is licensed under the MIT License.

## Contacts

- Author: Dmytro Voitovych
- Telegram: [@voitovychd](https://t.me/voitovychd)

---

**Ioncor Operators Manager** — your tool for efficient production management!
