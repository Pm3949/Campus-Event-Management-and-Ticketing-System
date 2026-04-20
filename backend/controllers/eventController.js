import Event from "../models/Events.js";

export const createEvent = async (req, res) => {
    try {
        
        // Security check: Only organizers should be able to create events
        if(req.user.role === 'student'){
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

// Get all events that are pending approval (Admin only)
export const getPendingEvents = async (req, res) => {
    try {
        if(req.user.role !== 'admin'){
            return res.status(403).json({ message: 'Access Denied: Admin only' });
        }

        // Fetch events that are pending approval
        const pendingEvents = await Event.find({ status: 'pending' }).populate('organizer', 'name email');
        res.status(200).json({ pendingEvents });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pending events', error });
    }
};

// Approve or reject an event (Admin only)
export const upadteEventStatus = async (req, res) => {
    try {
        if(req.user.role !== 'admin'){
            return res.status(403).json({ message: 'Access Denied: Admin only' });
        }

        const {status} = req.body; // expected to be 'approved' or 'rejected'
        if(!['approved', 'rejected'].includes(status)){
            return res.status(400).json({ message: 'Invalid status value' });
        }

        // Update the event's status
        const upadtedEvent = await Event.findByIdAndUpdate(
            req.params.id, // Event ID from the URL
            { status },
           { returnDocument: 'after' } // Return the updated document
        );

        if(!upadtedEvent){
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(200).json({ message: `Event ${status} successfully`, event: upadtedEvent });

    } catch (error) {
        res.status(500).json({ message: 'Error updating event status', error });
    }
};


export const getApprovedEvents = async (req, res) => {
    try {
        // Fetch events that are approved
        const approvedEvents = await Event.find({ status: 'approved' }).populate('organizer', 'name email');
        res.status(200).json({ approvedEvents });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching approved events', error });
    }
};

