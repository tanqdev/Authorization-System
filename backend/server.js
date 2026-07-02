import express from "express";
import dotenv from "dotenv";
import pool from "./db.js";
import authRoutes from "./routes/auth.js";
dotenv.config();
const PORT = process.env.PORT || 8000;
const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes);

try {
  await pool.query("SELECT NOW()");
  console.log("Connected to PostgreSQL");
} catch (err) {
  console.error("Error connecting the database:", err.message);
  process.exit(1);
}

app.listen(PORT, () => console.log(`Server is running on Port ${PORT}`));
