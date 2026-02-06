'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

interface IconCardProps {
  name: string;
  size: number;
}

export function IconCard({ name, size }: IconCardProps) {
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
      <div 
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <img
          src={`/svg/${name}.svg`}
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
