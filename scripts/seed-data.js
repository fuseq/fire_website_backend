import pool from "../config/database.js";
import bcrypt from "bcryptjs";

const seedData = async () => {
  const client = await pool.connect();

  try {
    console.log("🌱 İlk admin kullanıcı oluşturuluyor...\n");

    // Sadece ilk admin kullanıcı ekle
    const adminPasswordHash = await bcrypt.hash("admin123", 10);
    await client.query(`
      INSERT INTO users (email, password_hash, name, phone, is_admin)
      VALUES 
        ('admin@yanginguvenlik.com', $1, 'Admin User', '+90 532 000 0000', true)
      ON CONFLICT (email) DO NOTHING;
    `, [adminPasswordHash]);
    console.log("✅ Admin kullanıcı oluşturuldu");

    console.log("\n🎉 Başlangıç kurulumu tamamlandı!");
    console.log("\n📝 Admin Hesabı:");
    console.log("   Email: admin@yanginguvenlik.com");
    console.log("   Şifre: admin123");
    console.log("\n💡 Diğer verileri admin panel üzerinden ekleyebilirsiniz.");

  } catch (error) {
    console.error("❌ Hata:", error.message);
    throw error;
  } finally {
    client.release();
  }
};

// Script çalıştırma
seedData()
  .then(() => {
    console.log("\n✅ Veri ekleme tamamlandı");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Veri ekleme hatası:", error);
    process.exit(1);
  });
