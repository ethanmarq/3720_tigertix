import { getEvents, findEventByName, bookTickets } from '../models/llmModel.js';

const OLLAMA_API_URL = 'http://localhost:11434/api/generate';

// Helper function to safely parse JSON
const safeJsonParse = (str) => {
    try {
        // The response from Ollama often includes markdown backticks.
        const cleanStr = str.replace(/``````/g, '').trim();
        return JSON.parse(cleanStr);
    } catch (e) {
        console.error("Failed to parse JSON:", str);
        return null;
    }
};

export const parseBookingRequest = async (req, res) => {
    const { query } = req.body;
    if (!query) {
        return res.status(400).json({ error: 'Query is required.' });
    }

    try {
        const events = await getEvents();
        const eventList = events.map(e => `- ${e.name} (ID: ${e.id})`).join('\n');

        const prompt = `
You are a ticket booking assistant for "TigerTix". Your tasks are to help users view available events and book tickets.
Analyze the user's query: "${query}"

Available events:
${eventList}

Based on the query, determine the user's intent ("view_events" or "book_tickets") and extract the event name and the number of tickets.
If the user wants to book tickets but doesn't specify which event, ask for clarification.
Respond ONLY with a valid JSON object in the following format. Do not add any other text or explanations.

{
  "intent": "view_events" | "book_tickets" | "clarify" | "greeting",
  "event_name": "event name" | null,
  "tickets": number | null,
  "reply": "Your response to the user."
}

Example 1: User says "show me the events"
{
  "intent": "view_events",
  "event_name": null,
  "tickets": null,
  "reply": "Here are the available events: ${eventList}"
}

Example 2: User says "book two tickets for the TigerTix Launch Party"
{
  "intent": "book_tickets",
  "event_name": "TigerTix Launch Party",
  "tickets": 2,
  "reply": "I am ready to book 2 tickets for TigerTix Launch Party. Please confirm."
}

Example 3: User says "hello"
{
    "intent": "greeting",
    "event_name": null,
    "tickets": null,
    "reply": "Hello! I'm the TigerTix booking assistant. You can ask me to view events or book tickets."
}
`;

        const response = await fetch(OLLAMA_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3.1:8b',
                prompt: prompt,
                stream: false,
                format: 'json'
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama API request failed with status ${response.status}`);
        }

        const data = await response.json();
        const parsedResult = safeJsonParse(data.response);

        if (!parsedResult) {
            return res.status(500).json({ error: 'Failed to parse LLM response.', fallback_reply: "I'm sorry, I couldn't understand that. You can ask to 'view events' or 'book tickets for an event'." });
        }
        
        // If the intent is to book, find the event ID
        if(parsedResult.intent === 'book_tickets' && parsedResult.event_name) {
            const event = await findEventByName(parsedResult.event_name);
            if(event) {
                parsedResult.event_id = event.id;
            } else {
                parsedResult.reply = `I couldn't find an event named "${parsedResult.event_name}". Please choose from the available events.`;
                parsedResult.intent = 'clarify';
            }
        }

        res.json(parsedResult);

    } catch (err) {
        console.error('Error in parseBookingRequest:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};

export const confirmBooking = async (req, res) => {
    const { eventId, tickets } = req.body;

    if (!eventId || tickets === undefined) {
        return res.status(400).json({ error: 'Missing eventId or tickets.' });
    }

    try {
        const result = await bookTickets(eventId, tickets);
        res.status(200).json({ message: 'Booking successful!', tickets_remaining: result.remaining });
    } catch (err) {
        if (err.message === 'No tickets available' || err.message === 'Event not found' || err.message === 'Not enough tickets available') {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: 'Failed to book tickets.', details: err.message });
    }
};
