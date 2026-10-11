import { useId } from 'react';

const STROKES = [
  { el: 'ellipse', props: { cx: 230, cy: 92, rx: 220, ry: 86 }, delay: 0 },
  { el: 'ellipse', props: { cx: 230, cy: 92, rx: 128, ry: 86 }, delay: 0.25 },
  { el: 'line', props: { x1: 0, y1: 92, x2: 460, y2: 92 }, delay: 0.55, clip: true },
  { el: 'line', props: { x1: 230, y1: 0, x2: 230, y2: 184 }, delay: 0.65, clip: true },
  { el: 'line', props: { x1: 0, y1: 46, x2: 460, y2: 46 }, delay: 0.75, clip: true },
  { el: 'line', props: { x1: 460, y1: 138, x2: 0, y2: 138 }, delay: 0.85, clip: true }
];

const GlobeMark = ({ markRef, className = '', label = 'Project18 Europe', animated = true }) => {
  const clipId = `globe-${useId().replace(/:/g, '')}`;

  return (
    <svg
      ref={markRef}
      className={className}
      viewBox="0 0 460 184"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      role="img"
      aria-label={label}
    >
      <defs>
        <clipPath id={clipId}>
          <ellipse cx="230" cy="92" rx="220" ry="86" />
        </clipPath>
      </defs>
      {STROKES.map(({ el: Shape, props, delay, clip }, index) => (
        <Shape
          key={index}
          {...props}
          className={animated ? 'logo-stroke' : undefined}
          pathLength="1"
          clipPath={clip ? `url(#${clipId})` : undefined}
          style={{ '--delay': `${delay}s` }}
        />
      ))}
    </svg>
  );
};

export default GlobeMark;
