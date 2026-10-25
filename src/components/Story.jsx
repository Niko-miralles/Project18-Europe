const PARAGRAPHS = [
  'You’re building something before most people expect you to. You’re figuring out your product, finding customers and making decisions you haven’t made before.',
  'But finding someone your age to talk it through with can be harder than the work itself.',
  'Your friends might support you without sharing your interests. Your family might believe in you without knowing how to help. You can be surrounded by people and still miss having someone who understands this part of your life.',
  'You want conversations that go beyond “how’s your project going?” People you can ask for honest feedback. Friends who share what they’ve learned, challenge your ideas and get excited when something finally works.',
  'That’s why we’re building Project18 Europe. To bring together the best founders under 18 across Europe and connect them with the people and opportunities that help them grow.',
  'People to build with. People to learn from. People you want to spend time with even when you’re not talking about work.'
];

const Story = () => (
  <section className="story">
    <h2>
      Building a company is hard. <em>Finding your people</em> shouldn’t be.
    </h2>
    {PARAGRAPHS.map(text => (
      <p key={text}>{text}</p>
    ))}
  </section>
);

export default Story;
