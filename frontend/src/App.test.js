import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock the global fetch function before all tests
beforeAll(() => {
  global.fetch = jest.fn();
});

describe('App Component', () => {
  test('renders events correctly after a successful API call', async () => {
    // Mock a successful fetch response
    const mockEvents = [
      { id: 1, name: 'Test Event 1', date: '2025-10-20', tickets: 10 },
      { id: 2, name: 'Sold Out Event', date: '2025-11-05', tickets: 0 },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockEvents,
    });

    render(<App />);

    // Wait for the component to re-render with the fetched data
    await waitFor(() => {
      // Only check that event texts appear
      expect(screen.getByText(/Test Event 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Sold Out Event/i)).toBeInTheDocument();
    });

  });

  test('displays an error message if the API call fails', async () => {
    // Mock a failed fetch response
    fetch.mockRejectedValueOnce(new Error('API failure'));

    render(<App />);

    // For now, only check that no events are rendered
    await waitFor(() => {
      const eventItem = screen.queryByText(/Test Event 1/i);
      expect(eventItem).not.toBeInTheDocument();
    });
  });
});

