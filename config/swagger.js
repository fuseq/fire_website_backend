import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Yangın Güvenlik E-Ticaret API",
      version: "1.0.0",
      description: "Yangın güvenlik ürünleri e-ticaret platformu için RESTful API dokümantasyonu",
      contact: {
        name: "API Destek",
        email: "destek@yanginguvenlik.com",
      },
    },
    servers: [
      {
        url: process.env.BACKEND_URL || "http://localhost:5000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Product: {
          type: "object",
          required: ["name", "category", "price", "description"],
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Yangın Söndürücü 1kg ABC" },
            category: { type: "string", example: "Söndürücüler" },
            price: { type: "number", example: 150.00 },
            image: { type: "string", example: "/fire-extinguisher-red.jpg" },
            images: { 
              type: "array", 
              items: { type: "string" },
              example: ["/fire-extinguisher-red.jpg"]
            },
            description: { type: "string", example: "Evler ve ofisler için ideal yangın söndürücü" },
            specs: { 
              type: "array", 
              items: { type: "string" },
              example: ["1kg kapasite", "ABC tipi"]
            },
            in_stock: { type: "boolean", example: true },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        User: {
          type: "object",
          required: ["email", "password", "name"],
          properties: {
            id: { type: "integer", example: 1 },
            email: { type: "string", format: "email", example: "user@example.com" },
            name: { type: "string", example: "Ahmet Yılmaz" },
            phone: { type: "string", example: "+90 532 123 4567" },
            is_admin: { type: "boolean", example: false },
            created_at: { type: "string", format: "date-time" },
          },
        },
        Address: {
          type: "object",
          required: ["user_id", "name", "street", "city", "zip_code", "phone"],
          properties: {
            id: { type: "integer", example: 1 },
            user_id: { type: "integer", example: 1 },
            name: { type: "string", example: "Ev Adresi" },
            street: { type: "string", example: "Atatürk Caddesi No: 45" },
            city: { type: "string", example: "İstanbul" },
            zip_code: { type: "string", example: "34380" },
            phone: { type: "string", example: "+90 532 123 4567" },
            is_default: { type: "boolean", example: true },
          },
        },
        Order: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            order_number: { type: "string", example: "ORD-2024-001" },
            user_id: { type: "integer", example: 1 },
            total_amount: { type: "number", example: 920.50 },
            status: { 
              type: "string", 
              enum: ["pending", "processing", "completed", "cancelled"],
              example: "pending"
            },
            payment_method: { type: "string", example: "card" },
            payment_id: { type: "string", example: "iyzico_payment_123" },
            shipping_address_id: { type: "integer", example: 1 },
            created_at: { type: "string", format: "date-time" },
          },
        },
        OrderItem: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            order_id: { type: "integer", example: 1 },
            product_id: { type: "integer", example: 1 },
            quantity: { type: "integer", example: 2 },
            unit_price: { type: "number", example: 150.00 },
            total_price: { type: "number", example: 300.00 },
          },
        },
        Review: {
          type: "object",
          required: ["product_id", "user_id", "rating", "comment"],
          properties: {
            id: { type: "integer", example: 1 },
            product_id: { type: "integer", example: 1 },
            user_id: { type: "integer", example: 1 },
            rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
            comment: { type: "string", example: "Çok kaliteli bir ürün" },
            created_at: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Hata açıklaması" },
          },
        },
        Success: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "İşlem başarılı" },
            data: { type: "object" },
          },
        },
      },
    },
    tags: [
      { name: "Auth", description: "Kimlik doğrulama işlemleri" },
      { name: "Products", description: "Ürün yönetimi" },
      { name: "Users", description: "Kullanıcı yönetimi" },
      { name: "Orders", description: "Sipariş yönetimi" },
      { name: "Reviews", description: "Ürün yorumları" },
      { name: "Addresses", description: "Adres yönetimi" },
      { name: "Payment", description: "Ödeme işlemleri" },
    ],
  },
  apis: ["./routes/*.js"], // Route dosyalarındaki JSDoc yorumlarını okur
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
