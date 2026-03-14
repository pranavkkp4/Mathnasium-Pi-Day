import React from 'react';

const timeline = [
  {
    year: 'Ancient world',
    title: 'Early approximations',
    body: 'Ancient Babylonian and Egyptian mathematicians used approximations for the circle constant long before π had its modern symbol.'
  },
  {
    year: '250 BCE',
    title: 'Archimedes changes the game',
    body: 'Archimedes used polygons to trap π between upper and lower bounds, creating one of the most famous early methods in mathematics.'
  },
  {
    year: '1706',
    title: 'The symbol π appears',
    body: 'William Jones introduced the symbol π, and Leonhard Euler later helped make it standard across mathematics.'
  },
  {
    year: 'Modern era',
    title: 'From theory to technology',
    body: 'π appears in geometry, calculus, trigonometry, probability, physics, engineering, signal processing, and computer graphics.'
  },
  {
    year: 'Pi Day',
    title: 'A celebration of math',
    body: 'March 14 is celebrated because 3/14 matches the first three digits of π. It is the perfect day to make circles, eat pie, and play number games.'
  }
];

export default function HistoryPage() {
  return (
    <section className="stack-lg">
      <div className="glass page-hero">
        <p className="eyebrow">History of π</p>
        <h1>The number that never ends.</h1>
        <p className="lead">
          π is the ratio of a circle’s circumference to its diameter. It is irrational,
          never-ending, and shows up everywhere from classroom geometry to advanced
          engineering and physics.
        </p>
      </div>

      <div className="timeline">
        {timeline.map((entry) => (
          <article className="glass timeline-item" key={entry.year + entry.title}>
            <div className="timeline-year">{entry.year}</div>
            <div>
              <h3>{entry.title}</h3>
              <p>{entry.body}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="glass info-band">
        <div>
          <p className="eyebrow">Why students love π</p>
          <h3>It connects patterns, memory, and creativity.</h3>
        </div>
        <p>
          Pi Day is fun because it turns a deep mathematical idea into something students
          can experience directly through circles, recitation, puzzles, and competition.
        </p>
      </div>
    </section>
  );
}
