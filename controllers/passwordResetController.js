import pool from "../config/database.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../config/email.js";

/**
 * Şifre sıfırlama talebi oluştur
 */
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email adresi gereklidir",
      });
    }

    // Kullanıcıyı bul
    const userResult = await pool.query(
      "SELECT id, email, name FROM users WHERE email = $1",
      [email]
    );

    // Güvenlik: Email bulunamasa bile başarılı mesajı döndür (email enumeration saldırılarını önlemek için)
    if (userResult.rows.length === 0) {
      return res.json({
        success: true,
        message: "Eğer bu email adresi kayıtlıysa, şifre sıfırlama linki gönderildi.",
      });
    }

    const user = userResult.rows[0];

    // Random token oluştur
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Token'ı veritabanına kaydet (1 saat geçerli)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 saat

    // Eski token'ları sil
    await pool.query("DELETE FROM password_resets WHERE user_id = $1", [user.id]);

    // Yeni token ekle
    await pool.query(
      "INSERT INTO password_resets (user_id, reset_token, expires_at) VALUES ($1, $2, $3)",
      [user.id, hashedToken, expiresAt]
    );

    // Email gönder
    const emailResult = await sendPasswordResetEmail(user.email, resetToken);

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: "Email gönderilemedi. Lütfen daha sonra tekrar deneyin.",
      });
    }

    console.log(`✅ Şifre sıfırlama emaili gönderildi: ${user.email}`);

    res.json({
      success: true,
      message: "Eğer bu email adresi kayıtlıysa, şifre sıfırlama linki gönderildi.",
    });
  } catch (error) {
    console.error("Request password reset error:", error);
    res.status(500).json({
      success: false,
      message: "Bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
    });
  }
};

/**
 * Şifre sıfırlama token'ını doğrula
 */
export const validateResetToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token gereklidir",
      });
    }

    // Token'ı hashle
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Token'ı bul ve süresi dolmamış olmalı
    const result = await pool.query(
      `SELECT pr.*, u.email 
       FROM password_resets pr
       JOIN users u ON pr.user_id = u.id
       WHERE pr.reset_token = $1 AND pr.expires_at > NOW()`,
      [hashedToken]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz veya süresi dolmuş token",
      });
    }

    res.json({
      success: true,
      message: "Token geçerli",
    });
  } catch (error) {
    console.error("Validate token error:", error);
    res.status(500).json({
      success: false,
      message: "Token doğrulanamadı",
    });
  }
};

/**
 * Şifreyi sıfırla
 */
export const resetPassword = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token ve yeni şifre gereklidir",
      });
    }

    // Şifre uzunluğu kontrolü
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Şifre en az 6 karakter olmalıdır",
      });
    }

    // Token'ı hashle
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    await client.query("BEGIN");

    // Token'ı bul ve süresi dolmamış olmalı
    const result = await client.query(
      `SELECT pr.*, u.email 
       FROM password_resets pr
       JOIN users u ON pr.user_id = u.id
       WHERE pr.reset_token = $1 AND pr.expires_at > NOW()`,
      [hashedToken]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "Geçersiz veya süresi dolmuş token",
      });
    }

    const resetRecord = result.rows[0];

    // Yeni şifreyi hashle
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Kullanıcının şifresini güncelle
    await client.query(
      "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2",
      [hashedPassword, resetRecord.user_id]
    );

    // Kullanılan token'ı sil
    await client.query("DELETE FROM password_resets WHERE user_id = $1", [
      resetRecord.user_id,
    ]);

    await client.query("COMMIT");

    console.log(`✅ Şifre sıfırlandı: ${resetRecord.email}`);

    res.json({
      success: true,
      message: "Şifreniz başarıyla sıfırlandı. Giriş yapabilirsiniz.",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Şifre sıfırlanamadı",
    });
  } finally {
    client.release();
  }
};

/**
 * Süresi dolmuş token'ları temizle (Cron job için)
 */
export const cleanupExpiredTokens = async () => {
  try {
    const result = await pool.query(
      "DELETE FROM password_resets WHERE expires_at < NOW()"
    );
    console.log(`🧹 ${result.rowCount} süresi dolmuş token temizlendi`);
  } catch (error) {
    console.error("Cleanup expired tokens error:", error);
  }
};
