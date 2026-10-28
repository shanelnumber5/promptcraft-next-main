const assert = require('node:assert/strict');
(async () => {
  const { babbageCameoFor, renderBabbageCameo, isAbsurdPremise } = await import('../../src/shared/babbage-cameo.js');
  const state = (directions, subject = 'Office management') => ({ teacher: { directions, subject }, babbage: { mode: 'live' } });
  const printer = state('The office printer has applied for a promotion to Assistant Manager of Paper Jams.');
  assert.equal(isAbsurdPremise(printer), true);
  assert.match(babbageCameoFor(printer, 'The promotion committee says the printer has an impressive paper trail! Here is a workable discussion idea.'), /paper trail/i);
  assert.match(renderBabbageCameo(printer, 'The printer has a paper trail!'), /data-babbage-cameo=/);
  assert.equal(babbageCameoFor(printer, ''), null);
  assert.equal(babbageCameoFor({ ...printer, babbage: { mode: 'dev' } }, 'The printer has a paper trail!'), null);
  assert.equal(babbageCameoFor(state('Compare evidence about the role of satire in modern fiction.'), 'Let us compare interpretations.'), null);
  assert.equal(babbageCameoFor(state('Analyze controversial political rhetoric.'), 'Research rhetoric.'), null);
  assert.equal(babbageCameoFor(state('Discuss a serious incident of student harassment.'), 'A joke.'), null);
  assert.equal(babbageCameoFor(state('Create a creative science fiction story about an alien ecosystem.'), 'A joke.'), null);
  assert.equal(isAbsurdPremise(state('A unicorn has become the professor for the semester.')), true);
  assert.equal(isAbsurdPremise(state('The university hired a talking potato to teach calculus.')), true);
  console.log('Babbage visual-novel cameo checks passed');
})().catch(error => { console.error(error); process.exitCode = 1; });
