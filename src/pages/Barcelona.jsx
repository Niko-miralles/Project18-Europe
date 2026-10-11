import { useEffect } from 'react';
import GlobeMark from '../components/GlobeMark';
import useMobileScrollLock from '../hooks/useMobileScrollLock';
import DotMap from '../components/DotMap';
import { skyline } from '../maps/skyline';
import './Community.css';
import './Barcelona.css';

const Barcelona = ({ navigate }) => {
  useMobileScrollLock();

  useEffect(() => {
    document.title = 'Barcelona 2027 | Project18 Europe';
  }, []);

  const goHome = e => {
    if (!navigate || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    navigate('/');
  };

  return (
    <main className="community">
      <DotMap className="community-map" map={skyline} enter="fade" />

      <header className="community-head">
        <a href="/" className="community-home" aria-label="Project18 Europe — home" onClick={goHome}>
          <GlobeMark className="community-mark" animated={false} label="Project18 Europe" />
        </a>
      </header>

      <section className="community-copy">
        <p className="community-eyebrow">Our first gathering</p>
        <h1>
          Barcelona
          <br />
          2027.
        </h1>
        <p className="community-lead">
          30–40 founders under 18 from across Europe.
          <br />
          One weekend to meet, build and start something.
        </p>
        <p className="community-meta">
          <span>30–40 founders</span>
          <span aria-hidden="true">·</span>
          <span>Under 18</span>
          <span aria-hidden="true">·</span>
          <span>Europe</span>
        </p>
        <a href="/" className="bcn-cta" onClick={goHome}>
          Join the waitlist <span aria-hidden="true">→</span>
        </a>
      </section>

    </main>
  );
};

export default Barcelona;
