import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders Plan Mechanics Simulator', () => {
    render(<App />);
    const titleElement = screen.getByText(/Plan Mechanics Simulator/i);
    expect(titleElement).toBeInTheDocument();
  });

  it('renders the main description', () => {
    render(<App />);
    const descriptionElement = screen.getByText(/A tool to visualize and test the unlocking and communication logic/i);
    expect(descriptionElement).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    render(<App />);
    // If we get here without throwing, the test passes
    expect(true).toBe(true);
  });
});