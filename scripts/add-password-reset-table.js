import pool from "../config/database.js";

const addPasswordResetTable = async () => {
  try {
    console.log("🔄 Password reset tablosu oluşturuluyor...\n");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        reset_token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ password_resets tablosu oluşturuldu");

    // Index ekle
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_password_resets_token 
      ON password_resets(reset_token);
      
      CREATE INDEX IF NOT EXISTS idx_password_resets_user_id 
      ON password_resets(user_id);
    `);

    console.log("✅ Index'ler oluşturuldu");
    console.log("\n🎉 Migration başarıyla tamamlandı!");

  } catch (error) {
    console.error("❌ Hata:", error.message);
    throw error;
  } finally {
    process.exit(0);
  }
};

addPasswordResetTable();
