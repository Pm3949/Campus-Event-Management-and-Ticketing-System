import cron from 'node-cron';
import Event from './models/Events.js';
import Registration from './models/Registration.js';

const cleanupPastEvents = async () => {
  try {
    console.log('Running cleanup of past events...');
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    // Find events that happened before today
    const pastEvents = await Event.find({ eventDate: { $lt: today } });

    if (pastEvents.length > 0) {
      const eventIds = pastEvents.map(event => event._id);

      // Delete all registrations associated with these events
      const regResult = await Registration.deleteMany({ event: { $in: eventIds } });

      // Delete the events
      await Event.deleteMany({ _id: { $in: eventIds } });

      console.log(`Cleanup complete: Deleted ${pastEvents.length} past events and ${regResult.deletedCount} related registrations.`);
    } else {
      console.log('Cleanup complete: No past events to clean up.');
    }
  } catch (error) {
    console.error('Error during cleanup of past events:', error);
  }
}

// Run every day at midnight
export const startCronJobs = () => {
  // Run immediately on boot
  cleanupPastEvents();

  // Schedule to run daily at 00:00
  cron.schedule('0 0 * * *', cleanupPastEvents);
};
