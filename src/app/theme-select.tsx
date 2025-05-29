import { useRouter } from 'next/navigation';

const THEMES = [
  { key: 'vitality', label: 'Vitality Boost', icon: '⚡' },
  { key: 'digestion', label: 'Digestive Balance', icon: '🍽️' },
  { key: 'stress', label: 'Stress Relief', icon: '🧘' },
  { key: 'immune', label: 'Immune Support', icon: '🛡️' },
  { key: 'pain', label: 'Pain Relief', icon: '💪' },
  { key: 'sleep', label: 'Sleep Support', icon: '🌙' },
];

export default function ThemeSelectPage() {
  const router = useRouter();
  return (
    <main className="flex flex-col items-center min-h-screen bg-black px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-[var(--gold-primary)] font-serif">Select a Theme</h1>
      <div className="grid grid-cols-2 gap-6 w-full max-w-md">
        {THEMES.map(theme => (
          <button
            key={theme.key}
            onClick={() => router.push(`/session?mode=theme&item=${theme.key}`)}
            className="flex flex-col items-center bg-[#181818] border-2 border-[var(--gold-primary)] rounded-xl p-4 hover:bg-[#232323] transition-all"
          >
            <span className="text-4xl mb-2">{theme.icon}</span>
            <span className="text-[var(--gold-primary)] font-serif text-lg text-center">{theme.label}</span>
          </button>
        ))}
      </div>
      <button
        onClick={() => router.push('/session-start')}
        className="mt-10 text-[var(--gold-primary)] font-serif text-sm hover:underline"
      >
        Back
      </button>
    </main>
  );
}
