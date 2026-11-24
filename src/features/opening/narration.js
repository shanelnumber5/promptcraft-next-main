// Keep speech tied to the same authored content as the visible story and guide.
export function storyNarration(scenario, scene, state) {
  if (state.storyStage?.startsWith('response-')) {
    const speaker = state.storyStage.slice('response-'.length);
    const answer = scene.choice?.options.find((option) => option.id === state.answers[scene.id]);
    if (answer) return [{ speaker, text: `${scenario.characters[speaker].name}. ${answer.narrative?.[speaker] || answer.feedback}${speaker === 'pixel' ? ' ' + scene.choice.checkIn : ''}` }];
  }
  if (state.storyStage === 'dialogue')
    return [
      {
        speaker: scene.speaker,
        text: `${scenario.characters[scene.speaker].name}. ${[scene.dialogue].flat().join(' ')}`,
      },
    ];
  const board = scene.board;
  if (state.storyStage === 'question' && scene.choice) {
    const choice = scene.choice;
    const answer = choice.options.find((option) => option.id === state.answers[scene.id]);
    return [
      {
        text: [board.title, choice.question, ...choice.options.map((option) => option.label)].join(
          '. ',
        ),
      },
      ...(answer?.narrative
        ? [
            { speaker: 'maya', text: `Maya. ${answer.narrative.maya}` },
            { speaker: 'pixel', text: `Pixel. ${answer.narrative.pixel}` },
          ]
        : answer
          ? [{ speaker: 'pixel', text: `Pixel. ${answer.feedback}` }]
          : []),
    ];
  }
  return [
    {
      text: [
        board.title,
        board.quote,
        board.text,
        ...(board.facts || []),
        ...(board.nodes || []).map((node) => `${node.title}. ${node.detail}`),
        board.note,
        ...(scene === scenario.scenes.at(-1) ? [scenario.endNote] : []),
      ]
        .filter(Boolean)
        .join('. '),
    },
  ];
}
