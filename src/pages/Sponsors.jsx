import { useEffect, useRef, useState } from 'react';
import ApplyForm from '../components/ApplyForm';
import { Facts, InfoCards } from '../components/PageBlocks';
import SiteFooter from '../components/SiteFooter';
import { COUNTRIES } from '../data/countries';
import './Community.css';
import './Ambassadors.css';
import './Sponsors.css';

const CALENDAR_URL = 'https://calendar.app.google/HxAFZcACa5ZDeQwA8';
const CALENDAR_EMBED =
  'https://calendar.google.com/calendar/appointments/schedules/AcZssZ1LtTIfQlXpZpO8h8UvtjA-IY66Oezx41iHMDwW70ox1rX7byxndIKQSPHFxW2gfKPk00dmLdoT?gv=true';

const FACTS = [
  ['users', 'Founders', '40 selected under 18'],
  ['globe', 'Reach', 'Founders from across Europe'],
  ['calendar', 'Event', 'Barcelona · Spring 2027'],
  ['heart', 'Goal', 'Free for every selected founder']
];

const CARDS = [
  {
    icon: 'rocket',
    title: 'What you get',
    items: [
      ['users', 'Early access to talent', 'meet Europe’s best founders under 18 before anyone else'],
      ['mic', 'A seat at the table', 'talks, mentoring and judging at Barcelona 2027'],
      ['megaphone', 'Visibility', 'your brand on our site, event and channels'],
      ['heart', 'Real impact', 'young founders don’t have to depend on their family’s money']
    ]
  },
  {
    icon: 'gift',
    title: 'What it funds',
    items: [
      ['send', 'Travel for selected founders'],
      ['pin', 'Accommodation and meals in Barcelona'],
      ['spark', 'The weekend itself: venue, workshops and talks'],
      ['globe', 'The community and ambassadors across Europe']
    ]
  },
  {
    icon: 'calendar',
    title: 'How it works',
    items: [
      ['chat', 'Tell us about your company', 'it takes two minutes'],
      ['calendar', 'Book a call', 'pick a slot with our team right after'],
      ['shield', 'We shape it together', 'a package that fits your goals and budget']
    ]
  }
];

const FIELDS = [
  { name: 'company', label: 'Company', required: true, autoComplete: 'organization', placeholder: 'Company name' },
  { name: 'website', label: 'Website', placeholder: 'company.com' },
  { name: 'name', label: 'Your name', required: true, autoComplete: 'name', placeholder: 'Full name' },
  { name: 'role', label: 'Role', autoComplete: 'organization-title', placeholder: 'e.g. Head of Marketing' },
  { name: 'email', label: 'Work email', type: 'email', required: true, autoComplete: 'email', placeholder: 'you@company.com' },
  {
    name: 'country',
    label: 'Country',
    type: 'select',
    placeholder: 'Choose a country',
    options: [...COUNTRIES.map(c => c.name), 'Outside Europe']
  },
  {
    name: 'interest',
    label: 'Interested in',
    type: 'select',
    placeholder: 'Choose one',
    options: ['Barcelona 2027', 'The community', 'Both', 'Not sure yet']
  },
  {
    name: 'budget',
    label: 'Budget',
    type: 'select',
    placeholder: 'Choose a range',
    options: ['Under €2,500', '€2,500 – €10,000', '€10,000 – €25,000', '€25,000+', 'In-kind / not sure']
  },
  {
    name: 'message',
    label: 'What would you like to achieve?',
    type: 'textarea',
    wide: true,
    placeholder: 'Hiring, brand, giving back, product feedback…'
  }
];

const Sponsors = () => {
  const [values, setValues] = useState({});
  const [step, setStep] = useState('form');
  const formRef = useRef(null);

  useEffect(() => {
    document.title = 'Sponsors | Project18 Europe';
  }, []);

  const toForm = e => {
    e?.preventDefault();
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <main className="amb">
        <header className="amb-hero">
          <p className="ls-eyebrow">Sponsors</p>
          <h1>
            Back the next generation <em>of European founders.</em>
          </h1>
          <p className="ls-lead">
            Sponsors make Barcelona 2027 possible, so the best founders under 18 can come whatever their background.
          </p>
          <a href="#apply" className="ls-apply amb-hero-cta" onClick={toForm}>
            Become a sponsor
          </a>
        </header>

        <Facts facts={FACTS} />

        <section className="spn-why">
          <div className="ls-head">
            <p className="ls-eyebrow">Why sponsor</p>
            <h2 className="amb-h2">
              Meet the founders <em>before everyone else does.</em>
            </h2>
          </div>
          <InfoCards cards={CARDS} />
        </section>

        <section className="amb-apply" id="apply" ref={formRef}>
          <div className="ls-head">
            <p className="ls-eyebrow">{step === 'form' ? 'Step 1 of 2' : 'Step 2 of 2'}</p>
            <h2 className="amb-h2">
              {step === 'form' ? (
                <>
                  Tell us about <em>your company.</em>
                </>
              ) : (
                <>
                  Now pick a time <em>for a call.</em>
                </>
              )}
            </h2>
            <p className="ls-lead">
              {step === 'form'
                ? 'Two minutes. Then you’ll book a call with our team.'
                : `Thanks${values.name ? `, ${values.name.split(' ')[0]}` : ''}. Choose a slot that works for you and we’ll talk through how ${values.company || 'your company'} can get involved.`}
            </p>
          </div>

          {step === 'form' ? (
            <div className="amb-form">
              <ApplyForm
                type="sponsor"
                fields={FIELDS}
                values={values}
                onChange={setValues}
                submitLabel="Continue to book a call"
                onDone={() => {
                  setStep('book');
                  formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              />
            </div>
          ) : (
            <div className="spn-book">
              <iframe src={CALENDAR_EMBED} title="Book a call with Project18 Europe" loading="lazy" />
              <a className="spn-book-link" href={CALENDAR_URL} target="_blank" rel="noreferrer">
                Open the calendar in a new tab <span aria-hidden="true">→</span>
              </a>
            </div>
          )}
        </section>
      </main>
      <SiteFooter className="landing-footer" />
    </>
  );
};

export default Sponsors;
