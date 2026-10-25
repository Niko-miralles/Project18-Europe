import { useEffect, useRef, useState } from 'react';
import './Members.css';

const MEMBERS = [
  {
    tag: 'Space tech',
    name: 'Federico',
    role: 'Co-Founder | YET · 16',
    city: 'Turin',
    photo: '/members/federico.jpg',
    bio: 'CubeSat PM at Space Eagle. At 16, his team won the ESA EO Makerspace Hackathon at ESA-ESRIN with on-orbit AI that tracks Arctic ice in hours instead of days.'
  },
  {
    tag: 'Hackathons',
    name: 'Samuel',
    role: 'Co-Founder | HackSpain · 16',
    city: 'Madrid',
    photo: '/members/samuel.jpg',
    bio: 'Product engineer at QuiverAI and co-founder of HackSpain, which brought 250+ young builders to Madrid, backed by Google, Cursor and Cognition. Also runs an app at $10k MRR.'
  },
  {
    tag: 'AI',
    name: 'Edvin',
    role: 'Founder | Grit AI · 17',
    city: 'Jönköping, Sweden',
    photo: '/members/edvin.jpg',
    bio: 'Started his first business at 11 and was cold-calling US contractors at 13. Hit $1M ARR and a 49-person team by 16. Now an EWOR Fellow and Slush 20U20, building AI call centers for home improvement.'
  },
  {
    tag: 'Consumer AI',
    name: 'Niko',
    role: '3x Hackathon Winner · 16',
    city: 'Barcelona',
    photo: '/members/niko.jpg',
    bio: 'Three hackathons, three wins, including the hackathon for hackathon winners in Malmö. CTO for several national soccer teams.'
  }
];

const Arrow = ({ dir }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={dir === 'left' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
  </svg>
);

const CARDS = [...MEMBERS.map(m => ({ type: 'member', ...m })), { type: 'seat', name: 'seat' }];

const Card = ({ card }) => {
  if (card.type === 'seat')
    return (
      <article className="member-card is-seat">
        <span className="member-tag">[ your seat ]</span>
        <div className="member-photo">
          <svg className="member-seat-icon" viewBox="0 0 80 68" aria-hidden="true">
            <circle cx="40" cy="20" r="20" fill="currentColor" />
            <path d="M33 21.5c1.8 3 4.2 4.5 7 4.5s5.2-1.5 7-4.5" fill="none" stroke="#0b0b0b" strokeWidth="2.6" strokeLinecap="round" />
            <circle cx="33.5" cy="15.5" r="2" fill="#0b0b0b" />
            <circle cx="46.5" cy="15.5" r="2" fill="#0b0b0b" />
            <path d="M0 68c0-14 9-24 22-24h36c13 0 22 10 22 24z" fill="currentColor" />
          </svg>
          <span>Be the next</span>
        </div>
        <h3>You</h3>
        <p className="member-role">Founder | Your project</p>
        <p className="member-city">
          <span aria-hidden="true">📍</span>Your city
        </p>
        <p className="member-bio">
          If you’re building something before 18 and want people who understand what that takes, this seat is yours to
          apply for.
        </p>
      </article>
    );
  const { tag, name, role, city, photo, bio } = card;
  return (
    <article className="member-card">
      <span className="member-tag">[ {tag} ]</span>
      <div className="member-photo">
        <img src={photo} alt={`${name} portrait`} loading="lazy" />
      </div>
      <h3>{name}</h3>
      <p className="member-role">{role}</p>
      <p className="member-city">
        <span aria-hidden="true">📍</span>
        {city}
      </p>
      <p className="member-bio">{bio}</p>
    </article>
  );
};

const Members = ({ onApply }) => {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);

  const [positions, setPositions] = useState(1);

  const metrics = () => {
    const track = trackRef.current;
    const first = track?.children[0];
    const step = first ? first.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 16) : 1;
    return { track, step };
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    const update = () => {
      const { step } = metrics();
      const max = track.scrollWidth - track.clientWidth;
      setPositions(Math.max(1, Math.round(max / step) + 1));
      setActive(Math.round(track.scrollLeft / step));
    };
    update();
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      track.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const goTo = i => {
    const { track, step } = metrics();
    track?.scrollTo({ left: Math.max(0, Math.min(positions - 1, i)) * step, behavior: 'smooth' });
  };

  return (
    <section className="members" id="members">
      <p className="members-eyebrow">Our members</p>
      <h2>
        The kind of people you’ll be <em>building with.</em>
      </h2>
      <p className="members-lead">Founders under 18, already building real companies across Europe.</p>

      <div className="members-carousel">
        <button
          type="button"
          className="members-arrow is-left"
          onClick={() => goTo(active - 1)}
          disabled={active === 0}
          aria-label="Previous members"
        >
          <Arrow dir="left" />
        </button>
        <button
          type="button"
          className="members-arrow is-right"
          onClick={() => goTo(active + 1)}
          disabled={active >= positions - 1}
          aria-label="Next members"
        >
          <Arrow dir="right" />
        </button>
        <div className="members-track" ref={trackRef}>
          {CARDS.map(card => (
            <Card key={card.name} card={card} />
          ))}
        </div>
      </div>

      {positions > 1 && (
        <div className="members-dots">
          {Array.from({ length: positions }, (_, i) => (
            <button
              key={i}
              type="button"
              className={i === active ? 'is-active' : undefined}
              onClick={() => goTo(i)}
              aria-label={`Go to position ${i + 1}`}
            />
          ))}
        </div>
      )}

      <button type="button" className="members-apply" onClick={onApply}>
        Apply
      </button>
    </section>
  );
};

export default Members;
