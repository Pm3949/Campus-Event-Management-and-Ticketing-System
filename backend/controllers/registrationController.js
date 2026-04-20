import Registeration from "../models/Registration.js";
import Event from "../models/Events.js";

export const registerForEvent = async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const studentId = req.user._id;

        // Find the event to ensure it exists and is approved
        const event = await Event.findById(eventId);
        if (!event || event.status !== 'approved') {
            return res.status(404).json({ message: 'Event not found or not approved' });
        }

        // Check if event is already at capacity
        if(event.currentRegistrations >= event.participantLimit){
            return res.status(400).json({ message: 'Event is at full capacity' });
        }

        // Check if the student is already registered for this event
        const existingRegistration = await Registeration.findOne({ event: eventId, student: studentId });
        if (existingRegistration) {
            return res.status(400).json({ message: 'You are already registered for this event' });
        }

        // Generate a unique event ID + Student ID
        const qrCodeData = `EVT-${eventId}-STU-${studentId}`;

        // Create a new registration
        const registration = new Registeration({
            event: eventId,
            student: studentId,
            qrCodeData: qrCodeData,
        });

        event.currentRegistrations += 1; // Increment current registrations
        await event.save(); // Save the updated event
        await registration.save(); // Save the registration
        res.status(201).json({ message: 'Registered successfully', registration });
    } catch (error) {
        res.status(500).json({ message: 'Error registering for event', error });    
    }
};