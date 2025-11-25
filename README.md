# Yangın Güvenlik E-Ticaret Backend API

PostgreSQL veritabanı ve RESTful API ile tam özellikli e-ticaret backend sistemi.

## 🚀 Özellikler

- ✅ **PostgreSQL** veritabanı entegrasyonu
- ✅ **JWT** tabanlı kimlik doğrulama
- ✅ **Swagger** API dokümantasyonu
- ✅ **İyzico** ödeme entegrasyonu
- ✅ CRUD işlemleri (Ürünler, Siparişler, Adresler, Yorumlar)
- ✅ Admin panel desteği
- ✅ Otomatik timestamp'ler
- ✅ Transaction desteği

## 📋 Gereksinimler

- Node.js 18+
- PostgreSQL 14+
- npm veya yarn

## 🛠️ Kurulum

### 1. Bağımlılıkları Yükle

```bash
npm install
```

### 2. .env Dosyası Oluştur

Proje kök dizininde `.env` dosyası oluşturun:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=yangin_guvenlik
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this

# İyzico Payment Configuration
IYZICO_API_KEY=your-iyzico-api-key
IYZICO_SECRET_KEY=your-iyzico-secret-key
IYZICO_URI=https://sandbox-api.iyzipay.com
```

### 3. PostgreSQL Veritabanı Oluştur

pgAdmin veya psql ile:

```sql
CREATE DATABASE yangin_guvenlik;
```

### 4. Veritabanı Tablolarını Oluştur

```bash
npm run db:init
```

Bu komut şu tabloları oluşturur:
- `users` - Kullanıcılar
- `products` - Ürünler
- `addresses` - Adresler
- `orders` - Siparişler
- `order_items` - Sipariş öğeleri
- `reviews` - Ürün yorumları

### 5. İlk Admin Kullanıcı Oluştur (Opsiyonel)

```bash
npm run db:seed
```

**Admin Bilgileri:**
- Email: `admin@yanginguvenlik.com`
- Şifre: `admin123`

### 6. Sunucuyu Başlat

```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

Sunucu `http://localhost:5000` adresinde çalışacak.

## 📚 API Dokümantasyonu

API dokümantasyonuna erişmek için tarayıcınızda açın:

```
http://localhost:5000/api-docs
```

## 🔌 API Endpoint'leri

### Kimlik Doğrulama
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `GET /api/auth/profile` - Profil bilgileri (🔒 Token gerekli)
- `PUT /api/auth/profile` - Profil güncelle (🔒 Token gerekli)

### Ürünler
- `GET /api/products` - Tüm ürünleri listele
- `GET /api/products/:id` - Tek ürün detayı
- `GET /api/products/categories` - Kategorileri listele
- `POST /api/products` - Yeni ürün ekle (🔒 Admin)
- `PUT /api/products/:id` - Ürün güncelle (🔒 Admin)
- `DELETE /api/products/:id` - Ürün sil (🔒 Admin)

### Siparişler
- `POST /api/orders` - Sipariş oluştur (🔒 Token gerekli)
- `GET /api/orders/my-orders` - Kullanıcının siparişleri (🔒 Token gerekli)
- `GET /api/orders/:id` - Sipariş detayı (🔒 Token gerekli)
- `GET /api/orders/all` - Tüm siparişler (🔒 Admin)
- `GET /api/orders/stats` - İstatistikler (🔒 Admin)
- `PUT /api/orders/:id/status` - Sipariş durumu güncelle (🔒 Admin)

### Adresler
- `GET /api/addresses` - Kullanıcının adresleri (🔒 Token gerekli)
- `POST /api/addresses` - Yeni adres ekle (🔒 Token gerekli)
- `PUT /api/addresses/:id` - Adres güncelle (🔒 Token gerekli)
- `DELETE /api/addresses/:id` - Adres sil (🔒 Token gerekli)

### Yorumlar
- `GET /api/reviews/product/:productId` - Ürün yorumları
- `POST /api/reviews` - Yorum ekle (🔒 Token gerekli)
- `PUT /api/reviews/:id` - Yorum güncelle (🔒 Token gerekli)
- `DELETE /api/reviews/:id` - Yorum sil (🔒 Token gerekli veya Admin)

### Ödeme
- `POST /api/payment/checkout` - Ödeme başlat (İyzico 3D Secure)
- `POST /api/payment/callback` - 3D Secure callback
- `POST /api/payment/installments` - Taksit bilgileri
- `GET /api/payment/check/:paymentId` - Ödeme sorgula

## 🔐 Authentication (JWT)

API isteklerinde Authorization header'ı kullanın:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

**Örnek:**

```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 📊 Veritabanı Şeması

### Users
```sql
id, email, password_hash, name, phone, is_admin, created_at, updated_at
```

### Products
```sql
id, name, category, price, image, images[], description, specs[], in_stock, created_at, updated_at
```

### Orders
```sql
id, order_number, user_id, total_amount, status, payment_method, payment_id, shipping_address_id, created_at, updated_at
```

### Order Items
```sql
id, order_id, product_id, quantity, unit_price, total_price, created_at
```

### Addresses
```sql
id, user_id, name, street, city, zip_code, phone, is_default, created_at, updated_at
```

### Reviews
```sql
id, product_id, user_id, rating, comment, created_at
```

## 🧪 Test

### Health Check
```bash
curl http://localhost:5000/health
```

### Register Test
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "phone": "+90 532 123 4567"
  }'
```

### Login Test
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yanginguvenlik.com",
    "password": "admin123"
  }'
```

## 📝 NPM Scripts

```bash
npm start          # Sunucuyu başlat
npm run dev        # Development mode (auto-reload)
npm run db:init    # Veritabanı tablolarını oluştur
npm run db:seed    # İlk admin kullanıcı ekle
npm run db:setup   # Hem init hem seed çalıştır
```

## 🛡️ Güvenlik

- ✅ Şifreler bcrypt ile hash'lenir (10 rounds)
- ✅ JWT token'lar 7 gün geçerlidir
- ✅ SQL injection koruması (parametreli sorgular)
- ✅ CORS yapılandırması
- ✅ Admin route'ları korumalı

## 🔄 Veritabanı İşlemleri

### Tabloları Sıfırla
```sql
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

Sonra tekrar:
```bash
npm run db:setup
```

## 📦 Kullanılan Teknolojiler

- **Express.js** - Web framework
- **PostgreSQL** - Veritabanı
- **node-postgres (pg)** - PostgreSQL client
- **JWT** - Token authentication
- **bcryptjs** - Şifre hashleme
- **Swagger** - API dokümantasyonu
- **İyzico** - Ödeme gateway

## 🐛 Sorun Giderme

### Veritabanı Bağlantı Hatası
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Çözüm:** PostgreSQL servisinin çalıştığından emin olun.

### JWT Secret Hatası
```
Error: secretOrPrivateKey must have a value
```
**Çözüm:** `.env` dosyasında `JWT_SECRET` tanımlı olmalı.

### Port Zaten Kullanımda
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Çözüm:** Farklı bir port kullanın veya çalışan portu kapatın.

## 📄 Lisans

ISC

## 👤 Geliştirici

Backend API - Yangın Güvenlik E-Ticaret Platformu
