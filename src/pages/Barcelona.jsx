import { useEffect } from 'react';
import DotMap from '../components/DotMap';
import { Apply, Faq } from '../components/LandingSections';
import { FAQS } from '../components/faqs';
import { Facts, InfoCards, Steps } from '../components/PageBlocks';
import SiteFooter from '../components/SiteFooter';
import { skyline } from '../maps/skyline';
import './Community.css';
import './Barcelona.css';

const FACTS = [
  ['calendar', 'When', 'Spring 2027 · one weekend'],
  ['pin', 'Where', 'Barcelona, Spain'],
  ['users', 'Who', '40 founders under 18'],
  ['ticket', 'Cost', 'Goal: free for selected founders']
];

const CARDS = [
  {
    icon: 'code',
    title: 'What happens',
    items: [
      ['rocket', 'Build together', 'one weekend side by side with founders your age'],
      ['mic', 'Talks', 'from experienced founders and investors'],
      ['pin', 'The city', 'Barcelona, between sessions']
    ]
  },
  {
    icon: 'users',
    title: 'Who’s there',
    items: [
      ['spark', '40 selected founders under 18 from across Europe'],
      ['mic', 'Experienced founders and investors'],
      ['globe', 'The Project18 Europe team and our country ambassadors']
    ]
  },
  {
    icon: 'ticket',
    title: 'Cost',
    items: [
      ['gift', 'Applying is free'],
      ['heart', 'Our goal is for sponsors to cover it, so selected founders pay nothing'],
      ['shield', 'It goes ahead once enough sponsors confirm']
    ]
  }
];

const STEPS = [
  ['Application', 'Tell us what you’re building, where you are and what you’re looking for.'],
  [
    'Review',
    'We read every application ourselves. We look for people who are really building, whatever the stage, and who would give as much as they take.'
  ],
  ['Selection', 'For Barcelona 2027, we’ll select 40 founders from the list.']
];

const EVENT_FAQS = FAQS.filter(([q]) =>
  ['What is Barcelona 2027?', 'What does it cost?', 'Who can apply?', 'What happens after I apply?'].includes(q)
);

const Barcelona = ({ onApply }) => {
  useEffect(() => {
    document.title = 'Barcelona 2027 | Project18 Europe';
  }, []);

  return (
    <>
      <main className="community">
        <DotMap className="community-map" map={skyline} enter="fade" />

        <section className="community-copy">
          <p className="community-eyebrow">Our founding event</p>
          <h1>
            Barcelona
            <br />
            2027.
          </h1>
          <p className="community-lead">
            40 founders under 18 from across Europe.
            <br />
            One weekend to meet, build and start something.
          </p>
          <p className="community-meta">
            <span>Spring 2027</span>
            <span aria-hidden="true">·</span>
            <span>40 founders</span>
            <span aria-hidden="true">·</span>
            <span>Applications open</span>
          </p>
          <button type="button" className="bcn-cta" onClick={onApply}>
            Apply <span aria-hidden="true">→</span>
          </button>
        </section>
      </main>

      <div className="page-sections">
        <section className="ls-section">
          <div className="ls-head">
            <p className="ls-eyebrow">The weekend</p>
            <h2>
              Meet the people <em>behind the projects.</em>
            </h2>
            <p className="ls-lead">
              Our founding event. Building together, talks from experienced founders and investors, and the city.
            </p>
          </div>
          <Facts facts={FACTS} />
          <InfoCards cards={CARDS} />
        </section>

        <section className="ls-section">
          <div className="ls-head">
            <p className="ls-eyebrow">[ How we select ]</p>
            <h2>
              40 seats. <em>Every application read by hand.</em>
            </h2>
          </div>
          <Steps steps={STEPS} />
          <Apply onApply={onApply} note="Free to apply." />
        </section>

        <Faq items={EVENT_FAQS} onApply={onApply} />
      </div>
      <SiteFooter className="landing-footer" />
    </>
  );
};

export default Barcelona;
