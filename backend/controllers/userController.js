import User from '../models/User.js';

export const syncUser = async (req, res) => {
    try {
        // req.firebaseUser is set by the auth middleware and contains the decoded Firebase token
        const firebaseUser = req.firebaseUser;

        const { name, email, uid } = firebaseUser;

        // Check if a user with this Firebase UID already exists in MongoDB
        let user = await User.findOne({ firebaseUid: uid });

        // If the user doesn't exist, create a new one
        if (!user){
            user = new User.create({
                firebaseUid: uid,
                name: name || 'Unnamed User',
                email: email,
                role: 'student' // Default role, can be updated later by an admin
            });

            await user.save();
            return res.status(201).json({ message: 'User created successfully', user });
        }

        // If the user already exists, return the existing user data
        return res.status(200).json({ message: 'User already exists', user });
    } catch (error) {
        console.error('Error syncing user: ', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

