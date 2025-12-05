// ========================================================
//  SERVER.JS — FULLY MERGED (UPLOADS + COURSES + PAYMENT)
// ========================================================

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2/promise");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// email templates
const buildPaymentSuccessEmail = require("./email/paymentSuccessTemplate");
const buildPaymentFailedEmail = require("./email/paymentFailureTemplate");

// helper
function generatePassword() {
  return Math.random().toString(36).slice(-8);
}

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ========================================================
// SWAGGER SETUP
// ========================================================
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ProdemyX API",
      version: "1.0.0",
      description: "API documentation for ProdemyX Learning Management System",
    },
    servers: [
      {
        url: "http://ec2-16-171-24-103.eu-north-1.compute.amazonaws.com",
        description: "EC2 server",
      },
      {
        url: "http://localhost:5000",
        description: "Local server",
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
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./server.js"], // files containing annotations as above
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));


// ========================================================
// DATABASE
// ========================================================
console.log("Attempting to create database pool...");
const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "prodemyx",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Successfully connected to the database!");

    // Check and create default admin user if not exists
    const [adminUsers] = await connection.query("SELECT id FROM users WHERE email = ?", ["admin@gmail.com"]);
    if (adminUsers.length === 0) {
      const hashedPassword = await bcrypt.hash("admin", 10);
      await connection.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        ["Admin User", "admin@gmail.com", hashedPassword, "admin"]
      );
      console.log("Default admin user created: admin@gmail.com");
    } else {
      console.log("Default admin user (admin@gmail.com) already exists.");
    }

    connection.release();
  } catch (err) {
    console.error("Failed to connect to the database:", err.message);
    process.exit(1); // Exit if database connection fails critically
  }
})();

// ========================================================
// EMAIL (gmail)
// ========================================================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Email transporter verification failed:", error);
  } else {
    console.log("Email transporter ready for messages");
  }
});

// ========================================================
// RAZORPAY
// ========================================================
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

// ========================================================
// JWT HELPERS
// ========================================================
function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "dev_secret",
    { expiresIn: "7d" }
  );
}

async function getUserById(id) {
  const conn = await pool.getConnection();
  const [rows] = await conn.query(
    "SELECT id, name, email, role FROM users WHERE id = ?",
    [id]
  );
  conn.release();
  return rows[0] || null;
}

// ========================================================
// AUTH MIDDLEWARE
// ========================================================
function auth(req, res, next) {
  const header = req.headers["authorization"];
  if (!header || !header.startsWith("Bearer "))
    return res.status(401).json({ message: "Unauthorized" });

  try {
    const token = header.split(" ")[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid/Expired Token" });
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Admin access required" });
  next();
}

function instructorOnly(req, res, next) {
  if (req.user.role !== "instructor" && req.user.role !== "admin")
    return res.status(403).json({ message: "Instructor access required" });
  next();
}

function studentOnly(req, res, next) {
  if (req.user.role !== "student" && req.user.role !== "admin")
    return res.status(403).json({ message: "Student access required" });
  next();
}

// ========================================================
// UPLOADS SETUP
// ========================================================

const uploadsRoot = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsRoot)) fs.mkdirSync(uploadsRoot);

const materialsDir = path.join(uploadsRoot, "materials");
const coverDir = path.join(uploadsRoot, "course-covers");

if (!fs.existsSync(materialsDir)) fs.mkdirSync(materialsDir, { recursive: true });
if (!fs.existsSync(coverDir)) fs.mkdirSync(coverDir, { recursive: true });

// expose folder
app.use("/uploads", express.static(uploadsRoot));


// ===== MATERIAL UPLOAD =====
const materialsStorage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, materialsDir),
  filename: (_, file, cb) =>
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname)),
});

const uploadMaterials = multer({
  storage: materialsStorage,
  fileFilter: (_, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "video/mp4",
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Invalid file type"));
  },
});

