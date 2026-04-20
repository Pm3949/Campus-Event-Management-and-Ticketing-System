// controllers/userController.js
import User from '../models/User.js';

export const syncUser = async (req, res) => {
  try {
    // req.firebaseUser comes from our authMiddleware!
    const { uid, email, name } = req.firebaseUser;

    // 1. Check if the user already exists in MongoDB
    let user = await User.findOne({ firebaseUid: uid });

    // 2. If they don't exist, create a new user profile
    if (!user) {
      user = new User({
        firebaseUid: uid,
        email: email,
        name: name || 'Campus User', // Fallback if name isn't provided
        role: 'student', // Default role for new signups
      });
      
      await user.save(); // Save it to the database
      
      return res.status(201).json({ message: 'New user created', user });
    }

    // 3. If they do exist, just return their data
    res.status(200).json({ message: 'User synced successfully', user });
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};