import { useEffect } from 'react';
import GlobeMark from '../components/GlobeMark';
import useMobileScrollLock from '../hooks/useMobileScrollLock';
import DotMap from '../components/DotMap';
import { europe } from '../maps/europe';
import './Community.css';

const Community = ({ navigate }) => {
  useMobileScrollLock();

  useEffect(() => {
    document.title = 'Community | Project18 Europe';
  }, []);

  const goHome = e => {
    if (!navigate || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    navigate('/');
  };

  return (
    <main className="community">
      <DotMap className="community-map" map={europe} />

      <header className="community-head">
        <a href="/" className="community-home" aria-label="Project18 Europe — home" onClick={goHome}>
          <GlobeMark className="community-mark" animated={false} label="Project18 Europe" />
        </a>
      </header>

      <section className="community-copy">
        <p className="community-eyebrow">A European community</p>
        <h1>
          Founders
          <br />
          across Europe.
        </h1>
        <p className="community-lead">
          Young founders building ambitious things &mdash; together.
        </p>
        <p className="community-meta">
          <span>Under 18</span>
          <span aria-hidden="true">·</span>
          <span>Europe</span>
          <span aria-hidden="true">·</span>
          <span>Builders</span>
        </p>
      </section>
    </main>
  );
};

export default Community;
