import { useMemo, useState } from 'react';

const formatDate = iso => (iso ? new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '');
const toUrl = value => (/^https?:\/\//i.test(value) ? value : `https://${value}`);

const Value = ({ field, value }) => {
  if (field === 'email') return <a href={`mailto:${value}`}>{value}</a>;
  if (field === 'whatsapp')
    return (
      <a href={`https://wa.me/${value.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
        {value}
      </a>
    );
  if (['linkedin', 'website'].includes(field) && /^\S+\.\S+$/.test(value))
    return (
      <a href={toUrl(value)} target="_blank" rel="noreferrer noopener">
        {value}
      </a>
    );
  return value;
};

const FormEntry = ({ entry, type, fields, title, subtitle, onDeleted }) => {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    if (!window.confirm(`Delete ${title}?`)) return;
    setBusy(true);
    const res = await fetch('/api/admin/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, id: entry.id })
    }).catch(() => null);
    setBusy(false);
    if (res?.ok) onDeleted(entry.id);
    else window.alert('Could not delete. Please try again.');
  };

  return (
    <li className={`admin-entry${open ? ' is-open' : ''}`}>
      <button type="button" className="admin-entry-toggle" aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <h2>
          {title}
          {subtitle && <span className="admin-entry-sub">{subtitle}</span>}
        </h2>
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="admin-entry-body">
          <div className="admin-entry-meta">
            <p className="admin-muted">Submitted {formatDate(entry.submittedAt)}</p>
            <button type="button" className="admin-link admin-delete" onClick={remove} disabled={busy}>
              {busy ? 'Deleting…' : 'Delete'}
            </button>
          </div>
          <dl>
            {fields
              .filter(([key]) => entry[key])
              .map(([key, label]) => (
                <div key={key}>
                  <dt>{label}</dt>
                  <dd>
                    <Value field={key} value={entry[key]} />
                  </dd>
                </div>
              ))}
          </dl>
        </div>
      )}
    </li>
  );
};

export const FormEntries = ({ entries, type, fields, titleKey, subtitle, groupKey, onDeleted, empty }) => {
  const [group, setGroup] = useState('all');
  const groups = useMemo(() => [...new Set(entries.map(e => e[groupKey]).filter(Boolean))], [entries, groupKey]);
  const shown = entries
    .filter(e => group === 'all' || e[groupKey] === group)
    .sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''));

  return (
    <>
      {groupKey && groups.length > 0 && (
        <div className="admin-tools">
          <label className="admin-filter">
            <span>{groupKey === 'batch' ? 'Batch' : 'Interested in'}</span>
            <select value={group} onChange={e => setGroup(e.target.value)}>
              <option value="all">All</option>
              {groups.map(g => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
      {shown.length === 0 && <p className="admin-muted admin-empty">{empty}</p>}
      <ol className="admin-list">
        {shown.map(e => (
          <FormEntry
            key={e.id}
            entry={e}
            type={type}
            fields={fields}
            title={e[titleKey] || e.email}
            subtitle={subtitle(e)}
            onDeleted={onDeleted}
          />
        ))}
      </ol>
    </>
  );
};

const sorted = obj => Object.entries(obj || {}).sort((a, b) => b[1] - a[1]);

const Ranking = ({ title, data, limit = 8 }) => {
  const rows = sorted(data).slice(0, limit);
  const max = rows[0]?.[1] || 1;
  return (
    <section className="admin-rank">
      <h3>{title}</h3>
      {rows.length === 0 ? (
        <p className="admin-muted">No data yet.</p>
      ) : (
        <ul>
          {rows.map(([label, n]) => (
            <li key={label}>
              <span className="admin-rank-bar" style={{ width: `${(n / max) * 100}%` }} />
              <span className="admin-rank-label">{label}</span>
              <span className="admin-rank-n">{n}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export const StatsPanel = ({ stats, applications, emails }) => {
  if (!stats) return <p className="admin-muted admin-empty">Stats are not available yet.</p>;
  const { days } = stats;
  const today = days[days.length - 1] || { visitors: 0, views: 0 };
  const views30 = days.reduce((a, d) => a + d.views, 0);
  const sessions30 = days.reduce((a, d) => a + d.sessions, 0);
  const max = Math.max(1, ...days.map(d => d.visitors));
  const conversion = stats.visitorsAll ? ((emails / stats.visitorsAll) * 100).toFixed(1) : '0.0';

  const cards = [
    ['Visitors today', today.visitors],
    ['Visitors · 7 days', stats.visitors7],
    ['Visitors · 30 days', stats.visitors30],
    ['Visitors · all time', stats.visitorsAll],
    ['Page views · 30 days', views30],
    ['Sessions · 30 days', sessions30],
    ['Emails left', emails],
    ['Applications', applications],
    ['Visitor → email', `${conversion}%`]
  ];

  return (
    <div className="admin-statspanel">
      <div className="admin-kpis">
        {cards.map(([label, value]) => (
          <div key={label} className="admin-kpi">
            <p>{label}</p>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <section className="admin-chart">
        <h3>Unique visitors per day · last 30 days</h3>
        <div className="admin-bars">
          {days.map(d => (
            <div key={d.date} className="admin-bar" title={`${d.date}: ${d.visitors} visitors, ${d.views} views`}>
              <span style={{ height: `${(d.visitors / max) * 100}%` }} />
            </div>
          ))}
        </div>
        <div className="admin-bars-axis">
          <span>{days[0]?.date}</span>
          <span>{days[days.length - 1]?.date}</span>
        </div>
      </section>

      <div className="admin-ranks">
        <Ranking title="Top pages" data={stats.pages} />
        <Ranking title="Where they come from" data={stats.referrers} />
        <Ranking title="Countries" data={stats.countries} />
        <Ranking title="Devices" data={stats.devices} />
      </div>
    </div>
  );
};
