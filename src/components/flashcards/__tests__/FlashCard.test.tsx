import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import FlashCard from '../FlashCard';

const mockPoint = {
  id: 'test-1',
  korean: '테스트',
  english: 'Test Point',
  pointNumber: 'ST-36',
  meridian: 'Stomach',
  audio: 'audio/st/ST-36.mp3',
  healing: 'Test healing properties',
  martial: 'Test martial application',
  nextId: 'test-2',
  nextAudio: 'audio/st/ST-37.mp3',
  location: 'Test location',
  romanized: 'Test romanized',
  notes: 'Test notes'
};

describe('FlashCard Component', () => {
  beforeAll(() => {
    // Mock AudioContext
    window.AudioContext = jest.fn().mockImplementation(() => ({
      createBufferSource: jest.fn().mockReturnValue({
        connect: jest.fn(),
        start: jest.fn(),
        disconnect: jest.fn(),
        onended: jest.fn()
      }),
      decodeAudioData: jest.fn().mockResolvedValue({}),
      destination: {},
      close: jest.fn(),
      state: 'running',
      resume: jest.fn().mockResolvedValue(undefined)
    }));

    // Mock localStorage
    Storage.prototype.getItem = jest.fn();
    Storage.prototype.setItem = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Card Front', () => {
    it('renders basic point information', () => {
      render(<FlashCard point={mockPoint} />);
      
      expect(screen.getByText('테스트')).toBeInTheDocument();
      expect(screen.getByText('Test Point')).toBeInTheDocument();
      expect(screen.getByText('Stomach ST-36')).toBeInTheDocument();
      expect(screen.getByText('Test romanized')).toBeInTheDocument();
      expect(screen.getByText('Test location')).toBeInTheDocument();
    });

    it('displays audio button when audio is available', () => {
      render(<FlashCard point={mockPoint} />);
      expect(screen.getByLabelText('Play pronunciation audio')).toBeInTheDocument();
    });

    it('hides audio button when audio is not available', () => {
      const pointWithoutAudio = { ...mockPoint, audio: undefined };
      render(<FlashCard point={pointWithoutAudio} />);
      expect(screen.queryByLabelText('Play pronunciation audio')).not.toBeInTheDocument();
    });
  });

  describe('Card Back', () => {
    it('displays all content sections when flipped', async () => {
      render(<FlashCard point={mockPoint} />);
      
      const flipButton = screen.getByText('FLIP');
      await act(async () => {
        fireEvent.click(flipButton);
      });
      
      expect(screen.getByText('HEALING PROPERTIES')).toBeInTheDocument();
      expect(screen.getByText('Test healing properties')).toBeInTheDocument();
      expect(screen.getByText('MARTIAL APPLICATION')).toBeInTheDocument();
      expect(screen.getByText('Test martial application')).toBeInTheDocument();
      expect(screen.getByText('NOTES')).toBeInTheDocument();
      expect(screen.getByText('Test notes')).toBeInTheDocument();
    });

    it('shows back button when flipped', async () => {
      render(<FlashCard point={mockPoint} />);
      
      await act(async () => {
        fireEvent.click(screen.getByText('FLIP'));
      });
      
      expect(screen.getByText('BACK')).toBeInTheDocument();
    });
  });

  describe('Audio Functionality', () => {
    it('handles audio loading states', async () => {
      render(<FlashCard point={mockPoint} />);
      
      const audioButton = screen.getByLabelText('Play pronunciation audio');
      await act(async () => {
        fireEvent.click(audioButton);
      });
      
      expect(audioButton).not.toBeDisabled();
    });

    it('handles audio errors', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Audio load failed'));
      
      render(<FlashCard point={mockPoint} />);
      
      await act(async () => {
        fireEvent.click(screen.getByLabelText('Play pronunciation audio'));
      });
      
      expect(screen.getByText('Audio unavailable')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('flips card with spacebar', async () => {
      render(<FlashCard point={mockPoint} />);
      
      await act(async () => {
        fireEvent.keyDown(window, { key: ' ' });
      });
      
      expect(screen.getByText('HEALING PROPERTIES')).toBeInTheDocument();
    });

    it('flips card with enter key', async () => {
      render(<FlashCard point={mockPoint} />);
      
      await act(async () => {
        fireEvent.keyDown(window, { key: 'Enter' });
      });
      
      expect(screen.getByText('HEALING PROPERTIES')).toBeInTheDocument();
    });

    it('plays audio with p key', async () => {
      const mockCreateBufferSource = jest.fn().mockReturnValue({
        connect: jest.fn(),
        start: jest.fn(),
        disconnect: jest.fn()
      });
      
      window.AudioContext = jest.fn().mockImplementation(() => ({
        createBufferSource: mockCreateBufferSource,
        decodeAudioData: jest.fn().mockResolvedValue({}),
        destination: {},
        state: 'running'
      }));

      render(<FlashCard point={mockPoint} />);
      
      await act(async () => {
        fireEvent.keyDown(window, { key: 'p' });
      });
      
      expect(mockCreateBufferSource).toHaveBeenCalled();
    });
  });

  describe('Session Context', () => {
    it('displays session info when provided', () => {
      render(<FlashCard point={mockPoint} sessionMode="meridian" sessionItem="Stomach" />);
      expect(screen.getByText('Training: Stomach (meridian)')).toBeInTheDocument();
    });

    it('calls onFlip callback when flipped first time', async () => {
      const onFlip = jest.fn();
      render(<FlashCard point={mockPoint} onFlip={onFlip} />);
      
      await act(async () => {
        fireEvent.click(screen.getByText('FLIP'));
      });
      
      expect(onFlip).toHaveBeenCalledTimes(1);
      
      // Second flip should not trigger callback
      await act(async () => {
        fireEvent.click(screen.getByText('BACK'));
        fireEvent.click(screen.getByText('FLIP'));
      });
      
      expect(onFlip).toHaveBeenCalledTimes(1);
    });
  });

  describe('Resource Management', () => {
    it('prefetches next card resources', async () => {
      const prefetchComplete = jest.fn();
      render(<FlashCard point={mockPoint} onPrefetchComplete={prefetchComplete} />);
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 1100));
      });
      
      expect(prefetchComplete).toHaveBeenCalled();
    });
  });

  describe('Offline Functionality', () => {
    it('shows offline mode banner', () => {
      const mockNavigatorOnline = jest.spyOn(window.navigator, 'onLine', 'get');
      mockNavigatorOnline.mockReturnValue(false);
      
      render(<FlashCard point={mockPoint} />);
      expect(screen.getByText('Offline Mode')).toBeInTheDocument();
      
      mockNavigatorOnline.mockRestore();
    });

    it('uses cached audio in offline mode', async () => {
      const mockNavigatorOnline = jest.spyOn(window.navigator, 'onLine', 'get');
      mockNavigatorOnline.mockReturnValue(false);
      
      (Storage.prototype.getItem as jest.Mock).mockReturnValue('cached-audio-data');
      
      render(<FlashCard point={mockPoint} />);
      
      const audioButton = screen.getByLabelText('Play pronunciation audio');
      await act(async () => {
        fireEvent.click(audioButton);
      });
      
      expect(global.fetch).not.toHaveBeenCalled();
      
      mockNavigatorOnline.mockRestore();
    });
  });

  describe('Flag System', () => {
    it('handles flag submission', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({})
      });

      render(<FlashCard point={mockPoint} />);
      
      await act(async () => {
        fireEvent.click(screen.getByText('Report incorrect information'));
      });
      
      const textarea = screen.getByPlaceholderText('Please describe what is incorrect about this point...');
      const submitButton = screen.getByText('Submit Report');
      
      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'Test flag reason' } });
        fireEvent.click(submitButton);
      });
      
      expect(screen.getByText('Thank you for your feedback!')).toBeInTheDocument();
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('shows error state for failed flag submission', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Flag submission failed'));

      render(<FlashCard point={mockPoint} />);
      
      await act(async () => {
        fireEvent.click(screen.getByText('Report incorrect information'));
      });
      
      const textarea = screen.getByPlaceholderText('Please describe what is incorrect about this point...');
      const submitButton = screen.getByText('Submit Report');
      
      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'Test flag reason' } });
        fireEvent.click(submitButton);
      });
      
      expect(screen.queryByText('Thank you for your feedback!')).not.toBeInTheDocument();
    });
  });
});
