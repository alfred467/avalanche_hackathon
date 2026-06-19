let activeTab = 'safe';
let lockedClauseId = null;
let hoveredClauseId = null;

const root = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const settingsToggle = document.getElementById('settings-toggle');
const settingsPanel = document.getElementById('settings-panel');
const tabSafe = document.getElementById('tab-safe');
const tabFounder = document.getElementById('tab-founder');
const contractView = document.getElementById('contract-view');
const docPaperLabel = document.getElementById('doc-paper-label');
const annotationIdle = document.getElementById('annotation-idle');
const annotationActive = document.getElementById('annotation-active');
const annotationTag = document.getElementById('annotation-tag');
const annotationClauseTitle = document.getElementById('annotation-clause-title');
const annotationPlain = document.getElementById('annotation-plain');
const annotationLaw = document.getElementById('annotation-law');
const annotationClose = document.getElementById('annotation-close');
const downloadMdBtn = document.getElementById('download-md-btn');
const printBtn = document.getElementById('print-btn');

const companyNameInput = document.getElementById('company-name');
const regNumberInput = document.getElementById('reg-number');
const founderNamesInput = document.getElementById('founder-names');
const investorNameInput = document.getElementById('investor-name');
const investmentAmountInput = document.getElementById('investment-amount');
const valuationCapInput = document.getElementById('valuation-cap');
const salaryCapInput = document.getElementById('salary-cap');
const sigThresholdInput = document.getElementById('sig-threshold');
const qualifiedRoundInput = document.getElementById('qualified-round');
const weeklyHoursInput = document.getElementById('weekly-hours');
const vestingYearsInput = document.getElementById('vesting-years');
const cliffMonthsInput = document.getElementById('cliff-months');
const noncompeteMonthsInput = document.getElementById('noncompete-months');
const investmentDateInput = document.getElementById('investment-date');

investmentDateInput.value = new Date().toISOString().split('T')[0];

const savedTheme = localStorage.getItem('kelf-theme') || 'light';
root.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('kelf-theme', next);
});

settingsToggle.addEventListener('click', () => {
  settingsPanel.classList.toggle('collapsed');
});

function formatCurrency(val) {
  if (!val) return '0 KES';
  const n = val.toString().replace(/,/g, '');
  if (isNaN(n)) return val + ' KES';
  return Number(n).toLocaleString('en-KE') + ' KES';
}

function formatFounders(str) {
  if (!str) return '[Founders]';
  const names = str.split(',').map(s => s.trim()).filter(Boolean);
  if (!names.length) return '[Founders]';
  if (names.length === 1) return `${names[0]} (ID/Passport No. _______________)`;
  const detailed = names.map(n => `${n} (ID/Passport No. _______________)`);
  const last = detailed.pop();
  return detailed.join(', ') + ' and ' + last;
}

function getVars() {
  return {
    '{{COMPANY_NAME}}':              companyNameInput.value || '[Company Name]',
    '{{REGISTRATION_NUMBER}}':       regNumberInput.value || '[Reg. No.]',
    '{{FOUNDER_NAMES}}':             founderNamesInput.value || '[Founders]',
    '{{FOUNDER_NAMES_WITH_DETAILS}}': formatFounders(founderNamesInput.value),
    '{{INVESTOR_NAME}}':             investorNameInput.value || '[Investor]',
    '{{INVESTMENT_AMOUNT}}':         formatCurrency(investmentAmountInput.value),
    '{{VALUATION_CAP}}':             formatCurrency(valuationCapInput.value),
    '{{FOUNDER_SALARY_CAP}}':        formatCurrency(salaryCapInput.value),
    '{{SIGNATORY_THRESHOLD}}':       formatCurrency(sigThresholdInput.value),
    '{{QUALIFIED_ROUND_AMOUNT}}':    formatCurrency(qualifiedRoundInput.value),
    '{{WEEKLY_HOURS}}':              weeklyHoursInput.value || '45',
    '{{VESTING_YEARS}}':             vestingYearsInput.value || '4',
    '{{CLIFF_MONTHS}}':              cliffMonthsInput.value || '12',
    '{{NONCOMPETE_MONTHS}}':         noncompeteMonthsInput.value || '12',
    '{{INVESTMENT_DATE}}':           investmentDateInput.value
      ? new Date(investmentDateInput.value).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
      : '[Date]',
  };
}

function substitute(text, forHTML) {
  const vars = getVars();
  let out = text;
  for (const [key, value] of Object.entries(vars)) {
    const re = new RegExp(key.replace(/[{}]/g, '\\$&'), 'g');
    out = out.replace(re, forHTML ? `<span class="var-span">${value}</span>` : value);
  }
  return out;
}

