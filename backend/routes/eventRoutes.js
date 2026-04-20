import express from "express";
import { createEvent, getPendingEvents, upadteEventStatus, getApprovedEvents } from "../controllers/eventController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/events - Create a new event (protected route)
router.post('/', verifyToken, createEvent);

// New Admin routes for event approval
// GET /api/events/pending - Get all pending events (Admin only)
router.get('/pending', verifyToken, getPendingEvents);

// PATCH /api/events/:id/status - Update event status (Admin only)
router.patch('/:id/status', verifyToken, upadteEventStatus);

// Student routes
// GET /api/events/approved - Get all approved events (Public route) - Optional, can be implemented later
router.get('/approved', verifyToken, getApprovedEvents);

export default router;