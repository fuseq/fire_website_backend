import pool from "../config/database.js";

/**
 * Tüm ürünleri getir (filtreleme ve arama desteği)
 */
export const getAllProducts = async (req, res) => {
  try {
    const { category, search, inStock, sortBy = "created_at", order = "DESC" } = req.query;

    let query = "SELECT * FROM products WHERE 1=1";
    const params = [];
    let paramIndex = 1;

    // Kategori filtresi
    if (category && category !== "Tüm Ürünler") {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    // Arama filtresi
    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Stok filtresi
    if (inStock !== undefined) {
      query += ` AND in_stock = $${paramIndex}`;
      params.push(inStock === "true");
      paramIndex++;
    }

    // Sıralama
    const validSortColumns = ["name", "price", "created_at"];
    const validOrders = ["ASC", "DESC"];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : "created_at";
    const sortOrder = validOrders.includes(order.toUpperCase()) ? order.toUpperCase() : "DESC";
    
    query += ` ORDER BY ${sortColumn} ${sortOrder}`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      success: false,
      message: "Ürünler getirilirken hata oluştu",
    });
  }
};

/**
 * Tek bir ürünü getir (yorumlar ile)
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Ürün bilgisi
    const productResult = await pool.query(
      "SELECT * FROM products WHERE id = $1",
      [id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ürün bulunamadı",
      });
    }

    // Yorumlar
    const reviewsResult = await pool.query(
      `SELECT r.*, u.name as user_name 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.product_id = $1 
       ORDER BY r.created_at DESC`,
      [id]
    );

    const product = {
      ...productResult.rows[0],
      reviews: reviewsResult.rows.map(review => ({
        id: review.id,
        userName: review.user_name,
        rating: review.rating,
        comment: review.comment,
        date: review.created_at,
      })),
    };

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      success: false,
      message: "Ürün getirilirken hata oluştu",
    });
  }
};

/**
 * Yeni ürün ekle (Admin)
 */
export const createProduct = async (req, res) => {
  try {
    const { name, category, price, image, images, description, specs, inStock } = req.body;

    const result = await pool.query(
      `INSERT INTO products (name, category, price, image, images, description, specs, in_stock) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [name, category, price, image || null, images || [], description || null, specs || [], inStock !== false]
    );

    res.status(201).json({
      success: true,
      message: "Ürün başarıyla oluşturuldu",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({
      success: false,
      message: "Ürün oluşturulurken hata oluştu",
    });
  }
};

/**
 * Ürün güncelle (Admin)
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, image, images, description, specs, inStock } = req.body;

    const result = await pool.query(
      `UPDATE products 
       SET name = COALESCE($1, name),
           category = COALESCE($2, category),
           price = COALESCE($3, price),
           image = COALESCE($4, image),
           images = COALESCE($5, images),
           description = COALESCE($6, description),
           specs = COALESCE($7, specs),
           in_stock = COALESCE($8, in_stock)
       WHERE id = $9 
       RETURNING *`,
      [name, category, price, image, images, description, specs, inStock, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ürün bulunamadı",
      });
    }

    res.json({
      success: true,
      message: "Ürün başarıyla güncellendi",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({
      success: false,
      message: "Ürün güncellenirken hata oluştu",
    });
  }
};

/**
 * Ürün sil (Admin)
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ürün bulunamadı",
      });
    }

    res.json({
      success: true,
      message: "Ürün başarıyla silindi",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: "Ürün silinirken hata oluştu",
    });
  }
};

/**
 * Kategorileri getir
 */
export const getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT DISTINCT category FROM products ORDER BY category"
    );

    const categories = ["Tüm Ürünler", ...result.rows.map(row => row.category)];

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Kategoriler getirilirken hata oluştu",
    });
  }
};
