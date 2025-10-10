const { addEvent } = require('../models/adminModel');

const createEvent = (req, res) => {
    const { name, date, tickets } = req.body;

    if (!name || !date || tickets === undefined) {
        return res.status(400).json({ error: 'Missing required fields: name, date, tickets' });
    }

    if (typeof tickets !== 'number' || tickets < 0) {
        return res.status(400).json({ error: 'Tickets must be a non-negative number.' });
    }

    const newEvent = { name, date, tickets };

    addEvent(newEvent, (err, event) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to create event', details: err.message });
        }
        res.status(201).json({ message: 'Event created successfully', eventId: event.id });
    });
};

module.exports = { createEvent };
