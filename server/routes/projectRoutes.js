import { Router } from "express";
import { getProjects, createProject } from "../controllers/projectController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getProjects); // Public
router.post("/", authMiddleware, createProject); // Protected

export default router;
