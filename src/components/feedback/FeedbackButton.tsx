import { useState } from 'react';
import FeedbackModal from './FeedbackModal';

export default function FeedbackButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleSubmit = async (feedback: { type: string; description: string; deviceInfo: string }) => {
    // Store feedback in localStorage for now - in production this would call an API
    const feedbackHistory = JSON.parse(localStorage.getItem('beta-feedback') || '[]');
    const newFeedback = {
      ...feedback,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    feedbackHistory.push(newFeedback);
    localStorage.setItem('beta-feedback', JSON.stringify(feedbackHistory));

    // Show success message
    setIsModalOpen(false);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-4 right-4 bg-[var(--gold-primary)] text-black px-4 py-2 rounded-xl font-bold shadow-lg hover:bg-[var(--gold-hover)] transition-all hover:scale-105 z-40"
        aria-label="Provide Beta Feedback"
      >
        📝 Beta Feedback
      </button>

      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />

      {showSuccessMessage && (
        <div
          className="fixed bottom-4 right-4 bg-[var(--gold-primary)] text-black px-6 py-4 rounded-xl shadow-lg z-50 max-w-xs transform transition-all duration-300 animate-fade-in hover:scale-105"
          role="alert"
          aria-live="polite"
        >
          <p className="font-serif font-bold text-center">
            Thank you for your feedback! We'll review it carefully.
          </p>
        </div>
      )}
    </>
  );
}
