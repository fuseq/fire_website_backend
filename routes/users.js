import express from "express";
import {
  getAllUsers,
  getUserById,
  toggleAdminStatus,
  deleteUser,
  getUserStats,
} from "../controllers/userController.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Tüm kullanıcıları getir (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcı listesi
 *       403:
 *         description: Admin yetkisi gerekli
 */
router.get("/", authenticateToken, requireAdmin, getAllUsers);

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Kullanıcı istatistikleri (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: İstatistikler
 */
router.get("/stats", authenticateToken, requireAdmin, getUserStats);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Kullanıcı detaylarını getir (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Kullanıcı detayları
 *       404:
 *         description: Kullanıcı bulunamadı
 */
router.get("/:id", authenticateToken, requireAdmin, getUserById);

/**
 * @swagger
 * /api/users/{id}/toggle-admin:
 *   put:
 *     summary: Kullanıcı admin yetkisini değiştir (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isAdmin:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Yetki güncellendi
 *       400:
 *         description: Kendi yetkinizi kaldıramazsınız
 */
router.put("/:id/toggle-admin", authenticateToken, requireAdmin, toggleAdminStatus);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Kullanıcı sil (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Kullanıcı silindi
 *       400:
 *         description: Kendi hesabınızı silemezsiniz
 */
router.delete("/:id", authenticateToken, requireAdmin, deleteUser);

export default router;
