import { useState } from 'react';
import DotMap from './DotMap';
import { europe } from '../maps/europe';
import { skyline } from '../maps/skyline';
import { network } from '../maps/network';
import { FAQS } from './faqs';
import './LandingSections.css';

export const Apply = ({ onApply, note, label = 'Apply' }) => (
  <div className="ls-apply-wrap">
    <button type="button" className="ls-apply" onClick={onApply}>
      {label}
    </button>
    {note && <p className="ls-apply-note">{note}</p>}
  </div>
);

const Benefits = () => (
  <section className="ls-section" id="benefits">
    <div className="ls-head">
      <p className="ls-eyebrow">What you get</p>
      <h2>
        Three things.
        <br /> <em>One community.</em>
      </h2>
      <p className="ls-lead">
        We meet in three places. In an application-only community online. At our events across Europe. And through
        ambassadors in your own country.
      </p>
    </div>

    <div className="ls-rows">
      <div className="ls-row">
        <div className="ls-row-copy">
          <p className="ls-eyebrow">01</p>
          <h3>Community</h3>
          <p>
            An application-only circle of founders under 18 from across Europe. Bring the question you’re stuck on, share
            what you’ve learned, and find the people you’ll want to build with for years.
          </p>
        </div>
        <div className="ls-visual">
          <DotMap className="ls-map" map={network} enter="fade" />
        </div>
      </div>

      <div className="ls-row is-reverse">
        <div className="ls-row-copy">
          <p className="ls-eyebrow">02</p>
          <h3>Events</h3>
          <p>
            Project18 Europe Barcelona 2027, our founding event: one weekend, 40 selected founders, building together in
            Barcelona. The goal is for sponsors to cover it, so selected founders pay nothing. It goes ahead once enough
            sponsors confirm.
          </p>
        </div>
        <div className="ls-visual">
          <DotMap className="ls-map" map={skyline} enter="fade" />
        </div>
      </div>

      <div className="ls-row">
        <div className="ls-row-copy">
          <p className="ls-eyebrow">03</p>
          <h3>Ambassadors</h3>
          <p>
            One ambassador per country. Founders your age who bring Project18 to their city, so the community is not just
            a chat: it’s someone near you.
          </p>
        </div>
        <div className="ls-visual">
          <DotMap className="ls-map" map={europe} />
        </div>
      </div>
    </div>
  </section>
);

const Upcoming = ({ onApply, onNavigate }) => (
  <section className="ls-section" id="upcoming">
    <div className="ls-head">
      <h2>
        Build with your people,
        <br /> at <em>Barcelona 2027.</em>
      </h2>
      <p className="ls-lead">
        Our founding event. One weekend to meet the people behind the projects: building together, talks from experienced
        founders and investors, and the city.
      </p>
    </div>

    <p className="ls-eyebrow ls-center">Upcoming</p>
    <a href="/barcelona-2027" data-spa onClick={onNavigate('/barcelona-2027')} className="ls-event">
      <div className="ls-event-visual">
        <DotMap className="ls-map" map={skyline} enter="fade" />
      </div>
      <div className="ls-event-body">
        <p className="ls-event-region">Europe</p>
        <h3>Project18 Europe Barcelona 2027</h3>
        <p className="ls-event-meta">Spring 2027 · 40 founders · one weekend</p>
        <p className="ls-event-text">
          Applications are open. We’ll select 40 founders from the list. The goal is for sponsors to cover it, so
          selected founders pay nothing.
        </p>
        <span className="ls-event-link">
          More about Barcelona 2027 <span aria-hidden="true">→</span>
        </span>
      </div>
    </a>
    <p className="ls-small ls-center">More cities as our ambassadors launch across Europe.</p>
    <Apply onApply={onApply} />
  </section>
);

const Why = () => (
  <section className="ls-section ls-why" id="why">
    <div className="ls-why-copy">
      <p className="ls-eyebrow">Why we’re building this</p>
      <h2>
        Most founder communities are built <em>for adults.</em>
      </h2>
      <p>The few that aren’t treat you like a student, not a founder.</p>
      <p>
        We started Project18 Europe for a simple reason: the youngest founders have the least network and the least
        support. Your ambition shouldn’t depend on who you already know.
      </p>
      <p>
        So we’re building the network we wish existed. A European generation of builders, connected to each other and to
        the people and opportunities that help them grow.
      </p>
      <p>
        Project18 Europe is a community for like-minded founders under 18 across Europe who want to build something that
        matters.
      </p>
      <p className="ls-why-sign">By young European founders, for young European founders.</p>
    </div>
  </section>
);

export const Faq = ({ onApply, items = FAQS, eyebrow = 'Common questions', title = 'Anything we missed?' }) => {
  const [open, setOpen] = useState(null);
  return (
    <section className="ls-section ls-faq" id="faq">
      <div className="ls-head">
        <p className="ls-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      <div className="ls-faq-list">
        {items.map(([q, a], i) => {
          const isOpen = open === i;
          return (
            <div key={q} className={`ls-faq-item${isOpen ? ' is-open' : ''}`}>
              <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : i)}>
                {q}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              <div className="ls-faq-answer">
                <p>{a}</p>
              </div>
            </div>
          );
        })}
      </div>
      {onApply && <Apply onApply={onApply} note="Free to apply." />}
    </section>
  );
};

const LandingSections = ({ onApply, onNavigate }) => (
  <>
    <Benefits />
    <Upcoming onApply={onApply} onNavigate={onNavigate} />
    <Why />
    <Faq onApply={onApply} />
  </>
);

export default LandingSections;
