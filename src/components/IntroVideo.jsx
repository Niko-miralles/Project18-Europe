import { useState } from 'react';

const VIDEO_ID = 'iLjlI9EPhFQ';

const IntroVideo = () => {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="intro" id="intro">
      <p className="intro-label">
        <svg viewBox="0 0 10 12" fill="currentColor" aria-hidden="true">
          <path d="M0 0v12l10-6z" />
        </svg>
        Watch the 30-second intro. See if Project18 Europe is right for you.
      </p>
      <div className="intro-card">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            title="What is Project18 Europe?"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <button type="button" className="intro-preview" onClick={() => setPlaying(true)} aria-label="Play the Project18 Europe intro video">
            <video src="/intro-loop.mp4" poster="/intro-poster.jpg" autoPlay muted loop playsInline aria-hidden="true" />
            <span className="intro-play" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5.5v13l11-6.5z" />
              </svg>
            </span>
            <span className="intro-chip intro-chip-left">Tap for sound</span>
            <span className="intro-chip intro-chip-right">30 sec</span>
          </button>
        )}
      </div>
      <blockquote className="intro-quote">
        “Your age is not a limit. It’s your head start.”
      </blockquote>
    </section>
  );
};

export default IntroVideo;
