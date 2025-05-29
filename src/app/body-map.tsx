import BodyMap from '../components/body-map/BodyMap';

export default function BodyMapPage() {
  return (
    <main className="flex flex-col items-center min-h-screen bg-gradient-app">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Logo" className="w-20 mb-5" />
          <h1 className="text-center">
            <span className="text-[length:clamp(16px,4vw,20px)] block font-serif">EXPLORE</span>
            <span className="text-[length:clamp(24px,5vw,32px)] font-bold font-serif tracking-wide">BODY MAP</span>
          </h1>
        </div>
        <BodyMap />
      </div>
    </main>
  );
}
