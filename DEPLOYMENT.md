# 🚀 Backend Deployment Guide - CapRover

Yangın Güvenlik E-Ticaret Backend API'sini CapRover'a deploy etme rehberi.

---

## 📋 Ön Gereksinimler

- ✅ CapRover sunucusu kurulu ve çalışıyor
- ✅ Domain adı CapRover'a bağlı
- ✅ PostgreSQL database CapRover'da hazır
- ✅ GitHub reposu oluşturuldu

---

## 🗄️ 1. PostgreSQL Veritabanı Kurulumu

### CapRover Dashboard'dan:

1. **Apps** → **One-Click Apps/Databases**
2. **PostgreSQL** seçin
3. Ayarlar:
   ```
   App Name: postgres-yangin-guvenlik
   PostgreSQL Version: 14
   PostgreSQL Password: [güçlü bir şifre]
   ```
4. **Deploy** butonuna tıklayın

5. Deploy tamamlandıktan sonra **Internal Docker Access** notunu alın:
   ```
   srv-captain--postgres-yangin-guvenlik
   ```

### Veritabanı Oluşturma:

CapRover terminal veya pgAdmin ile:

```sql
CREATE DATABASE yangin_guvenlik;
```

---

## 🔧 2. Backend App Oluşturma

### CapRover Dashboard'dan:

1. **Apps** → **Create New App**
2. App Name: `backend-yangin-guvenlik`
3. **Create New App** butonuna tıklayın

---

## 📝 3. Environment Variables Ayarlama

**App Settings** → **Environment Variables** sekmesine gidin.

### Gerekli değişkenler:

```bash
# Server Configuration
PORT=5000
NODE_ENV=production
BACKEND_URL=https://backend-yangin-guvenlik.yourdomain.com
FRONTEND_URL=https://yangin-guvenlik.yourdomain.com

# Database Configuration
DB_HOST=srv-captain--postgres-yangin-guvenlik
DB_PORT=5432
DB_NAME=yangin_guvenlik
DB_USER=postgres
DB_PASSWORD=your-postgres-password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-min-32-chars

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM=noreply@yanginguvenlik.com

# İyzico Payment
IYZICO_API_KEY=your-iyzico-api-key
IYZICO_SECRET_KEY=your-iyzico-secret-key
IYZICO_URI=https://api.iyzipay.com
```

**Bulk Edit** butonunu kullanarak hepsini birden yapıştırabilirsiniz.

---

## 🌐 4. Domain (HTTPS) Ayarlama

1. **HTTP Settings** sekmesine gidin
2. **Enable HTTPS** aktif edin
3. **Force HTTPS** aktif edin
4. **Connect New Domain** butonuna tıklayın
5. Subdomain girin: `backend-yangin-guvenlik`
6. **Connect** butonuna tıklayın

CapRover otomatik olarak Let's Encrypt SSL sertifikası oluşturacak.

---

## 🚀 5. GitHub'dan Deploy

### Method 1: GitHub Integration (Önerilen)

1. **Deployment** sekmesine gidin
2. **Method 3: Deploy from Github/Bitbucket/Gitlab** seçin
3. Repository URL: `https://github.com/yourusername/yangin-guvenlik-backend`
4. Branch: `main` veya `master`
5. **Save & Update** butonuna tıklayın

### Method 2: CLI ile Deploy

```bash
# CapRover CLI yükle
npm install -g caprover

# Login
caprover login

# Deploy
cd backend
caprover deploy
```

---

## 🗃️ 6. Veritabanı Tablolarını Oluşturma

Deploy tamamlandıktan sonra, **CapRover terminal** ile bağlanın:

```bash
# App içine gir
cd /usr/src/app

# Veritabanı tablolarını oluştur
npm run db:init

# İlk admin kullanıcıyı ekle
npm run db:seed
```

**veya**

Kendi bilgisayarınızdan PostgreSQL'e bağlanıp scriptleri çalıştırın:

