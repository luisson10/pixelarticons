'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

interface IconCardProps {
  name: string;
  size: number;
  isNew?: boolean;
}

export function IconCard({ name, size, isNew }: IconCardProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    await navigator.clipboard.writeText(name);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleClick}
      className="group relative flex flex-col items-center gap-2 p-4 hover:bg-muted/50 transition-colors rounded-lg border border-transparent hover:border-border"
      title={`Click to copy: ${name}`}
    >
      {isNew && (
        <span className="absolute top-1.5 right-1.5 z-10 bg-accent text-accent-foreground text-[9px] font-bold uppercase leading-none px-1.5 py-0.5 rounded-sm tracking-wider">
          NEW
        </span>
      )}
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <img
          src={`/api/icons/${name}`}
          alt={name}
          className="w-full h-full"
          style={{ width: size, height: size }}
        />
        {copied && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/90 rounded">
            <Check className="w-6 h-6 text-primary-foreground" />
          </div>
        )}
      </div>
      <span className="text-xs text-center text-foreground/70 group-hover:text-foreground transition-colors max-w-full overflow-hidden text-ellipsis">
        {name}
      </span>
    </button>
  );
}
