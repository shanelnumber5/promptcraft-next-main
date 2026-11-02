process.env.PC_BROWSER_FEATURE = 'accessibility';
process.env.PC_CONTRAST_AUDIT = '1';
process.env.PC_CONTRAST_STRICT = '1';
require('./browser-harness.cjs');
