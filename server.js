import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { connectDB, readLocalFile, writeLocalFile, isStrictMongo } from "./server/config/db.js";
import bcrypt from "bcryptjs";

// Load environment variables
dotenv.config();

// Pre-import our routers
import authRoutes from "./server/routes/authRoutes.js";
import leadRoutes from "./server/routes/leadRoutes.js";
import projectRoutes from "./server/routes/projectRoutes.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize DB Connection
  await connectDB();

  // Seed default admin user on startup depending on active DB storage mode
  try {
    if (isStrictMongo()) {
      // Direct MongoDB Atlas Mode seeding if database has no admins
      const { default: MongoUserModel } = await import("./server/models/User.js");
      const adminCount = await MongoUserModel.countDocuments({ role: "admin" });
      if (adminCount === 0) {
        console.log("🌱 Database is empty in Atlas. Seeding default Admin directly in MongoDB...");
        const defaultHash = await bcrypt.hash("admin123", 10);
        await MongoUserModel.create({
          email: "admin@test.com",
          passwordHash: defaultHash,
          role: "admin"
        });
        console.log("🟩 Administrator created in MongoDB Atlas. (email: admin@test.com / password: admin123)");
      }
    } else {
      // Local fallback file-based mode (Only if MONGO_URI is absent)
      const users = readLocalFile("users.json");
      if (users.length === 0) {
        console.log("🌱 Seeding a default administrative preview user to local db...");
        const defaultHash = await bcrypt.hash("admin123", 10);
        users.push({
          _id: "u_default_seed",
          email: "admin@test.com",
          passwordHash: defaultHash,
          role: "admin"
        });
        writeLocalFile("users.json", users);
        console.log("🟩 Mock administrator created locally. (email: admin@test.com / password: admin123)");
      }
    }
  } catch (err) {
    console.error("Failed to seed default preview admin user:", err);
  }

  // Middlewares
  app.use(cors());
  app.use(express.json());

  // API routing declarations
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date() });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/leads", leadRoutes);
  app.use("/api/projects", projectRoutes);

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    console.log("⚙️  Running in DEVELOPMENT mode. Loading Vite dev server middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("🚀 Running in PRODUCTION mode. Serving pre-compiled static frontend...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`📡 Full-Stack Server listening actively at http://localhost:${PORT}`);
  });
}

startServer();
