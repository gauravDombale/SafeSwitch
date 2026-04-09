import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import App from './App';
import * as apiModule from './api';
import type { FeatureFlag } from './api';

// Mock the entire flagService so no real HTTP requests are made
vi.mock('./api', async (importOriginal) => {
  const actual = await importOriginal<typeof apiModule>();
  return {
    ...actual,
    flagService: {
      getFlags: vi.fn(),
      createFlag: vi.fn(),
      toggleFlag: vi.fn(),
      deleteFlag: vi.fn(),
    },
  };
});

const mockFlag: FeatureFlag = {
  id: 1,
  name: 'dark_mode',
  description: 'Enable dark mode UI',
  is_enabled: false,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the SafeSwitch dashboard header', async () => {
    vi.mocked(apiModule.flagService.getFlags).mockResolvedValue([]);
    render(<App />);
    expect(screen.getByText('SafeSwitch')).toBeInTheDocument();
    expect(screen.getByText('Strict, resilient feature toggle service')).toBeInTheDocument();
  });

  it('shows an empty state when no flags exist', async () => {
    vi.mocked(apiModule.flagService.getFlags).mockResolvedValue([]);
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('No feature flags found')).toBeInTheDocument();
    });
  });

  it('renders a list of feature flags returned by the API', async () => {
    vi.mocked(apiModule.flagService.getFlags).mockResolvedValue([mockFlag]);
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('dark_mode')).toBeInTheDocument();
      expect(screen.getByText('Enable dark mode UI')).toBeInTheDocument();
    });
  });

  it('calls toggleFlag with the inverted state when the toggle button is clicked', async () => {
    vi.mocked(apiModule.flagService.getFlags).mockResolvedValue([mockFlag]);
    vi.mocked(apiModule.flagService.toggleFlag).mockResolvedValue({ ...mockFlag, is_enabled: true });
    render(<App />);
    await waitFor(() => screen.getByText('dark_mode'));

    fireEvent.click(screen.getByTitle('Enable'));
    await waitFor(() => {
      expect(apiModule.flagService.toggleFlag).toHaveBeenCalledWith(1, true);
    });
  });

  it('shows an error banner when the API fails to load', async () => {
    vi.mocked(apiModule.flagService.getFlags).mockRejectedValue(new Error('Network Error'));
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Failed to connect to SafeSwitch API.')).toBeInTheDocument();
    });
  });
});

