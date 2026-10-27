// Consistent helper colors and concrete objects explain the plan in both views.
const ink = '#12264d',
  alex = '#219eaa',
  sam = '#e68265';
const helper = (x, y, color, skin = '#f3ceab') =>
  `<circle cx="${x}" cy="${y}" r="10" fill="${skin}" stroke="${ink}" stroke-width="2.5"/><path d="M${x - 15} ${y + 35}v-17q15-17 30 0v17z" fill="${color}" stroke="${ink}" stroke-width="2.5"/>`;
const pitcher = (x, y) =>
  `<path d="M${x} ${y}h22l-2 32h-18z" fill="#fff9dc" stroke="${ink}" stroke-width="2.5"/><path d="M${x + 3} ${y + 13}h16l-1 16h-14z" fill="#f4cf59"/><path d="M${x + 22} ${y + 5}h7v15h-8" fill="none" stroke="${ink}" stroke-width="2.5"/>`;
const drink = (x, y) =>
  `<path d="M${x} ${y}h14l-2 22h-10z" fill="#fff" stroke="${ink}" stroke-width="2.5"/><path d="M${x + 3} ${y + 10}h8l-1 9h-6z" fill="#f4cf59"/>`;
const cash = (x, y) =>
  `<rect x="${x}" y="${y}" width="26" height="17" rx="2" fill="#83c69a" stroke="${ink}" stroke-width="2.5"/><circle cx="${x + 13}" cy="${y + 8.5}" r="4" fill="#dff2e4" stroke="${ink}" stroke-width="2"/>`;
const arm = (path) =>
  `<path d="${path}" fill="none" stroke="${ink}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
const counter =
  '<path d="M12 82h146v15H12z" fill="#e4d1b4" stroke="' + ink + '" stroke-width="2.5"/>';
export function lemonadeVisual(kind = 'stand') {
  let artwork;
  if (kind === 'customers')
    artwork =
      '<ellipse cx="85" cy="85" rx="72" ry="10" fill="#e8e4f3"/>' +
      helper(37, 33, '#a78cc6', '#dca875') +
      helper(85, 23, '#e49bc0') +
      helper(133, 33, '#8aa3d0', '#a97452');
  else if (kind === 'payment')
    artwork =
      helper(30, 27, alex) +
      helper(140, 27, '#a78cc6', '#dca875') +
      counter +
      arm('M43 51l24 10 13-3') +
      arm('M127 51l-20 10-16-3') +
      cash(73, 47);
  else if (kind === 'drinks')
    artwork =
      helper(30, 27, sam) +
      helper(140, 27, '#a78cc6', '#dca875') +
      counter +
      arm('M44 51l16 5 8-7') +
      arm('M126 52l-10 13h-11') +
      `<g transform="rotate(-20 80 46)">${pitcher(66, 27)}</g>` +
      drink(101, 59) +
      '<path d="M92 44q10 2 14 15" fill="none" stroke="#d59e23" stroke-width="3" stroke-linecap="round"/>';
  else if (kind === 'supplies')
    artwork =
      helper(35, 27, sam) +
      counter +
      arm('M48 52l17 19h16') +
      pitcher(84, 45) +
      drink(127, 53) +
      drink(123, 45) +
      drink(119, 37) +
      '<path d="M78 80h75" stroke="' +
      ink +
      '" stroke-width="3"/>';
  else if (kind === 'both')
    artwork =
      helper(82, 27, alex) +
      counter +
      arm('M68 51l-14 11-15-5') +
      arm('M96 52l13 9 10-7') +
      cash(18, 47) +
      pitcher(115, 43) +
      drink(148, 60);
  else
    artwork =
      '<path d="M13 76V8h144v68" fill="none" stroke="' +
      ink +
      '" stroke-width="3"/><path d="M13 8h144v12H13z" fill="#f4cf59" stroke="' +
      ink +
      '" stroke-width="2.5"/>' +
      helper(50, 35, alex) +
      helper(119, 35, sam) +
      '<path d="M8 76h154v22H8z" fill="#d9edf7" stroke="' +
      ink +
      '" stroke-width="3"/><path d="M85 76v22M19 98v8m132-8v8" stroke="' +
      ink +
      '" stroke-width="3"/>' +
      cash(24, 78) +
      pitcher(93, 49) +
      drink(131, 57);
  return `<svg class="lemonade-visual" viewBox="0 0 170 110" aria-hidden="true" focusable="false">${artwork}</svg>`;
}

export function planVisuals(board) {
  return board.nodes.map((node, index) =>
    lemonadeVisual(
      index === 0
        ? 'customers'
        : index === 1
          ? board.numbered === false
            ? 'both'
            : 'payment'
          : board.numbered === false
            ? 'supplies'
            : 'drinks',
    ),
  );
}
