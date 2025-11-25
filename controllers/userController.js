import pool from "../config/database.js";

/**
 * Tüm kullanıcıları getir (Admin)
 */
export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, name, phone, is_admin, created_at, updated_at 
       FROM users 
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Kullanıcılar getirilirken hata oluştu",
    });
  }
};

/**
 * Kullanıcı detaylarını getir (Admin)
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const userResult = await pool.query(
      `SELECT id, email, name, phone, is_admin, created_at, updated_at 
       FROM users 
       WHERE id = $1`,
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Kullanıcı bulunamadı",
      });
    }

    // Kullanıcının adreslerini getir
    const addressesResult = await pool.query(
      "SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC",
      [id]
    );

    // Kullanıcının siparişlerini getir
    const ordersResult = await pool.query(
      `SELECT o.*, COUNT(oi.id) as items_count
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [id]
    );

    const user = {
      ...userResult.rows[0],
      addresses: addressesResult.rows,
      orders: ordersResult.rows,
    };

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Kullanıcı bilgileri getirilirken hata oluştu",
    });
  }
};

/**
 * Kullanıcı admin yetkisini değiştir (Admin)
 */
export const toggleAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAdmin } = req.body;

    // Kendi yetkini kaldıramazsın
    if (parseInt(id) === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: "Kendi admin yetkinizi kaldıramazsınız",
      });
    }

    const result = await pool.query(
      "UPDATE users SET is_admin = $1 WHERE id = $2 RETURNING id, email, name, is_admin",
      [isAdmin, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Kullanıcı bulunamadı",
      });
    }

    res.json({
      success: true,
      message: "Kullanıcı yetkisi güncellendi",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Toggle admin status error:", error);
    res.status(500).json({
      success: false,
      message: "Yetki güncellenirken hata oluştu",
    });
  }
};

/**
 * Kullanıcı sil (Admin)
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Kendi hesabını silemezsin
    if (parseInt(id) === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: "Kendi hesabınızı silemezsiniz",
      });
    }

    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Kullanıcı bulunamadı",
      });
    }

    res.json({
      success: true,
      message: "Kullanıcı başarıyla silindi",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Kullanıcı silinirken hata oluştu",
    });
  }
};

/**
 * Kullanıcı istatistikleri (Admin)
 */
export const getUserStats = async (req, res) => {
  try {
    // Toplam kullanıcı sayısı
    const totalUsersResult = await pool.query("SELECT COUNT(*) as count FROM users");
    
    // Admin sayısı
    const adminCountResult = await pool.query("SELECT COUNT(*) as count FROM users WHERE is_admin = true");
    
    // Son 7 günde kayıt olan kullanıcılar
    const recentUsersResult = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM users
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    // En aktif kullanıcılar (sipariş sayısına göre)
    const topUsersResult = await pool.query(`
      SELECT u.id, u.name, u.email, COUNT(o.id) as order_count, SUM(o.total_amount) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      GROUP BY u.id
      HAVING COUNT(o.id) > 0
      ORDER BY order_count DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        totalUsers: parseInt(totalUsersResult.rows[0].count),
        adminCount: parseInt(adminCountResult.rows[0].count),
        recentRegistrations: recentUsersResult.rows,
        topUsers: topUsersResult.rows,
      },
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      success: false,
      message: "İstatistikler getirilirken hata oluştu",
    });
  }
};
