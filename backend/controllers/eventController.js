import Event from "../models/Events";

export const createEvent = async (req, res) => {
    try {
        
        // Security check: Only organizers should be able to create events
        if(req.user.role !== 'organizer'){
            return res.status(403).json({ message: 'Only organizers can create events' });
        }

        // Extract event details from the request body
        const {title, description, venue, eventDate, category, participantLimit} = req.body;

        // Create a new event document in MongoDB
        const newEvent = new Event({
            title,
            description,
            venue,
            eventDate,
            category,
            participantLimit,
            organizer: req.user._id, // Link the event to the organizer's user ID
            status: 'pending' // New events start as pending and require admin approval
        })

        // Save the new event to the database
        await newEvent.save();

        // Return a success response
        res.status(201).json({ message: 'Event created successfully', event: newEvent });
    } catch (error) {
        // Return an error response
        res.status(500).json({ message: 'Error creating event', error });
    }
};

