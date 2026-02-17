/**
 * Server-only SQLite connection manager for the OneLink console.
 */
import 'server-only';

import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

const DEFAULT_DB_FILE_PATH = path.join(process.cwd(), '.data', 'onelink-console.sqlite');
const SQLITE_FILE_PATH = process.env.ONELINK_SQLITE_PATH?.trim() || DEFAULT_DB_FILE_PATH;

let sqliteInstance: Database.Database | null = null;

function ensureDatabaseDirectory(filePath: string): void {
  const directoryPath = path.dirname(filePath);
  fs.mkdirSync(directoryPath, { recursive: true });
}

function initializeSchema(db: Database.Database): void {
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS onelink_links (
      id TEXT PRIMARY KEY,
      link_name TEXT NOT NULL,
      short_link TEXT NOT NULL,
      long_url TEXT NOT NULL,
      template_id TEXT NOT NULL,
      brand_domain TEXT NOT NULL DEFAULT '',
      media_source TEXT NOT NULL DEFAULT '',
      campaign_name TEXT NOT NULL DEFAULT '',
      channel TEXT NOT NULL DEFAULT '',
      creation_type TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}

/**
 * getSqliteDatabase - Returns a singleton SQLite database instance.
 */
export function getSqliteDatabase(): Database.Database {
  if (sqliteInstance) {
    return sqliteInstance;
  }

  ensureDatabaseDirectory(SQLITE_FILE_PATH);
  sqliteInstance = new Database(SQLITE_FILE_PATH);
  initializeSchema(sqliteInstance);

  return sqliteInstance;
}
