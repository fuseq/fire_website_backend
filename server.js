import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import pool from "./config/database.js";

// Routes
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import addressRoutes from "./routes/addresses.js";
import reviewRoutes from "./routes/reviews.js";
import paymentRoutes from "./routes/payment.js";
import userRoutes from "./routes/users.js";
import passwordResetRoutes from "./routes/password-reset.js";

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: '*', // Development için - Production'da belirli origin'lere sınırla
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));

// Private Network Access için özel header
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
  next();
});

// Body parser middleware (10MB limit for file uploads)
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Yangın Güvenlik E-Ticaret API",
    version: "1.0.0",
        endpoints: {
      swagger: "/api-docs",
      auth: "/api/auth",
      products: "/api/products",
      orders: "/api/orders",
      addresses: "/api/addresses",
      reviews: "/api/reviews",
      payment: "/api/payment",
      users: "/api/users"
    }
  });
});

// Database health check
app.get("/health", async (req, res) => {
  try {
    await pool.query('SELECT NOW()');
    res.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      database: "disconnected",
      error: error.message
    });
  }
});

// Swagger API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Yangın Güvenlik API Docs"
}));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/password-reset", passwordResetRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint bulunamadı",
    path: req.path
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Sunucu hatası",
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Server başlat
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server çalışıyor: http://localhost:${PORT}`);
  console.log(`📚 API Dokümantasyonu: http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n⚠️  SIGTERM signal received: closing HTTP server');
  pool.end(() => {
    console.log('✅ Database pool closed');
    process.exit(0);
  });
});
