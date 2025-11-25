import pool from "../config/database.js";

/**
 * Ürün için yorumları getir
 */
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const result = await pool.query(
      `SELECT r.*, u.name as user_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = $1
       ORDER BY r.created_at DESC`,
      [productId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Yorumlar getirilirken hata oluştu",
    });
  }
};

/**
 * Yorum ekle
 */
export const createReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, rating, comment } = req.body;

    // Rating kontrolü
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Değerlendirme 1-5 arasında olmalıdır",
      });
    }

    // Ürünün varlığını kontrol et
    const productCheck = await pool.query(
      "SELECT id FROM products WHERE id = $1",
      [productId]
    );

    if (productCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ürün bulunamadı",
      });
    }

    // Kullanıcının bu ürüne daha önce yorum yapıp yapmadığını kontrol et
    const existingReview = await pool.query(
      "SELECT id FROM reviews WHERE product_id = $1 AND user_id = $2",
      [productId, userId]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Bu ürüne zaten yorum yaptınız",
      });
    }

    const result = await pool.query(
      `INSERT INTO reviews (product_id, user_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [productId, userId, rating, comment]
    );

    res.status(201).json({
      success: true,
      message: "Yorum başarıyla eklendi",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({
      success: false,
      message: "Yorum eklenirken hata oluştu",
    });
  }
};

/**
 * Yorumu güncelle
 */
export const updateReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { rating, comment } = req.body;

    // Rating kontrolü
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: "Değerlendirme 1-5 arasında olmalıdır",
      });
    }

    const result = await pool.query(
      `UPDATE reviews
       SET rating = COALESCE($1, rating),
           comment = COALESCE($2, comment)
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [rating, comment, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Yorum bulunamadı",
      });
    }

    res.json({
      success: true,
      message: "Yorum başarıyla güncellendi",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({
      success: false,
      message: "Yorum güncellenirken hata oluştu",
    });
  }
};

/**
 * Yorum sil
 */
export const deleteReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const isAdmin = req.user.isAdmin;
    const { id } = req.params;

    // Admin değilse sadece kendi yorumunu silebilir
    let query = "DELETE FROM reviews WHERE id = $1";
    const params = [id];

    if (!isAdmin) {
      query += " AND user_id = $2";
      params.push(userId);
    }

    query += " RETURNING id";

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Yorum bulunamadı",
      });
    }

    res.json({
      success: true,
      message: "Yorum başarıyla silindi",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({
      success: false,
      message: "Yorum silinirken hata oluştu",
    });
  }
};
