import pool from "../config/database.js";

const testConnection = async () => {
  try {
    console.log("🔍 PostgreSQL bağlantısı test ediliyor...\n");

    // Bağlantı testi
    const result = await pool.query("SELECT NOW() as current_time, version()");
    console.log("✅ Veritabanı bağlantısı başarılı!");
    console.log("⏰ Sunucu zamanı:", result.rows[0].current_time);
    console.log("📦 PostgreSQL versiyonu:", result.rows[0].version.split(" ")[1]);

    // Tablo varlık kontrolü
    console.log("\n📋 Mevcut tablolar:");
    const tables = await pool.query(`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);

    if (tables.rows.length === 0) {
      console.log("⚠️  Hiç tablo bulunamadı!");
      console.log("💡 Tabloları oluşturmak için: npm run db:init");
    } else {
      tables.rows.forEach((table, index) => {
        console.log(`   ${index + 1}. ${table.tablename}`);
      });

      // Her tablodaki kayıt sayısı
      console.log("\n📊 Tablo istatistikleri:");
      for (const table of tables.rows) {
        const count = await pool.query(
          `SELECT COUNT(*) as count FROM ${table.tablename}`
        );
        console.log(`   ${table.tablename}: ${count.rows[0].count} kayıt`);
      }
    }

    console.log("\n🎉 Test tamamlandı!");
  } catch (error) {
    console.error("\n❌ Hata oluştu:");
    console.error("   Mesaj:", error.message);
    
    if (error.code === "ECONNREFUSED") {
      console.log("\n💡 Çözüm önerileri:");
      console.log("   1. PostgreSQL servisi çalışıyor mu kontrol edin");
      console.log("   2. .env dosyasındaki DB_HOST ve DB_PORT değerlerini kontrol edin");
    } else if (error.code === "3D000") {
      console.log("\n💡 Çözüm:");
      console.log("   Veritabanı bulunamadı. Önce veritabanını oluşturun:");
      console.log("   psql -U postgres");
      console.log("   CREATE DATABASE yangin_guvenlik;");
    }
  } finally {
    await pool.end();
    process.exit(0);
  }
};

testConnection();
