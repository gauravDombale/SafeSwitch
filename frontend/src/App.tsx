import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import type { FeatureFlag } from './api';
import { flagService } from './api';
import { Shield, Plus, ToggleLeft, ToggleRight, Trash2, Zap, AlertCircle } from 'lucide-react';

function App() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  type ApiErrorBody = { error?: string };

  const loadFlags = async () => {
    try {
      setLoading(true);
      const data = await flagService.getFlags();
      setFlags(data);
      setError(null);
    } catch {
      setError("Failed to connect to SafeSwitch API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlags();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await flagService.createFlag({ name, description: desc });
      setName('');
      setDesc('');
      await loadFlags();
    } catch (err: unknown) {
      if (isAxiosError<ApiErrorBody>(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Error creating flag");
      }
    }
  };

  const handleToggle = async (id: number, current: boolean) => {
    try {
      await flagService.toggleFlag(id, !current);
      setFlags(flags.map(f => f.id === id ? { ...f, is_enabled: !current } : f));
      setError(null);
    } catch {
      setError("Error toggling flag");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      if (confirm("Are you sure you want to delete this feature flag?")) {
        await flagService.deleteFlag(id);
        setFlags(flags.filter(f => f.id !== id));
      }
    } catch {
      setError("Error deleting flag");
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
          {/* Create Form */}
          <div className="md:col-span-1">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-neutral-400" />
                New Flag
              </h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Flag Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    placeholder="e.g. new_dashboard"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Description <span className="opacity-50">(optional)</span></label>
                  <input
                    type="text"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="What does this protect?"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!name}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Create Flag
                </button>
              </form>
            </div>
          </div>

          {/* List display */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-neutral-400" />
              Active Environments
            </h2>

            {loading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-neutral-900 border border-neutral-800 rounded-xl"></div>
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
                  <div 
                    key={flag.id} 
                    className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex items-center justify-between transition-all hover:border-neutral-700 group"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${flag.is_enabled ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]' : 'bg-neutral-600'}`}></span>
                        <h3 className="font-mono font-semibold text-neutral-200 truncate">{flag.name}</h3>
                      </div>
                      {flag.description && (
                        <p className="text-neutral-500 text-sm mt-1.5 ml-5 truncate">{flag.description}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handleToggle(flag.id, flag.is_enabled)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          flag.is_enabled ? 'text-emerald-400 hover:bg-emerald-400/10' : 'text-neutral-500 hover:bg-neutral-800'
                        }`}
                        title={flag.is_enabled ? "Disable" : "Enable"}
                      >
                        {flag.is_enabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                      </button>
                      <button 
                        onClick={() => handleDelete(flag.id)}
                        className="text-neutral-600 hover:text-red-400 hover:bg-red-400/10 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete flag"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
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
