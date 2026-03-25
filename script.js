const chips = document.querySelectorAll('.chip');
const cards = document.querySelectorAll('.vuln');
const body = document.body;
const themeToggle = document.getElementById('theme-toggle');

const xpValue = document.getElementById('xp-value');
const levelValue = document.getElementById('level-value');
const progressValue = document.getElementById('progress-value');
const progressBar = document.getElementById('progress-bar');
const resetAllBtn = document.getElementById('reset-all');
const taskChecks = document.querySelectorAll('.task-check');

const flashcards = document.querySelectorAll('.flash');
const vfQuestion = document.getElementById('vf-question');
const vfResult = document.getElementById('vf-result');
const vfTrue = document.getElementById('vf-true');
const vfFalse = document.getElementById('vf-false');
const matchPrompt = document.getElementById('match-prompt');
const matchResult = document.getElementById('match-result');
const matchOptions = document.querySelectorAll('.match-option');

const quizForm = document.getElementById('owasp-quiz');
const quizReset = document.getElementById('quiz-reset');
const quizResult = document.getElementById('quiz-result');
const quizQuestions = document.querySelectorAll('.quiz-q');
const megaStarts = document.querySelectorAll('.mega-start');
const megaForm = document.getElementById('mega-form');
const megaSubmit = document.getElementById('mega-submit');
const megaReset = document.getElementById('mega-reset');
const megaResult = document.getElementById('mega-result');
const megaReview = document.getElementById('mega-review');
const megaMeta = document.getElementById('mega-meta');

const STORAGE_KEY = 'owasp_gameclass_v1';
const THEME_KEY = 'owasp-theme';

const state = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
state.xp = Number(state.xp || 0);
state.tasks = state.tasks || {};
state.flashSeen = state.flashSeen || {};
state.vfDone = !!state.vfDone;
state.matchDone = !!state.matchDone;
state.examBest = Number(state.examBest || 0);
state.megaBest = Number(state.megaBest || 0);

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function addXP(amount) {
  state.xp += amount;
  saveState();
  renderDashboard();
}

function computeLevel(xp) {
  return Math.max(1, Math.floor(xp / 120) + 1);
}

function getProgressPercent() {
  const totalTasks = taskChecks.length;
  const doneTasks = Object.values(state.tasks).filter(Boolean).length;
  const ratio = totalTasks === 0 ? 0 : doneTasks / totalTasks;
  return Math.round(ratio * 100);
}

function renderDashboard() {
  const level = computeLevel(state.xp);
  const progress = getProgressPercent();
  if (xpValue) xpValue.textContent = `${state.xp}`;
  if (levelValue) levelValue.textContent = `${level}`;
  if (progressValue) progressValue.textContent = `${progress}%`;
  if (progressBar) progressBar.style.width = `${progress}%`;
}

function setTheme(theme) {
  body.classList.toggle('dark', theme === 'dark');
  if (themeToggle) {
    themeToggle.textContent = theme === 'dark' ? 'Light' : 'Dark';
  }
  localStorage.setItem(THEME_KEY, theme);
}

setTheme(localStorage.getItem(THEME_KEY) || 'light');

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const next = body.classList.contains('dark') ? 'light' : 'dark';
    setTheme(next);
  });
}

chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    chips.forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    const filter = chip.dataset.filter;
    cards.forEach((card) => {
      card.hidden = filter !== 'all' && card.dataset.group !== filter;
    });
  });
});

taskChecks.forEach((checkbox) => {
  const key = checkbox.dataset.task;
  checkbox.checked = !!state.tasks[key];
  checkbox.addEventListener('change', () => {
    const wasChecked = !!state.tasks[key];
    state.tasks[key] = checkbox.checked;
    if (!wasChecked && checkbox.checked) addXP(20);
    saveState();
    renderDashboard();
  });
});

flashcards.forEach((card, index) => {
  const id = `f${index + 1}`;
  card.textContent = card.dataset.front;
  card.addEventListener('click', () => {
    const flipped = card.classList.toggle('flipped');
    card.textContent = flipped ? card.dataset.back : card.dataset.front;
    if (!state.flashSeen[id]) {
      state.flashSeen[id] = true;
      addXP(10);
    }
  });
});

const vfItem = {
  q: 'Question: HTTPS suffit seul pour securiser toute l application.',
  answer: false,
  explain: 'Faux. HTTPS protege le transport, pas la logique metier, ni SQLi, ni IDOR.'
};
if (vfQuestion) vfQuestion.textContent = vfItem.q;

