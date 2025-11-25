import express from "express";
import {
  requestPasswordReset,
  validateResetToken,
  resetPassword,
} from "../controllers/passwordResetController.js";

const router = express.Router();

/**
 * @swagger
 * /api/password-reset/request:
 *   post:
 *     summary: Şifre sıfırlama talebi oluştur
 *     tags: [Password Reset]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Email gönderildi
 *       400:
 *         description: Geçersiz istek
 */
router.post("/request", requestPasswordReset);

/**
 * @swagger
 * /api/password-reset/validate:
 *   post:
 *     summary: Reset token'ını doğrula
 *     tags: [Password Reset]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token geçerli
 *       400:
 *         description: Geçersiz token
 */
router.post("/validate", validateResetToken);

/**
 * @swagger
 * /api/password-reset/reset:
 *   post:
 *     summary: Şifreyi sıfırla
 *     tags: [Password Reset]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Şifre sıfırlandı
 *       400:
 *         description: Geçersiz istek
 */
router.post("/reset", resetPassword);

export default router;