```bash
# .env dosyasını production ayarlarıyla güncelle
DB_HOST=srv-captain--postgres-yangin-guvenlik.yourserver.com
DB_PORT=5432

# Scriptleri çalıştır
npm run db:setup
```

---

## ✅ 7. Test

### Health Check:
```bash
curl https://backend-yangin-guvenlik.yourdomain.com/health
```

**Beklenen Çıktı:**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### API Dokümantasyonu:
```
https://backend-yangin-guvenlik.yourdomain.com/api-docs
```

### Login Test:
```bash
curl -X POST https://backend-yangin-guvenlik.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yanginguvenlik.com",
    "password": "admin123"
  }'
```

---

## 📊 8. Monitoring

### Logs İzleme:

**App Settings** → **App Logs** sekmesinden real-time logları izleyebilirsiniz.

### Restart App:

Gerekirse uygulamayı yeniden başlatın:
- **App Settings** → **Save & Restart**

---

## 🔄 9. Otomatik Deployment (Webhook)

GitHub'dan otomatik deploy için:

1. **Deployment** sekmesinde **Webhook URL**'yi kopyalayın
2. GitHub repo → **Settings** → **Webhooks** → **Add webhook**
3. Payload URL: [kopyalanan webhook URL]
4. Content type: `application/json`
5. Trigger: `Just the push event`
6. **Add webhook** butonuna tıklayın

Artık her `git push` yaptığınızda otomatik deploy olacak! 🎉

---

## 🔐 10. Güvenlik Ayarları

### CORS Güncelleme:

`server.js` dosyasında CORS ayarlarını production için sınırlayın:

```javascript
app.use(cors({
  origin: 'https://yangin-guvenlik.yourdomain.com', // Frontend domain
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));
```

### Rate Limiting (Opsiyonel):

```bash
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100 // IP başına maksimum 100 istek
});

app.use('/api/', limiter);
```

---

## 🐛 Sorun Giderme

### Veritabanı Bağlantı Hatası
```
Error: connect ECONNREFUSED
```
**Çözüm:**
- Environment variables'ı kontrol edin
- PostgreSQL app'in çalıştığından emin olun
- `DB_HOST` değeri doğru mu kontrol edin

### Port Hatası
```
Error: Port 80 is already in use
```
**Çözüm:**
- CapRover otomatik port yönetimi yapar
- `PORT` değişkenini 5000 olarak bırakın

### Build Hatası
```
npm ERR! code ELIFECYCLE
```
**Çözüm:**
- `package.json` içinde `start` script'i var mı kontrol edin
- `captain-definition` dosyası doğru mu kontrol edin

---

## 📚 Faydalı Komutlar

```bash
# Logs izleme
caprover logs -a backend-yangin-guvenlik

# App'i yeniden başlatma
caprover restart -a backend-yangin-guvenlik

# Environment variable ekleme
caprover env -a backend-yangin-guvenlik
```

---

## 🎯 Checklist

- [ ] PostgreSQL database oluşturuldu
- [ ] Environment variables ayarlandı
- [ ] Domain ve HTTPS yapılandırıldı
- [ ] GitHub'a push edildi
- [ ] CapRover'a deploy edildi
- [ ] Veritabanı tabloları oluşturuldu
- [ ] Health check başarılı
- [ ] API Swagger dokümantasyonu erişilebilir
- [ ] CORS ayarları production'a göre güncellendi
- [ ] Admin kullanıcı oluşturuldu ve test edildi

---

## 🔗 İlgili Linkler

- [CapRover Documentation](https://caprover.com/docs/)
- [PostgreSQL on CapRover](https://caprover.com/docs/one-click-apps.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## 📞 Destek

Herhangi bir sorunla karşılaşırsanız:
1. CapRover logs'ları kontrol edin
2. `/health` endpoint'ini test edin
3. Environment variables'ları doğrulayın
4. PostgreSQL bağlantısını test edin

---

**🎉 Başarıyla deploy edildikten sonra backend API'niz hazır!**



