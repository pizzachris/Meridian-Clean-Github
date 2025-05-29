import { useRouter } from 'next/navigation';
import { regionData } from '../data/regions';

export default function RegionSelectPage() {
  const router = useRouter();
  return (
    <main className="flex flex-col items-center min-h-screen bg-black px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-[var(--gold-primary)] font-serif">Select a Region</h1>
      <div className="grid grid-cols-2 gap-6 w-full max-w-md">
        {Object.entries(regionData).map(([key, region]) => (
          <button
            key={key}
            onClick={() => router.push(`/session?mode=region&item=${key}`)}
            className="flex flex-col items-center bg-[#181818] border-2 border-[var(--gold-primary)] rounded-xl p-4 hover:bg-[#232323] transition-all"
          >
            <img src={region.image} alt={region.title} className="w-20 h-20 object-contain mb-2" />
            <span className="text-[var(--gold-primary)] font-serif text-lg text-center">{region.title}</span>
          </button>
        ))}
      </div>
      <button
        onClick={() => router.push('/')}
        className="mt-10 text-[var(--gold-primary)] font-serif text-sm hover:underline"
      >
        Back to Home
      </button>
    </main>
  );
}
