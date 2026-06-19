#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const safeTemplate = require('../templates/safe');
const founderTemplate = require('../templates/founder');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const questions = [
  { key: 'companyName', query: 'Enter Company Name (e.g. Safi Tech Limited): ', default: 'Safi Tech Limited' },
  { key: 'regNumber', query: 'Enter Kenyan Registration Number (e.g. PVT-DLUX89Z): ', default: 'PVT-DLUX89Z' },
  { key: 'founders', query: 'Enter Founder Names (comma-separated): ', default: 'Jane Koech, Peter Omondi' },
  { key: 'investorName', query: 'Enter Investor Name (for Kelper-SAFE): ', default: 'Nairobi Capital Partners' },
  { key: 'investmentAmount', query: 'Enter SAFE Investment Amount (KES): ', default: '5,000,000' },
  { key: 'valuationCap', query: 'Enter Valuation Cap (KES): ', default: '100,000,000' },
  { key: 'salaryCap', query: 'Enter Founder Monthly Salary Cap (KES): ', default: '200,000' },
  { key: 'sigThreshold', query: 'Enter M-Pesa/Bank Signatory Threshold (KES): ', default: '150,000' }
];

const answers = {};

function formatCurrency(val, currency = 'KES') {
  if (!val) return `0 ${currency}`;
  const cleanVal = val.toString().replace(/,/g, '');
  if (isNaN(cleanVal)) return `${val} ${currency}`;
  return `${Number(cleanVal).toLocaleString('en-KE')} ${currency}`;
}

function formatFoundersWithDetails(namesString) {
  if (!namesString) return '[Founders]';
  const names = namesString.split(',').map(n => n.trim()).filter(n => n.length > 0);
  if (names.length === 0) return '[Founders]';
  if (names.length === 1) return `${names[0]} (ID/Passport No. _______________)`;
  
  const formatted = names.map(name => `${name} (ID/Passport No. _______________)`);
  const last = formatted.pop();
  return formatted.join(', ') + ' and ' + last;
}

function askQuestion(index) {
  if (index === questions.length) {
    generateFiles();
    rl.close();
    return;
  }

  const q = questions[index];
  rl.question(`${q.query} [Default: ${q.default}]: `, (answer) => {
    answers[q.key] = answer.trim() || q.default;
    askQuestion(index + 1);
  });
}

function substitute(text) {
  const companyName = answers.companyName;
  const regNumber = answers.regNumber;
  const founderNames = answers.founders;
  const investorName = answers.investorName;
  const investmentAmount = formatCurrency(answers.investmentAmount);
  const valuationCap = formatCurrency(answers.valuationCap);
  const salaryCap = formatCurrency(answers.salaryCap);
  const sigThreshold = formatCurrency(answers.sigThreshold);
  const qualifiedRound = formatCurrency('25,000,000');
  
  const weeklyHours = '45';
  const vestingYears = '4';
  const cliffMonths = '12';
  const noncompeteMonths = '12';
  const formattedDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  const foundersWithDetails = formatFoundersWithDetails(founderNames);

  const replacements = {
    '{{COMPANY_NAME}}': companyName,
    '{{REGISTRATION_NUMBER}}': regNumber,
    '{{FOUNDER_NAMES}}': founderNames,
    '{{INVESTOR_NAME}}': investorName,
    '{{INVESTMENT_AMOUNT}}': investmentAmount,
    '{{VALUATION_CAP}}': valuationCap,
    '{{FOUNDER_SALARY_CAP}}': salaryCap,
    '{{SIGNATORY_THRESHOLD}}': sigThreshold,
    '{{QUALIFIED_ROUND_AMOUNT}}': qualifiedRound,
    '{{WEEKLY_HOURS}}': weeklyHours,
    '{{VESTING_YEARS}}': vestingYears,
    '{{CLIFF_MONTHS}}': cliffMonths,
    '{{NONCOMPETE_MONTHS}}': noncompeteMonths,
    '{{INVESTMENT_DATE}}': formattedDate,
    '{{FOUNDER_NAMES_WITH_DETAILS}}': foundersWithDetails
  };

  let newText = text;
  for (const [key, value] of Object.entries(replacements)) {
    const regex = new RegExp(key, 'g');
    newText = newText.replace(regex, value);
  }
  return newText;
}

function generateFiles() {
  console.log('\n📄 Generating customized legal agreements...');
  
  let safeContent = `# ${safeTemplate.title}\n\n`;
  safeContent += `${substitute(safeTemplate.introduction)}\n\n`;
  
  safeTemplate.clauses.forEach((clause) => {
    safeContent += `## ${clause.title}\n`;
    safeContent += `${substitute(clause.text)}\n\n`;
    safeContent += `*Plain-English Translation:*\n> ${substitute(clause.translation)}\n\n`;
    safeContent += `*Kenyan Legal Context:*\n> ${substitute(clause.kenyanLawNote)}\n\n`;
    safeContent += `---\n\n`;
  });
  
  const safePath = path.join(process.cwd(), 'K_SAFE_Agreement.md');
  fs.writeFileSync(safePath, safeContent, 'utf8');
  console.log(`✅ Created Kelper-SAFE Agreement: ${safePath}`);

  let founderContent = `# ${founderTemplate.title}\n\n`;
  founderContent += `${substitute(founderTemplate.introduction)}\n\n`;
  
  founderTemplate.clauses.forEach((clause) => {
    founderContent += `## ${clause.title}\n`;
    founderContent += `${substitute(clause.text)}\n\n`;
    founderContent += `*Plain-English Translation:*\n> ${substitute(clause.translation)}\n\n`;
    founderContent += `*Kenyan Legal Context:*\n> ${substitute(clause.kenyanLawNote)}\n\n`;
    founderContent += `---\n\n`;
  });
  
  const founderPath = path.join(process.cwd(), 'K_FOUNDER_Agreement.md');
  fs.writeFileSync(founderPath, founderContent, 'utf8');
  console.log(`✅ Created Kelper-FOUNDER Agreement: ${founderPath}`);

  const configPath = path.join(process.cwd(), 'k-legal.json');
  fs.writeFileSync(configPath, JSON.stringify(answers, null, 2), 'utf8');
  console.log(`✅ Saved config file: ${configPath}\n`);
  
  console.log('🎉 Generation complete. Run a web server to open frontend/index.html for the interactive translator.');
}

console.log('=== Kelper: Kenyan Equity Legal Framework CLI ===');
askQuestion(0);


