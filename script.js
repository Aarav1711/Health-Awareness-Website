/* ─────────────────────────────────────────
   MindEase — script.js
   All interactive features
───────────────────────────────────────── */

/* ═══════════════ THEME TOGGLE ═══════════════ */
const themeToggle = document.getElementById('themeToggle');
let dark = true;
themeToggle.addEventListener('click', () => {
  dark = !dark;
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  themeToggle.textContent = dark ? '🌙' : '☀️';
  initCanvas(); // re-draw canvas with new colors
});

/* ═══════════════ HAMBURGER ═══════════════ */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

/* ═══════════════ CANVAS BACKGROUND ═══════════════ */
const canvas = document.getElementById('bgCanvas');
const ctx    = canvas.getContext('2d');
let particles = [];
let animFrame;

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

function randBetween(a, b) { return a + Math.random() * (b - a); }

function initCanvas() {
  cancelAnimationFrame(animFrame);
  resizeCanvas();
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  const colors = isDark
    ? ['rgba(124,109,250,', 'rgba(94,232,197,', 'rgba(255,126,179,']
    : ['rgba(91,76,245,',   'rgba(15,188,142,', 'rgba(232,71,138,'];

  const N = Math.min(Math.floor(window.innerWidth / 18), 60);
  particles = Array.from({ length: N }, () => ({
    x:   Math.random() * canvas.width,
    y:   Math.random() * canvas.height,
    r:   randBetween(1.5, 4),
    vx:  randBetween(-0.3, 0.3),
    vy:  randBetween(-0.3, 0.3),
    col: colors[Math.floor(Math.random() * colors.length)],
    a:   randBetween(0.4, 0.9),
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          const alpha = (1 - dist / 130) * 0.18;
          ctx.strokeStyle = particles[i].col + alpha + ')';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // dots
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.col + p.a + ')';
      ctx.fill();

      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    });

    animFrame = requestAnimationFrame(draw);
  }

  draw();
}

window.addEventListener('resize', () => { resizeCanvas(); });
initCanvas();

/* ═══════════════ NAVBAR SCROLL SHRINK ═══════════════ */
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.style.padding = window.scrollY > 40 ? '0.6rem 5%' : '1rem 5%';
});

/* ═══════════════ BREATHING EXERCISE ═══════════════ */
const breathCircle = document.getElementById('breathCircle');
const breathPhase  = document.getElementById('breathPhase');
const breathCount  = document.getElementById('breathCount');
const breathStart  = document.getElementById('breathStart');
const breathStop   = document.getElementById('breathStop');
const breathTech   = document.getElementById('breathTechnique');

let breathInterval = null;
let breathTimeout  = null;

const techniques = {
  '478': { inhale: 4, hold: 7, exhale: 8, label: '4-7-8' },
  'box': { inhale: 4, hold: 4, exhale: 4, label: 'Box' },
  '24':  { inhale: 2, hold: 0, exhale: 4, label: '2-4' },
};

function clearBreath() {
  clearInterval(breathInterval);
  clearTimeout(breathTimeout);
  breathInterval = null;
  breathTimeout  = null;
}

function countdown(from, cb) {
  let n = from;
  breathCount.textContent = n;
  breathInterval = setInterval(() => {
    n--;
    breathCount.textContent = n;
    if (n <= 0) {
      clearInterval(breathInterval);
      cb();
    }
  }, 1000);
}

function runBreath() {
  const t = techniques[breathTech.value];
  if (!t) return;

  function cycle() {
    // Inhale
    breathCircle.className = 'breath-visual inhaling';
    breathPhase.textContent = 'Inhale 🌬️';
    breathCircle.style.animationDuration = t.inhale + 's';
    countdown(t.inhale, () => {

      // Hold (if any)
      if (t.hold > 0) {
        breathCircle.className = 'breath-visual holding';
        breathPhase.textContent = 'Hold 🫁';
        countdown(t.hold, exhalePhase);
      } else {
        exhalePhase();
      }
    });
  }

  function exhalePhase() {
    breathCircle.className = 'breath-visual exhaling';
    breathPhase.textContent = 'Exhale 😮‍💨';
    breathCircle.style.animationDuration = t.exhale + 's';
    countdown(t.exhale, cycle);
  }

  cycle();
}

breathStart.addEventListener('click', () => {
  breathStart.disabled = true;
  breathStop.disabled  = false;
  runBreath();
});

breathStop.addEventListener('click', () => {
  clearBreath();
  breathStart.disabled = false;
  breathStop.disabled  = true;
  breathCircle.className = 'breath-visual';
  breathPhase.textContent = 'Press Start';
  breathCount.textContent = '';
});

