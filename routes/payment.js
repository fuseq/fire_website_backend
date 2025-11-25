import express from "express";
import Iyzipay from "iyzipay";
import dotenv from "dotenv";
import { randomUUID } from "crypto";

dotenv.config();
const router = express.Router();

const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY,
  secretKey: process.env.IYZICO_SECRET_KEY,
  uri: process.env.IYZICO_URI
});

router.post("/checkout", async (req, res) => {
  const { price, email, cardInfo, installment = 1 } = req.body;

  // Kart bilgilerini parse et
  let cardNumber, cardHolderName, expireMonth, expireYear, cvc;

  if (cardInfo) {
    // Frontend'den kart bilgileri geldi
    cardNumber = cardInfo.number.replace(/\s/g, ''); // Boşluklari kaldir
    cardHolderName = cardInfo.name;
    const [month, year] = cardInfo.expiry.split('/');
    expireMonth = month;
    expireYear = `20${year}`; // YY -> YYYY
    cvc = cardInfo.cvv;
  } else {
    // Test kart bilgileri (sandbox için)
    cardNumber = "5528790000000008";
    cardHolderName = "John Doe";
    expireMonth = "12";
    expireYear = "2030";
    cvc = "123";
  }

  // Benzersiz ID'ler üret
  const conversationId = randomUUID();
  const basketId = `B${Date.now()}`;

  const request = {
    locale: Iyzipay.LOCALE.TR,
    conversationId: conversationId,
        price: price,
    paidPrice: price,
    currency: Iyzipay.CURRENCY.TRY,
    installment: installment.toString(),
    basketId: basketId,
    paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
    paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
    callbackUrl: `${process.env.BACKEND_URL}/api/payment/callback`,

        paymentCard: {
      cardHolderName: cardHolderName,
      cardNumber: cardNumber,
      expireMonth: expireMonth,
      expireYear: expireYear,
      cvc: cvc,
      registerCard: "0"
    },

    buyer: {
      id: "BY789",
      name: "Furkan",
      surname: "Şenoğlu",
      gsmNumber: "+905555555555",
      email: email,
      identityNumber: "74300864791",
      lastLoginDate: "2025-11-02 12:43:35",
      registrationDate: "2025-11-02 12:43:35",
      registrationAddress: "İstanbul",
      ip: "85.34.78.112",
      city: "İstanbul",
      country: "Turkey",
      zipCode: "34000"
    },

    shippingAddress: {
      contactName: "Furkan Şenoğlu",
      city: "İstanbul",
      country: "Turkey",
      address: "İstanbul",
      zipCode: "34000"
    },

    billingAddress: {
      contactName: "Furkan Şenoğlu",
      city: "İstanbul",
      country: "Turkey",
      address: "İstanbul",
      zipCode: "34000"
    },

    basketItems: [
      {
        id: "BI101",
        name: "Deneme Ürün",
        category1: "Genel",
        itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
        price: price
      }
    ]
  };

  iyzipay.threedsInitialize.create(request, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result?.threeDSHtmlContent) {
      res.send(Buffer.from(result.threeDSHtmlContent, "base64").toString("utf8"));
    } else {
      res.json(result);
    }
  });
});

