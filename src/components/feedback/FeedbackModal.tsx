import { memo, useState } from 'react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: { type: string; description: string; deviceInfo: string }) => Promise<void>;
}

const FEEDBACK_TYPES = [
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'content', label: 'Content Issue' },
  { value: 'experience', label: 'User Experience' },
  { value: 'other', label: 'Other' }
];

const FeedbackModal = memo(({ isOpen, onClose, onSubmit }: FeedbackModalProps) => {
  const [feedbackType, setFeedbackType] = useState(FEEDBACK_TYPES[0].value);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const deviceInfo = {
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        platform: navigator.platform,
        timestamp: new Date().toISOString()
      };

      await onSubmit({
        type: feedbackType,
        description,
        deviceInfo: JSON.stringify(deviceInfo)
      });

      // Clear form and close
      setDescription('');
      setFeedbackType(FEEDBACK_TYPES[0].value);
      onClose();

    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center px-4 z-50 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
    >
      <div
        className="bg-[var(--card-bg)] border-2 border-[var(--gold-primary)] rounded-3xl p-6 max-w-md w-full transform transition-all duration-300 hover:scale-[1.02]"
        role="document"
      >
        <h3
          id="feedback-modal-title"
          className="text-[var(--gold-primary)] text-xl font-serif font-bold mb-4"
        >
          Beta Feedback
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-[var(--subtext-color)] text-sm mb-2">
              Feedback Type
            </label>
            <select
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value)}
              className="w-full bg-[#111] text-white rounded-xl p-3 border-2 border-[var(--gold-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
            >
              {FEEDBACK_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-[var(--subtext-color)] text-sm mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-32 bg-[#111] text-white rounded-xl p-4 border-2 border-[var(--gold-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
              placeholder="Please describe your feedback in detail..."
              required
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              className="flex-1 bg-[var(--maroon-primary)] text-[var(--gold-primary)] px-4 py-2 rounded-xl font-bold border-2 border-[var(--gold-primary)] hover:bg-[var(--maroon-hover)] transition disabled:opacity-50"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-[var(--gold-primary)] text-black px-4 py-2 rounded-xl font-bold hover:bg-[var(--gold-hover)] transition disabled:opacity-50"
              disabled={isSubmitting || !description.trim()}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

FeedbackModal.displayName = 'FeedbackModal';
export default FeedbackModal;
