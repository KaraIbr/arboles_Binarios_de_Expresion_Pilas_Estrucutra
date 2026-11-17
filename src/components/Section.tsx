import type { ReactNode } from 'react';

interface SectionProps {
  label: string;
  title: string;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Bloque del sidebar separado por hairlines. */
export function Section({ label, title, aside, className = '', children }: SectionProps) {
  return (
    <section className={`border-b border-hairline px-6 py-4 last:border-b-0 ${className}`}>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="font-comfortaa text-[13px] font-bold text-graphite">
          <span className="mr-2 font-rubik text-[11px] font-normal text-mute">{label}</span>
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}
