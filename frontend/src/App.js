import React, { useEffect, useState, useCallback } from 'react';
import './App.css';
import Chatbot from './Chatbot'; // Import the new component

function App() {
    const [events, setEvents] = useState([]);
    const [message, setMessage] = useState('');

    const fetchEvents = useCallback(() => {
        fetch('http://localhost:6001/api/events')
            .then((res) => res.json())
            .then((data) => setEvents(data))
            .catch((err) => {
                console.error("Failed to fetch events:", err);
                setMessage("Error: Could not load events from the server.");
            });
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const buyTicket = (eventId, eventName) => {
        fetch(`http://localhost:6001/api/events/${eventId}/purchase`, {
            method: 'POST',
        })
        .then(res => {
            if (!res.ok) {
                return res.json().then(err => Promise.reject(err));
            }
            return res.json();
        })
        .then(data => {
            const successMsg = `Ticket purchased successfully for ${eventName}.`;
            setMessage(successMsg);
            alert(successMsg);
            fetchEvents();
        })
        .catch(err => {
            console.error('Purchase error:', err);
            const errorMsg = `Failed to purchase ticket for ${eventName}. Reason: ${err.error || 'Server error'}`;
            setMessage(errorMsg);
            alert(errorMsg);
        });
    };

    return (
        <div className="App">
            <header className="centered-header">
                <h1 tabIndex="0">Clemson Campus Events</h1>
            </header>
            <main>
                <div role="status" aria-live="polite" className="sr-only">
                    {message}
                </div>
                <ul>
                    {events.map((event) => (
                        <li key={event.id}>
                            <span id={`event-label-${event.id}`}>
                                {event.name} - {new Date(event.date).toLocaleDateString()} - <strong>{event.tickets}</strong> tickets available
                            </span>
                            <button
                                onClick={() => buyTicket(event.id, event.name)}
                                aria-label={event.tickets > 0 ? `Buy one ticket for ${event.name}` : `${event.name} is sold out`}
                                aria-labelledby={`event-label-${event.id}`}
                                disabled={event.tickets <= 0}
                                tabIndex="0"
                                className="focusable-btn"
                            >
                                {event.tickets > 0 ? `Buy Ticket` : 'Sold Out'}
                            </button>
                        </li>
                    ))}
                </ul>
                <Chatbot onBookingConfirmed={fetchEvents} />
            </main>
        </div>
    );
}

export default App;
