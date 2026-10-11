import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import PatternWaves from './components/PatternWaves';
import Logo from './components/Logo';
import Waitlist from './components/Waitlist';
import Application from './components/Application';

const INTRO_SCALE = 1.8;
const DRAW_MS = 1900;
const SETTLE_MS = 1200;
const LEAVE_MS = 320;

const App = ({ navigate, entered = false }) => {
  const markRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const [bgReady, setBgReady] = useState(false);
  const [email, setEmail] = useState(null);
  const [resume, setResume] = useState(null);
  const [quick] = useState(entered);
  const [leaving, setLeaving] = useState(false);
  const leaveTimer = useRef(null);

  useEffect(() => {
    document.title = 'Project18 Europe';
  }, []);

  useEffect(() => () => clearTimeout(leaveTimer.current), []);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('apply');
    if (!token) return;
    window.history.replaceState(window.history.state, '', window.location.pathname);
    fetch(`/api/resume?token=${encodeURIComponent(token)}`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (!data) return;
        setResume(data);
        setEmail(data.email);
      })
      .catch(() => {});
  }, []);

  useLayoutEffect(() => {
    const mark = markRef.current;
    if (quick || !mark || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRevealed(true);
      return undefined;
    }
    const rect = mark.getBoundingClientRect();
    const dx = window.innerWidth / 2 - (rect.left + rect.width / 2);
    const dy = window.innerHeight / 2 - (rect.top + rect.height / 2);
    const scale = Math.min(INTRO_SCALE, (window.innerWidth * 0.86) / rect.width);
    const start = `translate(${dx}px, ${dy}px) scale(${scale})`;
    mark.style.transform = start;

    let settle;
    const timer = setTimeout(() => {
      settle = mark.animate([{ transform: start }, { transform: 'none' }], {
        duration: SETTLE_MS,
        easing: 'cubic-bezier(0.7, 0, 0.2, 1)'
      });
      mark.style.transform = '';
      setRevealed(true);
    }, DRAW_MS);

    return () => {
      clearTimeout(timer);
      settle?.cancel();
      mark.style.transform = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!revealed) return undefined;
    const timer = setTimeout(() => setBgReady(true), quick ? 160 : 0);
    return () => clearTimeout(timer);
  }, [revealed, quick]);

  useEffect(() => {
    if (email) return undefined;
    document.documentElement.classList.add('is-locked');
    return () => document.documentElement.classList.remove('is-locked');
  }, [email]);

  const goTo = to => e => {
    if (!navigate || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    if (leaving) return;
    setLeaving(true);
    leaveTimer.current = setTimeout(() => navigate(to), LEAVE_MS);
  };

  const pageClass = ['page', revealed && 'is-revealed', quick && 'is-quick', leaving && 'is-leaving']
    .filter(Boolean)
    .join(' ');

  return (
    <main className={pageClass}>
      <div className="page-background">
        {bgReady && (
          <PatternWaves
            preset="silk"
            pattern="dot"
            color="#d4d4d4"
            backgroundColor="#000000"
            spacing={14}
            markSize={0.42}
            depth={0.2}
            shine={0.2}
            contrast={0.8}
            speed={0.22}
            scale={1.6}
            fade="none"
            interactive
            cursorSize={55}
            cursorStrength={0.08}
          />
        )}
      </div>
      {email ? (
        <Application
          email={email}
          initialAnswers={resume?.answers}
          initialStep={resume?.step}
          editing={resume?.submitted}
        />
      ) : (
        <section className="hero">
          <Logo markRef={markRef} />
          <div className="hero-cta">
            <Waitlist onJoin={setEmail} />
          </div>
          <nav className="hero-nav" aria-label="Sections">
            <a href="/community" onClick={goTo('/community')}>
              Community
            </a>
            <a href="/barcelona-2027" onClick={goTo('/barcelona-2027')}>
              Barcelona 2027
            </a>
            <a href="/about" onClick={goTo('/about')}>
              About
            </a>
          </nav>
        </section>
      )}
    </main>
  );
};

export default App;
