import { useRouter } from 'next/navigation';

const MERIDIANS = [
  'Lung',
  'Large Intestine',
  'Stomach',
  'Spleen',
  'Heart',
  'Small Intestine',
  'Urinary Bladder',
  'Kidney',
  'Pericardium',
  'Triple Burner',
  'Gall Bladder',
  'Liver',
];

export default function MeridianSelectPage() {
  const router = useRouter();
  return (
    <main className="flex flex-col items-center min-h-screen bg-black px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-[var(--gold-primary)] font-serif">Select a Meridian</h1>
      <div className="grid grid-cols-2 gap-6 w-full max-w-md">
        {MERIDIANS.map(meridian => (
          <button
            key={meridian}
            onClick={() => router.push(`/session?mode=meridian&item=${encodeURIComponent(meridian)}`)}
            className="flex flex-col items-center bg-[#181818] border-2 border-[var(--gold-primary)] rounded-xl p-4 hover:bg-[#232323] transition-all"
          >
            <span className="text-[var(--gold-primary)] font-serif text-lg text-center">{meridian}</span>
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
