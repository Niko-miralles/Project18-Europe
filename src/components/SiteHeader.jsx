import { useState } from 'react';
import GlobeMark from './GlobeMark';
import SocialLinks from './SocialLinks';
import './SiteHeader.css';

const LINKS = [
  { label: 'Community', href: '/community', internal: true },
  { label: 'Events', href: '/barcelona-2027', internal: true },
  { label: 'Ambassadors', href: '/ambassadors', internal: true },
  { label: 'Become a sponsor', href: '/sponsors', internal: true }
];

const SiteHeader = ({ markRef, className = '', path, onNavigate, onApply, animated = false }) => {
  const [open, setOpen] = useState(false);

  const go = to => e => {
    setOpen(false);
    if (!onNavigate || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    onNavigate(to);
  };

  return (
    <header className={['site-header', open && 'is-open', className].filter(Boolean).join(' ')}>
      <a href="/" className="site-brand" aria-label="Project18 Europe — home" data-spa onClick={go('/')}>
        <GlobeMark markRef={markRef} className="site-brand-mark" animated={animated} />
        <span className="site-brand-word" aria-hidden="true">
          <span>Project18</span>
          <span>Europe</span>
        </span>
      </a>

      <nav className="site-nav" aria-label="Main">
        {LINKS.map(({ label, href, internal }) => (
          <a
            key={label}
            href={href}
            data-spa={internal || undefined}
            className={internal && path === href ? 'is-active' : undefined}
            aria-current={internal && path === href ? 'page' : undefined}
            onClick={internal ? go(href) : () => setOpen(false)}
          >
            {label}
          </a>
        ))}
        <SocialLinks className="site-nav-social" />
      </nav>

      <div className="site-actions">
        <SocialLinks className="site-social" />
        <button
          type="button"
          className="site-apply"
          onClick={() => {
            setOpen(false);
            onApply?.();
          }}
        >
          Apply
        </button>
        <button
          type="button"
          className="site-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen(v => !v)}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
};

export default SiteHeader;
