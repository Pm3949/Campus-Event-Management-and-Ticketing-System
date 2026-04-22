import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import initFirebase from "./config/firebase.js";
import userRoutes from "./routes/userRoutes.js";
import eventRoutes from "./routes/eventRoutes.js"
import registrationRoutes from "./routes/registrationRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { startCronJobs } from "./cronJobs.js";
// Initialize the Express app
const app = express();

// Middleware
app.use(cors({origin: 'http://localhost:5173'})); // Allow requests from our React frontend
app.use(express.json()); // Allows us to parse JSON data sent in request bodies

// DEBUG: Log all requests
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  next();
});

// Connect to Database and Initialize Firebase
connectDB();
initFirebase();

// Start Background Jobs (e.g. daily cleanup)
startCronJobs();

// A simple test route
app.get('/', (req, res) => {
  res.send('Campus Event API is running...');
});
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});