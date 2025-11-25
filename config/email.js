import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Email transporter oluştur
const createTransporter = () => {
  // Gmail kullanacaksanız
  if (process.env.EMAIL_SERVICE === "gmail") {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // Gmail App Password kullanın
      },
    });
  }

  // Genel SMTP ayarları
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

/**
 * Şifre sıfırlama emaili gönder
 */
export const sendPasswordResetEmail = async (to, resetToken) => {
  try {
    const transporter = createTransporter();
    
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"Yangın Güvenlik" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: "Şifre Sıfırlama Talebi",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9f9f9;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
              color: white;
              padding: 20px;
              border-radius: 10px 10px 0 0;
              text-align: center;
              margin: -30px -30px 20px -30px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              margin: 20px 0;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              font-size: 12px;
              color: #666;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔥 Yangın Güvenlik</h1>
            </div>
            
            <h2>Şifre Sıfırlama Talebi</h2>
            
            <p>Merhaba,</p>
            
            <p>Hesabınız için bir şifre sıfırlama talebi aldık. Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Şifremi Sıfırla</a>
            </div>
            
            <p>Veya aşağıdaki linki tarayıcınıza kopyalayın:</p>
            <p style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all;">
              ${resetUrl}
            </p>
            
            <div class="warning">
              <strong>⚠️ Önemli:</strong> Bu link 1 saat boyunca geçerlidir. Süre sonunda yeni bir şifre sıfırlama talebi oluşturmanız gerekecektir.
            </div>
            
            <p>Eğer bu talebi siz yapmadıysanız, bu emaili görmezden gelebilirsiniz. Şifreniz değiştirilmeyecektir.</p>
            
            <div class="footer">
              <p>Bu otomatik bir emaildir, lütfen yanıtlamayın.</p>
              <p>&copy; ${new Date().getFullYear()} Yangın Güvenlik. Tüm hakları saklıdır.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email gönderildi:", info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error("❌ Email gönderme hatası:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Sipariş onay emaili gönder
 */
export const sendOrderConfirmationEmail = async (to, orderDetails) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Yangın Güvenlik" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: `Sipariş Onayı - ${orderDetails.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9f9f9;
              border-radius: 10px;
              padding: 30px;
            }
            .header {
              background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
              color: white;
              padding: 20px;
              border-radius: 10px;
              text-align: center;
              margin-bottom: 20px;
            }
            .order-info {
              background-color: white;
              padding: 20px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .items-table th, .items-table td {
              padding: 10px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            .items-table th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .total {
              font-size: 20px;
              font-weight: bold;
              color: #dc2626;
              text-align: right;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔥 Yangın Güvenlik</h1>
              <p>Siparişiniz Alındı!</p>
            </div>
            
            <p>Merhaba ${orderDetails.customerName},</p>
            
            <p>Siparişiniz başarıyla alınmıştır. Siparişiniz en kısa sürede hazırlanacak ve kargoya verilecektir.</p>
            
            <div class="order-info">
              <h3>Sipariş Detayları</h3>
              <p><strong>Sipariş No:</strong> ${orderDetails.orderNumber}</p>
              <p><strong>Tarih:</strong> ${new Date(orderDetails.date).toLocaleDateString('tr-TR')}</p>
              <p><strong>Durum:</strong> ${orderDetails.status === 'pending' ? 'Beklemede' : orderDetails.status}</p>
            </div>
            
            <h3>Sipariş Ürünleri</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Ürün</th>
                  <th>Miktar</th>
                  <th>Fiyat</th>
                </tr>
              </thead>
              <tbody>
                ${orderDetails.items.map(item => `
                  <tr>
                    <td>${item.productName}</td>
                    <td>${item.quantity}</td>
                    <td>₺${item.price}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="total">
              Toplam: ₺${orderDetails.total}
            </div>
            
            <p>Kargo takip numaranız oluşturulduğunda size bildirilecektir.</p>
            
            <p>Teşekkür ederiz!</p>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Sipariş onay emaili gönderildi:", info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error("❌ Email gönderme hatası:", error);
    return { success: false, error: error.message };
  }
};

export default { sendPasswordResetEmail, sendOrderConfirmationEmail };
