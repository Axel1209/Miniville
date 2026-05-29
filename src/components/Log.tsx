import React from 'react';

interface LogProps {
  logs: string[];
}

export const Log: React.FC<LogProps> = ({ logs }) => {
  // Reverse the logs array so the newest are at the top
  const reversedLogs = [...logs].reverse();

  return (
    <div className="flex-1 overflow-y-auto space-y-2">
      {reversedLogs.map((log, i) => (
        <div key={logs.length - 1 - i} className="text-sm text-slate-300 pb-2 border-b border-white/5 last:border-0">
          {log}
        </div>
      ))}
    </div>
  );
};
