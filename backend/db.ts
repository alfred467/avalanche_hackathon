import mysql from 'mysql2';
import 'dotenv/config';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kelf',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Create a wrapper object that matches the sqlite3 interface used in server.ts
export const db = {
  run: (sql: string, params: any[] = [], callback?: (this: any, err: Error | null) => void) => {
    pool.query(sql, params, (err, results: any) => {
      if (callback) {
        callback.call({ lastID: results?.insertId, changes: results?.affectedRows }, err as Error);
      }
    });
  },
  get: (sql: string, params: any[] = [], callback?: (err: Error | null, row: any) => void) => {
    pool.query(sql, params, (err, results: any[]) => {
      if (callback) {
        callback(err as Error, results && results.length > 0 ? results[0] : undefined);
      }
    });
  },
  all: (sql: string, params: any[] = [], callback?: (err: Error | null, rows: any[]) => void) => {
    pool.query(sql, params, (err, results: any[]) => {
      if (callback) {
        callback(err as Error, results);
      }
    });
  }
};

export function initDb() {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    doc_type VARCHAR(50) NOT NULL,
    content LONGTEXT NOT NULL,
    creator_id INT NOT NULL,
    second_party_email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'draft',
    creator_signed TINYINT(1) DEFAULT 0,
    second_party_signed TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users (id)
  )`);
}
