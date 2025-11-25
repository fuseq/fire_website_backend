import pool from "../config/database.js";
import { sendOrderConfirmationEmail } from "../config/email.js";

/**
 * Sipariş oluştur
 */
export const createOrder = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { items, shippingAddressId, paymentMethod, paymentId } = req.body;
    const userId = req.user.userId;

    console.log("📦 Sipariş oluşturuluyor...");
    console.log("User ID:", userId);
    console.log("Items:", items);
    console.log("Shipping Address ID:", shippingAddressId);
    console.log("Payment Method:", paymentMethod);
    console.log("Payment ID:", paymentId);

    await client.query("BEGIN");

    // Sipariş numarası oluştur
    const orderNumber = `ORD-${Date.now()}`;

    // Toplam tutarı hesapla
    let totalAmount = 0;
    for (const item of items) {
      const productResult = await client.query(
        "SELECT price FROM products WHERE id = $1",
        [item.productId]
      );
      
      if (productResult.rows.length === 0) {
        throw new Error(`Ürün bulunamadı: ${item.productId}`);
      }
      
      totalAmount += productResult.rows[0].price * item.quantity;
    }

    // Siparişi oluştur
    const orderResult = await client.query(
      `INSERT INTO orders (order_number, user_id, total_amount, status, payment_method, payment_id, shipping_address_id)
       VALUES ($1, $2, $3, 'pending', $4, $5, $6)
       RETURNING *`,
      [orderNumber, userId, totalAmount, paymentMethod, paymentId, shippingAddressId]
    );

    const order = orderResult.rows[0];

    // Sipariş öğelerini ekle ve id'lerini topla
    const orderItemIds = [];
    for (const item of items) {
      const productResult = await client.query(
        "SELECT price FROM products WHERE id = $1",
        [item.productId]
      );
      
      const unitPrice = productResult.rows[0].price;
      const totalPrice = unitPrice * item.quantity;

      const itemResult = await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [order.id, item.productId, item.quantity, unitPrice, totalPrice]
      );
      
      orderItemIds.push(itemResult.rows[0].id);
    }

    // Order_items_ids'leri orders tablosuna ekle
    await client.query(
      `UPDATE orders SET order_items_ids = $1 WHERE id = $2`,
      [orderItemIds, order.id]
    );

    await client.query("COMMIT");

    console.log("✅ Sipariş başarıyla oluşturuldu:", order.order_number);
    console.log("Order Items IDs:", orderItemIds);

    // Kullanıcı bilgilerini al (email için)
    const userResult = await pool.query(
      "SELECT name, email FROM users WHERE id = $1",
      [userId]
    );

    // Sipariş ürünlerini al (email için)
    const orderItemsResult = await pool.query(
      `SELECT oi.quantity, oi.unit_price, p.name as product_name
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [order.id]
    );

    // Email gönder (asenkron, hata olsa bile sipariş oluşturuldu)
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      const orderForEmail = {
        orderNumber: order.order_number,
        customerName: user.name,
        date: order.created_at,
        status: order.status,
        total: parseFloat(order.total_amount),
        items: orderItemsResult.rows.map(item => ({
          productName: item.product_name,
          quantity: item.quantity,
          price: parseFloat(item.unit_price),
        })),
      };

      // Email'i arka planda gönder (await kullanmıyoruz, response'u bekletmemek için)
      sendOrderConfirmationEmail(user.email, orderForEmail)
        .then((result) => {
          if (result.success) {
            console.log(`📧 Sipariş onay emaili gönderildi: ${user.email}`);
          } else {
            console.error(`❌ Email gönderilemedi: ${result.error}`);
          }
        })
        .catch((error) => {
          console.error(`❌ Email gönderme hatası:`, error);
        });
    }

    res.status(201).json({
      success: true,
      message: "Sipariş başarıyla oluşturuldu",
      data: {
        orderId: order.id,
        orderNumber: order.order_number,
        totalAmount: order.total_amount,
        orderItemsIds: orderItemIds,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      message: "Sipariş oluşturulurken hata oluştu",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

/**
 * Kullanıcının siparişlerini getir
 */
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Siparişleri getir
    const ordersResult = await pool.query(
      `SELECT o.*, 
              a.name as address_name, a.street, a.city, a.zip_code, a.phone
       FROM orders o
       LEFT JOIN addresses a ON o.shipping_address_id = a.id
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC`,
      [userId]
    );

    // Her sipariş için order_items'ları getir
    const ordersWithItems = await Promise.all(
      ordersResult.rows.map(async (order) => {
        // order_items_ids kullanarak ürünleri getir
        if (order.order_items_ids && order.order_items_ids.length > 0) {
          const itemsResult = await pool.query(
            `SELECT oi.*, 
                    p.name as product_name, 
                    p.image as product_image, 
                    p.category
             FROM order_items oi
             LEFT JOIN products p ON oi.product_id = p.id
             WHERE oi.id = ANY($1)
             ORDER BY oi.id ASC`,
            [order.order_items_ids]
          );

          return {
            ...order,
            items: itemsResult.rows,
            items_count: itemsResult.rows.length,
          };
        } else {
          // Fallback: order_id kullanarak getir (eski siparişler için)
          const itemsResult = await pool.query(
            `SELECT oi.*, 
                    p.name as product_name, 
                    p.image as product_image, 
                    p.category
             FROM order_items oi
             LEFT JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = $1
             ORDER BY oi.id ASC`,
            [order.id]
          );

          return {
            ...order,
            items: itemsResult.rows,
            items_count: itemsResult.rows.length,
          };
        }
      })
    );

    res.json({
      success: true,
      data: ordersWithItems,
    });
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({
      success: false,
      message: "Siparişler getirilirken hata oluştu",
    });
  }
};

/**
 * Sipariş detaylarını getir
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const isAdmin = req.user.isAdmin;

    // Sipariş bilgisi
    let orderQuery = `
      SELECT o.*, 
             u.name as user_name, u.email as user_email, u.phone as user_phone,
             a.name as address_name, a.street, a.city, a.zip_code, a.phone as address_phone
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN addresses a ON o.shipping_address_id = a.id
      WHERE o.id = $1
    `;

    // Admin değilse sadece kendi siparişlerini görebilir
    if (!isAdmin) {
      orderQuery += ` AND o.user_id = $2`;
    }

    const orderParams = isAdmin ? [id] : [id, userId];
    const orderResult = await pool.query(orderQuery, orderParams);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Sipariş bulunamadı",
      });
    }

    // Sipariş öğeleri
    const itemsResult = await pool.query(
      `SELECT oi.*, p.name as product_name, p.image as product_image
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [id]
    );

    const order = {
      ...orderResult.rows[0],
      items: itemsResult.rows,
    };

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({
      success: false,
      message: "Sipariş getirilirken hata oluştu",
    });
  }
};

