const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 9.5V19" />
    <circle cx="5" cy="5.2" r="0.6" fill="currentColor" />
    <path d="M10 19v-9.5M10 13.5c0-2.4 1.6-4 3.7-4s3.3 1.4 3.3 3.8V19" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="3.9" />
    <circle cx="17.1" cy="6.9" r="0.4" fill="currentColor" />
  </svg>
);

const SocialLinks = ({ className = '' }) => (
  <div className={`social-links ${className}`.trim()}>
    <a className="site-icon" href="https://www.linkedin.com/company/project18-europe" target="_blank" rel="noreferrer" aria-label="LinkedIn">
      <LinkedInIcon />
    </a>
    <a className="site-icon" href="https://www.instagram.com/project18.eu/" target="_blank" rel="noreferrer" aria-label="Instagram">
      <InstagramIcon />
    </a>
  </div>
);

export default SocialLinks;