function handleVF(userAnswer) {
  if (!vfResult) return;
  const ok = userAnswer === vfItem.answer;
  vfResult.textContent = ok ? `Correct. ${vfItem.explain}` : `Pas encore. ${vfItem.explain}`;
  vfResult.style.color = ok ? '#21a06f' : '#d94f5f';
  if (ok && !state.vfDone) {
    state.vfDone = true;
    addXP(25);
  }
  saveState();
}

if (vfTrue) vfTrue.addEventListener('click', () => handleVF(true));
if (vfFalse) vfFalse.addEventListener('click', () => handleVF(false));

if (matchPrompt) {
  matchPrompt.textContent = 'Faille: A03 Injection';
}

matchOptions.forEach((btn) => {
  btn.addEventListener('click', () => {
    const ok = btn.dataset.correct === 'yes';
    if (matchResult) {
      matchResult.textContent = ok
        ? 'Correct. Injection -> requetes preparees + validation + encoding.'
        : 'Incorrect. Cette option ne stoppe pas directement Injection.';
      matchResult.style.color = ok ? '#21a06f' : '#d94f5f';
    }
    if (ok && !state.matchDone) {
      state.matchDone = true;
      addXP(25);
    }
    saveState();
  });
});

if (quizForm) {
  quizForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let score = 0;
    let answered = 0;

    quizQuestions.forEach((question, idx) => {
      const checked = quizForm.querySelector(`input[name="q${idx + 1}"]:checked`);
      const correct = question.dataset.answer;
      question.style.outline = 'none';
      if (checked) answered += 1;
      if (checked && checked.value === correct) {
        score += 1;
        question.style.outline = '2px solid #22c55e';
      } else if (checked) {
        question.style.outline = '2px solid #ef4444';
      }
    });

    const total = quizQuestions.length;
    if (answered < total) {
      quizResult.textContent = `Tu as repondu a ${answered}/${total}. Complete tout d abord.`;
      return;
    }

    const pct = Math.round((score / total) * 100);
    quizResult.textContent = `Score final: ${score}/${total} (${pct}%).`;
    if (pct > state.examBest) {
      state.examBest = pct;
      addXP(40);
    } else {
      addXP(15);
    }
    saveState();
  });
}

if (quizReset) {
  quizReset.addEventListener('click', () => {
    if (quizForm) quizForm.reset();
    quizQuestions.forEach((q) => {
      q.style.outline = 'none';
    });
    if (quizResult) quizResult.textContent = '';
  });
}

if (resetAllBtn) {
  resetAllBtn.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    state.xp = 0;
    state.tasks = {};
    state.flashSeen = {};
    state.vfDone = false;
    state.matchDone = false;
    state.examBest = 0;
    state.megaBest = 0;
    taskChecks.forEach((c) => { c.checked = false; });
    flashcards.forEach((card, index) => {
      card.classList.remove('flipped');
      card.textContent = card.dataset.front || `Card ${index + 1}`;
    });
    if (vfResult) vfResult.textContent = '';
    if (matchResult) matchResult.textContent = '';
    if (quizForm) quizForm.reset();
    if (quizResult) quizResult.textContent = '';
    if (megaForm) megaForm.innerHTML = '';
    if (megaResult) megaResult.textContent = '';
    if (megaReview) megaReview.innerHTML = '';
    if (megaMeta) megaMeta.textContent = 'Choisis un mode pour generer un nouveau set de questions.';
    renderDashboard();
    saveState();
  });
}

