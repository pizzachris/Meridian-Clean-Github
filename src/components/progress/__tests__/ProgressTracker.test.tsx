import { render, screen, fireEvent } from '@testing-library/react';
import ProgressTracker from '../ProgressTracker';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('ProgressTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
      completedPoints: ['point1', 'point2'],
      masteredPoints: ['point1'],
      streak: 5,
      lastStudied: new Date().toISOString()
    }));
  });
  it('renders progress statistics', () => {
    render(<ProgressTracker 
      current={2} 
      total={10} 
      category="test-category"
      label="Test Progress"
    />);
    expect(screen.getByText(/points completed/i)).toBeInTheDocument();
    expect(screen.getByText(/points mastered/i)).toBeInTheDocument();
    expect(screen.getByText(/day streak/i)).toBeInTheDocument();
  });

  it('displays correct completion percentage', () => {
    render(<ProgressTracker 
      current={5} 
      total={10} 
      category="test-category"
      label="Test Progress"
    />);
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuenow', '40'); // Assuming 5 total points
  });
  it('shows streak information', () => {
    render(<ProgressTracker 
      current={2} 
      total={10} 
      category="test-category"
      label="Test Progress"
    />);
    expect(screen.getByText('5')).toBeInTheDocument(); // Current streak
  });

  it('resets progress when reset button is clicked', () => {
    render(<ProgressTracker 
      current={2} 
      total={10} 
      category="test-category"
      label="Test Progress"
    />);
    const resetButton = screen.getByRole('button', { name: /reset progress/i });
    
    fireEvent.click(resetButton);
    // Should show confirmation dialog
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('progress', JSON.stringify({
      completedPoints: [],
      masteredPoints: [],
      streak: 0,
      lastStudied: expect.any(String)
    }));
  });

  it('updates streak correctly', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify({
      completedPoints: ['point1'],
      masteredPoints: [],
      streak: 1,
      lastStudied: yesterday.toISOString()
    }));

    render(<ProgressTracker 
      current={2} 
      total={10} 
      category="test-category"
      label="Test Progress"
    />);
    
    // Simulate completing a point
    fireEvent.click(screen.getByTestId('complete-point'));
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('progress', expect.stringContaining('"streak":2'));
  });

  it('breaks streak after missed day', () => {
    const today = new Date();
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify({
      completedPoints: ['point1'],
      masteredPoints: [],
      streak: 5,
      lastStudied: twoDaysAgo.toISOString()
    }));

    render(<ProgressTracker 
      current={2} 
      total={10} 
      category="test-category"
      label="Test Progress"
    />);
    
    // Streak should reset to 1 on next completion
    fireEvent.click(screen.getByTestId('complete-point'));
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('progress', expect.stringContaining('"streak":1'));
  });
});
