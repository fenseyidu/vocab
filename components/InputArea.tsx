import React from 'react';
import { ArrowRight } from 'lucide-react';

interface InputAreaProps {
  value: string;
  onChange: (val: string) => void;
  onProcess: () => void;
}

export const InputArea: React.FC<InputAreaProps> = ({
  value,
  onChange,
  onProcess
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Enter words (Format: English # Chinese)
        </label>
        <p className="text-xs text-slate-500 mb-4">
          Example:<br/>
          Apple # 苹果<br/>
          Ambition # 野心<br/>
          To give up # 放弃
        </p>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-64 p-4 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm resize-none"
          placeholder="Paste your list here..."
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={onProcess}
          disabled={!value.trim()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};