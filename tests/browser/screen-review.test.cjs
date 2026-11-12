process.env.PC_BROWSER_FEATURE = 'screens';
process.env.PC_CONTRAST_AUDIT = '1';
process.env.PC_CONTRAST_STRICT = '1';
process.env.PC_BROWSER_COLLECT_ISSUES = '1';
require('./browser-harness.cjs');
