"use client";
import React, { useState } from 'react';
import points from '../data/points.json';

function getRandomPoint(exclude: number[] = []) {
  const available = points.filter((_, idx) => !exclude.includes(idx));
  if (available.length === 0) return null;
  const idx = Math.floor(Math.random() * available.length);
  return { ...available[idx], idx: points.findIndex(p => p.id === available[idx].id) };
}

export default function QuizPage() {
  const [answered, setAnswered] = useState<number[]>([]);
  const [missed, setMissed] = useState<number[]>([]);
  const [reviewMode, setReviewMode] = useState(false);
  const [current, setCurrent] = useState(() => getRandomPoint());
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const getNextPoint = (exclude: number[] = []) => {
    if (reviewMode) {
      const available = missed.filter(idx => !exclude.includes(idx));
      if (available.length === 0) return null;
      const idx = available[Math.floor(Math.random() * available.length)];
      return { ...points[idx], idx };
    } else {
      return getRandomPoint(exclude);
    }
  };

  if ((!current && !reviewMode) || (reviewMode && missed.length === 0))
    return <div className="text-center text-gray-400 mt-20">{reviewMode ? 'No missed points to review!' : 'All points quizzed! Reset to try again.'}</div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!current) return;
    // Accept answer if matches any of the main fields
    const correct = [current.korean, current.romanized, current.english]
      .map(s => s.toLowerCase().trim())
      .includes(input.toLowerCase().trim());
    if (correct) {
      setFeedback(`✅ Correct! ${current.healing ? 'Healing: ' + current.healing : ''}`);
      setAnswered([...answered, current.idx]);
      if (reviewMode) {
        setMissed(missed.filter(idx => idx !== current.idx));
      }
      setTimeout(() => {
        setFeedback(null);
        setInput('');
        setShowAnswer(false);
        setHint(null);
        setCurrent(getNextPoint([...answered, current.idx]));
      }, 1800);
    } else {
      setFeedback(`❌ Not quite. Martial: ${current.martial || 'Review the point.'}`);
      if (!missed.includes(current.idx)) setMissed([...missed, current.idx]);
    }
  };

  const handleHint = () => {
    if (!current) return;
    if (current.healing) {
      setHint('Healing: ' + current.healing);
    } else if (current.martial) {
      setHint('Martial: ' + current.martial);
    } else {
      setHint('Try thinking about the meridian or location.');
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background px-2">
      <h1 className="text-3xl font-bold mb-6 text-secondary">Quiz Mode</h1>
      <div className="bg-card rounded-3xl shadow-2xl border border-gray-700 p-8 max-w-md w-full flex flex-col items-center">
        <div className="mb-4 text-lg text-white text-center">
          <span className="font-bold text-secondary">Q:</span> What is the Korean, Romanized, or English name for this point?
        </div>
        <div className="mb-4 text-gray-300 text-center">
          <span className="font-bold">Meridian:</span> {current ? `${current.meridian} ${current.pointNumber}` : ''}<br />
          <span className="font-bold">Location:</span> {current ? current.location : ''}
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col items-center w-full gap-2">
          <input
            className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-[#181818] text-white focus:outline-none"
            placeholder="Type your answer..."
            value={input}
            onChange={e => setInput(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <button type="submit" className="bg-secondary text-black px-4 py-2 rounded font-bold shadow hover:bg-yellow-400 transition">Submit</button>
            <button type="button" className="bg-accent text-white px-4 py-2 rounded font-bold shadow hover:bg-red-700 transition" onClick={() => setShowAnswer(true)}>Reveal</button>
            <button type="button" className="bg-secondary text-black px-4 py-2 rounded font-bold shadow hover:bg-yellow-400 transition" onClick={handleHint}>AI Hint</button>
          </div>
        </form>
        {hint && <div className="mt-3 text-gold text-base font-serif text-center">💡 {hint}</div>}
        {feedback && <div className="mt-4 text-lg font-bold text-secondary text-center font-serif">{feedback}</div>}
        {showAnswer && current && (
          <div className="mt-4 text-white text-center">
            <div className="font-bold text-secondary mb-1">Answer:</div>
            <div>Korean: <span className="font-bold">{current.korean}</span></div>
            <div>Romanized: <span className="font-bold">{current.romanized}</span></div>
            <div>English: <span className="font-bold">{current.english}</span></div>
          </div>
        )}
      </div>
      <div className="mt-8 text-gray-400 text-sm">Quizzed {answered.length} of {points.length} points</div>
      <div className="flex gap-4 mt-4">
        <button className="px-6 py-2 bg-secondary text-black font-bold rounded-lg shadow hover:bg-yellow-400 transition" onClick={() => { setAnswered([]); setMissed([]); setCurrent(getRandomPoint()); setInput(''); setFeedback(null); setShowAnswer(false); setReviewMode(false); }}>Reset Quiz</button>
        <button className={`px-6 py-2 font-bold rounded-lg shadow transition ${reviewMode ? 'bg-accent text-white' : 'bg-card text-secondary border-2 border-secondary'}`} onClick={() => { setReviewMode(r => !r); setCurrent(getNextPoint()); setInput(''); setFeedback(null); setShowAnswer(false); setHint(null); }}>
          {reviewMode ? 'Exit Review Missed' : 'Review Missed'}
        </button>
      </div>
    </main>
  );
}
