import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import type { FeatureFlag } from './api';
import { flagService } from './api';
import { Shield, Zap, AlertCircle } from 'lucide-react';
import { FlagCard } from './components/FlagCard';
import { CreateFlagForm } from './components/CreateFlagForm';

type ApiErrorBody = { error?: string };

function App() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFlags = async () => {
    try {
      setLoading(true);
      const data = await flagService.getFlags();
      setFlags(data);
      setError(null);
    } catch {
      setError('Failed to connect to SafeSwitch API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlags();
  }, []);

  const handleCreate = async (name: string, description: string) => {
    try {
      await flagService.createFlag({ name, description });
      await loadFlags();
    } catch (err: unknown) {
      if (isAxiosError<ApiErrorBody>(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Error creating flag');
      }
    }
  };

  const handleToggle = async (id: number, current: boolean) => {
    try {
      await flagService.toggleFlag(id, !current);
      setFlags((prev) => prev.map((f) => (f.id === id ? { ...f, is_enabled: !current } : f)));
      setError(null);
    } catch {
      setError('Error toggling flag');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this feature flag?')) return;
    try {
      await flagService.deleteFlag(id);
      setFlags((prev) => prev.filter((f) => f.id !== id));
    } catch {
      setError('Error deleting flag');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-blue-500/30">
      <div className="max-w-4xl mx-auto p-6 md:p-12">
        <header className="flex items-center gap-3 mb-10 border-b border-neutral-800 pb-6">
          <div className="p-3 bg-blue-600/10 rounded-xl">
            <Shield className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">SafeSwitch</h1>
            <p className="text-neutral-400 text-sm mt-1">Strict, resilient feature toggle service</p>
          </div>
        </header>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <CreateFlagForm onSubmit={handleCreate} />
          </div>

          <div className="md:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-neutral-400" />
              Active Environments
            </h2>

            {loading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-neutral-900 border border-neutral-800 rounded-xl" />
                ))}
              </div>
            ) : flags.length === 0 ? (
              <div className="bg-neutral-900/50 border border-neutral-800 border-dashed rounded-2xl p-10 text-center">
                <Shield className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
                <h3 className="text-neutral-400 font-medium">No feature flags found</h3>
                <p className="text-neutral-500 text-sm mt-1">Create your first flag to get started securely.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {flags.map((flag) => (
                  <FlagCard
                    key={flag.id}
                    flag={flag}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
