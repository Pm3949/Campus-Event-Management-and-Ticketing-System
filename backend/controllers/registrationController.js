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

    const ticket = await Registration.findOne({ qrCodeData })
      .populate('student', 'name email')
      .populate('event', 'title');

    if (!ticket) {
      return res.status(404).json({ message: 'Invalid or Fake Ticket!' });
    }

    // NEW LOGIC: Check if they are already marked as present!
    if (ticket.isCheckedIn) {
      return res.status(400).json({ 
        message: 'Ticket already used! Student has already checked in.' 
      });
    }

    // If it's their first time scanning, mark them as checked in and save to DB
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