function renderContract() {
  const template = activeTab === 'safe' ? safeTemplate : founderTemplate;
  docPaperLabel.textContent = template.title;

  let html = `<p class="contract-intro">${substitute(template.introduction, true)}</p>`;

  template.clauses.forEach(clause => {
    const sel = clause.id === lockedClauseId || clause.id === hoveredClauseId ? 'selected' : '';
    html += `
      <div class="contract-clause ${sel}" data-id="${clause.id}" id="c-${clause.id}">
        <div class="clause-title">${clause.title}</div>
        <div class="clause-body">${substitute(clause.text, true)}</div>
      </div>`;
  });

  contractView.innerHTML = html;
  lucide.createIcons();

  contractView.querySelectorAll('.contract-clause').forEach(el => {
    const id = el.getAttribute('data-id');

    el.addEventListener('mouseenter', () => {
      if (!lockedClauseId) {
        hoveredClauseId = id;
        showAnnotation(id);
        el.classList.add('selected');
      }
    });

    el.addEventListener('mouseleave', () => {
      if (!lockedClauseId) {
        hoveredClauseId = null;
        clearAnnotation();
        el.classList.remove('selected');
      }
    });

    el.addEventListener('click', () => {
      if (lockedClauseId === id) {
        lockedClauseId = null;
        hoveredClauseId = id;
        showAnnotation(id);
      } else {
        lockedClauseId = id;
        hoveredClauseId = null;
        contractView.querySelectorAll('.contract-clause').forEach(x => x.classList.remove('selected'));
        el.classList.add('selected');
        showAnnotation(id);
      }
    });
  });
}

function showAnnotation(id) {
  const template = activeTab === 'safe' ? safeTemplate : founderTemplate;
  const clause = template.clauses.find(c => c.id === id);
  if (!clause) return;

  annotationTag.textContent = clause.title;
  annotationClauseTitle.textContent = clause.title;
  annotationPlain.innerHTML = substitute(clause.translation, true);
  annotationLaw.innerHTML = substitute(clause.kenyanLawNote, true);

  annotationIdle.classList.add('hidden');
  annotationActive.classList.remove('hidden');
}

function clearAnnotation() {
  annotationActive.classList.add('hidden');
  annotationIdle.classList.remove('hidden');
}

annotationClose.addEventListener('click', () => {
  lockedClauseId = null;
  hoveredClauseId = null;
  contractView.querySelectorAll('.contract-clause').forEach(x => x.classList.remove('selected'));
  clearAnnotation();
});

function switchTab(tab) {
  if (activeTab === tab) return;
  activeTab = tab;
  lockedClauseId = null;
  hoveredClauseId = null;
  clearAnnotation();

  tabSafe.classList.toggle('active', tab === 'safe');
  tabFounder.classList.toggle('active', tab === 'founder');

  document.querySelectorAll('.k-safe-fields').forEach(el => el.classList.toggle('hidden', tab !== 'safe'));
  document.querySelectorAll('.k-founder-fields').forEach(el => el.classList.toggle('hidden', tab !== 'founder'));

  renderContract();
}

tabSafe.addEventListener('click', () => switchTab('safe'));
tabFounder.addEventListener('click', () => switchTab('founder'));

document.getElementById('customizer-form').addEventListener('input', () => {
  renderContract();
  const active = lockedClauseId || hoveredClauseId;
  if (active) showAnnotation(active);
});

function stripHtml(h) {
  const d = document.createElement('div');
  d.innerHTML = h;
  return d.textContent || '';
}

downloadMdBtn.addEventListener('click', () => {
  const template = activeTab === 'safe' ? safeTemplate : founderTemplate;
  let md = `# ${template.title}\n\n${stripHtml(substitute(template.introduction, true))}\n\n`;
  template.clauses.forEach(c => {
    md += `## ${c.title}\n${stripHtml(substitute(c.text, true))}\n\n`;
    md += `*Plain English:*\n> ${stripHtml(substitute(c.translation, true))}\n\n`;
    md += `*Kenyan Law Context:*\n> ${stripHtml(substitute(c.kenyanLawNote, true))}\n\n---\n\n`;
  });
  md += `*Generated by K-ELF on ${new Date().toLocaleDateString()}*\n`;

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = activeTab === 'safe' ? 'K_SAFE_Agreement.md' : 'K_FOUNDER_Agreement.md';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

printBtn.addEventListener('click', () => window.print());

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('doc') === 'founder') switchTab('founder');

renderContract();
lucide.createIcons();

// Kenyan Equity Legal Framework - Generator Application Controller
