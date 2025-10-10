import React, { useEffect, useState, useCallback } from 'react';
import './App.css';

function App() {
    const [events, setEvents] = useState([]);
    const [message, setMessage] = useState(''); // For screen reader announcements

    // useCallback to memoize the function so it's not recreated on every render
    const fetchEvents = useCallback(() => {
        // The frontend now fetches from the client service on port 6001
        fetch('http://localhost:6001/api/events')
            .then((res) => res.json())
            .then((data) => setEvents(data))
            .catch((err) => {
                console.error("Failed to fetch events:", err);
                setMessage("Error: Could not load events from the server.");
            });
    }, []);

    // Fetch events on initial component mount
    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const buyTicket = (eventId, eventName) => {
        fetch(`http://localhost:6001/api/events/${eventId}/purchase`, {
            method: 'POST',
        })
        .then(res => {
            if (!res.ok) {
                // If the server responds with an error (e.g., 400 for no tickets)
                // we convert it to JSON to read the error message
                return res.json().then(err => Promise.reject(err));
            }
            return res.json();
        })
        .then(data => {
            // Announce success to screen readers via the live region
            const successMsg = `Ticket purchased successfully for ${eventName}.`;
            setMessage(successMsg);
            alert(successMsg); // Visual confirmation for sighted users
            fetchEvents(); // Refresh the list of events to show the new ticket count
        })
        .catch(err => {
            console.error('Purchase error:', err);
            // Announce failure and show an alert
            const errorMsg = `Failed to purchase ticket for ${eventName}. Reason: ${err.error || 'Server error'}`;
            setMessage(errorMsg);
            alert(errorMsg);
        });
    };

    return (
        <div className="App">
            <header>
                <h1>Clemson Campus Events</h1>
            </header>
            <main>
                {/* This div is a "live region" for accessibility. Screen readers will announce changes to its content. */}
                <div role="status" aria-live="polite" className="sr-only">
                    {message}
                </div>
                <ul>
                    {events.map((event) => (
                        <li key={event.id}>
                            {event.name} - {new Date(event.date).toLocaleDateString()} - <strong>{event.tickets}</strong> tickets available
                            <button 
                                onClick={() => buyTicket(event.id, event.name)}
                                // Descriptive label for screen readers
                                aria-label={`Buy one ticket for ${event.name}`}
                                // Disable button if no tickets are left
                                disabled={event.tickets <= 0}
                            >
                                {event.tickets > 0 ? 'Buy Ticket' : 'Sold Out'}
                            </button>
                        </li>
                    ))}
                </ul>
            </main>
        </div>
    );
}

export default App;
