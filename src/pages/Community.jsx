import { useEffect } from 'react';
import DotMap from '../components/DotMap';
import Members from '../components/Members';
import { Apply, Faq } from '../components/LandingSections';
import { FAQS } from '../components/faqs';
import { InfoCards } from '../components/PageBlocks';
import SiteFooter from '../components/SiteFooter';
import { europe } from '../maps/europe';
import './Community.css';

const CARDS = [
  {
    icon: 'gift',
    title: 'What you get',
    items: [
      ['users', 'Founders your age', 'people you can build with, not just contacts'],
      ['chat', 'Honest feedback', 'bring the question you’re stuck on'],
      ['heart', 'Real friends', 'who share what they’ve learned and get excited when it works'],
      ['ticket', 'Events', 'starting with Project18 Europe Barcelona 2027']
    ]
  },
  {
    icon: 'spark',
    title: 'How it works',
    items: [
      ['shield', 'Application-only', 'every member applies and we read every application by hand'],
      ['globe', 'Online-first', 'wherever you are in Europe'],
      ['pin', 'Local', 'one ambassador per country, so someone near you is part of it']
    ]
  },
  {
    icon: 'shield',
    title: 'Who it’s for',
    items: [
      ['rocket', 'You’re under 18 and already building something real'],
      ['globe', 'You’re based in Europe, or building for it'],
      ['chat', 'You’d rather ask a hard question than pretend you know the answer'],
      ['heart', 'You share what you learn without keeping score']
    ]
  }
];

const COMMUNITY_FAQS = FAQS.filter(([q]) =>
  ['Who can apply?', 'What does it cost?', 'Do I need users or revenue?', 'Where do I have to live?'].includes(q)
);

const Community = ({ onApply }) => {
  useEffect(() => {
    document.title = 'Community | Project18 Europe';
  }, []);

  return (
    <>
      <main className="community">
        <DotMap className="community-map" map={europe} />

        <section className="community-copy">
          <p className="community-eyebrow">A European community</p>
          <h1>
            Founders
            <br />
            across Europe.
          </h1>
          <p className="community-lead">
            An application-only circle of founders under 18 from across Europe. The people you’ll want to build with
            for years.
          </p>
          <p className="community-meta">
            <span>Under 18</span>
            <span aria-hidden="true">·</span>
            <span>Europe</span>
            <span aria-hidden="true">·</span>
            <span>Builders</span>
          </p>
        </section>
      </main>

      <div className="page-sections">
        <section className="ls-section">
          <div className="ls-head">
            <p className="ls-eyebrow">The community</p>
            <h2>
              Your people, <em>finally in one place.</em>
            </h2>
            <p className="ls-lead">
              Bring the question you’re stuck on, share what you’ve learned, and find the people you’ll want to build with
              for years.
            </p>
          </div>
          <InfoCards cards={CARDS} />
          <Apply onApply={onApply} note="Free to apply." />
        </section>

        <Members onApply={onApply} />

        <Faq items={COMMUNITY_FAQS} onApply={onApply} />
      </div>
      <SiteFooter className="landing-footer" />
    </>
  );
};

export default Community;
