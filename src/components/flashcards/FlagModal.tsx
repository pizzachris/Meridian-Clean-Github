import { memo } from 'react';

interface FlagModalProps {
  isOpen: boolean;
  flagReason: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  onChange: (value: string) => void;
}

const FlagModal = memo(({ 
  isOpen, 
  flagReason, 
  onClose, 
  onSubmit, 
  onChange,
  isSubmitting 
}: FlagModalProps) => {
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(flagReason);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center px-4 z-50 animate-fade-in-out"
      role="dialog"
      aria-modal="true"
      aria-labelledby="flag-modal-title"
    >
      <div 
        className="bg-[var(--card-bg)] border-2 border-[var(--gold-primary)] rounded-3xl p-6 max-w-md w-full transform transition-all duration-300 hover:scale-[1.02]"
        role="document"
      >
        <h3 
          id="flag-modal-title"
          className="text-[var(--gold-primary)] text-xl font-serif font-bold mb-4"
        >
          Report Incorrect Information
        </h3>
        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full h-32 bg-[#111] text-white rounded-xl p-4 border-2 border-[var(--gold-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
            placeholder="Please describe what is incorrect about this point..."
            value={flagReason}
            onChange={e => onChange(e.target.value)}
            disabled={isSubmitting}
            aria-label="Report details"
            required
          />
          <div className="flex gap-4 mt-4">
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
              disabled={isSubmitting || !flagReason.trim()}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

FlagModal.displayName = 'FlagModal';
export default FlagModal;
