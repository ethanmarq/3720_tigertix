import React, { useState, useEffect, useRef, useCallback } from 'react';
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
        finalTranscript,
        isMicrophoneAvailable
    } = useSpeechRecognition();

    const [micError, setMicError] = useState('');

    // A ref to track if a message has been sent to prevent duplicates
    const messageSentRef = useRef(false);

    // Sync input field with the live transcript
    useEffect(() => {
        setInputValue(transcript);
    }, [transcript]);

    // (moved) effect to send message when listening stops is defined below after sendMessage

    const speak = useCallback((text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    }, []);

    const addMessage = useCallback((text, sender) => {
        setMessages(prev => [...prev, { text, sender }]);
    }, []);

    const sendMessage = useCallback(async (text) => {
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
    }, [addMessage, resetTranscript, speak]);

    // This effect handles sending the message when listening stops
    useEffect(() => {
        if (finalTranscript && !listening && !messageSentRef.current) {
            sendMessage(finalTranscript);
            messageSentRef.current = true; // Mark as sent
        }
    }, [finalTranscript, listening, sendMessage]);

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

    // Keep a timeout to auto-stop listening if the onend event doesn't fire promptly
    const stopTimeoutRef = useRef(null);

    const ensureMicPermission = async () => {
        // If the library reports mic unavailable, try to trigger permission prompt
        if (isMicrophoneAvailable === false && navigator.mediaDevices?.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                // Immediately stop tracks; we only needed the permission
                stream.getTracks().forEach(t => t.stop());
            } catch (err) {
                throw new Error('Microphone permission denied.');
            }
        }
    };

    const stopListeningSafely = () => {
        try { SpeechRecognition.stopListening(); } catch (_) { /* no-op */ }
        if (stopTimeoutRef.current) {
            clearTimeout(stopTimeoutRef.current);
            stopTimeoutRef.current = null;
        }
    };

    const handleMicClick = async () => {
        setMicError('');
        if (!browserSupportsSpeechRecognition) {
            setMicError('Voice input is not supported in this browser. Please use Chrome or Edge.');
            return;
        }

        if (listening) {
            stopListeningSafely();
            return;
        }

        try {
            await ensureMicPermission();
            resetTranscript();
            messageSentRef.current = false; // Reset flag for a new utterance
            // Start a single-utterance capture with interim results for responsiveness
            SpeechRecognition.startListening({ continuous: false, interimResults: true, language: 'en-US' });
            // Failsafe: auto-stop after 7 seconds in case the onend event doesn't fire
            stopTimeoutRef.current = setTimeout(() => stopListeningSafely(), 7000);
        } catch (err) {
            setMicError(err.message || 'Unable to access microphone.');
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopListeningSafely();
        };
    }, []);

    return (
        <div className="chatbot-container">
            <div className="chatbot-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender}`}>
                        {msg.text}
                    </div>
                ))}
            </div>
            {!browserSupportsSpeechRecognition && (
                <div className="chatbot-warning" style={{ color: '#b59700', marginBottom: 8 }}>
                    Voice input isn&apos;t supported in this browser. Use Chrome or Edge for the mic, or type your message.
                </div>
            )}
            {micError && (
                <div className="chatbot-error" style={{ color: '#c0392b', marginBottom: 8 }}>
                    {micError}
                </div>
            )}
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
                <button onClick={handleMicClick} className={listening ? 'listening' : ''} disabled={!browserSupportsSpeechRecognition} title={!browserSupportsSpeechRecognition ? 'Use Chrome or Edge for voice input' : ''}>
                    🎤
                </button>
            </div>
        </div>
    );
};

export default Chatbot;
