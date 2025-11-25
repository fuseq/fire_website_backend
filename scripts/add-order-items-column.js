import pool from "../config/database.js";

const addOrderItemsColumn = async () => {
  const client = await pool.connect();
  
  try {
    console.log("🔄 Orders tablosuna order_items_ids sütunu ekleniyor...\n");

    // order_items_ids sütununu ekle (integer array)
    await client.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS order_items_ids INTEGER[] DEFAULT '{}';
    `);
    
    console.log("✅ order_items_ids sütunu eklendi");

    // Mevcut siparişler için order_items_ids'leri doldur
    console.log("\n🔄 Mevcut siparişler için order_items_ids güncelleniyor...");
    
    const ordersResult = await client.query('SELECT id FROM orders');
    
    for (const order of ordersResult.rows) {
      const itemsResult = await client.query(
        'SELECT id FROM order_items WHERE order_id = $1 ORDER BY id ASC',
        [order.id]
      );
      
      const itemIds = itemsResult.rows.map(item => item.id);
      
      if (itemIds.length > 0) {
        await client.query(
          'UPDATE orders SET order_items_ids = $1 WHERE id = $2',
          [itemIds, order.id]
        );
        console.log(`✅ Sipariş #${order.id} için ${itemIds.length} item güncellendi`);
      }
    }

    console.log("\n🎉 Tüm güncellemeler başarıyla tamamlandı!");

  } catch (error) {
    console.error("❌ Hata:", error.message);
    throw error;
  } finally {
    client.release();
  }
};

// Script çalıştırma
addOrderItemsColumn()
  .then(() => {
    console.log("\n✅ Migration tamamlandı");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Migration hatası:", error);
    process.exit(1);
  });