/* ═══════════════ STRESS QUIZ ═══════════════ */
const questions = [
  { q: "How often do you feel overwhelmed by your workload?",            opts: ["Rarely", "Sometimes", "Often", "Almost always"] },
  { q: "How well do you sleep most nights?",                             opts: ["Very well", "Okay", "Poorly", "I barely sleep"] },
  { q: "How often do you feel anxious about upcoming exams or results?", opts: ["Never", "Occasionally", "Frequently", "Constantly"] },
  { q: "Do you find it difficult to focus or concentrate on studies?",   opts: ["No", "Slightly", "Moderately", "Yes, very much"] },
  { q: "How often do you feel physically tired or drained?",             opts: ["Rarely", "Once a week", "Several times", "Daily"] },
  { q: "Do you feel like you're falling behind compared to your peers?", opts: ["Not at all", "A little", "Often", "Always"] },
  { q: "How often do you feel irritable, sad, or low without reason?",   opts: ["Never", "Rarely", "Sometimes", "Most of the time"] },
  { q: "Do you have time for activities or hobbies you enjoy?",          opts: ["Yes, often", "Sometimes", "Rarely", "Never"] },
];

const quizQ   = document.getElementById('quizQ');
const quizOpts= document.getElementById('quizOpts');
const quizBar = document.getElementById('quizBar');
const quizCounter = document.getElementById('quizCounter');
const quizPrev = document.getElementById('quizPrev');
const quizNext = document.getElementById('quizNext');
const quizResult = document.getElementById('quizResult');
const quizContent = document.getElementById('quizContent');

let currentQ = 0;
let answers  = Array(questions.length).fill(null);

function renderQuiz() {
  const q = questions[currentQ];
  quizQ.textContent = q.q;
  quizOpts.innerHTML = '';
  q.opts.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-opt' + (answers[currentQ] === i ? ' selected' : '');
    btn.textContent = opt;
    btn.addEventListener('click', () => {
      answers[currentQ] = i;
      document.querySelectorAll('.quiz-opt').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
    quizOpts.appendChild(btn);
  });
  quizBar.style.width = ((currentQ + 1) / questions.length * 100) + '%';
  quizCounter.textContent = (currentQ + 1) + ' / ' + questions.length;
  quizPrev.disabled = currentQ === 0;
  quizNext.textContent = currentQ === questions.length - 1 ? 'See Results ✓' : 'Next →';
}

function showResult() {
  const score = answers.reduce((sum, a) => sum + (a ?? 0), 0);
  const max   = questions.length * 3;
  const pct   = Math.round((score / max) * 100);

  let level, color, advice;
  if (pct < 30) {
    level = "Low Stress 🌿"; color = "#5ee8c5";
    advice = "Great news! Your stress levels appear to be well-managed. Keep maintaining those healthy habits — sleep, exercise, and social connection are working for you.";
  } else if (pct < 55) {
    level = "Moderate Stress ⚠️"; color = "#f5c842";
    advice = "You're managing, but there are signs of strain. Consider adding a daily breathing exercise, talking to a friend, or adjusting your study schedule to include breaks.";
  } else if (pct < 78) {
    level = "High Stress 🔴"; color = "#ff7eb3";
    advice = "Your stress levels are elevated and deserve attention. Please try the breathing exercises on this page, reduce perfectionism, and consider speaking with a counsellor.";
  } else {
    level = "Severe Stress 🆘"; color = "#ff5a5a";
    advice = "You're carrying a very heavy load right now. Please reach out to a mental health professional or a trusted person in your life. You don't have to face this alone.";
  }

  quizContent.classList.add('hidden');
  quizResult.classList.remove('hidden');
  quizResult.innerHTML = `
    <h3 style="color:${color}">${level}</h3>
    <div class="result-bar" style="background: linear-gradient(90deg, ${color}, rgba(124,109,250,0.5)); width: ${pct}%;"></div>
    <p>Score: <strong>${pct}%</strong></p>
    <p>${advice}</p>
    <button class="btn btn-outline" id="retakeQuiz" style="margin-top:1rem">↩ Retake Quiz</button>
  `;
  document.getElementById('retakeQuiz').addEventListener('click', () => {
    answers = Array(questions.length).fill(null);
    currentQ = 0;
    quizContent.classList.remove('hidden');
    quizResult.classList.add('hidden');
    renderQuiz();
  });
}

quizNext.addEventListener('click', () => {
  if (currentQ < questions.length - 1) {
    currentQ++;
    renderQuiz();
  } else {
    showResult();
  }
});
quizPrev.addEventListener('click', () => {
  if (currentQ > 0) { currentQ--; renderQuiz(); }
});

renderQuiz();

