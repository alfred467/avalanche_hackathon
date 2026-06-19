let activeTab = 'safe';
let lockedClauseId = null;
let hoveredClauseId = null;
let editingLocked = false;
let wizardDocType = 'safe';
let wizardExtractedFields = null;

const undoStack = [];
const redoStack = [];
let suppressSnapshot = false;

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
const downloadDocxBtn = document.getElementById('download-docx-btn');
const emailBtn = document.getElementById('email-btn');
const printBtn = document.getElementById('print-btn');
const copyBtn = document.getElementById('copy-btn');
const resetBtn = document.getElementById('reset-btn');
const undoBtn = document.getElementById('undo-btn');
const redoBtn = document.getElementById('redo-btn');
const fullscreenBtn = document.getElementById('et-fullscreen');
const toast = document.getElementById('toast');
const wordCount = document.getElementById('et-wordcount');
const readingTime = document.getElementById('et-reading-time');
// User Profile dropdown
const userBtn = document.getElementById('user-profile-btn');
const userDropdown = document.getElementById('user-dropdown');
if (userBtn && userDropdown) {
  userBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle('show');
  });
  document.addEventListener('click', () => {
    userDropdown.classList.remove('show');
  });

  async function loadProfile() {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        const nDisp = document.getElementById('user-name-display');
        const dn = document.getElementById('dropdown-name');
        const de = document.getElementById('dropdown-email');
        if (nDisp) nDisp.innerText = data.user.name.split(' ')[0];
        if (dn) dn.innerText = data.user.name;
        if (de) de.innerText = data.user.email;
      }
    } catch(e) {}
  }
  loadProfile();
}
const stampDutyResult = document.getElementById('stamp-duty-result');
const capTableResult = document.getElementById('cap-table-result');

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
const autosaveToggle = document.getElementById('autosave-toggle');
const saveVersionBtn = document.getElementById('save-version-btn');
const loadVersionSelect = document.getElementById('load-version-select');

investmentDateInput.value = new Date().toISOString().split('T')[0];

const savedTheme = localStorage.getItem('kelf-theme') || 'light';
root.setAttribute('data-theme', savedTheme);
themeToggle.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('kelf-theme', next);
});

function showToast(msg, duration = 2500) {
  toast.textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.add('hidden'), duration);
}

function takeSnapshot() {
  if (suppressSnapshot) return;
  const data = {};
  document.querySelectorAll('#customizer-form input').forEach(el => { data[el.id] = el.value; });
  const htmlState = contractView.innerHTML;
  const snap = JSON.stringify({ tab: activeTab, data, html: htmlState });
  if (undoStack[undoStack.length - 1] === snap) return;
  undoStack.push(snap);
  if (undoStack.length > 50) undoStack.shift();
  redoStack.length = 0;
}

function applySnapshot(snap) {
  suppressSnapshot = true;
  const { tab, data, html } = JSON.parse(snap);
  Object.keys(data).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = data[id];
  });
  if (tab !== activeTab) switchTab(tab);
  if (html) {
    contractView.innerHTML = html;
    bindClauseEvents();
  } else {
    renderContract();
  }
  if (autosaveToggle.checked) saveFormData();
  suppressSnapshot = false;
  updateWordCount();
}

if (undoBtn) undoBtn.addEventListener('click', () => {
  if (undoStack.length < 2) { showToast('Nothing to undo'); return; }
  redoStack.push(undoStack.pop());
  applySnapshot(undoStack[undoStack.length - 1]);
  showToast('Undone');
});

