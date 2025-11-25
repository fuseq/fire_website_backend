import jwt from "jsonwebtoken";

// JWT token doğrulama middleware
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: "Erişim reddedildi. Token bulunamadı." 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      message: "Geçersiz veya süresi dolmuş token" 
    });
  }
};

// Admin kontrolü middleware
export const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ 
      success: false, 
      message: "Bu işlem için admin yetkisi gereklidir" 
    });
  }
  next();
};

// Opsiyonel authentication (token varsa decode et, yoksa devam et)
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
      req.user = decoded;
    } catch (error) {
      // Token geçersiz olsa bile devam et
    }
  }
  next();
};
