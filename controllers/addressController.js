import pool from "../config/database.js";

/**
 * Kullanıcının adreslerini getir
 */
export const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      "SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC",
      [userId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get addresses error:", error);
    res.status(500).json({
      success: false,
      message: "Adresler getirilirken hata oluştu",
    });
  }
};

/**
 * Yeni adres ekle
 */
export const createAddress = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user.userId;
    const { name, street, city, zipCode, phone, isDefault } = req.body;

    await client.query("BEGIN");

    // Eğer varsayılan adres olarak işaretlendiyse, diğerlerini kaldır
    if (isDefault) {
      await client.query(
        "UPDATE addresses SET is_default = false WHERE user_id = $1",
        [userId]
      );
    }

    const result = await client.query(
      `INSERT INTO addresses (user_id, name, street, city, zip_code, phone, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, name, street, city, zipCode, phone, isDefault || false]
    );

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Adres başarıyla eklendi",
      data: result.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Create address error:", error);
    res.status(500).json({
      success: false,
      message: "Adres eklenirken hata oluştu",
    });
  } finally {
    client.release();
  }
};

/**
 * Adres güncelle
 */
export const updateAddress = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { name, street, city, zipCode, phone, isDefault } = req.body;

    await client.query("BEGIN");

    // Adresin kullanıcıya ait olduğunu kontrol et
    const checkResult = await client.query(
      "SELECT id FROM addresses WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Adres bulunamadı",
      });
    }

    // Eğer varsayılan adres olarak işaretlendiyse, diğerlerini kaldır
    if (isDefault) {
      await client.query(
        "UPDATE addresses SET is_default = false WHERE user_id = $1",
        [userId]
      );
    }

    const result = await client.query(
      `UPDATE addresses 
       SET name = COALESCE($1, name),
           street = COALESCE($2, street),
           city = COALESCE($3, city),
           zip_code = COALESCE($4, zip_code),
           phone = COALESCE($5, phone),
           is_default = COALESCE($6, is_default)
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [name, street, city, zipCode, phone, isDefault, id, userId]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Adres başarıyla güncellendi",
      data: result.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Update address error:", error);
    res.status(500).json({
      success: false,
      message: "Adres güncellenirken hata oluştu",
    });
  } finally {
    client.release();
  }
};

/**
 * Adres sil
 */
export const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Adres bulunamadı",
      });
    }

    res.json({
      success: true,
      message: "Adres başarıyla silindi",
    });
  } catch (error) {
    console.error("Delete address error:", error);
    res.status(500).json({
      success: false,
      message: "Adres silinirken hata oluştu",
    });
  }
};
