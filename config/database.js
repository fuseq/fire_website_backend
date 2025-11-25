import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// PostgreSQL bağlantı havuzu
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "yangin_guvenlik",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  max: 20, // Maksimum bağlantı sayısı
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Bağlantı testi
pool.on("connect", () => {
  console.log("✅ PostgreSQL veritabanına bağlandı");
});

pool.on("error", (err) => {
  console.error("❌ PostgreSQL bağlantı hatası:", err);
  process.exit(-1);
});

export default pool;
