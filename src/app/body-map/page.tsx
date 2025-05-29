import BodyMap from '../../components/body-map/BodyMap';

export default function BodyMapPage() {
  return (
    <main className="body-map-container">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center mb-12">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="w-20 h-20 mb-6 filter drop-shadow-lg" 
          />
          <h1 className="text-center">
            <span className="block font-serif text-base text-[var(--gold-primary)] mb-1">
              EXPLORE
            </span>
            <span className="block font-serif text-2xl font-bold text-[var(--gold-primary)] tracking-wide">
              BODY MAP
            </span>
          </h1>
        </div>
        <BodyMap />
      </div>
    </main>
  );
}