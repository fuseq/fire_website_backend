# 🔥 Yangın Güvenlik E-Ticaret - Backend API

Node.js + Express + PostgreSQL ile geliştirilmiş RESTful API backend.

## 🚀 Özellikler

- ✅ **PostgreSQL** veritabanı entegrasyonu
- ✅ **JWT** tabanlı kimlik doğrulama
- ✅ **Swagger** API dokümantasyonu
- ✅ **İyzico** ödeme entegrasyonu
- ✅ CRUD işlemleri (Ürünler, Siparişler, Adresler, Yorumlar)
- ✅ Admin panel desteği
- ✅ Email gönderimi (Nodemailer)
- ✅ Şifre sıfırlama
- ✅ bcrypt şifre hashleme
- ✅ Express validator
- ✅ CORS desteği

## 📋 Teknolojiler

- **Node.js** 18+
- **Express.js** 5.1.0
- **PostgreSQL** 14+
- **JWT** (jsonwebtoken)
- **bcryptjs** - Şifre hashleme
- **İyzico** - Ödeme gateway
- **Swagger** - API dokümantasyonu
- **Nodemailer** - Email servisi

## 🗄️ Veritabanı Şeması

### Tablolar:
- `users` - Kullanıcılar (admin desteği)
- `products` - Ürünler
- `addresses` - Teslimat adresleri
- `orders` - Siparişler
- `order_items` - Sipariş detayları
- `reviews` - Ürün yorumları
- `password_resets` - Şifre sıfırlama token'ları

## 🔌 API Endpoint'leri

### 🔐 Authentication
```
POST   /api/auth/register      # Kullanıcı kaydı
POST   /api/auth/login         # Kullanıcı girişi
GET    /api/auth/profile       # Profil bilgileri (Token)
PUT    /api/auth/profile       # Profil güncelle (Token)
```

### 📦 Products
```
GET    /api/products            # Tüm ürünler
GET    /api/products/:id        # Tek ürün
GET    /api/products/categories # Kategoriler
POST   /api/products            # Yeni ürün (Admin)
PUT    /api/products/:id        # Güncelle (Admin)
DELETE /api/products/:id        # Sil (Admin)
```

### 🛒 Orders
```
POST   /api/orders              # Sipariş oluştur (Token)
GET    /api/orders/my-orders    # Kullanıcı siparişleri (Token)
GET    /api/orders/:id          # Sipariş detay (Token)
GET    /api/orders/all          # Tüm siparişler (Admin)
GET    /api/orders/stats        # İstatistikler (Admin)
PUT    /api/orders/:id/status   # Durum güncelle (Admin)
```

### 📍 Addresses
```
GET    /api/addresses           # Kullanıcı adresleri (Token)
POST   /api/addresses           # Yeni adres (Token)
PUT    /api/addresses/:id       # Güncelle (Token)
DELETE /api/addresses/:id       # Sil (Token)
```

### ⭐ Reviews
```
GET    /api/reviews/product/:id # Ürün yorumları
POST   /api/reviews             # Yorum ekle (Token)
PUT    /api/reviews/:id         # Güncelle (Token)
DELETE /api/reviews/:id         # Sil (Token/Admin)
```

### 💳 Payment
```
POST   /api/payment/checkout        # Ödeme başlat (İyzico)
POST   /api/payment/callback        # 3D Secure callback
POST   /api/payment/installments    # Taksit bilgileri
GET    /api/payment/check/:id       # Ödeme sorgula
```

### 👥 Users (Admin)
```
GET    /api/users               # Tüm kullanıcılar (Admin)
GET    /api/users/:id           # Kullanıcı detay (Admin)
PUT    /api/users/:id/toggle-admin # Admin yetkisi (Admin)
DELETE /api/users/:id           # Kullanıcı sil (Admin)
GET    /api/users/stats         # İstatistikler (Admin)
```