/**
 * Tüm siparişleri getir (Admin)
 */
export const getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT o.*, 
             u.name as user_name, u.email as user_email,
             COUNT(oi.id) as items_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE 1=1
    `;

    const params = [];
    if (status) {
      query += ` AND o.status = $1`;
      params.push(status);
    }

    query += ` GROUP BY o.id, u.id ORDER BY o.created_at DESC`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({
      success: false,
      message: "Siparişler getirilirken hata oluştu",
    });
  }
};

/**
 * Sipariş durumunu güncelle (Admin)
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "processing", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz sipariş durumu",
      });
    }

    const result = await pool.query(
      "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Sipariş bulunamadı",
      });
    }

    res.json({
      success: true,
      message: "Sipariş durumu güncellendi",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      message: "Sipariş durumu güncellenirken hata oluştu",
    });
  }
};

/**
 * İstatistikler (Admin)
 */
export const getOrderStats = async (req, res) => {
  try {
    // Toplam sipariş sayısı
    const totalOrdersResult = await pool.query("SELECT COUNT(*) as count FROM orders");
    
    // Toplam gelir
    const totalRevenueResult = await pool.query(
      "SELECT SUM(total_amount) as total FROM orders WHERE status = 'completed'"
    );
    
    // Durumlara göre sipariş sayıları
    const statusCountResult = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM orders 
      GROUP BY status
    `);

    // Son 7 günün siparişleri
    const recentOrdersResult = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count, SUM(total_amount) as revenue
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    res.json({
      success: true,
      data: {
        totalOrders: parseInt(totalOrdersResult.rows[0].count),
        totalRevenue: parseFloat(totalRevenueResult.rows[0].total || 0),
        statusCounts: statusCountResult.rows.reduce((acc, row) => {
          acc[row.status] = parseInt(row.count);
          return acc;
        }, {}),
        recentOrders: recentOrdersResult.rows,
      },
    });
  } catch (error) {
    console.error("Get order stats error:", error);
    res.status(500).json({
      success: false,
      message: "İstatistikler getirilirken hata oluştu",
    });
  }
};
