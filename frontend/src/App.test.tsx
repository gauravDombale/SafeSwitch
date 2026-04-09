import { render, screen } from '@testing-library/react';
import App from './App';
import { describe, it, expect } from 'vitest';

describe('App Component', () => {
  it('renders the SafeSwitch dashboard header properly', () => {
    render(<App />);
    
    // Look for the header text we expect
    expect(screen.getByText('SafeSwitch')).toBeInTheDocument();
    expect(screen.getByText('Strict, resilient feature toggle service')).toBeInTheDocument();
  });
});