// Upload material
/**
 * @swagger
 * /api/upload-material:
 *   post:
 *     summary: Upload course material
 *     tags: [Uploads]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               material:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *       400:
 *         description: No file uploaded or invalid file type
 */
app.post("/api/upload-material", uploadMaterials.single("material"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  return res.json({
    message: "Uploaded successfully",
    filePath: `/uploads/materials/${req.file.filename}`,
  });
});


// ===== COVER UPLOAD =====
const coverStorage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, coverDir),
  filename: (_, file, cb) =>
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname)),
});

const uploadCover = multer({
  storage: coverStorage,
  fileFilter: (_, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Invalid cover image"));
  },
});

// Upload cover image
/**
 * @swagger
 * /api/upload-cover:
 *   post:
 *     summary: Upload course cover image
 *     tags: [Uploads]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               cover:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       400:
 *         description: No image uploaded or invalid file type
 */
app.post("/api/upload-cover", uploadCover.single("cover"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image uploaded" });

  return res.json({
    message: "Cover uploaded",
    filePath: `/uploads/course-covers/${req.file.filename}`,
  });
});

// ===== GENERIC COURSE UPLOAD (Photo + Material) =====
const courseStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "photo") cb(null, coverDir);
    else if (file.fieldname === "material") cb(null, materialsDir);
    else cb(new Error("Invalid field name"), null);
  },
  filename: (_, file, cb) =>
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname)),
});

const uploadCourseFiles = multer({
  storage: courseStorage,
  fileFilter: (_, file, cb) => {
    if (file.fieldname === "photo") {
      const allowed = ["image/jpeg", "image/png", "image/webp"];
      if (allowed.includes(file.mimetype)) cb(null, true);
      else cb(new Error("Invalid cover image"));
    } else if (file.fieldname === "material") {
      const allowed = [
        "application/pdf",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "video/mp4",
      ];
      if (allowed.includes(file.mimetype)) cb(null, true);
      else cb(new Error("Invalid material file"));
    } else {
      cb(new Error("Unexpected field"));
    }
  },
});

// ========================================================
// AUTH ROUTES
// ========================================================
/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 default: student
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Missing fields or email already exists
 */
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const conn = await pool.getConnection();

    const [exists] = await conn.query("SELECT id FROM users WHERE email = ?", [email]);
    if (exists.length) {
      conn.release();
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await conn.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashed, role || "student"]
    );

    conn.release();
    res.json({ message: "User registered", id: result.insertId });

  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
