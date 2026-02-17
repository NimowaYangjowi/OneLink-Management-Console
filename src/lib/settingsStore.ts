/**
 * Server-side repository for persisting and loading console settings from SQLite.
 */
import 'server-only';

import { getSqliteDatabase } from '@/lib/sqlite';
import { sanitizeSettingsState, type SettingsState } from '@/lib/settingsSchema';

const SETTINGS_ROW_KEY = 'onelink_console_settings_v1';

interface SettingsRow {
  value: string;
}

/**
 * loadSettings - Reads settings from SQLite and returns sanitized state.
 */
export function loadSettings(): SettingsState {
  const db = getSqliteDatabase();
  const row = db
    .prepare('SELECT value FROM app_settings WHERE key = ?')
    .get(SETTINGS_ROW_KEY) as SettingsRow | undefined;

  if (!row) {
    return sanitizeSettingsState(null);
  }

  try {
    const parsed = JSON.parse(row.value) as unknown;
    return sanitizeSettingsState(parsed);
  } catch {
    return sanitizeSettingsState(null);
  }
}

/**
 * saveSettings - Sanitizes and upserts settings into SQLite.
 */
export function saveSettings(state: unknown): SettingsState {
  const sanitizedState = sanitizeSettingsState(state);
  const db = getSqliteDatabase();

  db.prepare(
    `
      INSERT INTO app_settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = CURRENT_TIMESTAMP
    `,
  ).run(SETTINGS_ROW_KEY, JSON.stringify(sanitizedState));

  return sanitizedState;
}
