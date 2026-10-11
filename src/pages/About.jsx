import { useEffect } from 'react';
import GlobeMark from '../components/GlobeMark';
import useMobileScrollLock from '../hooks/useMobileScrollLock';
import './Community.css';
import './About.css';

const PRINCIPLES = [
  ['01', 'Meet', 'Find people like you.'],
  ['02', 'Build', 'Turn conversations into projects.'],
  ['03', 'Grow', 'Create opportunities together.']
];

const About = ({ navigate }) => {
  useMobileScrollLock();

  useEffect(() => {
    document.title = 'About | Project18 Europe';
  }, []);

  const goHome = e => {
    if (!navigate || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    navigate('/');
  };

  return (
    <main className="about">
      <header className="community-head">
        <a href="/" className="community-home" aria-label="Project18 Europe — home" onClick={goHome}>
          <GlobeMark className="community-mark" animated={false} label="Project18 Europe" />
        </a>
      </header>

      <div className="about-body">
        <section className="about-left">
          <p className="community-eyebrow">About Project18</p>
          <h1>
            The network
            <br />
            we wish
            <br />
            existed.
          </h1>
          <p className="community-lead">
            Project18 Europe brings together ambitious founders under 18 from across Europe who are already building companies, products and projects.
          </p>
          <p className="community-meta">
            <span>Under 18</span>
            <span aria-hidden="true">·</span>
            <span>Europe</span>
            <span aria-hidden="true">·</span>
            <span>Builders</span>
          </p>
        </section>

        <section className="about-side">
          <p className="about-statement">
            You shouldn&rsquo;t have to wait until university to find people as ambitious as you.
          </p>
          <ol className="about-principles">
            {PRINCIPLES.map(([n, title, text]) => (
              <li key={n}>
                <span className="about-num">{n}</span>
                <span className="about-principle">{title}</span>
                <span className="about-note">{text}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <p className="about-sign">
        <span>By founders,</span> <span>for founders.</span>
      </p>
    </main>
  );
};

export default About;
