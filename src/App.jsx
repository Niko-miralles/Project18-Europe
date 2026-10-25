import { useEffect, useRef, useState } from 'react';
import PatternWaves from './components/PatternWaves';
import SiteFooter from './components/SiteFooter';
import IntroVideo from './components/IntroVideo';
import Story from './components/Story';
import Members from './components/Members';
import LandingSections from './components/LandingSections';
import Waitlist from './components/Waitlist';
import Application from './components/Application';

const App = ({ navigate, intro = false, revealed = true, applyFocus = 0, onApplying }) => {
  const [bgReady, setBgReady] = useState(false);
  const [email, setEmail] = useState(null);
  const [resume, setResume] = useState(null);
  const signupRef = useRef(null);

  useEffect(() => {
    document.title = 'Project18 Europe';
  }, []);

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

  useEffect(() => {
    if (applyFocus) signupRef.current?.focus();
  }, [applyFocus]);

  const scrollToApply = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => signupRef.current?.focus({ preventScroll: true }), 450);
  };

  useEffect(() => {
    onApplying?.(Boolean(email));
    if (!email) return undefined;
    const timer = setTimeout(() => setBgReady(true), 160);
    return () => clearTimeout(timer);
  }, [email, onApplying]);

  useEffect(() => () => onApplying?.(false), [onApplying]);

  const goTo = to => e => {
    if (!navigate || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    navigate(to);
  };

  if (!email) {
    const landingClass = ['landing', intro && 'is-intro', intro && revealed && 'is-revealed'].filter(Boolean).join(' ');
    return (
      <div className={landingClass}>
        <div className="landing-image" aria-hidden="true" />
        <main className="landing-main">
          <section className="landing-hero">
            <div className="landing-copy">
              <h1>
                Europe’s next great companies are being built by <em>founders under 18.</em>
              </h1>
              <p className="landing-lead">
                The youngest founders have the least network and support. We’re building a community to connect
                Europe’s best founders under 18 with the people and opportunities they need to grow.
              </p>
              <div className="landing-cta">
                <Waitlist onJoin={setEmail} inputRef={signupRef} label="Apply" />
              </div>
              <p className="landing-meta">
                <a href="/barcelona-2027" data-spa onClick={goTo('/barcelona-2027')}>
                  Project18 Europe Barcelona 2027
                </a>
                <span aria-hidden="true">·</span>
                <span>Applications open</span>
              </p>
            </div>
          </section>
          <IntroVideo />
          <Story />
          <Members onApply={scrollToApply} />
          <LandingSections onApply={scrollToApply} onNavigate={goTo} />
        </main>
        <SiteFooter className="landing-footer" />
      </div>
    );
  }

  return (
    <main className="page is-revealed is-quick">
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
      <Application
        email={email}
        initialAnswers={resume?.answers}
        initialStep={resume?.step}
        editing={resume?.submitted}
      />
    </main>
  );
};

export default App;
