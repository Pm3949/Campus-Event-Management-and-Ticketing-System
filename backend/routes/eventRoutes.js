import express from "express";
import { createEvent } from "../controllers/eventController";
import { verifyToken } from "../middleware/authMiddleware";

const router = express.Router();

// POST /api/events - Create a new event (protected route)
router.post('/', verifyToken, createEvent);

export default router;