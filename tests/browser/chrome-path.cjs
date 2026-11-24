const fs = require('node:fs');
const path = require('node:path');
// PC_CHROME_EXECUTABLE remains the explicit override for custom installations.
module.exports = function chromePath() {
  if (process.env.PC_CHROME_EXECUTABLE) return process.env.PC_CHROME_EXECUTABLE;
  const candidates = [
    ...['PROGRAMFILES', 'PROGRAMFILES(X86)', 'LOCALAPPDATA'].filter(key=>process.env[key])
      .map(key=>path.join(process.env[key],'Google','Chrome','Application','chrome.exe')),
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome',
    '/opt/google/chrome/chrome',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ];
  const found = candidates.find(candidate=>fs.existsSync(candidate));
  if (found) return found;
  throw Error('Chrome or Chromium was not found. Set PC_CHROME_EXECUTABLE to its full executable path.');
};