app.post("/api/login", async (req, res) => {
  try {
    const { email, password, expected_role } = req.body;

    const conn = await pool.getConnection();
    const [rows] = await conn.query(
      "SELECT id, name, email, password, role FROM users WHERE email = ?",
      [email]
    );
    conn.release();

    if (!rows.length) return res.status(401).json({ message: "Invalid login" });

    const user = rows[0];

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid login" });

    // 🚨 ROLE CHECK
    if (expected_role && user.role !== expected_role) {
      return res.status(403).json({
        message: `You do not have ${expected_role} access. Your account role is '${user.role}'.`
      });
    }

    const token = createToken(user);

    return res.json({
      message: "Login ok",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });

  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


app.post("/api/auth/register-guest", async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const conn = await pool.getConnection();
    const [existing] = await conn.query("SELECT id FROM users WHERE email = ?", [email]);

    if (existing.length) {
      conn.release();
      return res.json({ success: true, message: "User already exists." });
    }

    const tempPassword = generatePassword();
    const hashed = await bcrypt.hash(tempPassword, 10);

    await conn.query(
      "INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, 'student')",
      [name, email, phone, hashed]
    );

    conn.release();

    try {
      await transporter.sendMail({
        from: `"ProdemyX" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Welcome to ProdemyX!",
        html: `<p>Hi ${name},</p>
               <p>Your account has been created. You can now proceed to checkout.</p>
               <p>Your login credentials are:</p>
               <p>Email: ${email}</p>
               <p>Password: ${tempPassword}</p>
               <p>Thank you for choosing ProdemyX!</p>`,
      });
    } catch (e) {
      console.warn("Email failed to send for guest registration:", e);
    }

    res.json({ success: true, message: "Guest registered successfully." });

  } catch (err) {
    console.error("Guest registration error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * @swagger
 * /api/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: Unauthorized
 */
app.get("/api/me", auth, async (req, res) => {
  const user = await getUserById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

// ========================================================
// ADMIN USER CRUD
// ========================================================
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Admin access required
 */
app.get("/api/users", auth, adminOnly, async (_, res) => {
  const conn = await pool.getConnection();
  const [rows] = await conn.query(
    "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"
  );
  conn.release();
  res.json(rows);
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: User created successfully
 *       403:
 *         description: Admin access required
 */
app.post("/api/users", auth, adminOnly, async (req, res) => {
  const { name, email, password, role, phone, address } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: "Missing fields" });

  const hashed = await bcrypt.hash(password, 10);
  const conn = await pool.getConnection();

  await conn.query(
    "INSERT INTO users (name, email, password, phone, address, role) VALUES (?, ?, ?, ?, ?, ?)",
    [name, email, hashed, phone || null, address || null, role || "student"]
  );

  conn.release();
  res.json({ message: "User created" });
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       403:
 *         description: Admin access required
 */
app.put("/api/users/:id", auth, async (req, res) => {
  const id = req.params.id;
  const { name, email, password, role, phone, address } = req.body;

  // Check if user is updating their own profile or is an admin
  const isOwnProfile = req.user.id === parseInt(id);
  const isAdmin = req.user.role === "admin";

  if (!isOwnProfile && !isAdmin) {
    return res.status(403).json({ message: "You can only update your own profile" });
  }

  // Only admins can change roles
  if (role && role !== req.user.role && !isAdmin) {
    return res.status(403).json({ message: "Only admins can change user roles" });
  }

  const conn = await pool.getConnection();

  try {
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      if (isAdmin) {
        // Admin can update everything including role
        await conn.query(
          "UPDATE users SET name=?, email=?, password=?, role=?, phone=?, address=? WHERE id=?",
          [name, email, hashed, role, phone, address, id]
        );
      } else {
        // Students/Instructors can't change their role
        await conn.query(
          "UPDATE users SET name=?, email=?, password=?, phone=?, address=? WHERE id=?",
          [name, email, hashed, phone, address, id]
        );
      }
    } else {
      if (isAdmin) {
        // Admin can update everything including role
        await conn.query(
          "UPDATE users SET name=?, email=?, role=?, phone=?, address=? WHERE id=?",
          [name, email, role, phone, address, id]
        );
      } else {
        // Students/Instructors can't change their role
        await conn.query(
          "UPDATE users SET name=?, email=?, phone=?, address=? WHERE id=?",
          [name, email, phone, address, id]
        );
      }
    }

    conn.release();
    res.json({ message: "User updated" });
  } catch (err) {
    conn.release();
    console.error("Update user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User removed successfully
 *       403:
 *         description: Admin access required
 */
app.delete("/api/users/:id", auth, adminOnly, async (req, res) => {
  const conn = await pool.getConnection();
  await conn.query("DELETE FROM users WHERE id=?", [req.params.id]);
  conn.release();
  res.json({ message: "User removed" });
});

// ========================================================
// CATEGORIES
// ========================================================
/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories (Authenticated)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 */
app.get("/api/categories", auth, async (_, res) => {
  const conn = await pool.getConnection();
  const [rows] = await conn.query(
    "SELECT id, name, description, created_at FROM categories ORDER BY name ASC"
  );
  conn.release();
  res.json(rows);
});

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a category (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category created successfully
 *       403:
 *         description: Admin access required
 */
app.post("/api/categories", auth, adminOnly, async (req, res) => {
  const { name, description } = req.body;

  const conn = await pool.getConnection();
  await conn.query(
    "INSERT INTO categories (name, description, created_at) VALUES (?, ?, NOW())",
    [name.trim(), description || null]
  );
  conn.release();
  res.json({ message: "Category created" });
});

// PUBLIC categories
/**
 * @swagger
 * /public/categories:
 *   get:
 *     summary: Get all categories (Public)
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 */
app.get("/public/categories", async (_, res) => {
  const [rows] = await pool.query(
    "SELECT id, name, description FROM categories ORDER BY name ASC"
  );
  res.json(rows);
});

// ========================================================
// COURSES (FULL SCHEMA)
// ========================================================

// ADMIN list
/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all courses (Authenticated)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of courses
 */
app.get("/api/courses", auth, async (_, res) => {
  const [rows] = await pool.query(`
    SELECT 
      c.*,
      cat.name AS category_name,
      u.name AS instructor_name
    FROM courses c
    LEFT JOIN categories cat ON cat.id = c.category_id
    LEFT JOIN users u ON u.id = c.instructor_id
    ORDER BY c.id DESC
  `);

  res.json(rows);
});

// ADMIN create
/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a new course (Admin only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, category_id]
 *             properties:
 *               title:
 *                 type: string
 *               short_description:
 *                 type: string
 *               long_description:
 *                 type: string
 *               category_id:
 *                 type: integer
 *               instructor_id:
 *                 type: integer
 *               zoom_link:
 *                 type: string
 *               schedule_morning:
 *                 type: boolean
 *               schedule_evening:
 *                 type: boolean
 *               schedule_weekend:
 *                 type: boolean
 *               material_path:
 *                 type: string
 *               photo:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Course created successfully
 *       403:
 *         description: Admin access required
 */
app.post("/api/courses", auth, adminOnly, async (req, res) => {
  try {
    const {
      title,
      short_description,
      long_description,
      category_id,
      instructor_id,
      zoom_link,
      schedule_morning,
      schedule_evening,
      schedule_weekend,
      material_path,
      photo,
      status,
      price   // <-- ADD THIS
    } = req.body;

    if (!title || !category_id)
      return res.status(400).json({ message: "Missing title/category" });

    const conn = await pool.getConnection();

    const [result] = await conn.query(
      `
      INSERT INTO courses (
        title,
        short_description,
        long_description,
        category_id,
        instructor_id,
        zoom_link,
        file,
        photo,
        status,
        price
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        title,
        short_description || null,
        long_description || null,
        category_id,
        instructor_id || null,
        zoom_link || null,
        material_path || null,
        photo || null,
        status || "draft",
        price || null  // <-- NEW
      ]
    );

    conn.release();
    res.json({ message: "Course created", course_id: result.insertId });

  } catch (err) {
    console.error("Create course error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ADMIN delete
/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Delete a course (Admin only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Course removed successfully
 *       403:
 *         description: Admin access required
 */
app.delete("/api/courses/:id", auth, adminOnly, async (req, res) => {
  const conn = await pool.getConnection();
  await conn.query("DELETE FROM courses WHERE id=?", [req.params.id]);
  conn.release();
  res.json({ message: "Course removed" });
});

// ADMIN update
/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     summary: Update a course (Admin only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               short_description:
 *                 type: string
 *               long_description:
 *                 type: string
 *               category_id:
 *                 type: integer
 *               instructor_id:
 *                 type: integer
 *               zoom_link:
 *                 type: string
 *               schedule_morning:
 *                 type: boolean
 *               schedule_evening:
 *                 type: boolean
 *               schedule_weekend:
 *                 type: boolean
 *               status:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: binary
 *               material:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Course updated successfully
 *       403:
 *         description: Admin access required
 */
app.put(
  "/api/courses/:id",
  auth,
  adminOnly,
  uploadCourseFiles.fields([
    { name: "photo", maxCount: 1 },
    { name: "material", maxCount: 1 }
  ]),
  async (req, res) => {
    const id = req.params.id;

    const {
      title,
      short_description,
      long_description,
      category_id,
      instructor_id,
      zoom_link,
      schedule_morning,
      schedule_evening,
      schedule_weekend,
      status,
      price   // <-- NEW
    } = req.body;

    const conn = await pool.getConnection();

    let query = "UPDATE courses SET ";
    const params = [];

    if (title) { query += "title=?, "; params.push(title); }
    if (short_description) { query += "short_description=?, "; params.push(short_description); }
    if (long_description) { query += "long_description=?, "; params.push(long_description); }
    if (category_id) { query += "category_id=?, "; params.push(category_id); }
    if (instructor_id) { query += "instructor_id=?, "; params.push(instructor_id); }
    if (zoom_link) { query += "zoom_link=?, "; params.push(zoom_link); }
    if (status) { query += "status=?, "; params.push(status); }

    // ADD PRICE
    if (price) {
      query += "price=?, ";
      params.push(price);
    }

    // FILES
    if (req.files["photo"]) {
      query += "photo=?, ";
      params.push(`/uploads/course-covers/${req.files["photo"][0].filename}`);
    }

    if (req.files["material"]) {
      query += "file=?, ";
      params.push(`/uploads/materials/${req.files["material"][0].filename}`);
    }

    query = query.slice(0, -2);
    query += " WHERE id=?";
    params.push(id);

    try {
      await conn.query(query, params);
      conn.release();
      res.json({ message: "Course updated successfully" });
    } catch (err) {
      console.error("Update course error:", err);
      conn.release();
      res.status(500).json({ message: "Server error" });
    }
  }
);


// PUBLIC list (website)
/**
 * @swagger
 * /public/courses:
 *   get:
 *     summary: Get all public courses
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: List of public courses
 */
app.get("/public/courses", async (_, res) => {
  const [rows] = await pool.query(`
      SELECT 
        c.id,
        c.title,
        c.short_description,
        c.file,
        c.photo,
        c.price,
        c.category_id,
        cat.name AS category_name
      FROM courses c
      LEFT JOIN categories cat ON c.category_id = cat.id
      ORDER BY c.id DESC
  `);

  const mapped = rows.map(c => ({
    ...c,
    photo: c.photo ? `http://localhost:5000${c.photo}` : null,
    material_url: c.file ? `http://localhost:5000${c.file}` : null,
  }));

  res.json(mapped);
});

// PUBLIC course details
/**
 * @swagger
 * /public/courses/{id}:
 *   get:
 *     summary: Get public course details
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Course details
 *       404:
 *         description: Course not found
 */
app.get("/public/courses/:id", async (req, res) => {
  const id = req.params.id;

  const [rows] = await pool.query(
    "SELECT * FROM courses WHERE id=? LIMIT 1",
    [id]
  );

  if (!rows.length)
    return res.status(404).json({ message: "not_found" });

  const course = rows[0];

  course.photo = course.photo ? `http://localhost:5000${course.photo}` : null;
  course.material_url = course.file
    ? `http://localhost:5000${course.file}`
    : null;

  res.json(course);
});

// ========================================================
// INSTRUCTOR DASHBOARD
// ========================================================
/**
 * @swagger
 * /api/instructor/dashboard:
 *   get:
 *     summary: Get instructor dashboard data
 *     tags: [Instructor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Instructor dashboard data
 *       403:
 *         description: Instructor access required
 */
app.get("/api/instructor/dashboard", auth, async (req, res) => {
  if (req.user.role !== "instructor")
    return res.status(403).json({ message: "Instructor access required" });

  const instructorId = req.user.id;

  const [courses] = await pool.query(
    `SELECT c.*, cat.name AS category_name 
     FROM courses c
     LEFT JOIN categories cat ON c.category_id = cat.id
     WHERE c.instructor_id = ?`,
    [instructorId]
  );

  const [schedules] = await pool.query(
    `SELECT cs.*, c.title AS course_title
     FROM course_schedules cs
     LEFT JOIN courses c ON c.id = cs.course_id
     WHERE cs.instructor_id = ?
       AND cs.meeting_date >= CURDATE()
     ORDER BY cs.meeting_date, cs.meeting_time`,
    [instructorId]
  );

  res.json({
    summary: {
      total_courses: courses.length,
      upcoming_sessions: schedules.length,
      enrolled_students: 0,
    },
    courses,
    schedules,
  });
});


// ========================================================
// STUDENT — ENROLLED COURSES LIST
// ========================================================
app.get("/api/student/enrolled-courses", auth, studentOnly, async (req, res) => {
  try {
    const studentId = req.user.id;

    const [rows] = await pool.query(
      `
      SELECT 
        c.id,
        c.title,
        c.short_description,
        c.duration,
        c.price,
        c.status,
        c.zoom_link,
        c.file AS material_file,
        cat.name AS category_name,
        u.name AS instructor_name
      FROM user_course_access uca
      JOIN courses c ON c.id = uca.course_id
      LEFT JOIN categories cat ON cat.id = c.category_id
      LEFT JOIN users u ON u.id = c.instructor_id
      WHERE uca.user_id = ?
      ORDER BY c.id DESC
      `,
      [studentId]
    );

    // FIX MATERIAL + FIX URLS
    const updated = rows.map(c => ({
      ...c,
      zoom_link: c.zoom_link || null,
      material_file: c.material_file ? `http://localhost:5000${c.material_file}` : null
    }));

    res.json(updated);

  } catch (err) {
    console.error("Enrolled courses error:", err);
    res.status(500).json({ message: "Server error loading enrolled courses" });
  }
});




// =============================
//  STUDENT DASHBOARD SUMMARY
// =============================
app.get("/api/student/dashboard", auth, studentOnly, async (req, res) => {
  try {
    const userId = req.user.id;

    // TOTAL COURSES
    const [[{ total_courses }]] = await pool.query(
      "SELECT COUNT(*) AS total_courses FROM courses"
    );

    // ENROLLED COURSES
    const [[{ enrolled }]] = await pool.query(
      "SELECT COUNT(*) AS enrolled FROM user_course_access WHERE user_id = ?",
      [userId]
    );

    // COMPLETED (future feature)
    const completed = 0;

    return res.json({
      total_courses,
      enrolled_courses: enrolled,
      completed_courses: completed,
      in_progress: enrolled - completed
    });

  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Server error loading dashboard" });
  }
});



// ========================================================
// PURCHASE / ENROLLMENT / PAYMENT
// ========================================================

// Create order
/**
 * @swagger
 * /api/payment/order:
 *   post:
 *     summary: Create a payment order
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, course_ids]
 *             properties:
 *               amount:
 *                 type: number
 *               course_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *               customer_name:
 *                 type: string
 *               customer_email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order created successfully
 *       400:
 *         description: Missing amount or courses
 */
app.post("/api/payment/order", async (req, res) => {
  try {
    const { amount, course_id, course_ids, customer_name, customer_email } = req.body;

    const courseList = Array.isArray(course_ids)
      ? course_ids
      : course_id
        ? [course_id]
        : [];

    if (!amount || !courseList.length)
      return res.status(400).json({ message: "Missing amount/courses" });

    const order = await razorpay.orders.create({
      amount: Number(amount) * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
      notes: {
        customer_email,
        customer_name,
        course_ids: JSON.stringify(courseList),
      },
    });

    res.json(order);
  } catch (err) {
    console.error("order error:", err);
    res.status(500).json({ message: "Order failed" });
  }
});

// verify payment
/**
 * @swagger
 * /api/payment/verify:
 *   post:
 *     summary: Verify payment signature
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [razorpay_order_id, razorpay_payment_id, razorpay_signature]
 *             properties:
 *               razorpay_order_id:
 *                 type: string
 *               razorpay_payment_id:
 *                 type: string
 *               razorpay_signature:
 *                 type: string
 *               customer_email:
 *                 type: string
 *               customer_name:
 *                 type: string
 *               course_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *       400:
 *         description: Invalid signature
 */
app.post("/api/payment/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customer_email,
      customer_name,
      course_ids: course_ids_json, // Renamed to avoid conflict
      amount,
    } = req.body;

    const course_ids = JSON.parse(course_ids_json);

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const conn = await pool.getConnection();
    let userId;
    let newUser = false;
    let tempPassword = null;

    // Fetch individual course prices
    const [coursePrices] = await conn.query(
      `SELECT id, price FROM courses WHERE id IN (?)`,
      [course_ids]
    );
    const coursePriceMap = new Map(coursePrices.map(c => [c.id, c.price]));

    // user exists?
    const [existing] = await conn.query("SELECT id FROM users WHERE email=?", [
      customer_email,
    ]);

    if (!existing.length) {
      newUser = true;
      tempPassword = generatePassword();
      const hashed = await bcrypt.hash(tempPassword, 10);

      const [insert] = await conn.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'student')",
        [customer_name || "Learner", customer_email, hashed]
      );

      userId = insert.insertId;
    } else {
      userId = existing[0].id;
    }

    // Record purchases and grant access for each course
    for (const course_id of course_ids) {
      const coursePrice = coursePriceMap.get(course_id) || 0; // Get individual course price
      await conn.query(
        `INSERT INTO purchases (user_id, course_id, payment_id, amount, status, purchase_date)
         VALUES (?, ?, ?, ?, 'success', NOW())`,
        [userId, course_id, razorpay_payment_id, coursePrice] // Use individual course price
      );

      await conn.query(
        "INSERT INTO user_course_access (user_id, course_id, access_granted_date) VALUES (?, ?, NOW())",
        [userId, course_id]
      );
    }

    conn.release();

    // Fetch real course names for email
    const courseTitles = [];
    for (const course_id of course_ids) {
      try {
        const [crs] = await pool.query(
          "SELECT title FROM courses WHERE id=? LIMIT 1",
          [course_id]
        );
        if (crs.length) courseTitles.push(crs[0].title);
      } catch { /* ignore */ }
    }
    const courseTitleList = courseTitles.length > 0 ? courseTitles.join(", ") : "Selected Courses";

    // send email
    try {
      const html = buildPaymentSuccessEmail({
        CUSTOMER_NAME: customer_name,
        CUSTOMER_EMAIL: customer_email,
        TEMP_PASSWORD: newUser ? tempPassword : null,
        COURSE_TITLE: courseTitleList,
        AMOUNT: amount,
        ORDER_ID: razorpay_order_id,
      });

      await transporter.sendMail({
        from: `"ProdemyX" <${process.env.EMAIL_USER}>`,
        to: customer_email,
        subject: "Payment Successful – Access Granted",
        html,
      });
    } catch (e) {
      console.warn("Email failed:", e);
    }

    res.json({ success: true });
  } catch (err) {
    console.error("verify error:", err);
    res.status(500).json({ message: "Payment verify failed" });
  }
});

// ========================================================
// REPORTS
// ========================================================
/**
 * @swagger
 * /api/reports/summary:
 *   get:
 *     summary: Get system summary report (Admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System summary data
 *       403:
 *         description: Admin access required
 */
app.get("/api/reports/summary", auth, adminOnly, async (_, res) => {
  const [[{ total_users }]] = await pool.query(
    "SELECT COUNT(*) AS total_users FROM users"
  );
  const [[{ total_courses }]] = await pool.query(
    "SELECT COUNT(*) AS total_courses FROM courses"
  );
  const [[{ total_enrollments }]] = await pool.query(
    "SELECT COUNT(*) AS total_enrollments FROM user_course_access"
  );

  res.json({ total_users, total_courses, total_enrollments });
});

// ========================================================
// HEALTH
// ========================================================
/**
 * @swagger
 * /:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running
 */
app.get("/", (_, res) => res.json({ status: "ok" }));

console.log("Attempting to start server...");
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

module.exports = app;