### 🔑 Password Reset
```
POST   /api/password-reset/request  # Şifre sıfırlama talebi
POST   /api/password-reset/verify   # Token doğrula
POST   /api/password-reset/reset    # Yeni şifre oluştur
```

## 📚 API Dokümantasyonu

Swagger UI: `/api-docs`

## 🛠️ Yerel Kurulum

### 1. Repository'yi klonlayın
```bash
git clone https://github.com/yourusername/yangin-guvenlik-backend.git
cd yangin-guvenlik-backend
```

### 2. Bağımlılıkları yükleyin
```bash
npm install
```

### 3. PostgreSQL database oluşturun
```sql
CREATE DATABASE yangin_guvenlik;
```

### 4. Environment variables
`env.example` dosyasını `.env` olarak kopyalayın ve düzenleyin:

```bash
cp env.example .env
```

Gerekli değişkenler:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET` (min 32 karakter)
- `IYZICO_API_KEY`, `IYZICO_SECRET_KEY`
- Email ayarları (opsiyonel)

### 5. Veritabanı tablolarını oluşturun
```bash
npm run db:init
npm run db:seed    # İlk admin kullanıcı
```

**Admin Bilgileri:**
- Email: `admin@yanginguvenlik.com`
- Şifre: `admin123`

### 6. Sunucuyu başlatın
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Sunucu: `http://localhost:5000`

## 🚀 CapRover'a Deployment

Detaylı deployment rehberi: [DEPLOYMENT.md](./DEPLOYMENT.md)

### Hızlı Başlangıç:

1. **PostgreSQL App Oluştur** (CapRover One-Click Apps)
2. **Backend App Oluştur**
3. **Environment Variables Ayarla**
4. **Deploy:**
```bash
caprover deploy
```

## 🔐 Güvenlik

- ✅ Şifreler bcrypt ile hash'lenir (10 rounds)
- ✅ JWT token'lar 7 gün geçerlidir
- ✅ SQL injection koruması (parametreli sorgular)
- ✅ CORS yapılandırması
- ✅ Admin route'ları JWT middleware ile korumalı
- ✅ Express validator ile input validation

## 📊 NPM Scripts

```bash
npm start                      # Production server
npm run dev                    # Development (auto-reload)
npm run db:init               # Tabloları oluştur
npm run db:seed               # Admin kullanıcı ekle
npm run db:setup              # Init + Seed
npm run db:test               # Bağlantı testi
npm run db:migrate:order-items # Order items migration
```

## 🧪 Test

### Health Check:
```bash
curl http://localhost:5000/health
```

### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yanginguvenlik.com","password":"admin123"}'
```

## 📁 Proje Yapısı

```
backend/
├── config/              # Veritabanı, Email, Swagger config
├── controllers/         # İş mantığı
│   ├── authController.js
│   ├── productController.js
│   ├── orderController.js
│   └── ...
├── middleware/          # JWT auth middleware
├── routes/              # API route'ları
├── scripts/             # Database init/seed scripts
├── server.js            # Ana sunucu dosyası
├── captain-definition   # CapRover deployment
└── package.json
```

## 🔗 İlgili Repolar

- **Frontend:** [yangin-guvenlik-frontend](https://github.com/yourusername/yangin-guvenlik-frontend)

## 🐛 Sorun Giderme

### Veritabanı bağlantı hatası
```
Error: connect ECONNREFUSED
```
**Çözüm:** PostgreSQL servisinin çalıştığından emin olun.

### JWT hatası
```
Error: jwt must be provided
```
**Çözüm:** Authorization header'ı ekleyin: `Bearer YOUR_TOKEN`

## 📄 Lisans

ISC

## 👤 Geliştirici

Yangın Güvenlik E-Ticaret Backend API

---

**🔗 API Base URL:** `https://backend-yangin-guvenlik.yourdomain.com`

**📚 Swagger Docs:** `https://backend-yangin-guvenlik.yourdomain.com/api-docs`



