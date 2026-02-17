# src/lib/providers

React context providers that wrap the application. Each provider encapsulates a specific concern (theming, authentication, etc.) and is composed in the root layout.

## Files

- `SettingsContext.tsx` - Global settings store for Template IDs and attribution presets with API-backed SQLite persistence
- `ThemeProvider.tsx` - MUI ThemeProvider + CssBaseline wrapper using the project's default theme
