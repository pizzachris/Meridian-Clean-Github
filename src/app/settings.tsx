import SettingsPanel from '../components/ui/SettingsPanel';

export default function SettingsPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background">
      <h1 className="text-3xl font-bold mb-6 text-secondary">Settings</h1>
      <SettingsPanel />
      <div className="text-xs text-gray-500 mt-6 text-center max-w-xs">
        Theme and progress are saved in your browser. More settings coming soon!<br />
        Have a feature request? Let us know.
      </div>
    </main>
  );
}
