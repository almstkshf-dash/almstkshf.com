import clsx from 'clsx';

interface CardGlowProps {
  className?: string;
}

export function CardGlow({ className }: CardGlowProps) {
  return (
    <div
      className={clsx(
        'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10',
        className || 'bg-gradient-to-tr from-slate-900/50 via-slate-800/10 to-transparent'
      )}
      aria-hidden="true"
    />
  );
}
