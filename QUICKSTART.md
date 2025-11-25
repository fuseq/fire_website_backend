# 🚀 Hızlı Başlangıç Rehberi

Backend API'yi 5 dakikada çalıştırın!

## 1️⃣ PostgreSQL Hazırlığı

### pgAdmin ile:
1. pgAdmin'i açın
2. Sağ tıklayın → "Create" → "Database"
3. Database name: `yangin_guvenlik`
4. Save

### veya psql ile:
```bash
psql -U postgres
CREATE DATABASE yangin_guvenlik;
\q
```

## 2️⃣ .env Dosyası Oluştur

Backend klasöründe `.env` dosyası oluşturun:

```env
PORT=5000
NODE_ENV=development
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=yangin_guvenlik
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=my-secret-key-12345

IYZICO_API_KEY=sandbox-key
IYZICO_SECRET_KEY=sandbox-secret
IYZICO_URI=https://sandbox-api.iyzipay.com
```

⚠️ **Önemli:** `DB_PASSWORD` kısmını kendi PostgreSQL şifrenizle değiştirin!

## 3️⃣ Tabloları Oluştur

```bash
npm run db:init
```

**Çıktı:**
```
✅ Users tablosu oluşturuldu
✅ Products tablosu oluşturuldu
✅ Addresses tablosu oluşturuldu
✅ Orders tablosu oluşturuldu
✅ Order Items tablosu oluşturuldu
✅ Reviews tablosu oluşturuldu
✅ İndeksler oluşturuldu
✅ Trigger'lar oluşturuldu
🎉 Tüm tablolar başarıyla oluşturuldu!
```

## 4️⃣ İlk Admin Kullanıcı Oluştur

```bash
npm run db:seed
```

**Admin Bilgileri:**
- 📧 Email: `admin@yanginguvenlik.com`
- 🔑 Şifre: `admin123`

## 5️⃣ Sunucuyu Başlat

```bash
npm run dev
```

**Çıktı:**
```
🚀 Server çalışıyor: http://localhost:5000
📚 API Dokümantasyonu: http://localhost:5000/api-docs
🏥 Health Check: http://localhost:5000/health
```

## ✅ Test Et

### 1. Tarayıcıda Aç:
```
http://localhost:5000
```

Şunu görmelisiniz:
```json
{
  "status": "success",
  "message": "Yangın Güvenlik E-Ticaret API",
  "version": "1.0.0"
}
```

### 2. Swagger Dokümantasyonu:
```
http://localhost:5000/api-docs
```

### 3. Admin Girişi Test Et:

**Postman veya cURL ile:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yanginguvenlik.com",
    "password": "admin123"
  }'
```

**Başarılı Yanıt:**
```json
{
  "success": true,
  "message": "Giriş başarılı",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "admin@yanginguvenlik.com",
      "name": "Admin User",
      "isAdmin": true
    }
  }
}
```

## 🎯 İlk Ürün Ekle (Admin)

1. Önce login yapıp token alın
2. Token ile ürün ekleyin:

```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Yangın Söndürücü 1kg ABC",
    "category": "Söndürücüler",
    "price": 150,
    "description": "Evler ve ofisler için ideal yangın söndürücü",
    "specs": ["1kg kapasite", "ABC tipi", "CE Sertifikalı"],
    "inStock": true
  }'
```

## 📊 Veritabanını Kontrol Et

### pgAdmin ile:
1. Servers → PostgreSQL → Databases → yangin_guvenlik
2. Schemas → public → Tables
3. users tablosuna sağ tık → View/Edit Data → All Rows

### psql ile:
```bash
psql -U postgres -d yangin_guvenlik
SELECT * FROM users;
SELECT * FROM products;
```

## 🔄 Sıfırdan Başla

Herşeyi silip yeniden başlamak için:

```bash
# 1. Tabloları sil
psql -U postgres -d yangin_guvenlik
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
\q

# 2. Tekrar oluştur
npm run db:setup
```

## 🐛 Sorunlar?

### Bağlantı hatası:
```
Error: connect ECONNREFUSED
```
✅ PostgreSQL servisi çalışıyor mu kontrol edin

### Tablolar oluşmadı:
```
npm run db:init
```
komutunu tekrar çalıştırın

### Port zaten kullanımda:
.env dosyasında `PORT=5001` yapın

## 📱 Frontend ile Bağlantı

Frontend'den backend'e istek atmak için:

```javascript
// Frontend .env veya config
NEXT_PUBLIC_API_URL=http://localhost:5000
```

```javascript
// API istekleri
const response = await fetch('http://localhost:5000/api/products');
const products = await response.json();
```

## 🎉 Tamamdır!

Artık backend API'niz hazır. Frontend'e geçebilirsiniz! 

**Sonraki Adımlar:**
- Swagger'dan tüm endpoint'leri keşfedin
- Ürün, sipariş, adres ekleyin
- Frontend ile entegre edin
