import express from "express";
import { registerForEvent, getMyRegistrations, verifyTicket } from "../controllers/registrationController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/registrations/my-tickets - Get my registrations (protected route) - Optional, can be implemented later
router.get('/my-tickets', verifyToken, getMyRegistrations);

// POST /api/registrations/verify 
router.post('/verify', verifyToken, verifyTicket);

// POST /api/registrations/:eventId - Register for an event (protected route)
router.post('/:eventId', verifyToken, registerForEvent);
export default router;