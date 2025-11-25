import express from "express";
import {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "../controllers/addressController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * /api/addresses:
 *   get:
 *     summary: Kullanıcının adreslerini getir
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Adres listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Address'
 *       401:
 *         description: Yetkisiz erişim
 */
router.get("/", authenticateToken, getUserAddresses);

/**
 * @swagger
 * /api/addresses:
 *   post:
 *     summary: Yeni adres ekle
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - street
 *               - city
 *               - zipCode
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Ev Adresi"
 *               street:
 *                 type: string
 *                 example: "Atatürk Caddesi No: 45"
 *               city:
 *                 type: string
 *                 example: "İstanbul"
 *               zipCode:
 *                 type: string
 *                 example: "34380"
 *               phone:
 *                 type: string
 *                 example: "+90 532 123 4567"
 *               isDefault:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: Adres oluşturuldu
 *       401:
 *         description: Yetkisiz erişim
 */
router.post("/", authenticateToken, createAddress);

/**
 * @swagger
 * /api/addresses/{id}:
 *   put:
 *     summary: Adres güncelle
 *     tags: [Addresses]
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
 *               name:
 *                 type: string
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               phone:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Adres güncellendi
 *       404:
 *         description: Adres bulunamadı
 */
router.put("/:id", authenticateToken, updateAddress);

/**
 * @swagger
 * /api/addresses/{id}:
 *   delete:
 *     summary: Adres sil
 *     tags: [Addresses]
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
 *         description: Adres silindi
 *       404:
 *         description: Adres bulunamadı
 */
router.delete("/:id", authenticateToken, deleteAddress);

export default router;
