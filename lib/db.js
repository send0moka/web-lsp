import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "lsp_denso.db");

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let _db;

export function getDb() {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    initDatabase(_db);
  }
  return _db;
}

function initDatabase(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id_user INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'admin'
    );

    CREATE TABLE IF NOT EXISTS skema_sertifikasi (
      id_skema INTEGER PRIMARY KEY AUTOINCREMENT,
      kode_skema TEXT NOT NULL UNIQUE,
      nama_skema TEXT NOT NULL,
      jenis_skema TEXT NOT NULL,
      deskripsi TEXT,
      foto_url TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS unit_kompetensi (
      id_unit INTEGER PRIMARY KEY AUTOINCREMENT,
      kode_unit TEXT NOT NULL,
      nama_unit TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS skema_unit (
      id_skema INTEGER NOT NULL,
      id_unit INTEGER NOT NULL,
      urutan INTEGER,
      PRIMARY KEY (id_skema, id_unit),
      FOREIGN KEY (id_skema) REFERENCES skema_sertifikasi(id_skema) ON DELETE CASCADE,
      FOREIGN KEY (id_unit) REFERENCES unit_kompetensi(id_unit) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS asesor_kompetensi (
      id_asesor INTEGER PRIMARY KEY AUTOINCREMENT,
      nama_asesor TEXT NOT NULL,
      no_registrasi TEXT NOT NULL,
      foto_url TEXT
    );

    CREATE TABLE IF NOT EXISTS asesor_skema (
      id_asesor INTEGER NOT NULL,
      id_skema INTEGER NOT NULL,
      PRIMARY KEY (id_asesor, id_skema),
      FOREIGN KEY (id_asesor) REFERENCES asesor_kompetensi(id_asesor) ON DELETE CASCADE,
      FOREIGN KEY (id_skema) REFERENCES skema_sertifikasi(id_skema) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tempat_uji_kompetensi (
      id_tuk INTEGER PRIMARY KEY AUTOINCREMENT,
      kode_tuk TEXT NOT NULL,
      nama_tuk TEXT NOT NULL,
      jenis_tuk TEXT NOT NULL,
      foto_tuk TEXT
    );

    CREATE TABLE IF NOT EXISTS tuk_skema (
      id_tuk INTEGER NOT NULL,
      id_skema INTEGER NOT NULL,
      PRIMARY KEY (id_tuk, id_skema),
      FOREIGN KEY (id_tuk) REFERENCES tempat_uji_kompetensi(id_tuk) ON DELETE CASCADE,
      FOREIGN KEY (id_skema) REFERENCES skema_sertifikasi(id_skema) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS jadwal_sertifikasi (
      id_jadwal INTEGER PRIMARY KEY AUTOINCREMENT,
      id_skema INTEGER NOT NULL,
      id_tuk INTEGER NOT NULL,
      id_asesor INTEGER NOT NULL,
      id_trainer INTEGER NOT NULL,
      tanggal_mulai TEXT NOT NULL,
      tanggal_selesai TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (id_skema) REFERENCES skema_sertifikasi(id_skema),
      FOREIGN KEY (id_tuk) REFERENCES tempat_uji_kompetensi(id_tuk),
      FOREIGN KEY (id_asesor) REFERENCES asesor_kompetensi(id_asesor),
      FOREIGN KEY (id_trainer) REFERENCES asesor_kompetensi(id_asesor)
    );

    CREATE TABLE IF NOT EXISTS pendaftaran_sertifikasi (
      id_pendaftaran INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT,
      npk TEXT,
      seksi TEXT,
      company TEXT,
      plant TEXT,
      pic TEXT,
      id_skema INTEGER,
      id_jadwal INTEGER,
      standard TEXT,
      lembaga TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (id_skema) REFERENCES skema_sertifikasi(id_skema)
    );

    CREATE TABLE IF NOT EXISTS hasil_sertifikasi (
      id_hasil INTEGER PRIMARY KEY AUTOINCREMENT,
      id_pendaftaran INTEGER NOT NULL UNIQUE,
      hasil TEXT,
      keterangan TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (id_pendaftaran) REFERENCES pendaftaran_sertifikasi(id_pendaftaran) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sertifikat (
      id_sertifikat INTEGER PRIMARY KEY AUTOINCREMENT,
      id_hasil INTEGER UNIQUE,
      no_blanko TEXT,
      no_sertifikat TEXT,
      no_registrasi TEXT,
      file_sertifikat TEXT,
      FOREIGN KEY (id_hasil) REFERENCES hasil_sertifikasi(id_hasil) ON DELETE CASCADE
    );
  `);

  const userCount = db.prepare("SELECT COUNT(*) as cnt FROM users").get();
  if (userCount.cnt === 0) {
    db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)")
      .run("admin", "admin", "admin");
  }
}

export async function connectDB() {
  const db = getDb();

  function buildBindParams(rawParams) {
    const result = {};
    for (const [key, value] of Object.entries(rawParams)) {
      result[key] = value === undefined ? null : value;
    }
    return result;
  }

  function executeQuery(sqlText, rawParams) {
    sqlText = sqlText.replace(/GETDATE\(\)/gi, "datetime('now')");
    sqlText = sqlText.replace(
      /FORMAT\(([^,]+),\s*'yyyy-MM-dd'\)/gi,
      "strftime('%Y-%m-%d', $1)"
    );
    sqlText = sqlText.replace(
      /FORMAT\(([^,]+),\s*'dd\/MM\/yyyy'\)/gi,
      "strftime('%d/%m/%Y', $1)"
    );

    const outputMatch = sqlText.match(/OUTPUT\s+INSERTED\.(\w+)/i);
    if (outputMatch) {
      const idColumn = outputMatch[1];
      const cleanSql = sqlText.replace(/\s*OUTPUT\s+INSERTED\.\w+\s*/i, " ");
      const stmt = db.prepare(cleanSql);
      const info = stmt.run(buildBindParams(rawParams));
      return { recordset: [{ [idColumn]: Number(info.lastInsertRowid) }] };
    }

    const stmt = db.prepare(sqlText);
    const isDataStmt = /^\s*SELECT/i.test(sqlText);
    if (isDataStmt) {
      const rows = stmt.all(buildBindParams(rawParams));
      return { recordset: rows };
    }
    stmt.run(buildBindParams(rawParams));
    return { recordset: [] };
  }

  return {
    request() {
      const params = {};
      const req = {
        input(name, typeOrValue, maybeValue) {
          if (maybeValue !== undefined) {
            params[name] = maybeValue;
          } else {
            params[name] = typeOrValue;
          }
          return req;
        },
        query(sqlText) {
          return executeQuery(sqlText, params);
        },
      };
      return req;
    },
    exec(sqlText) {
      db.exec(sqlText);
    },
  };
}
