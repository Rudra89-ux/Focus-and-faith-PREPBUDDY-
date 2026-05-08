# PrepBuddy Project Guidelines

## Design Philosophy
- **Colors**: Strict black (#0A0A0A), white (#FFFFFF), and shades of grey. Accents should be subtle (purple/cyan for ranks/stats).
- **Aesthetic**: Premium, minimal but high-density. Use large rounded corners (28px-40px).
- **Animations**: Use `motion/react` for all state transitions. Prefer "glassmorphism" for overlays.

## Technical Rules
- **State**: Use `AuthContext` for user profile and auth state.
- **Database**: All focus sessions and tasks are stored in user subcollections.
- **AI**: All accountability logic is in `src/services/geminiService.ts`.
