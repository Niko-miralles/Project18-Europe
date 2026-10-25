import { useState } from 'react';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STORAGE_KEY = 'yef-waitlist';

const Waitlist = ({ initialEmail = '', onJoin, inputRef, label = 'Join the waitlist' }) => {
  const [email, setEmail] = useState(initialEmail);
  const [status, setStatus] = useState('idle');

  const onSubmit = async e => {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL_PATTERN.test(value)) {
      setStatus('invalid');
      return;
    }
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!saved.includes(value)) localStorage.setItem(STORAGE_KEY, JSON.stringify([...saved, value]));
    setStatus('sending');
    const res = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: value })
    }).catch(() => null);
    if (res?.status === 409) {
      setStatus('used');
      return;
    }
    onJoin(value);
  };

  return (
    <form className="waitlist" onSubmit={onSubmit} noValidate>
      <div className={`waitlist-field${status === 'invalid' || status === 'used' ? ' is-invalid' : ''}`}>
        <input
          ref={inputRef}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="your@email.com"
          aria-label="Email address"
          value={email}
          onChange={e => {
            setEmail(e.target.value);
            if (status === 'invalid' || status === 'used') setStatus('idle');
          }}
        />
        <button type="submit" aria-busy={status === 'sending'}>
          {label}
        </button>
      </div>
      {status === 'invalid' && <p className="waitlist-note">Please enter a valid email.</p>}
      {status === 'used' && <p className="waitlist-note">Email already used. Check your inbox.</p>}
    </form>
  );
};

export default Waitlist;