// 3D Secure callback endpoint
router.post("/callback", async (req, res) => {
  console.log("💳 3D Secure Callback alındı");

    // İyzico callback verileri
  const { paymentId, conversationId, status, mdStatus } = req.body;

  console.log("🔍 Ödeme Bilgileri:", { 
    paymentId, 
    conversationId, 
    status, 
    mdStatus: mdStatus === '1' ? 'Başarılı' : 'Başarısız'
  });

  // Eğer status failure ise veya mdStatus başarısız ise
  if (status === 'failure' || mdStatus !== '1') {
    console.error("❌ 3D Secure doğrulama başarısız!");
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Yönlendiriliyor...</title>
      </head>
      <body>
        <script>
          window.top.location.href = '${process.env.FRONTEND_URL}/payment/failure?error=${encodeURIComponent('3D Secure doğrulama başarısız oldu')}';
        </script>
        <p style="text-align: center; font-family: Arial; margin-top: 50px;">
          ❌ Doğrulama başarısız. Yönlendiriliyorsunuz...
        </p>
      </body>
      </html>
    `);
  }

  // Eğer paymentId yoksa hata döndür
  if (!paymentId) {
    console.error("❌ paymentId bulunamadı!");
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Yönlendiriliyor...</title>
      </head>
      <body>
        <script>
          window.top.location.href = '${process.env.FRONTEND_URL}/payment/failure?error=${encodeURIComponent('Ödeme ID bulunamadı')}';
        </script>
        <p style="text-align: center; font-family: Arial; margin-top: 50px;">
          ❌ Ödeme hatası. Yönlendiriliyorsunuz...
        </p>
      </body>
      </html>
    `);
  }

  // 3DS sonucunu kontrol et
  const request = {
    locale: Iyzipay.LOCALE.TR,
    conversationId: conversationId,
    paymentId: paymentId,
  };

    iyzipay.threedsPayment.retrieve(request, (err, result) => {
    if (err) {
      console.error("❌ Ödeme doğrulama hatası:", err);
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failure?error=${encodeURIComponent(err.message || 'Ödeme başarısız')}`);
    }

    console.log("📊 Ödeme Doğrulandı:", {
      status: result.status,
      price: result.price,
      paidPrice: result.paidPrice,
      currency: result.currency,
      cardType: result.cardType,
      cardAssociation: result.cardAssociation,
      lastFourDigits: result.lastFourDigits,
      installment: result.installment
    });

        if (result.status === "success") {
      console.log("✅ Ödeme Başarılı! PaymentId:", paymentId);
      // İframe içinde redirect yerine parent window'u yönlendir
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Yönlendiriliyor...</title>
        </head>
        <body>
          <script>
            window.top.location.href = '${process.env.FRONTEND_URL}/payment/success?paymentId=${paymentId}&conversationId=${conversationId}&price=${result.paidPrice}';
          </script>
          <p style="text-align: center; font-family: Arial; margin-top: 50px;">
            ✅ Ödeme başarılı! Yönlendiriliyorsunuz...
          </p>
        </body>
        </html>
      `);
    } else {
      console.log("❌ Ödeme Başarısız:", result.errorMessage);
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Yönlendiriliyor...</title>
        </head>
        <body>
          <script>
            window.top.location.href = '${process.env.FRONTEND_URL}/payment/failure?error=${encodeURIComponent(result.errorMessage || 'Ödeme başarısız')}';
          </script>
          <p style="text-align: center; font-family: Arial; margin-top: 50px;">
            ❌ Ödeme başarısız oldu. Yönlendiriliyorsunuz...
          </p>
        </body>
        </html>
      `);
    }
  });
});

// Taksit bilgilerini sorgulama endpoint'i
router.post("/installments", async (req, res) => {
  const { price, binNumber } = req.body;

  if (!binNumber || binNumber.length < 6) {
    return res.status(400).json({ error: "Geçersiz kart numarası" });
  }

  const request = {
    locale: Iyzipay.LOCALE.TR,
    conversationId: randomUUID(),
    binNumber: binNumber.substring(0, 6), // İlk 6 hane (BIN)
    price: price
  };

  iyzipay.installmentInfo.retrieve(request, (err, result) => {
    if (err) {
      console.error("❌ Taksit bilgisi alınamadı:", err);
      return res.status(500).json({ error: err });
    }
    res.json(result);
  });
});

// Manuel ödeme sorgulama endpoint'i (opsiyonel)
router.get("/check/:paymentId", async (req, res) => {
  const { paymentId } = req.params;

  const request = {
    locale: Iyzipay.LOCALE.TR,
    conversationId: randomUUID(),
    paymentId: paymentId,
  };

  iyzipay.threedsPayment.retrieve(request, (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, error: err });
    }
    res.json({ success: true, payment: result });
  });
});

export default router;
