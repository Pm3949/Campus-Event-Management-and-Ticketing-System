import admin from 'firebase-admin';
import User from '../models/User.js';

// Middleware to verify Firebase ID token and attach user info to the request
export const verifyToken = async (req, res, next) => {
    try {
        // Get the ID token from the Authorization header
        const token = req.headers.authorization?.split(' ')[1];

        if(!token){
            return res.status(401).json({ message: 'No token provided' });
        }

        // Verify the token with Firebase Admin SDK
        const decodedToken = await admin.auth().verifyIdToken(token);

        // Find the user in MongoDB using the Firebase UID
        const user = await User.findOne({ firebaseUid: decodedToken.uid });

        if(!user){
            return res.status(401).json({ message: 'User not found' });
        }

        // Attach user info to the request so the next function can access it
        req.user = user;
        req.firebaseUser = decodedToken; // Attach the decoded Firebase token as well

        next(); // Call the next middleware or route handler
    } catch (error) {
        console.error('Auth error: ', error);
        return res.status(401).json({ message: 'Invalid token' });
    }
};
