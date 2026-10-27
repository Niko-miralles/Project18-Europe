import { useEffect, useRef, useState } from 'react';
import ApplyForm from '../components/ApplyForm';
import DotMap from '../components/DotMap';
import { Accordion, Icon, InfoCards, Steps } from '../components/PageBlocks';
import SiteFooter from '../components/SiteFooter';
import { AMBASSADORS, AMBASSADOR_COUNTRIES, COUNTRIES, ambassadorBatches, ambassadorOf, currentBatch, flag } from '../data/countries';
import { ambassadorsMap, countryAt } from '../maps/ambassadors';
import './Community.css';
import './Ambassadors.css';

const CARDS = [
  {
    icon: 'gift',
    title: 'Your benefits',
    items: [
      ['shirt', 'Exclusive Project18 Europe Ambassador hoodie'],
      ['spark', 'Full access to the Project18 Europe community and events'],
      ['rocket', 'Direct influence on events and community priorities'],
      ['globe', 'Europe-wide ambassador network'],
      ['ticket', 'Special access to selected events']
    ]
  },
  {
    icon: 'send',
    title: 'Your tasks',
    items: [
      ['users', 'Find founders', 'invite the best founders under 18 in your country to apply'],
      ['link', 'Build partnerships', 'connect us with local schools, communities and companies'],
      ['megaphone', 'Spread the word', 'share Project18 Europe in your network and represent us at local events']
    ]
  },
  {
    icon: 'shield',
    title: 'Requirements',
    items: [
      ['rocket', 'You’re under 18 and already building something'],
      ['pin', 'You live in the country you represent'],
      ['users', 'Community-oriented and ready to bring people together'],
      ['calendar', 'You can commit to a full 3-month batch']
    ]
  }
];

const STEPS = [
  ['Apply', 'Pick a batch and tell us who you are and why you should represent your country.'],
  ['Short call', 'We get to know you and talk through what you’d do in your country.'],
  ['Selection', 'We pick one ambassador per country for each 3-month batch.'],
  ['New batch', 'Every 3 months the seats open again. Current ambassadors can reapply.']
];

const BATCHES = ambassadorBatches();

