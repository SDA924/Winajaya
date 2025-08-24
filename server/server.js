require("dotenv").config();

const cors = require("cors");
const express = require("express");
const path = require("path");

// Import your database and routes
const sequelize = require("./src/config/database");
const routes = require("./src/routes");

const app = express();

// ✅ Allowed origins untuk monorepo setup
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "https://winajaya.vercel.app", // Frontend Production
  "capacitor://localhost",
  "http://localhost",
];

// ✅ CORS configuration (pakai function supaya fleksibel)
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Cache-Control",
  ],
  optionsSuccessStatus: 200,
};

// ✅ Apply CORS
app.use(cors(corsOptions));

// ✅ Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ✅ Logging middleware
app.use((req, res, next) => {
  console.log(`🌐 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log(`📍 Origin: ${req.headers.origin || "none"}`);
  next();
});

// ✅ Root endpoint (untuk health check Render)
app.get("/", (req, res) => {
  res.send("🚀 Backend is live on Render");
});

// ✅ Health check API
app.get("/api", (req, res) => {
  res.json({
    message: "🚀 API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    cors: "enabled",
    allowedOrigins: allowedOrigins,
  });
});

// ✅ API routes
app.use("/api", routes);

// ✅ 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    error: "API route not found",
    path: req.path,
  });
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error("💥 Server Error:", err);

  if (err.message.includes("CORS")) {
    return res.status(403).json({
      error: "CORS Error",
      message: err.message,
    });
  }

  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

// ✅ Database initialization
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established.");

    if (process.env.NODE_ENV !== "production") {
      await sequelize.sync();
      console.log("✅ Models synchronized.");
    }
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
})();

// Export untuk Render / Vercel
module.exports = app;

// ✅ Local development server
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📍 API endpoint: http://localhost:${PORT}/api`);
  });
}
