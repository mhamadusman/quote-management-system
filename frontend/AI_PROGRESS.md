# Frontend Progress

## Setup
- **Implemented**: Initialized React + Vite + TypeScript project directly in `frontend/`. Installed core packages (`@mui/material`, `@emotion/react`, `@emotion/styled`, `@mui/icons-material`, `react-router-dom`, `@tanstack/react-query`, `axios`, `framer-motion`, `react-hook-form`).
- **Decisions**: Standard Vite React-TS configuration without nested subdirectories.

## Design System & Theme
- **Implemented**: Configured Material UI theme (`theme/` directory) with custom palette, typography (Inter & Poppins), and component overrides using type-only imports.
- **Inputs & Buttons**: Set 4px subtle rounded border radius across inputs, text fields, buttons, and icon buttons; removed focus shadow ring for clean border focus state.
## Layout & Components
- **Navbar**: Standardized profile pill and logout pill to identical 36px height; condensed user details width with compact typography and overflow truncation in `/src/styles/navbar/navbar.css`.
- **Footer**: Refactored `Footer` to remove image banner and enhanced the top-right half-circle graphic with balanced visibility in `/src/styles/footer/footer.css`.
## Authentication & Routing
- **Routing**: Set up `react-router-dom` with routes for `/login`, `/signup`, and `/` (Dashboard).
- **Service Architecture**: Refactored `AuthService` into class with static methods and explicit try-catch error handling.
## Quotations & Dashboard
- **Quote Components**: Created memoized `QuoteCard`, `QuoteStatusChip` (`draft`, `in_review`, `approved`, `rejected`), and `EmptyQuotes` zero-state components in `/src/components/quotes/`.
- **Dashboard Modularization**: Extracted `DashboardHeader`, `DashboardToolbar`, and `GuestLanding` subcomponents into `/src/components/dashboard/`, and extracted `filterQuotes` logic into `/src/utils/quoteFilter.ts`.
- **Layout**: Fixed `100vh` min/max constraints on Dashboard root with inner scrolling.
- **Next**: Build quote creation modal and corridor attachment selector.




