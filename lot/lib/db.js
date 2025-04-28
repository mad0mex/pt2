import Database from 'better-sqlite3';

const db = new Database('database.sqlite'); // Erstellt die SQLite-Datei

// Falls du Tabellen beim ersten Start automatisch erstellen willst:
db.exec(`
CREATE TABLE IF NOT EXISTS produkte (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  produktname TEXT,
  datum TEXT,
  erstellt_von TEXT
);

CREATE TABLE IF NOT EXISTS zutaten (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT
);

CREATE TABLE IF NOT EXISTS produkt_zutat (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  produkt_id INTEGER,
  zutat_id INTEGER,
  mhd TEXT,
  chargennummer TEXT,
  marke TEXT,
  FOREIGN KEY (produkt_id) REFERENCES produkte(id),
  FOREIGN KEY (zutat_id) REFERENCES zutaten(id)
);
`);

export default db;
