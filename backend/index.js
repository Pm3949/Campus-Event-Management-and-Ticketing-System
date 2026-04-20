import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import initFirebase from "./config/firebase.js";
import userRoutes from "./routes/userRoutes.js";
import eventRoutes from "./routes/eventRoutes.js"
import registrationRoutes from "./routes/registrationRoutes.js";

// Initialize the Express app
const app = express();

// Middleware
app.use(cors({origin: 'http://localhost:5173'})); // Allow requests from our React frontend
app.use(express.json()); // Allows us to parse JSON data sent in request bodies

// Connect to Database and Initialize Firebase
connectDB();
initFirebase();

// A simple test route
app.get('/', (req, res) => {
  res.send('Campus Event API is running...');
});
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});