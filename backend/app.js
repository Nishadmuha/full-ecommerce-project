const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

// Load env vars
dotenv.config();

// Initialize app
const app = express();

// Middlewares
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(morgan("dev"));
app.use(cookieParser());

// Import Routes
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const wishlistRoutes = require("./routes/wishlist");
const orderRoutes = require("./routes/orders");
const userRoutes = require("./routes/users");
const homeRoutes = require("./routes/home");
const adminRoutes = require("./routes/admin");

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/admin", adminRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Export app
module.exports = app;
