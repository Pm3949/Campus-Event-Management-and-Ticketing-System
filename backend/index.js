import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import initFirebase from "./config/firebase.js";
import userRoutes from "./routes/userRoutes.js";

// Initialize the Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Allows us to parse JSON data sent in request bodies

// Connect to Database and Initialize Firebase
connectDB();
initFirebase();

// A simple test route
app.get('/', (req, res) => {
  res.send('Campus Event API is running...');
});
app.use('/api/users', userRoutes);



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});