/* ═══════════════ QUOTES ═══════════════ */
const quotes = [
  { text: "You don't have to see the whole staircase, just take the first step.", author: "Martin Luther King Jr." },
  { text: "It's okay not to be okay. What matters is that you keep going.", author: "Unknown" },
  { text: "Breathe. You have survived every bad day so far. 100% success rate.", author: "Unknown" },
  { text: "You are allowed to be both a masterpiece and a work in progress simultaneously.", author: "Sophia Bush" },
  { text: "Anxiety is the dizziness of freedom — but freedom also means choosing to rest.", author: "Søren Kierkegaard" },
  { text: "Your speed doesn't matter, forward is forward.", author: "Unknown" },
  { text: "Mental health is not a destination, but a process. It's about how you drive, not where you're going.", author: "Noam Shpancer" },
  { text: "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, annoyed — that's being human.", author: "Lori Deschene" },
  { text: "Promise me you'll always remember: you are braver than you believe, and stronger than you seem.", author: "A.A. Milne" },
  { text: "Be gentle with yourself. You are a child of the universe, no less than the trees and the stars.", author: "Max Ehrmann" },
];

let quoteIndex = 0;
const quoteText   = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const quoteDots   = document.getElementById('quoteDots');

function buildDots() {
  quoteDots.innerHTML = '';
  quotes.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'quote-dot' + (i === quoteIndex ? ' active' : '');
    d.addEventListener('click', () => setQuote(i));
    quoteDots.appendChild(d);
  });
}

function setQuote(i) {
  quoteIndex = (i + quotes.length) % quotes.length;
  quoteText.style.opacity = 0;
  setTimeout(() => {
    quoteText.textContent  = quotes[quoteIndex].text;
    quoteAuthor.textContent = '— ' + quotes[quoteIndex].author;
    quoteText.style.opacity = 1;
    buildDots();
  }, 200);
}

document.getElementById('nextQuote').addEventListener('click', () => setQuote(quoteIndex + 1));
document.getElementById('prevQuote').addEventListener('click', () => setQuote(quoteIndex - 1));
document.getElementById('randomQuote').addEventListener('click', () => {
  let r;
  do { r = Math.floor(Math.random() * quotes.length); } while (r === quoteIndex);
  setQuote(r);
});

// Auto-advance quotes
setInterval(() => setQuote(quoteIndex + 1), 8000);
buildDots();

/* ═══════════════ TIPS TABS ═══════════════ */
const tipsData = {
  physical: [
    { icon: "🏃", title: "Exercise Daily", text: "Just 20-30 minutes of movement releases endorphins that directly counteract cortisol (stress hormone). Walking, dancing, or yoga all count." },
    { icon: "😴", title: "Prioritise Sleep", text: "7-9 hours of quality sleep is non-negotiable for a student. Sleep consolidates memory and restores emotional balance depleted by stress." },
    { icon: "🥗", title: "Eat for Your Brain", text: "Omega-3 fatty acids, magnesium-rich foods (nuts, seeds), and limiting caffeine directly influence anxiety levels and cognitive function." },
    { icon: "💧", title: "Stay Hydrated", text: "Even mild dehydration increases the stress hormone cortisol. Drink at least 2 litres of water daily — it literally affects your mood." },
  ],
  mental: [
    { icon: "🧘", title: "Mindfulness Meditation", text: "10 minutes of daily mindfulness has been shown to reduce amygdala reactivity — the brain's fear and stress center — in just 8 weeks." },
    { icon: "📓", title: "Journaling", text: "Writing your thoughts externalises them. Research shows expressive writing for 15-20 minutes reduces anxiety and improves working memory." },
    { icon: "🎨", title: "Creative Outlets", text: "Drawing, music, cooking, or any creative act activates the brain's reward pathways and interrupts the rumination cycle of anxiety." },
    { icon: "🚫", title: "Limit Doomscrolling", text: "Set a 30-minute daily limit on social media. Social comparison is a proven driver of anxiety in students aged 18-25." },
  ],
  social: [
    { icon: "🗣️", title: "Talk to Someone", text: "Verbalising your worries to a trusted person reduces their psychological weight. Connection is the antidote to anxiety-driven isolation." },
    { icon: "👨‍👩‍👧", title: "Nurture Relationships", text: "Strong social bonds are one of the most robust predictors of resilience. Even 15 minutes of genuine connection can shift your nervous system." },
    { icon: "🤝", title: "Join a Club or Group", text: "Shared purpose reduces loneliness. Find a club, study group, sports team, or volunteer program connected to something you care about." },
    { icon: "🧑‍⚕️", title: "See a Counsellor", text: "Seeking help is a sign of self-awareness, not weakness. University counsellors are trained to help — and the service is usually free." },
  ],
  academic: [
    { icon: "🗓️", title: "Use a Planner", text: "Breaking large tasks into daily micro-goals reduces overwhelm. The act of planning itself lowers anxiety by restoring a sense of control." },
    { icon: "⏰", title: "Pomodoro Technique", text: "Study for 25 minutes, rest for 5. Four cycles = one long break. This method improves focus and prevents the burnout of marathon study sessions." },
    { icon: "🙅", title: "Learn to Say No", text: "Over-committing is a major student stressor. Prioritise ruthlessly. Saying no to one thing is saying yes to your mental health." },
    { icon: "🎯", title: "Reframe Failure", text: "A bad grade is information, not identity. Cognitive reframing — consciously replacing 'I failed' with 'I learned' — rewires anxiety over time." },
  ],
};

