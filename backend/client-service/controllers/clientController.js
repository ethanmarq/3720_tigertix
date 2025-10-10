const { getAllEvents, purchaseTicket } = require('../models/clientModel');

const listEvents = (req, res) => {
    getAllEvents((err, events) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch events' });
        }
        res.json(events);
    });
};

const buyTicket = (req, res) => {
    const eventId = req.params.id;
    purchaseTicket(eventId, (err, result) => {
        if (err) {
            if (err.message === 'No tickets available') {
                return res.status(400).json({ error: err.message });
            }
            return res.status(500).json({ error: 'Failed to purchase ticket' });
        }
        res.json({ message: 'Ticket purchased successfully', tickets_remaining: result.remaining });
    });
};

module.exports = { listEvents, buyTicket };