const megaBank = [
  { topic: 'chap1', q: 'OWASP est principalement:', a: ['Un framework JS', 'Un referentiel securite app web', 'Un pare-feu'], c: 1, e: 'OWASP est une reference securite app web.' },
  { topic: 'chap1', q: 'SOP compare:', a: ['IP et DNS', 'Cookie et Token', 'Protocole + hote + port'], c: 2, e: 'Same-Origin = protocole + hote + port.' },
  { topic: 'chap1', q: 'Le test black box signifie:', a: ['Acces code source complet', 'Aucune connaissance interne', 'Acces admin donne'], c: 1, e: 'Black box simule un attaquant externe.' },
  { topic: 'chap1', q: 'Header HTTP qui identifie le domaine cible:', a: ['Accept', 'Host', 'Cache-Control'], c: 1, e: 'Host specifie la cible serveur.' },
  { topic: 'chap1', q: 'Google Dorks sert a:', a: ['Compiler du code', 'Chercher infos exposees', 'Hasher passwords'], c: 1, e: 'Dorks = recherche avancee de ressources exposees.' },
  { topic: 'chap1', q: 'White box apporte surtout:', a: ['Realisme externe max', 'Visibilite technique profonde', 'Zero cout'], c: 1, e: 'White box donne une couverture interne forte.' },
  { topic: 'chap1', q: 'Une erreur detaillee en prod:', a: ['Aide attaquant', 'Toujours sans risque', 'Remplace monitoring'], c: 0, e: 'Les traces detaillees exposent des infos techniques.' },
  { topic: 'chap1', q: 'GET est souvent utilise pour:', a: ['Lire une ressource', 'Supprimer base de donnees', 'Signer firmware'], c: 0, e: 'GET est classiquement pour lecture.' },
  { topic: 'chap1', q: 'Grey box signifie:', a: ['Aucune info', 'Info partielle', 'Acces root'], c: 1, e: 'Grey box = connaissance partielle.' },
  { topic: 'chap1', q: 'SOP bloque totalement tout cross-origin:', a: ['Vrai', 'Faux'], c: 1, e: 'Des mecanismes existent (ex CORS controle).' },

  { topic: 'chap2', q: 'A01 traite surtout:', a: ['Cryptographie', 'Controle d acces', 'Monitoring'], c: 1, e: 'A01 = Broken Access Control.' },
  { topic: 'chap2', q: 'A02 concerne:', a: ['Crypto faible', 'Dorking', 'UI design'], c: 0, e: 'A02 = Cryptographic Failures.' },
  { topic: 'chap2', q: 'Payload SQLi classique:', a: ['<img onerror=...>', '\' OR 1=1 --', '169.254.169.254'], c: 1, e: 'Pattern classique tautologique SQLi.' },
  { topic: 'chap2', q: 'Defense prioritaire contre SQLi:', a: ['Prepared statements', 'Bloquer CSS', 'Changer favicon'], c: 0, e: 'Prepared statements + validation.' },
  { topic: 'chap2', q: 'Stored XSS execute le payload:', a: ['Seulement sur serveur', 'Chez chaque visiteur de la page', 'Uniquement en local'], c: 1, e: 'Stored XSS affecte les visiteurs.' },
  { topic: 'chap2', q: 'A04 Insecure Design signifie:', a: ['Bug syntaxe', 'Faiblesse de conception', 'Erreur DNS'], c: 1, e: 'Le probleme vient du design du systeme.' },
  { topic: 'chap2', q: 'A05 examples:', a: ['Defaults, debug, directory listing', 'MFA obligatoire', 'Hash Argon2'], c: 0, e: 'A05 = mauvaise configuration securite.' },
  { topic: 'chap2', q: 'A06 cible:', a: ['Dependances obsoletees', 'Captcha UX', 'Language choice'], c: 0, e: 'A06 = composants vulnerables/outdated.' },
  { topic: 'chap2', q: 'A07 inclut:', a: ['Session fixation', 'Dark mode', 'PDF export'], c: 0, e: 'A07 = auth/session failures.' },
  { topic: 'chap2', q: 'A08 se lie a:', a: ['Integrite logicielle', 'Compression gzip', 'DNS cache'], c: 0, e: 'A08 = software/data integrity failures.' },
  { topic: 'chap2', q: 'A09 impact majeur:', a: ['Detection tardive', 'CPU faster', 'Better UX'], c: 0, e: 'Sans logs, attaques restent invisibles.' },
  { topic: 'chap2', q: 'A10 SSRF permet:', a: ['Server appelle ressources internes', 'Client side popup', 'Hash cracking'], c: 0, e: 'SSRF abuse les requetes serveur.' },
  { topic: 'chap2', q: 'URL metadata cloud typique:', a: ['127.0.0.1:3306', '169.254.169.254', '8.8.8.8'], c: 1, e: 'Metadata endpoint cloud classique.' },
  { topic: 'chap2', q: 'Bonne defense SSRF:', a: ['Allowlist destination', 'Disable HTML', 'Set wallpaper'], c: 0, e: 'Allowlist + network egress control.' },
  { topic: 'chap2', q: 'Ne jamais logger:', a: ['Passwords/tokens', 'Failed login', 'Server start event'], c: 0, e: 'Secrets ne doivent pas etre logges.' },
  { topic: 'chap2', q: 'MFA reduit:', a: ['Credential stuffing', 'SQL syntax errors', 'CORS preflight'], c: 0, e: 'MFA limite takeover avec creds voles.' },
  { topic: 'chap2', q: 'Session secure implique:', a: ['Regeneration ID apres login', 'ID dans URL', 'No timeout'], c: 0, e: 'ID session doit etre regenere et protege.' },
  { topic: 'chap2', q: 'Directory traversal vise:', a: ['Lecture fichiers arbitraires', 'GPU overload', 'JWT refresh'], c: 0, e: 'Traversal accede a des chemins sensibles.' },
  { topic: 'chap2', q: 'CSRF exploite surtout:', a: ['Session authentifiee victime', 'Compiler bug', 'RAM leak hardware'], c: 0, e: 'CSRF abuse la session valide de la victime.' },
  { topic: 'chap2', q: 'CSP aide surtout contre:', a: ['XSS', 'SQLi', 'SSRF'], c: 0, e: 'CSP reduit execution scripts non fiables.' }
];

