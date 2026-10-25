import { useEffect, useMemo, useState } from 'react';
import './Admin.css';

const FIELDS = [
  ['email', 'Email'],
  ['whatsapp', 'WhatsApp'],
  ['dob', 'Born'],
  ['location', 'Based in'],
  ['building', 'Building'],
  ['built', 'Built'],
  ['coolest', 'Coolest thing'],
  ['future', 'Next 3 years'],
  ['links', 'Links'],
  ['barcelona', 'Barcelona 2027'],
  ['barcelonaNote', 'Note'],
  ['video', 'Video']
];

const SEARCH_FIELDS = ['name', ...FIELDS.map(([key]) => key)];

const DAY = 24 * 60 * 60 * 1000;

const periodStart = period => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === 'today') return today.getTime();
  if (period === 'week') return today.getTime() - ((today.getDay() + 6) % 7) * DAY;
  if (period === 'month') return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  return 0;
};

const since = (list, period) => {
  const start = periodStart(period);
  return list.filter(a => new Date(a.submittedAt).getTime() >= start);
};

const formatDate = iso => (iso ? new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '');

const toUrl = value => (/^https?:\/\//i.test(value) ? value : `https://${value}`);
const isUrl = value => /^\S+\.\S+$/.test(value);
const hasVideo = a => Boolean(a.video);

const csvCell = value => `"${String(value ?? '').replace(/"/g, '""')}"`;

const saveCsv = (name, header, rows) => {
  const csv = [header, ...rows].map(r => r.map(csvCell).join(',')).join('\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  link.download = `project18-${name}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

const downloadApplications = applications =>
  saveCsv(
    'applications',
    ['Name', ...FIELDS.map(([, label]) => label), 'Submitted', 'Edit link'],
    applications.map(a => [a.name, ...FIELDS.map(([key]) => a[key]), a.submittedAt, a.editUrl])
  );

const downloadEmails = (waitlist, applications) => {
  const byEmail = new Map(applications.map(a => [a.email, a]));
  saveCsv(
    'emails',
    ['Email', 'Status', 'Name', 'Answers', 'Joined', 'Edit link'],
    [...waitlist]
      .sort((a, b) => (b.joinedAt || '').localeCompare(a.joinedAt || ''))
      .map(w => {
        const app = byEmail.get(w.email);
        const status = app ? 'Applied' : w.answered ? 'In progress' : 'Not started';
        return [w.email, status, app?.name, app ? '' : w.answered, w.joinedAt, w.editUrl];
      })
  );
};

const CopyLink = ({ url }) => {
  const [copied, setCopied] = useState(false);
  if (!url) return null;
  const copy = async () => {
    await navigator.clipboard?.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button type="button" className="admin-link admin-copy" onClick={copy}>
      {copied ? 'Copied' : 'Copy edit link'}
    </button>
  );
};

const Chevron = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Value = ({ field, entry }) => {
  const value = entry[field];
  if (field === 'video' && !value) return <span className="admin-muted">No video</span>;
  if (field === 'email') return <a href={`mailto:${value}`}>{value}</a>;
  if (field === 'whatsapp') {
    return (
      <a href={`https://wa.me/${value.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
        {value}
      </a>
    );
  }
  if (['built', 'links', 'video'].includes(field) && isUrl(value)) {
    return (
      <a href={toUrl(value)} target="_blank" rel="noreferrer noopener">
        {value}
      </a>
    );
  }
  return value;
};

const DeleteButton = ({ email, onDeleted }) => {
  const [busy, setBusy] = useState(false);
  const remove = async () => {
    if (!window.confirm(`Delete ${email}? This removes their application, saved answers and newsletter contact.`)) return;
    setBusy(true);
    const res = await fetch('/api/admin/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    }).catch(() => null);
    setBusy(false);
    if (res?.ok) onDeleted(email);
    else window.alert('Could not delete. Please try again.');
  };
  return (
    <button type="button" className="admin-link admin-delete" onClick={remove} disabled={busy}>
      {busy ? 'Deleting…' : 'Delete'}
    </button>
  );
};

const Entry = ({ entry, onDeleted }) => {
  const [open, setOpen] = useState(false);
  const id = `entry-${entry.email.replace(/\W/g, '-')}`;

  return (
    <li className={`admin-entry${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="admin-entry-toggle"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(o => !o)}
      >
        <h2>{entry.name || entry.email}</h2>
        <Chevron />
      </button>
      {open && (
        <div id={id} className="admin-entry-body">
          <div className="admin-entry-meta">
            <p className="admin-muted">Submitted {formatDate(entry.submittedAt)}</p>
            <CopyLink url={entry.editUrl} />
            <DeleteButton email={entry.email} onDeleted={onDeleted} />
          </div>
          <dl>
            {FIELDS.filter(([key]) => entry[key] || key === 'video').map(([key, label]) => (
              <div key={key}>
                <dt>{label}</dt>
                <dd>
                  <Value field={key} entry={entry} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </li>
  );
};

const EmailRow = ({ entry, app, onDeleted }) => {
  const [open, setOpen] = useState(false);
  const shown = app || entry.answers || {};
  const fields = [['name', 'Name'], ...FIELDS.filter(([key]) => key !== 'email')].filter(([key]) => shown[key]);
  const status = app ? 'Applied' : entry.answered ? `${entry.answered} answered` : 'Not started';
  const id = `email-${entry.email.replace(/\W/g, '-')}`;

  return (
    <li className={open ? 'is-open' : undefined}>
      <a href={`mailto:${entry.email}`}>{entry.email}</a>
      <span className="admin-pending-meta">
        {fields.length > 0 ? (
          <button
            type="button"
            className="admin-link admin-email-toggle"
            aria-expanded={open}
            aria-controls={id}
            onClick={() => setOpen(o => !o)}
          >
            {status}
            <Chevron />
          </button>
        ) : (
          <span className="admin-muted">{status}</span>
        )}
        {entry.reminded && !app && <span className="admin-muted">Reminder sent</span>}
        <span className="admin-muted">{formatDate(entry.joinedAt)}</span>
        <CopyLink url={entry.editUrl} />
        <DeleteButton email={entry.email} onDeleted={onDeleted} />
      </span>
      {open && (
        <div id={id} className="admin-email-body">
          <p className="admin-muted">
            {app ? `Submitted ${formatDate(app.submittedAt)}` : `Last saved ${formatDate(entry.draftUpdatedAt)}`}
          </p>
          <dl>
            {fields.map(([key, label]) => (
              <div key={key}>
                <dt>{label}</dt>
                <dd>
                  <Value field={key} entry={shown} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </li>
  );
};

const Login = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async e => {
    e.preventDefault();
    if (busy || !password) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not sign in.');
      setPassword('');
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="admin-login" onSubmit={submit}>
      <p className="admin-eyebrow">Project18 Europe · Admin</p>
      <input
        type="password"
        className="admin-input"
        placeholder="Password"
        aria-label="Password"
        autoComplete="current-password"
        autoFocus
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button type="submit" className="admin-button" disabled={busy}>
        {busy ? 'Checking…' : 'Enter'}
      </button>
      <p className="admin-error" role="alert">{error}</p>
    </form>
  );
};

const Filter = ({ label, value, onChange, options }) => (
  <label className="admin-filter">
    <span>{label}</span>
    <select value={value} onChange={e => onChange(e.target.value)}>
      {options.map(([v, text]) => (
        <option key={v} value={v}>
          {text}
        </option>
      ))}
    </select>
  </label>
);

const Admin = () => {
  const [state, setState] = useState('loading');
  const [data, setData] = useState({ applications: [], waitlist: [] });
  const [query, setQuery] = useState('');
  const [barcelona, setBarcelona] = useState('all');
  const [video, setVideo] = useState('all');
  const [period, setPeriod] = useState('all');
  const [city, setCity] = useState('all');
  const [tab, setTab] = useState('applications');

  const load = async () => {
    setState('loading');
    try {
      const res = await fetch('/api/admin/data', { cache: 'no-store' });
      if (res.status === 401) return setState('login');
      if (!res.ok) throw new Error();
      setData(await res.json());
      setState('ready');
    } catch {
      setState('error');
    }
  };

  useEffect(() => {
    document.title = 'Admin | Project18 Europe';
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    document.head.appendChild(robots);
    load();
    return () => robots.remove();
  }, []);

  const removeEmail = email =>
    setData(d => ({
      applications: d.applications.filter(a => a.email !== email),
      waitlist: d.waitlist.filter(w => w.email !== email)
    }));

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
    setData({ applications: [], waitlist: [] });
    setState('login');
  };

  const stats = useMemo(
    () => ({
      today: since(data.applications, 'today').length,
      week: since(data.applications, 'week').length,
      month: since(data.applications, 'month').length
    }),
    [data.applications]
  );

  const applications = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return since(data.applications, period)
      .filter(a => city === 'all' || a.location === city)
      .filter(a => barcelona === 'all' || a.barcelona === barcelona)
      .filter(a => video === 'all' || (video === 'yes') === hasVideo(a))
      .filter(a => {
        const text = SEARCH_FIELDS.map(key => a[key] ?? '').join(' ').toLowerCase();
        return terms.every(term => text.includes(term));
      })
      .sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''));
  }, [data.applications, query, city, barcelona, video, period]);

  const locations = useMemo(() => {
    const counts = new Map();
    for (const a of data.applications) if (a.location) counts.set(a.location, (counts.get(a.location) || 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [data.applications]);

  const emails = useMemo(() => {
    const byEmail = new Map(data.applications.map(a => [a.email, a]));
    return data.waitlist
      .map(w => ({ ...w, app: byEmail.get(w.email) }))
      .sort((a, b) => (b.joinedAt || '').localeCompare(a.joinedAt || ''));
  }, [data]);

  const filtered = query || city !== 'all' || barcelona !== 'all' || video !== 'all' || period !== 'all';

  if (state === 'loading') return <main className="admin admin-center"><p className="admin-muted">Loading…</p></main>;
  if (state === 'login') return <main className="admin admin-center"><Login onSuccess={load} /></main>;
  if (state === 'error') {
    return (
      <main className="admin admin-center">
        <p className="admin-muted">Could not load the data.</p>
        <button type="button" className="admin-link" onClick={load}>Try again</button>
      </main>
    );
  }

  return (
    <main className="admin">
      <header className="admin-head">
        <div>
          <p className="admin-eyebrow">Project18 Europe · Admin</p>
          <h1>{tab === 'applications' ? 'Applications' : 'Emails'}</h1>
          <p className="admin-stats">
            <span><strong>{data.applications.length}</strong> applications</span>
            <span><strong>{data.waitlist.length}</strong> emails</span>
          </p>
          <p className="admin-stats">
            <span><strong>{stats.today}</strong> today</span>
            <span><strong>{stats.week}</strong> this week</span>
            <span><strong>{stats.month}</strong> this month</span>
          </p>
        </div>
        <div className="admin-actions">
          <button type="button" className="admin-link" onClick={load}>Refresh</button>
          <button type="button" className="admin-link" onClick={() => downloadApplications(applications)}>Export CSV</button>
          <button type="button" className="admin-link" onClick={() => downloadEmails(data.waitlist, data.applications)}>
            Export emails
          </button>
          <button type="button" className="admin-link" onClick={logout}>Log out</button>
        </div>
      </header>

      <div className="admin-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'applications'} onClick={() => setTab('applications')}>
          Applications <span>{data.applications.length}</span>
        </button>
        <button type="button" role="tab" aria-selected={tab === 'emails'} onClick={() => setTab('emails')}>
          Emails <span>{data.waitlist.length}</span>
        </button>
      </div>

      {tab === 'applications' && (
      <>
      <div className="admin-tools">
        <input
          type="search"
          className="admin-input admin-search"
          placeholder="Search name, city, email, answers…"
          aria-label="Search applications"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <Filter
          label="City"
          value={city}
          onChange={setCity}
          options={[['all', 'All'], ...locations.map(([name, n]) => [name, `${name} (${n})`])]}
        />
        <Filter
          label="Barcelona 2027"
          value={barcelona}
          onChange={setBarcelona}
          options={[['all', 'All'], ['Yes', 'Yes'], ['Maybe', 'Maybe'], ['No', 'No']]}
        />
        <Filter
          label="Video"
          value={video}
          onChange={setVideo}
          options={[['all', 'All'], ['yes', 'With video'], ['no', 'Without video']]}
        />
        <Filter
          label="Submitted"
          value={period}
          onChange={setPeriod}
          options={[['all', 'Any time'], ['today', 'Today'], ['week', 'This week'], ['month', 'This month']]}
        />
      </div>

      {filtered && (
        <p className="admin-muted admin-count">
          {applications.length} of {data.applications.length} applications
        </p>
      )}

      {applications.length === 0 && (
        <p className="admin-muted admin-empty">{filtered ? 'No applications match.' : 'No applications yet.'}</p>
      )}

      <ol className="admin-list">
        {applications.map(a => (
          <Entry key={a.email} entry={a} onDeleted={removeEmail} />
        ))}
      </ol>

      </>
      )}

      {tab === 'emails' && (
        <section className="admin-pending">
          {emails.length === 0 && <p className="admin-muted admin-empty">No emails yet.</p>}
          <ul>
            {emails.map(w => (
              <EmailRow key={w.email} entry={w} app={w.app} onDeleted={removeEmail} />
            ))}
          </ul>
        </section>
      )}
    </main>
  );
};

export default Admin;
