import express from "express";
import { registerForEvent } from "../controllers/registrationController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/registrations/:eventId - Register for an event (protected route)
router.post('/:eventId', verifyToken, registerForEvent);

export default router;