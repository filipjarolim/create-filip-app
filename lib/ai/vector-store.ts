import * as SQLite from 'expo-sqlite';

import { cosineSimilarity } from '@/lib/vector-math';

type MemoryRow = {
  id: string;
  body: string;
  vector: string;
};

let database: SQLite.SQLiteDatabase | null = null;

function db(): SQLite.SQLiteDatabase {
  if (!database) {
    database = SQLite.openDatabaseSync('local-memory.db');
    database.execSync(
      'create table if not exists memories (id text primary key not null, body text not null, vector text not null)',
    );
  }
  return database;
}

export function remember(id: string, body: string, vector: number[]): void {
  db().runSync('insert or replace into memories (id, body, vector) values (?, ?, ?)', id, body, JSON.stringify(vector));
}

export function searchMemories(vector: number[], limit = 3): { id: string; body: string; score: number }[] {
  const rows = db().getAllSync<MemoryRow>('select id, body, vector from memories limit 200');
  return rows
    .map((row) => ({
      id: row.id,
      body: row.body,
      score: cosineSimilarity(vector, JSON.parse(row.vector) as number[]),
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
}
