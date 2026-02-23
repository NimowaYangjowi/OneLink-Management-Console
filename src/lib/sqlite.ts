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

function hasColumn(db: Database.Database, tableName: string, columnName: string): boolean {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string }>;
  return columns.some((column) => column.name === columnName);
}

function ensureColumn(
  db: Database.Database,
  tableName: string,
  columnName: string,
  definition: string,
): void {
  if (hasColumn(db, tableName, columnName)) {
    return;
  }

  db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition};`);
}

function ensureDatabaseDirectory(filePath: string): void {
  const directoryPath = path.dirname(filePath);
  fs.mkdirSync(directoryPath, { recursive: true });
}

export function ensureOneLinkLinkGroupColumns(db: Database.Database): void {
  ensureColumn(db, 'onelink_links', 'group_id', 'TEXT');
  ensureColumn(db, 'onelink_links', 'group_item_id', 'TEXT');
  ensureColumn(db, 'onelink_link_groups', 'scoped_params_json', 'TEXT NOT NULL DEFAULT \'[]\'');

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_onelink_links_group_id ON onelink_links(group_id);
    CREATE UNIQUE INDEX IF NOT EXISTS uniq_onelink_links_group_item_id ON onelink_links(group_item_id);
  `);
}

function initializeSchema(db: Database.Database): void {
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

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
      group_id TEXT,
      group_item_id TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS onelink_link_groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      template_id TEXT NOT NULL,
      brand_domain TEXT NOT NULL DEFAULT '',
      tree_config_json TEXT NOT NULL,
      global_params_json TEXT NOT NULL DEFAULT '{}',
      scoped_params_json TEXT NOT NULL DEFAULT '[]',
      planned_count INTEGER NOT NULL,
      success_count INTEGER NOT NULL DEFAULT 0,
      failed_count INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS onelink_link_group_nodes (
      id TEXT PRIMARY KEY,
      group_id TEXT NOT NULL,
      parent_node_id TEXT,
      level TEXT NOT NULL,
      value TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      path_key TEXT NOT NULL,
      is_leaf INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (group_id) REFERENCES onelink_link_groups(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_node_id) REFERENCES onelink_link_group_nodes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS onelink_link_group_items (
      id TEXT PRIMARY KEY,
      group_id TEXT NOT NULL,
      leaf_node_id TEXT NOT NULL,
      path_label TEXT NOT NULL,
      variant_key TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      status TEXT NOT NULL,
      short_link TEXT NOT NULL DEFAULT '',
      error_message TEXT NOT NULL DEFAULT '',
      retry_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (group_id) REFERENCES onelink_link_groups(id) ON DELETE CASCADE,
      FOREIGN KEY (leaf_node_id) REFERENCES onelink_link_group_nodes(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_group_nodes_group_id ON onelink_link_group_nodes(group_id);
    CREATE INDEX IF NOT EXISTS idx_group_nodes_parent_node_id ON onelink_link_group_nodes(parent_node_id);
    CREATE INDEX IF NOT EXISTS idx_group_items_group_id ON onelink_link_group_items(group_id);
    CREATE INDEX IF NOT EXISTS idx_group_items_status ON onelink_link_group_items(group_id, status);
    CREATE UNIQUE INDEX IF NOT EXISTS uniq_group_variant_key
      ON onelink_link_group_items(group_id, variant_key);
  `);

  ensureOneLinkLinkGroupColumns(db);
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
