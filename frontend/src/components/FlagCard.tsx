import { ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import type { FeatureFlag } from '../api';

interface FlagCardProps {
  flag: FeatureFlag;
  onToggle: (id: number, current: boolean) => void;
  onDelete: (id: number) => void;
}

export function FlagCard({ flag, onToggle, onDelete }: FlagCardProps) {
  return (
    <div
      className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex items-center justify-between transition-all hover:border-neutral-700 group"
      data-testid={`flag-card-${flag.id}`}
    >
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center gap-3">
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              flag.is_enabled
                ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]'
                : 'bg-neutral-600'
            }`}
          />
          <h3 className="font-mono font-semibold text-neutral-200 truncate">{flag.name}</h3>
        </div>
        {flag.description && (
          <p className="text-neutral-500 text-sm mt-1.5 ml-5 truncate">{flag.description}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => onToggle(flag.id, flag.is_enabled)}
          className={`p-1.5 rounded-lg transition-colors ${
            flag.is_enabled
              ? 'text-emerald-400 hover:bg-emerald-400/10'
              : 'text-neutral-500 hover:bg-neutral-800'
          }`}
          title={flag.is_enabled ? 'Disable' : 'Enable'}
          aria-label={`${flag.is_enabled ? 'Disable' : 'Enable'} ${flag.name}`}
        >
          {flag.is_enabled ? (
            <ToggleRight className="w-8 h-8" />
          ) : (
            <ToggleLeft className="w-8 h-8" />
          )}
        </button>

        <button
          onClick={() => onDelete(flag.id)}
          className="text-neutral-600 hover:text-red-400 hover:bg-red-400/10 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          title={`Delete ${flag.name}`}
          aria-label={`Delete ${flag.name}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
