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
    console.error("Register Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All Fields Are Required" });
    }
    const user = await pool.query(
      "SELECT id,password FROM users WHERE email=$1",
      [email],
    );
    if (user.rows.length === 0) {
      return res.status(401).json({ message: "Invalid Email or Password" });
    }
    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Email or Password" });
    }
    const userId = user.rows[0].id;
    const token = jwt.sign(
      {
        userId,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );
    return res.status(200).json({
      message: "User Logged In successfully.",
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export { registerUser, loginUser };
