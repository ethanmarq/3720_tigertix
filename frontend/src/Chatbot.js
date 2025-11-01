import React, { useState, useEffect, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import './Chatbot.css';

const Chatbot = ({ onBookingConfirmed }) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [bookingProposal, setBookingProposal] = useState(null);
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition,
        finalTranscript
    } = useSpeechRecognition();

    // A ref to track if a message has been sent to prevent duplicates
    const messageSentRef = useRef(false);

    // Sync input field with the live transcript
    useEffect(() => {
        setInputValue(transcript);
    }, [transcript]);

    // This effect handles sending the message when listening stops
    useEffect(() => {
        if (finalTranscript && !listening && !messageSentRef.current) {
            sendMessage(finalTranscript);
            messageSentRef.current = true; // Mark as sent
        }
    }, [finalTranscript, listening]);

    const speak = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    };

    const addMessage = (text, sender) => {
        setMessages(prev => [...prev, { text, sender }]);
    };

    const sendMessage = async (text) => {
        if (!text) return;

        addMessage(text, 'user');
        setInputValue('');
        resetTranscript();

        try {
            const response = await fetch('http://localhost:7001/api/llm/parse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: text }),
            });

            if (!response.ok) {
                 const errData = await response.json();
                 throw new Error(errData.fallback_reply || 'Network response was not ok');
            }

            const data = await response.json();
            
            addMessage(data.reply, 'bot');
            speak(data.reply);

            if (data.intent === 'book_tickets' && data.event_id) {
                setBookingProposal({
                    eventId: data.event_id,
                    eventName: data.event_name,
                    tickets: data.tickets
                });
            } else {
                setBookingProposal(null);
            }
        } catch (error) {
            const errorMsg = error.message || "Sorry, I'm having trouble connecting. Please try again later.";
            addMessage(errorMsg, 'bot');
            speak(errorMsg);
        }
    };

    const handleConfirmBooking = async () => {
        if (!bookingProposal) return;
    
        try {
            const response = await fetch('http://localhost:7001/api/llm/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventId: bookingProposal.eventId,
                    tickets: bookingProposal.tickets
                }),
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                throw new Error(data.error || 'Booking failed');
            }
    
            const successMsg = `Successfully booked ${bookingProposal.tickets} ticket(s) for ${bookingProposal.eventName}.`;
            addMessage(successMsg, 'bot');
            speak(successMsg);
            
            onBookingConfirmed();
    
        } catch (error) {
            const errorMsg = `Booking failed: ${error.message}`;
            addMessage(errorMsg, 'bot');
            speak(errorMsg);
        } finally {
            setBookingProposal(null);
        }
    };

    const handleMicClick = () => {
        if (listening) {
            SpeechRecognition.stopListening();
        } else {
            resetTranscript();
            messageSentRef.current = false; // Reset the sent flag
            SpeechRecognition.startListening({ continuous: false });
        }
    };

    if (!browserSupportsSpeechRecognition) {
        return <span>Browser doesn't support speech recognition.</span>;
    }

    return (
        <div className="chatbot-container">
            <div className="chatbot-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender}`}>
                        {msg.text}
                    </div>
                ))}
            </div>
            {bookingProposal && (
                <div className="booking-confirmation">
                    <p>Do you want to confirm this booking?</p>
                    <button onClick={handleConfirmBooking}>Confirm Booking</button>
                    <button onClick={() => setBookingProposal(null)}>Cancel</button>
                </div>
            )}
            <div className="chatbot-input">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            messageSentRef.current = false; // Reset flag for manual send
                            sendMessage(inputValue);
                        }
                    }}
                    placeholder="Type a message or use the mic..."
                />
                <button onClick={() => {
                    messageSentRef.current = false; // Reset flag for manual send
                    sendMessage(inputValue);
                }}>Send</button>
                <button onClick={handleMicClick} className={listening ? 'listening' : ''}>
                    🎤
                </button>
            </div>
        </div>
    );
};

export default Chatbot;
