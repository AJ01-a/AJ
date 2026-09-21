import type { ReactNode } from 'react';

interface SectionProps {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** Centres the heading block. Left-aligned reads better for long lead text. */
  center?: boolean;
}

/**
 * The shared section shell: consistent rhythm, heading scale and gutters.
 *
 * Every band on the page goes through this, which is what stops a long
 * marketing page from drifting into slightly different spacing per section.
 */
export default function Section({
  id,
  eyebrow,
  title,
  lead,
  children,
  className = '',
  center = false,
}: SectionProps) {
  return (
    <section
      id={id}
      className={`relative scroll-mt-24 py-20 sm:py-28 ${className}`}
    >
      <div className="shell">
        {(eyebrow || title || lead) && (
          <header className={`max-w-2xl ${center ? 'mx-auto text-center' : ''}`}>
            {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
            {title && (
              <h2 className="display text-[clamp(1.7rem,4.2vw,2.9rem)] leading-[1.08] text-ink">
                {title}
              </h2>
            )}
            {lead && (
              <p className="mt-5 text-base leading-relaxed text-ink-dim sm:text-lg">
                {lead}
              </p>
            )}
          </header>
        )}
        {children && <div className={eyebrow || title ? 'mt-12' : ''}>{children}</div>}
      </div>
    </section>
  );
}
