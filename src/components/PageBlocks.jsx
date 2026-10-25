import { useState } from 'react';
import './PageBlocks.css';

const PATHS = {
  gift: 'M20 12v9H4v-9M2 7h20v5H2zM12 21V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z',
  send: 'M22 2 11 13M22 2l-7 20-4-9-9-4z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  spark: 'M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8',
  shirt: 'M20.4 6.6 16 4a4 4 0 0 1-8 0L3.6 6.6a1 1 0 0 0-.5 1.2l1.4 3.5a1 1 0 0 0 1.2.6L7 11.5V20a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-8.5l1.3.4a1 1 0 0 0 1.2-.6l1.4-3.5a1 1 0 0 0-.5-1.2z',
  rocket: 'M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1zM12 15l-3-3a22 22 0 0 1 2-3.9A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22.4 22.4 0 0 1-4 2zM9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5',
  globe: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
  ticket: 'M2 9a3 3 0 0 0 0 6v4h20v-4a3 3 0 0 0 0-6V5H2zM13 5v2M13 17v2M13 11v2',
  heart: 'M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  link: 'M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7',
  megaphone: 'm3 11 18-5v12L3 14v-3zM11.6 16.8a3 3 0 1 1-5.8-1.6',
  code: 'm16 18 6-6-6-6M8 6l-6 6 6 6',
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  pin: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  chat: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  mic: 'M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v3'
};

export const Icon = ({ name }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={PATHS[name]} />
  </svg>
);

export const InfoCards = ({ cards }) => (
  <div className="pb-cards">
    {cards.map(({ icon, title, items }) => (
      <article key={title} className="pb-card">
        <h3>
          <Icon name={icon} />
          {title}
        </h3>
        <ul>
          {items.map(([itemIcon, strong, text]) => (
            <li key={strong + (text || '')}>
              <Icon name={itemIcon} />
              <span>
                {text ? (
                  <>
                    <strong>{strong}</strong>: {text}
                  </>
                ) : (
                  strong
                )}
              </span>
            </li>
          ))}
        </ul>
      </article>
    ))}
  </div>
);

export const Steps = ({ steps }) => (
  <ol className="pb-steps">
    {steps.map(([title, text], i) => (
      <li key={title}>
        <p className="pb-step-num">
          0{i + 1}
          <span>/</span>
        </p>
        <h3>{title}</h3>
        <p>{text}</p>
      </li>
    ))}
  </ol>
);

export const Facts = ({ facts }) => (
  <dl className="pb-facts">
    {facts.map(([icon, label, value]) => (
      <div key={label}>
        <dt>
          <Icon name={icon} />
          {label}
        </dt>
        <dd>{value}</dd>
      </div>
    ))}
  </dl>
);

export const Accordion = ({ title, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`pb-accordion${open ? ' is-open' : ''}`}>
      <button type="button" aria-expanded={open} onClick={() => setOpen(o => !o)}>
        {title}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div className="pb-accordion-body">
        <div>{children}</div>
      </div>
    </div>
  );
};