if (redoBtn) redoBtn.addEventListener('click', () => {
  if (!redoStack.length) { showToast('Nothing to redo'); return; }
  const snap = redoStack.pop();
  undoStack.push(snap);
  applySnapshot(snap);
  showToast('Redone');
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

function parseCurrency(val) {
  return parseFloat((val || '0').toString().replace(/,/g, '')) || 0;
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

function updateCalculators() {
  const investment = parseCurrency(investmentAmountInput.value);
  const valCap     = parseCurrency(valuationCapInput.value);
  const stampDuty = investment * 0.01;
  if (stampDutyResult) stampDutyResult.textContent = `KES ${stampDuty.toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;
  if (capTableResult) {
    const stake = valCap > 0 ? ((investment / valCap) * 100).toFixed(2) : '—';
    capTableResult.textContent = valCap > 0 ? `${stake}%` : '—%';
  }
}

function updateWordCount() {
  if (!wordCount) return;
  const text = contractView.innerText || '';
  const count = text.trim().split(/\s+/).filter(Boolean).length;
  wordCount.textContent = `${count.toLocaleString()} words`;
  if (readingTime) {
    const mins = Math.max(1, Math.ceil(count / 250));
    readingTime.textContent = `${mins} min read`;
  }
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
  if (!editingLocked) {
    contractView.setAttribute('contenteditable', 'true');
    contractView.setAttribute('spellcheck', 'false');
  } else {
    contractView.removeAttribute('contenteditable');
  }
  lucide.createIcons();
  bindClauseEvents();
  updateWordCount();
  updateCalculators();
}

function bindClauseEvents() {
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
    el.addEventListener('click', (e) => {
      if (e.target.closest('[contenteditable]')) return;
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
    el.addEventListener('input', () => {
      updateWordCount();
      takeSnapshot();
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

document.getElementById('et-bold').addEventListener('click', () => { document.execCommand('bold'); });
document.getElementById('et-italic').addEventListener('click', () => { document.execCommand('italic'); });
document.getElementById('et-underline').addEventListener('click', () => { document.execCommand('underline'); });
document.getElementById('et-align-left').addEventListener('click', () => { document.execCommand('justifyLeft'); });
document.getElementById('et-align-center').addEventListener('click', () => { document.execCommand('justifyCenter'); });
document.getElementById('et-align-right').addEventListener('click', () => { document.execCommand('justifyRight'); });

document.getElementById('et-fontsize').addEventListener('change', (e) => {
  document.execCommand('fontSize', false, '7');
  const sel = window.getSelection();
  if (sel.rangeCount) {
    const range = sel.getRangeAt(0);
    const span = document.createElement('span');
    span.style.fontSize = e.target.value + 'pt';
    range.surroundContents(span);
  }
});

if (fullscreenBtn) {
  fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      fullscreenBtn.innerHTML = '<i data-lucide="minimize"></i>';
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      fullscreenBtn.innerHTML = '<i data-lucide="maximize"></i>';
    }
    lucide.createIcons();
  });
}

if (etLockToggle) {
  etLockToggle.addEventListener('click', () => {
    editingLocked = !editingLocked;
    etModeLbl.textContent = editingLocked ? 'Locked' : 'Live';
    etLockToggle.querySelector('i').setAttribute('data-lucide', editingLocked ? 'lock' : 'lock-open');
    lucide.createIcons();
    if (docStatusBadge) {
      docStatusBadge.textContent = editingLocked ? 'FINALISED' : 'DRAFT';
      docStatusBadge.className = `doc-status-badge ${editingLocked ? 'ready' : 'draft'}`;
    }
    if (!editingLocked) {
      contractView.setAttribute('contenteditable', 'true');
    } else {
      contractView.removeAttribute('contenteditable');
    }
    showToast(editingLocked ? '🔒 Document locked' : '✏️ Document unlocked');
  });
}

document.getElementById('ca-move-up')?.addEventListener('click', () => {
  const id = lockedClauseId || hoveredClauseId;
  const el = document.getElementById(`c-${id}`);
  if (el && el.previousElementSibling) {
    el.parentNode.insertBefore(el, el.previousElementSibling);
    takeSnapshot();
  }
});

document.getElementById('ca-move-down')?.addEventListener('click', () => {
  const id = lockedClauseId || hoveredClauseId;
  const el = document.getElementById(`c-${id}`);
  if (el && el.nextElementSibling) {
    el.parentNode.insertBefore(el.nextElementSibling, el);
    takeSnapshot();
  }
});

document.getElementById('ca-add-custom')?.addEventListener('click', () => {
  const id = lockedClauseId || hoveredClauseId;
  const el = document.getElementById(`c-${id}`);
  const newId = 'custom-' + Date.now();
  const html = `<div class="contract-clause" data-id="${newId}" id="c-${newId}">
    <div class="clause-title" contenteditable="true">Custom Clause</div>
    <div class="clause-body" contenteditable="true">Enter clause text here...</div>
  </div>`;
  if (el) el.insertAdjacentHTML('afterend', html);
  else contractView.insertAdjacentHTML('beforeend', html);
  bindClauseEvents();
  takeSnapshot();
  showToast('Custom clause added');
});

document.getElementById('ca-delete')?.addEventListener('click', () => {
  const id = lockedClauseId || hoveredClauseId;
  const el = document.getElementById(`c-${id}`);
  if (el) {
    el.remove();
    clearAnnotation();
    takeSnapshot();
    showToast('Clause deleted');
  }
});

async function clauseAIAction(instruction) {
  const id = lockedClauseId || hoveredClauseId;
  if (!id) { showToast('Select a clause first'); return; }
  const el = document.getElementById(`c-${id}`);
  const title = el.querySelector('.clause-title').innerText;
  const text = el.querySelector('.clause-body').innerText;
  showToast('⏳ AI is working...');
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: `${instruction}\n\nClause title: ${title}\nClause text: ${text}` })
    });
    const data = await res.json();
    if (data.reply) {
      const aiResp = document.getElementById('ai-response');
      aiResp.classList.remove('hidden');
      aiResp.innerHTML = `<strong>${instruction}</strong><br><br>${data.reply.replace(/\n/g, '<br>')}`;
      showToast('✅ AI response ready');
    }
  } catch { showToast('❌ AI connection error'); }
}

document.getElementById('ca-simplify')?.addEventListener('click', () => clauseAIAction('Simplify this clause into plain English for a non-lawyer Kenyan founder:'));
document.getElementById('ca-strengthen')?.addEventListener('click', () => clauseAIAction('Make this clause stronger and more protective under Kenyan law:'));
document.getElementById('ca-translate-sw')?.addEventListener('click', () => clauseAIAction('Translate this legal clause into Swahili:'));
document.getElementById('ca-risk')?.addEventListener('click', () => clauseAIAction('Provide a risk assessment for this clause from the perspective of both the company and the investor under Kenyan law:'));

const aiInput = document.getElementById('ai-input');
const aiSubmitBtn = document.getElementById('ai-submit-btn');
const aiResponse = document.getElementById('ai-response');

if (aiSubmitBtn) {
  aiSubmitBtn.addEventListener('click', async () => {
    const prompt = aiInput.value.trim();
    if (!prompt) return;
    aiSubmitBtn.disabled = true;
    aiSubmitBtn.innerHTML = '<i data-lucide="loader"></i> Asking...';
    lucide.createIcons();
    aiResponse.classList.remove('hidden');
    aiResponse.innerHTML = '<em>Consulting Kenyan AI Legal Assistant...</em>';

    const id = lockedClauseId || hoveredClauseId;
    let fullPrompt = prompt;
    if (id) {
      const el = document.getElementById(`c-${id}`);
      if (el) fullPrompt = `Context Clause: ${el.querySelector('.clause-title').innerText}\n${el.querySelector('.clause-body').innerText}\n\nUser Question: ${prompt}`;
    }

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt })
      });
      const data = await res.json();
      if (data.error) {
        aiResponse.innerHTML = `<span style="color:red">Error: ${data.error}</span>`;
      } else {
        aiResponse.innerHTML = stripHtml(data.reply).replace(/\n/g, '<br>');
      }
    } catch { aiResponse.innerHTML = `<span style="color:red">Error connecting to AI.</span>`; }

    aiSubmitBtn.disabled = false;
    aiSubmitBtn.innerHTML = 'Ask AI';
    aiInput.value = '';
  });
}

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
  // Update document text without full re-render
  // Re-rendering wipes manual edits, so we only update variables via form if needed.
  // We'll leave it up to the user to either generate with AI, use the form initially, or edit manually.
  if (autosaveToggle.checked) {
    saveFormData();
    takeSnapshot();
  }
  updateCalculators();
});

function saveFormData() {
  const data = {};
  document.querySelectorAll('#customizer-form input').forEach(el => { data[el.id] = el.value; });
  localStorage.setItem('kelf-form-data', JSON.stringify(data));
}

function loadFormData() {
  const saved = localStorage.getItem('kelf-form-data');
  if (!saved) return;
  try {
    const data = JSON.parse(saved);
    Object.keys(data).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = data[id];
    });
  } catch {}
}

function populateVersions() {
  const keys = Object.keys(localStorage).filter(k => k.startsWith('kelf-version-'));
  loadVersionSelect.innerHTML = '<option value="">Load Version...</option>';
  keys.forEach(k => {
    const opt = document.createElement('option');
    opt.value = k;
    opt.textContent = k.replace('kelf-version-', '');
    loadVersionSelect.appendChild(opt);
  });
}

saveVersionBtn.addEventListener('click', () => {
  const name = prompt('Enter version name:', `v${Object.keys(localStorage).filter(k => k.startsWith('kelf-version-')).length + 1}`);
  if (!name) return;
  const data = {};
  document.querySelectorAll('#customizer-form input').forEach(el => { data[el.id] = el.value; });
  localStorage.setItem(`kelf-version-${name}`, JSON.stringify({ tab: activeTab, data, html: contractView.innerHTML }));
  populateVersions();
  showToast('Version saved');
});

loadVersionSelect.addEventListener('change', (e) => {
  if (!e.target.value) return;
  const saved = localStorage.getItem(e.target.value);
  if (saved) {
    applySnapshot(saved);
    showToast('Version loaded');
  }
  e.target.value = '';
});

if (copyBtn) {
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(document.getElementById('doc-paper').innerText).then(() => {
      showToast('✅ Document copied to clipboard');
    });
  });
}

if (emailBtn) {
  emailBtn.addEventListener('click', () => {
    const text = encodeURIComponent(document.getElementById('doc-paper').innerText.substring(0, 2000));
    window.location.href = `mailto:?subject=K-ELF Document&body=${text}`;
    showToast('Opening email client');
  });
}

if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    if (!confirm('Reset all form data?')) return;
    document.getElementById('customizer-form').reset();
    investmentDateInput.value = new Date().toISOString().split('T')[0];
    saveFormData();
    renderContract();
    showToast('Form reset');
  });
}

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
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
  showToast('📄 Markdown exported');
});

if (downloadDocxBtn) {
  downloadDocxBtn.addEventListener('click', () => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + document.getElementById('contract-view').innerHTML + footer;
    const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeTab === 'safe' ? 'K_SAFE.docx' : 'K_FOUNDER.docx';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
    showToast('📄 Docx exported');
  });
}

const saveDashboardBtn = document.getElementById('save-dashboard-btn');
if (saveDashboardBtn) {
  saveDashboardBtn.addEventListener('click', async () => {
    const secondPartyEmail = prompt('Enter the email of the second party (REQUIRED):');
    if (!secondPartyEmail) {
      showToast('❌ Second party email is required to create a document');
      return;
    }
    
    const title = prompt('Enter a title for this document:', `${companyNameInput.value || 'Untitled'} - ${activeTab.toUpperCase()}`);
    if (!title) return;
    
    saveDashboardBtn.disabled = true;
    saveDashboardBtn.innerHTML = '<i data-lucide="loader"></i> Saving...';
    lucide.createIcons();
    
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          doc_type: activeTab,
          content: document.getElementById('contract-view').innerHTML,
          second_party_email: secondPartyEmail
        })
      });
      if (res.ok) {
        showToast('✅ Saved to Dashboard successfully');
      } else {
        showToast('❌ Failed to save document');
      }
    } catch (err) {
      showToast('❌ Connection error');
    }
    
    saveDashboardBtn.disabled = false;
    saveDashboardBtn.innerHTML = '<i data-lucide="upload-cloud"></i> Save to Dashboard';
    lucide.createIcons();
  });
}

printBtn.addEventListener('click', () => window.print());

const wizardOverlay = document.getElementById('wizard-overlay');
const wizardOpenBtn = document.getElementById('wizard-open-btn');
const wizardCloseBtn = document.getElementById('wizard-close-btn');
const wizardInput = document.getElementById('wizard-input');
const wizardGenerateBtn = document.getElementById('wizard-generate-btn');
const wizardApplyBtn = document.getElementById('wizard-apply-btn');
const wizardRetryBtn = document.getElementById('wizard-retry-btn');
const wizardErrRetryBtn = document.getElementById('wizard-err-retry-btn');
const wdocSafe = document.getElementById('wdoc-safe');
const wdocFounder = document.getElementById('wdoc-founder');
const aiprefillBtn = document.getElementById('ai-prefill-btn');

function showWizardStep(stepId) {
  document.querySelectorAll('.wizard-step').forEach(s => {
    s.classList.remove('active');
    s.classList.add('hidden');
  });
  const el = document.getElementById(stepId);
  if (el) { el.classList.remove('hidden'); el.classList.add('active'); }
}

function openWizard() {
  wizardOverlay.classList.remove('hidden');
  showWizardStep('wizard-step-intro');
}

function closeWizard() {
  wizardOverlay.classList.add('hidden');
}

wizardOpenBtn?.addEventListener('click', openWizard);
aiprefillBtn?.addEventListener('click', openWizard);
wizardCloseBtn?.addEventListener('click', closeWizard);
wizardOverlay?.addEventListener('click', (e) => { if (e.target === wizardOverlay) closeWizard(); });

[wdocSafe, wdocFounder].forEach(btn => {
  btn?.addEventListener('click', () => {
    wizardDocType = btn.dataset.wdoc;
    wdocSafe.classList.toggle('active', wizardDocType === 'safe');
    wdocFounder.classList.toggle('active', wizardDocType === 'founder');
  });
});

document.querySelectorAll('.wizard-example-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    if (wizardInput) wizardInput.value = chip.dataset.example;
    wizardInput?.focus();
  });
});

wizardGenerateBtn?.addEventListener('click', async () => {
  const desc = wizardInput.value.trim();
  if (!desc || desc.length < 20) {
    showToast('Please describe your deal in more detail');
    return;
  }
  showWizardStep('wizard-step-loading');
  const wls = ['wls-1','wls-2','wls-3'];
  wls.forEach((id, i) => {
    setTimeout(() => { document.getElementById(id)?.classList.add('done'); }, i * 1000);
  });
  try {
    const res = await fetch('/api/ai-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userDescription: desc, docType: wizardDocType })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    wizardExtractedFields = data.fields;
    const preview = document.getElementById('wizard-extracted-fields');
    if (preview) {
      preview.innerHTML = Object.entries(data.fields)
        .filter(([, v]) => v)
        .map(([k, v]) => `<div class="wfp-row">
          <span class="wfp-label">${k.replace(/([A-Z])/g, ' $1').trim()}</span>
          <span class="wfp-val">${v}</span>
        </div>`).join('');
    }
    showWizardStep('wizard-step-result');
  } catch (err) {
    document.getElementById('wizard-error-msg').textContent = err.message || 'AI generation failed. Check your GROQ_API_KEY.';
    showWizardStep('wizard-step-error');
  }
});

wizardApplyBtn?.addEventListener('click', () => {
  const f = wizardExtractedFields;
  if (!f) return;
  const map = {
    companyName:          'company-name',
    registrationNumber:   'reg-number',
    founderNames:         'founder-names',
    investorName:         'investor-name',
    investmentAmount:     'investment-amount',
    valuationCap:         'valuation-cap',
    qualifiedRound:       'qualified-round',
    salaryCap:            'salary-cap',
    signatoryThreshold:   'sig-threshold',
    weeklyHours:          'weekly-hours',
    vestingYears:         'vesting-years',
    cliffMonths:          'cliff-months',
    noncompeteMonths:     'noncompete-months',
    investmentDate:       'investment-date'
  };
  Object.entries(map).forEach(([field, inputId]) => {
    if (f[field]) {
      const el = document.getElementById(inputId);
      if (el) el.value = f[field];
    }
  });
  switchTab(wizardDocType);
  saveFormData();
  takeSnapshot();
  renderContract();
  closeWizard();
  showToast('✅ Document generated from your description!');
});

wizardRetryBtn?.addEventListener('click', () => showWizardStep('wizard-step-intro'));
wizardErrRetryBtn?.addEventListener('click', () => showWizardStep('wizard-step-intro'));

loadFormData();
takeSnapshot();
populateVersions();

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('doc') === 'founder') switchTab('founder');

if (!localStorage.getItem('kelf-wizard-seen')) {
  openWizard();
  localStorage.setItem('kelf-wizard-seen', '1');
}

renderContract();
lucide.createIcons();