let currentMegaQuestions = [];

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickMegaQuestions(mode) {
  if (mode === 'chap1') return shuffle(megaBank.filter((q) => q.topic === 'chap1')).slice(0, 10);
  if (mode === 'chap2') return shuffle(megaBank.filter((q) => q.topic === 'chap2')).slice(0, 15);
  return shuffle(megaBank).slice(0, 20);
}

function renderMega(mode) {
  currentMegaQuestions = pickMegaQuestions(mode);
  if (!megaForm) return;
  megaForm.innerHTML = currentMegaQuestions.map((q, idx) => {
    const choices = q.a.map((opt, i) => {
      return `<label><input type="radio" name="mq${idx}" value="${i}"> ${opt}</label>`;
    }).join('');
    return `
      <fieldset class="card mega-q" data-correct="${q.c}">
        <h4>${idx + 1}) ${q.q}</h4>
        ${choices}
      </fieldset>
    `;
  }).join('');
  if (megaMeta) megaMeta.textContent = `Mode ${mode.toUpperCase()} charge avec ${currentMegaQuestions.length} questions.`;
  if (megaResult) megaResult.textContent = '';
  if (megaReview) megaReview.innerHTML = '';
}

megaStarts.forEach((btn) => {
  btn.addEventListener('click', () => {
    renderMega(btn.dataset.mode);
    addXP(10);
  });
});

if (megaSubmit) {
  megaSubmit.addEventListener('click', () => {
    if (!megaForm || currentMegaQuestions.length === 0) {
      if (megaResult) megaResult.textContent = 'Commence d abord un mode Mega QCM.';
      return;
    }
    const blocks = megaForm.querySelectorAll('.mega-q');
    let score = 0;
    let answered = 0;
    const review = [];

    blocks.forEach((block, idx) => {
      const checked = block.querySelector(`input[name="mq${idx}"]:checked`);
      const correct = Number(block.dataset.correct);
      block.style.outline = 'none';
      if (checked) answered += 1;
      const chosen = checked ? Number(checked.value) : -1;
      const ok = chosen === correct;
      if (ok) score += 1;
      if (checked) block.style.outline = ok ? '2px solid #22c55e' : '2px solid #ef4444';
      review.push({ ok, q: currentMegaQuestions[idx].q, exp: currentMegaQuestions[idx].e });
    });

    if (answered < blocks.length) {
      if (megaResult) megaResult.textContent = `Tu as repondu a ${answered}/${blocks.length}. Reponds a tout.`;
      return;
    }

    const pct = Math.round((score / blocks.length) * 100);
    const on20 = ((pct / 100) * 20).toFixed(1);
    if (megaResult) megaResult.textContent = `Mega score: ${score}/${blocks.length} = ${pct}% -> ${on20}/20`;

    if (megaReview) {
      megaReview.innerHTML = review.map((r, i) => {
        return `<div class="review-item ${r.ok ? 'ok' : 'bad'}"><strong>Q${i + 1}:</strong> ${r.ok ? 'Correct' : 'Incorrect'} - ${r.exp}</div>`;
      }).join('');
    }

    if (pct > state.megaBest) {
      state.megaBest = pct;
      addXP(80);
    } else {
      addXP(30);
    }
    saveState();
  });
}

if (megaReset) {
  megaReset.addEventListener('click', () => {
    if (megaForm) megaForm.innerHTML = '';
    currentMegaQuestions = [];
    if (megaResult) megaResult.textContent = '';
    if (megaReview) megaReview.innerHTML = '';
    if (megaMeta) megaMeta.textContent = 'Choisis un mode pour generer un nouveau set de questions.';
  });
}

renderDashboard();
