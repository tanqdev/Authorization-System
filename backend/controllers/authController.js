import pool from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone_number } = req.body;
    if (!name || !email || !password || !phone_number) {
      return res.status(400).json({ message: "All Fields Are Required" });
    }
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email=$1",
      [email],
    );
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: "User Already Exists." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users(name,email,password,phone_number) VALUES($1,$2,$3,$4) RETURNING id`,
      [name, email, hashedPassword, phone_number],
    );
    const userId = result.rows[0].id;
    const token = jwt.sign(
      {
        userId,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );
    return res.status(201).json({
      message: "User registered successfully.",
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export { registerUser };
