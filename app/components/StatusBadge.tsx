// app/components/StatusBadge.tsx
import React from 'react';

export const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    OPEN: "bg-blue-100 text-blue-700 border-blue-200",
    IN_PROGRESS: "bg-purple-100 text-purple-700 border-purple-200",
    CLOSED: "bg-slate-100 text-slate-500 border-slate-200",
  };

  const label = {
    OPEN: "Ouvert",
    IN_PROGRESS: "En Cours",
    CLOSED: "Archivé",
  };

  // Default to OPEN if status is unknown
  const currentStyle = styles[status as keyof typeof styles] || styles.OPEN;
  const currentLabel = label[status as keyof typeof label] || status;

  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${currentStyle}`}>
      {currentLabel}
    </span>
  );
};