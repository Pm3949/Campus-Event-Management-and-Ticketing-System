// controllers/registrationController.js
import Registration from "../models/Registration.js"; // <-- Fixed spelling here!
import Event from "../models/Events.js";

export const registerForEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const studentId = req.user._id;

    // Find the event to ensure it exists and is approved
    const event = await Event.findById(eventId);
    if (!event || event.status !== "approved") {
      return res
        .status(404)
        .json({ message: "Event not found or not approved" });
    }

    // Check if the event date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of today
    if (new Date(event.eventDate) < today) {
      return res.status(400).json({ message: "This event has already ended." });
    }

    // Check if event is already at capacity
    if (event.currentRegistrations >= event.participantLimit) {
      return res.status(400).json({ message: "Event is at full capacity" });
    }

    // Check if the student is already registered for this event
    const existingRegistration = await Registration.findOne({ // <-- Fixed spelling here!
      event: eventId,
      student: studentId,
    });
    if (existingRegistration) {
      return res
        .status(400)
        .json({ message: "You are already registered for this event" });
    }

    // Generate a unique event ID + Student ID
    const qrCodeData = `EVT-${eventId}-STU-${studentId}`;

    // Create a new registration
    const registration = new Registration({ // <-- Fixed spelling here!
      event: eventId,
      student: studentId,
      qrCodeData: qrCodeData,
    });

    event.currentRegistrations += 1; // Increment current registrations
    await event.save(); // Save the updated event
    await registration.save(); // Save the registration
    res.status(201).json({ message: "Registered successfully", registration });
  } catch (error) {
    res.status(500).json({ message: "Error registering for event", error });
  }
};

export const getMyRegistrations = async (req, res) => {
  try {
    const studentId = req.user._id;

    const registrations = await Registration.find({ // <-- Fixed spelling here!
      student: studentId,
    }).populate("event");
    res.status(200).json({ registrations });
  } catch (error) {
    res.status(500).json({ message: "Error fetching registrations", error });
  }
};
// Verify a digital ticket & Mark Attendance (Organizer/Admin only)
export const verifyTicket = async (req, res) => {
  try {
    if (req.user.role !== 'organizer' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const { qrCodeData } = req.body;

    // 1. Notice we added 'organizer' to the event population!
    const ticket = await Registration.findOne({ qrCodeData })
      .populate('student', 'name email')
      .populate('event', 'title organizers');

    if (!ticket) {
      return res.status(404).json({ message: 'Invalid or Fake Ticket!' });
    }

    // 2. NEW MULTI-ORGANIZER SECURITY CHECK
    if (req.user.role === 'organizer') {
      // Check if the logged-in user is inside the array of organizers for this event
      const isCoOrganizer = ticket.event.organizers.some(
        (orgId) => orgId.toString() === req.user._id.toString()
      );
      
      if (!isCoOrganizer) {
        return res.status(403).json({ 
          message: 'Access Denied: You are not an organizer for this event!' 
        });
      }
    }

    // 3. Check if they are already marked as present
    if (ticket.isCheckedIn) {
      return res.status(400).json({ 
        message: 'Ticket already used! Student has already checked in.' 
      });
    }

    // 4. Mark them as checked in
    ticket.isCheckedIn = true;
    await ticket.save();

    res.status(200).json({ 
      message: 'Ticket Validated & Attendance Marked!', 
      studentName: ticket.student?.name || ticket.student?.email,
      eventName: ticket.event?.title
    });

  } catch (error) {
    console.error('Error verifying ticket:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get all participants for a specific event
export const getEventParticipants = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Find all registrations for this event and populate the student details
    const participants = await Registration.find({ event: eventId })
      .populate('student', 'name email');
      
    res.status(200).json({ participants });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching participants', error: error.message });
  }
};