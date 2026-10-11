import GlobeMark from './GlobeMark';

const Logo = ({ markRef, className = '' }) => (
  <div className={`logo ${className}`.trim()}>
    <GlobeMark markRef={markRef} className="logo-mark" />
    <div className="logo-text">
      <span className="logo-word" aria-label="Project18 Europe">
        <span className="logo-word-main">Project18</span>
        <span className="logo-word-sub">Europe</span>
      </span>
      <p className="logo-tagline">A European generation of builders</p>
    </div>
  </div>
);

export default Logo;
