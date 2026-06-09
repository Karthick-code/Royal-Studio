import { Router } from "express";
import { createLead, getLeads, updateLead, getSmtpStatus, testSmtpConnection } from "../controllers/leadController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", createLead); // Public
router.get("/smtp-status", authMiddleware, getSmtpStatus); // Protected status
router.post("/smtp-test", authMiddleware, testSmtpConnection); // Protected connection test
router.get("/", authMiddleware, getLeads); // Protected
router.put("/:id", authMiddleware, updateLead); // Protected

export default router;
