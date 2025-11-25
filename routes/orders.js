import express from "express";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getOrderStats,
} from "../controllers/orderController.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Yeni sipariş oluştur
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - shippingAddressId
 *               - paymentMethod
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *               shippingAddressId:
 *                 type: integer
 *               paymentMethod:
 *                 type: string
 *                 enum: [card, transfer]
 *               paymentId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sipariş oluşturuldu
 *       401:
 *         description: Yetkisiz erişim
 */
router.post("/", authenticateToken, createOrder);

/**
 * @swagger
 * /api/orders/my-orders:
 *   get:
 *     summary: Kullanıcının siparişlerini getir
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sipariş listesi
 *       401:
 *         description: Yetkisiz erişim
 */
router.get("/my-orders", authenticateToken, getUserOrders);

/**
 * @swagger
 * /api/orders/stats:
 *   get:
 *     summary: Sipariş istatistikleri (Admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: İstatistikler
 *       403:
 *         description: Admin yetkisi gerekli
 */
router.get("/stats", authenticateToken, requireAdmin, getOrderStats);

/**
 * @swagger
 * /api/orders/all:
 *   get:
 *     summary: Tüm siparişleri getir (Admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, cancelled]
 *     responses:
 *       200:
 *         description: Sipariş listesi
 *       403:
 *         description: Admin yetkisi gerekli
 */
router.get("/all", authenticateToken, requireAdmin, getAllOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Sipariş detaylarını getir
 *     tags: [Orders]
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
 *         description: Sipariş detayları
 *       404:
 *         description: Sipariş bulunamadı
 */
router.get("/:id", authenticateToken, getOrderById);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Sipariş durumunu güncelle (Admin)
 *     tags: [Orders]
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, completed, cancelled]
 *     responses:
 *       200:
 *         description: Durum güncellendi
 *       404:
 *         description: Sipariş bulunamadı
 */
router.put("/:id/status", authenticateToken, requireAdmin, updateOrderStatus);

export default router;
