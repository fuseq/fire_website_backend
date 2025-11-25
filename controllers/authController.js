import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/database.js";

/**
 * Kullanıcı kaydı
 */
export const register = async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    // Email kontrolü
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Bu email adresi zaten kullanılıyor",
      });
    }

    // Şifreyi hashle
    const passwordHash = await bcrypt.hash(password, 10);

    // Kullanıcı oluştur
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, phone, is_admin) 
       VALUES ($1, $2, $3, $4, false) 
       RETURNING id, email, name, phone, is_admin, created_at`,
      [email, passwordHash, name, phone || null]
    );

    const user = result.rows[0];

    // JWT token oluştur
    const token = jwt.sign(
      { userId: user.id, email: user.email, isAdmin: user.is_admin },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Kullanıcı başarıyla oluşturuldu",
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          isAdmin: user.is_admin,
        },
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Kayıt sırasında bir hata oluştu",
    });
  }
};

/**
 * Kullanıcı girişi
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kullanıcıyı bul
    const result = await pool.query(
      "SELECT id, email, password_hash, name, phone, is_admin FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Email veya şifre hatalı",
      });
    }

    const user = result.rows[0];

    // Şifre kontrolü
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Email veya şifre hatalı",
      });
    }

    // JWT token oluştur
    const token = jwt.sign(
      { userId: user.id, email: user.email, isAdmin: user.is_admin },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Giriş başarılı",
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          isAdmin: user.is_admin,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Giriş sırasında bir hata oluştu",
    });
  }
};

/**
 * Kullanıcı bilgilerini getir (token ile)
 */
export const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, name, phone, is_admin, created_at FROM users WHERE id = $1",
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Kullanıcı bulunamadı",
      });
    }

    res.json({
      success: true,
      data: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        name: result.rows[0].name,
        phone: result.rows[0].phone,
        isAdmin: result.rows[0].is_admin,
        createdAt: result.rows[0].created_at,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Profil bilgileri alınırken hata oluştu",
    });
  }
};

/**
 * Profil güncelle
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET name = COALESCE($1, name), 
           phone = COALESCE($2, phone)
       WHERE id = $3 
       RETURNING id, email, name, phone, is_admin`,
      [name, phone, req.user.userId]
    );

    res.json({
      success: true,
      message: "Profil başarıyla güncellendi",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Profil güncellenirken hata oluştu",
    });
  }
};
