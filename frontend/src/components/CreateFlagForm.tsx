import { useState } from 'react';
import { Plus } from 'lucide-react';

interface CreateFlagFormProps {
  onSubmit: (name: string, description: string) => Promise<void>;
}

export function CreateFlagForm({ onSubmit }: CreateFlagFormProps) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(name, desc);
      setName('');
      setDesc('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Plus className="w-5 h-5 text-neutral-400" />
        New Flag
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
            Flag Name
          </label>
          <input
            id="flag-name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
            placeholder="e.g. new_dashboard"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
            Description <span className="opacity-50">(optional)</span>
          </label>
          <input
            id="flag-description-input"
            type="text"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="What does this protect?"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={!name || submitting}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? 'Creating…' : 'Create Flag'}
        </button>
      </form>
    </div>
  );
}
