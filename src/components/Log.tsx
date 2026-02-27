import React, { useEffect, useRef } from 'react';

interface LogProps {
  logs: string[];
}

export const Log: React.FC<LogProps> = ({ logs }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2">
      {logs.map((log, i) => (
        <div key={i} className="text-sm text-slate-700 pb-2 border-b border-slate-100 last:border-0">
          {log}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
};