const FIELDS = [
  { name: 'batch', label: 'Batch', type: 'select', required: true, options: BATCHES, placeholder: 'Choose a batch' },
  {
    name: 'country',
    label: 'Country',
    type: 'select',
    required: true,
    placeholder: 'Choose your country',
    options: [
      ...COUNTRIES.map(c => [c.name, `${flag(c.code)}  ${c.name}${AMBASSADOR_COUNTRIES.includes(c.name) ? ' · filled this batch' : ''}`]),
      ['Other', 'Other (tell us in notes)']
    ]
  },
  { name: 'name', label: 'Full name', required: true, autoComplete: 'name', placeholder: 'Your name' },
  { name: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'email', placeholder: 'you@email.com' },
  { name: 'whatsapp', label: 'WhatsApp', type: 'tel', required: true, autoComplete: 'tel', placeholder: '+34 600 000 000' },
  { name: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/you' },
  {
    name: 'why',
    label: 'Why you?',
    type: 'textarea',
    required: true,
    wide: true,
    placeholder: 'What are you building, and why should you represent your country?'
  },
  { name: 'notes', label: 'Notes', type: 'textarea', wide: true, rows: 3, placeholder: 'Anything else we should know' }
];

const Ambassadors = () => {
  const [values, setValues] = useState({ batch: BATCHES[0] });
  const [done, setDone] = useState(false);
  const [hover, setHover] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {
    document.title = 'Ambassadors | Project18 Europe';
  }, []);

  const filled = COUNTRIES.filter(c => AMBASSADOR_COUNTRIES.includes(c.name));

  const pick = country => {
    setValues(v => ({ ...v, country }));
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <main className="amb">
        <header className="amb-hero">
          <p className="ls-eyebrow">Community roles across Europe</p>
          <h1>
            Represent Europe’s young founders <em>in your country.</em>
          </h1>
          <p className="ls-lead">
            One ambassador per country. Every 3 months a new batch. Find the best founders under 18 near you and bring
            them into one European community.
          </p>
          <a
            href="#apply"
            className="ls-apply amb-hero-cta"
            onClick={e => {
              e.preventDefault();
              formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            Apply as ambassador
          </a>
        </header>

        <section className="amb-role">
          <div className="amb-role-head">
            <span className="amb-role-icon">
              <Icon name="pin" />
            </span>
            <div>
              <h2>Ambassador</h2>
              <p>Under 18 · One per country · 3-month batches</p>
            </div>
          </div>
          <p className="amb-role-text">
            You’re building something and you want founders like you around you. As an Ambassador, you represent
            Project18 Europe in your country: you find the best young founders, grow the local scene and connect the dots
            across Europe. Every ambassador gets the exclusive Project18 Europe Ambassador hoodie.
          </p>
          <InfoCards cards={CARDS} />
          <Accordion title="The process">
            <Steps steps={STEPS} />
          </Accordion>
        </section>

        <section className="amb-positions">
          <div className="ls-head">
            <p className="ls-eyebrow">Available positions · current batch {currentBatch()}</p>
            <h2 className="amb-h2">
              {filled.length} countries filled. <em>{COUNTRIES.length - filled.length} still open.</em>
            </h2>
          </div>

          <div
            className={`amb-map${hover ? ' is-hovering' : ''}`}
            onMouseMove={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              const country = countryAt(x, y);
              setHover(country ? { country, x, y } : null);
            }}
            onMouseLeave={() => setHover(null)}
            onClick={() => hover && pick(hover.country.name)}
          >
            <DotMap className="amb-map-canvas" map={ambassadorsMap} enter="fade" interactive={false} />
            {hover && (
              <div className="amb-tip" style={{ left: hover.x, top: hover.y }} role="tooltip">
                <span className="amb-flag" aria-hidden="true">
                  {flag(hover.country.code)}
                </span>
                <strong>{hover.country.name}</strong>
                {ambassadorOf(hover.country.name) ? (
                  <span className="amb-tip-status is-filled">{ambassadorOf(hover.country.name)}</span>
                ) : (
                  <span className="amb-tip-status">Open · click to apply</span>
                )}
              </div>
            )}
            <ul className="amb-legend">
              <li>
                <span className="amb-dot is-active" />
                Ambassador in place
              </li>
              <li>
                <span className="amb-dot" />
                Open seat
              </li>
            </ul>
          </div>

          <ul className="amb-countries">
            {COUNTRIES.map(c => {
              const taken = AMBASSADOR_COUNTRIES.includes(c.name);
              return (
                <li key={c.name}>
                  <button
                    type="button"
                    className={`amb-country${taken ? ' is-filled' : ''}`}
                    onClick={() => pick(c.name)}
                    title={taken ? 'Filled this batch. You can apply for the next one.' : 'Apply for this country'}
                  >
                    <span className="amb-flag" aria-hidden="true">
                      {flag(c.code)}
                    </span>
                    <span className="amb-country-name">
                      {c.name}
                      {taken && <em>{ambassadorOf(c.name)}</em>}
                    </span>
                    <span className="amb-status">{taken ? 'Filled' : 'Open'}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="amb-note">
            Your country isn’t listed? Apply anyway and choose “Other”.
          </p>
        </section>

        <section className="amb-apply" id="apply" ref={formRef}>
          <div className="ls-head">
            <p className="ls-eyebrow">Apply</p>
            <h2 className="amb-h2">
              Become an <em>ambassador.</em>
            </h2>
            <p className="ls-lead">Takes a few minutes. We reply to every application.</p>
          </div>
          <div className="amb-form">
            {done ? (
              <div className="amb-done" role="status">
                <h3>Application received.</h3>
                <p>Thanks{values.name ? `, ${values.name.split(' ')[0]}` : ''}. We’ll get back to you before the {values.batch} batch starts.</p>
              </div>
            ) : (
              <ApplyForm
                type="ambassador"
                fields={FIELDS}
                values={values}
                onChange={setValues}
                submitLabel="Send application"
                fallback={
                  <>
                    Or email us at <a href="mailto:info@project18.eu">info@project18.eu</a>.
                  </>
                }
                onDone={() => setDone(true)}
              />
            )}
          </div>
        </section>

        <section className="amb-team">
          <p className="ls-eyebrow">Our ambassadors</p>
          <ul>
            {AMBASSADORS.map(a => {
              const c = COUNTRIES.find(x => x.name === a.country);
              return (
                <li key={a.country}>
                  <div>
                    <p className="amb-team-country">
                      <span className="amb-flag" aria-hidden="true">
                        {c ? flag(c.code) : ''}
                      </span>
                      Ambassador · {a.country}
                    </p>
                    <strong>
                      {a.linkedin ? (
                        <a href={a.linkedin} target="_blank" rel="noreferrer">
                          {a.name}
                        </a>
                      ) : (
                        a.name
                      )}
                    </strong>
                    <em>{a.role}</em>
                    <p className="amb-team-bio">{a.bio}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </main>
      <SiteFooter className="landing-footer" />
    </>
  );
};

export default Ambassadors;