const tipsContent = document.getElementById('tipsContent');

function renderTips(cat) {
  tipsContent.innerHTML = tipsData[cat].map(t => `
    <div class="tip-card">
      <div class="tip-card-icon">${t.icon}</div>
      <h4>${t.title}</h4>
      <p>${t.text}</p>
    </div>
  `).join('');
}

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTips(btn.dataset.tab);
  });
});
renderTips('physical');

/* ═══════════════ MOOD TRACKER ═══════════════ */
const moodResponses = {
  5: { msg: "You're thriving — that's wonderful! 🌟 Keep nurturing what's working. Maybe share your energy with someone who needs it today.", col: "#5ee8c5" },
  4: { msg: "Good to hear you're doing well! 🙂 A good day is worth noticing. Write down one thing you're grateful for to anchor this feeling.", col: "#7c6dfa" },
  3: { msg: "Okay is okay. 😐 You're showing up, and that matters. Take one small break today — even 5 minutes of fresh air can shift things.", col: "#f5c842" },
  2: { msg: "It sounds like today is tough. 😟 You don't have to fix everything right now. Try the breathing exercise above, drink water, and be gentle with yourself.", col: "#ff7eb3" },
  1: { msg: "You're overwhelmed right now, and that's valid. 💙 Please talk to someone you trust, or call iCall: 9152987821. You don't have to carry this alone.", col: "#ff5a5a" },
};

const moodResponseEl = document.getElementById('moodResponse');
document.querySelectorAll('.mood-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const m = parseInt(btn.dataset.mood);
    const r = moodResponses[m];
    moodResponseEl.style.borderColor = r.col;
    moodResponseEl.style.color = r.col;
    moodResponseEl.innerHTML = `<strong>${btn.dataset.label}:</strong><br>${r.msg}`;
    moodResponseEl.classList.remove('hidden');
    document.querySelectorAll('.mood-btn').forEach(b => b.style.transform = '');
    btn.style.transform = 'scale(1.3)';
  });
});

/* ═══════════════ AFFIRMATIONS ═══════════════ */
const customAff = document.getElementById('customAffirmation');
const saveAff   = document.getElementById('saveAffirmation');
const savedList = document.getElementById('savedAffirmations');
let savedAffirmations = [];

saveAff.addEventListener('click', () => {
  const val = customAff.value.trim();
  if (!val) return;
  savedAffirmations.push(val);
  const div = document.createElement('div');
  div.className = 'saved-aff-item';
  div.textContent = '✨ ' + val;
  savedList.appendChild(div);
  customAff.value = '';
});

customAff.addEventListener('keydown', e => { if (e.key === 'Enter') saveAff.click(); });

/* ═══════════════ SCROLL REVEAL ═══════════════ */
const revealEls = document.querySelectorAll('.glow-card, .section-title, .section-tag, .hero-content');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

revealEls.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// Hero should be visible immediately
document.querySelectorAll('.hero-content, .hero-visual').forEach(el => {
  el.style.opacity = '1';
  el.style.transform = 'none';
});

/* ═══════════════ RIPPLE ON BUTTONS ═══════════════ */
document.querySelectorAll('.btn, .mood-btn, .tab-btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const rect = btn.getBoundingClientRect();
    const circle = document.createElement('span');
    circle.style.cssText = `
      position:absolute; border-radius:50%;
      width:60px; height:60px;
      background: rgba(255,255,255,0.25);
      left:${e.clientX - rect.left - 30}px;
      top:${e.clientY - rect.top - 30}px;
      transform:scale(0); animation: ripple 0.5s linear; pointer-events:none;
    `;
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
  });
});

/* ─── inject ripple keyframes ─── */
const style = document.createElement('style');
style.textContent = `@keyframes ripple { to { transform: scale(4); opacity: 0; } }`;
document.head.appendChild(style);