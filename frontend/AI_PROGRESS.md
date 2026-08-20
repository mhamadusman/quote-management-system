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
## Common Utility Components & Architecture
- **Memoized Inputs & Buttons**: Created reusable components (`FormInput`, `PasswordInput`, `SubmitButton`) in `/src/components/common/` wrapped in `React.memo` for optimal render performance and error label encapsulation.
- **Auth Card & Password Checklist**: Extracted `AuthCard` layout and `PasswordRules` into `/src/components/auth/`, condensing both `LoginPage.tsx` and `SignupPage.tsx` down to lightweight ~50 line components.
- **Next**: Build corridor listing, quote creation engine, and metrics summary tables.


