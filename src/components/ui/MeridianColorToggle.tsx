import { meridianColors } from '../../data/meridians';

interface MeridianColorToggleProps {
  activeMeridians: Set<string>;
  onToggle: (meridian: string) => void;
  onToggleAll: (state: boolean) => void;
}

export default function MeridianColorToggle({ activeMeridians, onToggle, onToggleAll }: MeridianColorToggleProps) {
  const allActive = Object.keys(meridianColors).every(m => activeMeridians.has(m));
  const someActive = Object.keys(meridianColors).some(m => activeMeridians.has(m));

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-sm p-3 rounded-l-lg border border-r-0 border-[var(--gold-primary)] shadow-xl">
      <div className="flex flex-col gap-2">
        <button
          onClick={() => onToggleAll(!someActive)}
          className={`w-6 h-6 rounded-full transition-all duration-200 hover:scale-110 ${
            allActive ? 'ring-2 ring-[var(--gold-primary)]' : someActive ? 'ring-2 ring-gray-500' : 'opacity-50'
          }`}
          style={{ background: 'linear-gradient(45deg, var(--gold-primary), var(--gold-hover))' }}
          title={someActive ? 'Hide All Meridians' : 'Show All Meridians'}
          aria-label={someActive ? 'Hide All Meridians' : 'Show All Meridians'}
        />
        <div className="w-full h-px bg-[var(--gold-primary)] opacity-50 my-1" />
        {Object.entries(meridianColors).map(([code, info]) => (
          <button
            key={code}
            onClick={() => onToggle(code)}
            className={`w-6 h-6 rounded-full transition-all duration-200 hover:scale-110 ${
              activeMeridians.has(code) ? 'ring-2 ring-[var(--gold-primary)]' : 'opacity-50'
            }`}
            style={{ backgroundColor: info.color }}
            title={`${info.name} Meridian (${code})`}
            aria-label={`Toggle ${info.name} Meridian`}
            aria-pressed={activeMeridians.has(code)}
          />
        ))}
      </div>
    </div>
  );
}
