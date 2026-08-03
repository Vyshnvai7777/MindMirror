
    // Generate star field
    (function(){
      var container = document.getElementById('loader-stars');
      for(var i=0;i<80;i++){
        var s=document.createElement('div');
        s.className='loader-star';
        var size = Math.random()*2.5+1;
        s.style.cssText='width:'+size+'px;height:'+size+'px;left:'+Math.random()*100+'%;top:'+Math.random()*100+'%;animation-delay:'+Math.random()*3+'s;animation-duration:'+(1.5+Math.random()*2)+'s;';
        container.appendChild(s);
      }
    })();
  

(function() {
"use strict";

// ── PARTICLES ──────────────────────────────────────────
var canvas = document.getElementById('particles-canvas');
var ctx = canvas.getContext('2d');
var pts = [];
function resizeCanvas() { canvas.width = innerWidth; canvas.height = innerHeight; }
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
for (var i = 0; i < 55; i++) {
  pts.push({ x: Math.random()*innerWidth, y: Math.random()*innerHeight, r: Math.random()*3+1, dx: (Math.random()-.5)*.4, dy: (Math.random()-.5)*.4, hue: Math.random()*60+260 });
}
function animP() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pts.forEach(function(p) {
    p.x += p.dx; p.y += p.dy;
    if (p.x < 0 || p.x > innerWidth) p.dx *= -1;
    if (p.y < 0 || p.y > innerHeight) p.dy *= -1;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fillStyle = 'hsla('+p.hue+',60%,75%,0.5)'; ctx.fill();
  });
  requestAnimationFrame(animP);
}
animP();

// ── LOADER ──────────────────────────────────────────
window.addEventListener('load', function() {
  setTimeout(function() { document.getElementById('loader').classList.add('hidden'); }, 1500);
});

// ── SCROLL REVEAL ──────────────────────────────────────────
var revealObs = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(function(el) { revealObs.observe(el); });

// ── STATE ──────────────────────────────────────────
var currentUser = null;
var selectedQ = [];
var currentQ = 0;
var answers = [];
var scores = { E:0, I:0, S:0, N:0, T:0, F:0, J:0, P:0 };

// ── NAVIGATION ──────────────────────────────────────────
function goTo(id) {
  var pages = document.querySelectorAll('.page');
  var target = document.getElementById(id);
  if (!target) return;
  pages.forEach(function(p) {
    if (p.classList.contains('active')) {
      p.classList.remove('active');
      p.classList.add('slide-out');
      setTimeout(function() { p.classList.remove('slide-out'); }, 500);
    } else {
      p.classList.remove('active','slide-out');
    }
  });
  target.classList.add('active');
  target.scrollTop = 0;
}
window.goTo = goTo;

function startQuizIfLoggedIn() {
  if (!currentUser) { goTo('auth'); return; }
  startQuiz();
}
window.startQuizIfLoggedIn = startQuizIfLoggedIn;

// ── AUTH ──────────────────────────────────────────
function switchTab(tab) {
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-signup').classList.toggle('active', tab === 'signup');
  document.getElementById('form-login').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('form-signup').style.display = tab === 'signup' ? 'block' : 'none';
}
window.switchTab = switchTab;

function checkStrength(inp) {
  var v = inp.value;
  var score = 0;
  if (v.length >= 8) score++;
  if (/[A-Z]/.test(v)) score++;
  if (/[0-9]/.test(v)) score++;
  if (/[^A-Za-z0-9]/.test(v)) score++;
  var bar = document.getElementById('sbar');
  bar.style.width = (score * 25) + '%';
  var cols = ['#f4a7b9','#f7c59f','#a8d8c8','#7cb9a0'];
  bar.style.background = cols[score-1] || '#f4a7b9';
}
window.checkStrength = checkStrength;

// ── VALIDATION HELPERS ─────────────────────────────────
function isValidEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
}
function capitalise(s) {
  return s.split(' ').map(function(w){return w.charAt(0).toUpperCase()+w.slice(1);}).join(' ');
}
function showFieldError(fieldId, msg) {
  var inp = document.getElementById(fieldId);
  if (!inp) return;
  inp.style.borderColor = '#f4a7b9';
  inp.style.background = 'rgba(244,167,185,.07)';
  var wrap = inp.closest('.form-group') || inp.parentElement.parentElement;
  var err = wrap.querySelector('.field-error');
  if (!err) {
    err = document.createElement('div');
    err.className = 'field-error';
    err.style.cssText = 'color:#c0506a;font-size:.75rem;margin-top:5px;padding-left:4px;display:flex;align-items:center;gap:4px';
    wrap.appendChild(err);
  }
  err.innerHTML = '⚠ ' + msg;
}
function clearErrors() {
  document.querySelectorAll('.field-error').forEach(function(e){e.remove();});
  document.querySelectorAll('.form-group input').forEach(function(i){
    i.style.borderColor = ''; i.style.background = '';
  });
}

function doLogin() {
  var email = document.getElementById('login-email').value.trim();
  var pass = document.getElementById('login-pass').value;
  clearErrors();
  var ok = true;
  if (!email) { showFieldError('login-email', 'Email is required'); ok = false; }
  else if (!isValidEmail(email)) { showFieldError('login-email', 'Please enter a valid email (e.g. name' + String.fromCharCode(64) + 'gmail.com)'); ok = false; }
  if (!pass) { showFieldError('login-pass', 'Password is required'); ok = false; }
  else if (pass.length < 6) { showFieldError('login-pass', 'Password must be at least 6 characters'); ok = false; }
  if (!ok) return;
  currentUser = { name: capitalise(email.split(String.fromCharCode(64))[0].replace(/[._]/g,' ')), email: email };
  showToast('Welcome back, ' + currentUser.name + '!');
  var hb = document.getElementById('hist-nav-btn');
  var hl = document.getElementById('hist-email-label');
  if (hb) hb.classList.add('visible');
  if (hl) hl.textContent = email;
  setTimeout(startQuiz, 900);
}
window.doLogin = doLogin;

function doSignup() {
  var name = document.getElementById('signup-name').value.trim();
  var email = document.getElementById('signup-email').value.trim();
  var pass = document.getElementById('signup-pass').value;
  var confirm = document.getElementById('signup-confirm').value;
  clearErrors();
  var ok = true;
  if (!name || name.length < 2) { showFieldError('signup-name', 'Please enter your full name (at least 2 characters)'); ok = false; }
  if (!email) { showFieldError('signup-email', 'Email is required'); ok = false; }
  else if (!isValidEmail(email)) { showFieldError('signup-email', 'Please enter a valid email (e.g. name' + String.fromCharCode(64) + 'gmail.com)'); ok = false; }
  if (!pass) { showFieldError('signup-pass', 'Password is required'); ok = false; }
  else if (pass.length < 8) { showFieldError('signup-pass', 'Password must be at least 8 characters'); ok = false; }
  else if (!/[A-Z]/.test(pass)) { showFieldError('signup-pass', 'Add at least one capital letter'); ok = false; }
  else if (!/[0-9]/.test(pass)) { showFieldError('signup-pass', 'Add at least one number'); ok = false; }
  if (confirm !== pass) { showFieldError('signup-confirm', 'Passwords do not match'); ok = false; }
  if (!ok) return;
  currentUser = { name: name, email: email };
  showToast('Account created! Welcome, ' + name + '!');
  var hb = document.getElementById('hist-nav-btn');
  var hl = document.getElementById('hist-email-label');
  if (hb) hb.classList.add('visible');
  if (hl) hl.textContent = email;
  setTimeout(startQuiz, 900);
}
window.doSignup = doSignup;

function socialLogin(provider) {
  currentUser = { name: 'Explorer', email: ('user'+String.fromCharCode(64)) + provider.toLowerCase() + '.com' };
  showToast('Continuing with ' + provider);
  var hb = document.getElementById('hist-nav-btn');
  var hl = document.getElementById('hist-email-label');
  if (hb) hb.classList.add('visible');
  if (hl) hl.textContent = currentUser.email;
  setTimeout(startQuiz, 800);
}
window.socialLogin = socialLogin;

// ── QUESTIONS ──────────────────────────────────────────
var ALL_Q = [
  {dim:"EI",pole:"E",emoji:"🎉",text:"Walking into a room full of strangers immediately energises you and you naturally start conversations",opts:[{t:"Strongly Agree",v:"E",w:2},{t:"Agree",v:"E",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"I",w:1},{t:"Strongly Disagree",v:"I",w:2}]},
  {dim:"EI",pole:"E",emoji:"🗣️",text:"After a full evening socialising with a large group you feel more alive and energised than when you arrived",opts:[{t:"Strongly Agree",v:"E",w:2},{t:"Agree",v:"E",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"I",w:1},{t:"Strongly Disagree",v:"I",w:2}]},
  {dim:"EI",pole:"E",emoji:"📞",text:"When something exciting happens your first instinct is to call or text someone and share it right away",opts:[{t:"Strongly Agree",v:"E",w:2},{t:"Agree",v:"E",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"I",w:1},{t:"Strongly Disagree",v:"I",w:2}]},
  {dim:"EI",pole:"E",emoji:"🏖️",text:"On holiday you tend to befriend other travellers quickly and spend most of your time with new people",opts:[{t:"Strongly Agree",v:"E",w:2},{t:"Agree",v:"E",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"I",w:1},{t:"Strongly Disagree",v:"I",w:2}]},
  {dim:"EI",pole:"E",emoji:"🎤",text:"Being in front of an audience — presenting, performing, or leading a discussion — genuinely excites you",opts:[{t:"Strongly Agree",v:"E",w:2},{t:"Agree",v:"E",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"I",w:1},{t:"Strongly Disagree",v:"I",w:2}]},
  {dim:"EI",pole:"E",emoji:"🌍",text:"Talking a difficult problem through out loud with someone helps you think more clearly than working alone",opts:[{t:"Strongly Agree",v:"E",w:2},{t:"Agree",v:"E",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"I",w:1},{t:"Strongly Disagree",v:"I",w:2}]},
  {dim:"EI",pole:"E",emoji:"🎊",text:"You are usually the person who suggests making plans, organises gatherings, and keeps everyone connected",opts:[{t:"Strongly Agree",v:"E",w:2},{t:"Agree",v:"E",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"I",w:1},{t:"Strongly Disagree",v:"I",w:2}]},
  {dim:"EI",pole:"E",emoji:"💬",text:"Conversations with new people energise you and you rarely run out of things to say",opts:[{t:"Strongly Agree",v:"E",w:2},{t:"Agree",v:"E",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"I",w:1},{t:"Strongly Disagree",v:"I",w:2}]},
  {dim:"EI",pole:"E",emoji:"🏙️",text:"The energy and buzz of a lively city environment makes you feel more alive and motivated",opts:[{t:"Strongly Agree",v:"E",w:2},{t:"Agree",v:"E",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"I",w:1},{t:"Strongly Disagree",v:"I",w:2}]},
  {dim:"EI",pole:"E",emoji:"🌟",text:"After a tough week, spending time with friends and going out is your most effective way to feel like yourself again",opts:[{t:"Strongly Agree",v:"E",w:2},{t:"Agree",v:"E",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"I",w:1},{t:"Strongly Disagree",v:"I",w:2}]},
  {dim:"EI",pole:"E",emoji:"🎭",text:"You genuinely enjoy being the centre of attention at social gatherings and feel comfortable with all eyes on you",opts:[{t:"Strongly Agree",v:"E",w:2},{t:"Agree",v:"E",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"I",w:1},{t:"Strongly Disagree",v:"I",w:2}]},
  {dim:"EI",pole:"E",emoji:"📣",text:"You process your thoughts and feelings best by speaking them aloud to someone else",opts:[{t:"Strongly Agree",v:"E",w:2},{t:"Agree",v:"E",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"I",w:1},{t:"Strongly Disagree",v:"I",w:2}]},
  {dim:"EI",pole:"E",emoji:"🔥",text:"Your ideas sharpen and improve through live discussion with others rather than through private reflection",opts:[{t:"Strongly Agree",v:"E",w:2},{t:"Agree",v:"E",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"I",w:1},{t:"Strongly Disagree",v:"I",w:2}]},
  {dim:"EI",pole:"E",emoji:"🎶",text:"Your energy grows in direct proportion to how many people are around you",opts:[{t:"Strongly Agree",v:"E",w:2},{t:"Agree",v:"E",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"I",w:1},{t:"Strongly Disagree",v:"I",w:2}]},
  {dim:"EI",pole:"E",emoji:"🌺",text:"You are the kind of person who strikes up conversations with strangers in queues, on transport, at events",opts:[{t:"Strongly Agree",v:"E",w:2},{t:"Agree",v:"E",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"I",w:1},{t:"Strongly Disagree",v:"I",w:2}]},
  {dim:"EI",pole:"E",emoji:"🎯",text:"When you have free time and no plans your first feeling is restlessness and desire to organise something social",opts:[{t:"Strongly Agree",v:"E",w:2},{t:"Agree",v:"E",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"I",w:1},{t:"Strongly Disagree",v:"I",w:2}]},
  {dim:"EI",pole:"E",emoji:"🌈",text:"You have a wide social circle with many genuine friends rather than a very small intimate group",opts:[{t:"Strongly Agree",v:"E",w:2},{t:"Agree",v:"E",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"I",w:1},{t:"Strongly Disagree",v:"I",w:2}]},
  {dim:"EI",pole:"E",emoji:"🏋️",text:"In group settings at work you naturally take a leadership or connector role and enjoy the collaboration",opts:[{t:"Strongly Agree",v:"E",w:2},{t:"Agree",v:"E",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"I",w:1},{t:"Strongly Disagree",v:"I",w:2}]},
  {dim:"EI",pole:"E",emoji:"🎪",text:"Large events like festivals, conferences, or parties are environments where you feel particularly in your element",opts:[{t:"Strongly Agree",v:"E",w:2},{t:"Agree",v:"E",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"I",w:1},{t:"Strongly Disagree",v:"I",w:2}]},
  {dim:"EI",pole:"E",emoji:"🚀",text:"Being around people gives you ideas, motivation, and a sense of purpose that is hard to find when alone",opts:[{t:"Strongly Agree",v:"E",w:2},{t:"Agree",v:"E",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"I",w:1},{t:"Strongly Disagree",v:"I",w:2}]},
  {dim:"EI",pole:"E",emoji:"🌻",text:"When you are upset or anxious, talking to someone almost immediately helps you feel better",opts:[{t:"Strongly Agree",v:"E",w:2},{t:"Agree",v:"E",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"I",w:1},{t:"Strongly Disagree",v:"I",w:2}]},
  {dim:"EI",pole:"E",emoji:"🎲",text:"You are genuinely comfortable and happy meeting and chatting with complete strangers in social situations",opts:[{t:"Strongly Agree",v:"E",w:2},{t:"Agree",v:"E",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"I",w:1},{t:"Strongly Disagree",v:"I",w:2}]},
  {dim:"EI",pole:"E",emoji:"🏄",text:"Your social battery seems to not run out — more social time generally means more energy for you",opts:[{t:"Strongly Agree",v:"E",w:2},{t:"Agree",v:"E",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"I",w:1},{t:"Strongly Disagree",v:"I",w:2}]},
  {dim:"EI",pole:"E",emoji:"🌊",text:"Spending a whole weekend completely alone with no social contact would leave you feeling flat and disconnected",opts:[{t:"Strongly Agree",v:"E",w:2},{t:"Agree",v:"E",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"I",w:1},{t:"Strongly Disagree",v:"I",w:2}]},
  {dim:"EI",pole:"E",emoji:"🎵",text:"You are comfortable filling silences in conversation and tend to keep the energy going in a group",opts:[{t:"Strongly Agree",v:"E",w:2},{t:"Agree",v:"E",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"I",w:1},{t:"Strongly Disagree",v:"I",w:2}]},
  {dim:"EI",pole:"I",emoji:"🌙",text:"After a full day of social interaction — even enjoyable interaction — you need significant time alone to feel restored",opts:[{t:"Strongly Agree",v:"I",w:2},{t:"Agree",v:"I",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"E",w:1},{t:"Strongly Disagree",v:"E",w:2}]},
  {dim:"EI",pole:"I",emoji:"🏡",text:"Your ideal way to recharge after a hard week is a quiet evening at home with minimal stimulation",opts:[{t:"Strongly Agree",v:"I",w:2},{t:"Agree",v:"I",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"E",w:1},{t:"Strongly Disagree",v:"E",w:2}]},
  {dim:"EI",pole:"I",emoji:"🧘",text:"You do your best thinking when you are completely alone with no interruptions or external noise",opts:[{t:"Strongly Agree",v:"I",w:2},{t:"Agree",v:"I",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"E",w:1},{t:"Strongly Disagree",v:"E",w:2}]},
  {dim:"EI",pole:"I",emoji:"📖",text:"Deep solo activities like reading, writing, or reflecting are genuinely more restorative for you than socialising",opts:[{t:"Strongly Agree",v:"I",w:2},{t:"Agree",v:"I",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"E",w:1},{t:"Strongly Disagree",v:"E",w:2}]},
  {dim:"EI",pole:"I",emoji:"🌿",text:"You have a small number of very close friendships rather than a wide network of social connections",opts:[{t:"Strongly Agree",v:"I",w:2},{t:"Agree",v:"I",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"E",w:1},{t:"Strongly Disagree",v:"E",w:2}]},
  {dim:"EI",pole:"I",emoji:"🧠",text:"You usually know how you feel or what you think before you need to discuss it with anyone",opts:[{t:"Strongly Agree",v:"I",w:2},{t:"Agree",v:"I",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"E",w:1},{t:"Strongly Disagree",v:"E",w:2}]},
  {dim:"EI",pole:"I",emoji:"🎧",text:"In public spaces you instinctively create distance with headphones or limited eye contact to preserve your energy",opts:[{t:"Strongly Agree",v:"I",w:2},{t:"Agree",v:"I",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"E",w:1},{t:"Strongly Disagree",v:"E",w:2}]},
  {dim:"EI",pole:"I",emoji:"💭",text:"You process emotions and difficult experiences best by sitting with them privately",opts:[{t:"Strongly Agree",v:"I",w:2},{t:"Agree",v:"I",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"E",w:1},{t:"Strongly Disagree",v:"E",w:2}]},
  {dim:"EI",pole:"I",emoji:"🌌",text:"Being alone does not feel lonely — it feels peaceful, productive, and genuinely preferred on most days",opts:[{t:"Strongly Agree",v:"I",w:2},{t:"Agree",v:"I",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"E",w:1},{t:"Strongly Disagree",v:"E",w:2}]},
  {dim:"EI",pole:"I",emoji:"🏕️",text:"Solo travel or spending extended time completely alone sounds genuinely appealing rather than isolating",opts:[{t:"Strongly Agree",v:"I",w:2},{t:"Agree",v:"I",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"E",w:1},{t:"Strongly Disagree",v:"E",w:2}]},
  {dim:"EI",pole:"I",emoji:"😮‍💨",text:"You often feel drained after social events — even fun ones — and need quiet time afterwards to recover",opts:[{t:"Strongly Agree",v:"I",w:2},{t:"Agree",v:"I",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"E",w:1},{t:"Strongly Disagree",v:"E",w:2}]},
  {dim:"EI",pole:"I",emoji:"🌅",text:"Your mornings are most restorative when they begin in complete quiet with no interaction before you are ready",opts:[{t:"Strongly Agree",v:"I",w:2},{t:"Agree",v:"I",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"E",w:1},{t:"Strongly Disagree",v:"E",w:2}]},
  {dim:"EI",pole:"I",emoji:"📝",text:"You prefer to write your thoughts, feelings, or ideas down privately rather than expressing them verbally",opts:[{t:"Strongly Agree",v:"I",w:2},{t:"Agree",v:"I",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"E",w:1},{t:"Strongly Disagree",v:"E",w:2}]},
  {dim:"EI",pole:"I",emoji:"🔕",text:"Unexpected visitors, unplanned phone calls, or sudden social demands feel intrusive and draining to you",opts:[{t:"Strongly Agree",v:"I",w:2},{t:"Agree",v:"I",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"E",w:1},{t:"Strongly Disagree",v:"E",w:2}]},
  {dim:"EI",pole:"I",emoji:"🎬",text:"Solo activities — watching something alone, walking alone, working alone — are when you feel most like yourself",opts:[{t:"Strongly Agree",v:"I",w:2},{t:"Agree",v:"I",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"E",w:1},{t:"Strongly Disagree",v:"E",w:2}]},
  {dim:"EI",pole:"I",emoji:"🧩",text:"A common observation others make about you is that you are quiet, reserved, or hard to get to know initially",opts:[{t:"Strongly Agree",v:"I",w:2},{t:"Agree",v:"I",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"E",w:1},{t:"Strongly Disagree",v:"E",w:2}]},
  {dim:"EI",pole:"I",emoji:"🌙",text:"You frequently need significant time between social events to recover — back-to-back socialising genuinely exhausts you",opts:[{t:"Strongly Agree",v:"I",w:2},{t:"Agree",v:"I",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"E",w:1},{t:"Strongly Disagree",v:"E",w:2}]},
  {dim:"EI",pole:"I",emoji:"🏔️",text:"Crowded environments — concerts, parties, busy offices — genuinely tire you regardless of how enjoyable they are",opts:[{t:"Strongly Agree",v:"I",w:2},{t:"Agree",v:"I",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"E",w:1},{t:"Strongly Disagree",v:"E",w:2}]},
  {dim:"EI",pole:"I",emoji:"💡",text:"Your most creative and productive ideas come to you when you are alone, not in group discussions",opts:[{t:"Strongly Agree",v:"I",w:2},{t:"Agree",v:"I",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"E",w:1},{t:"Strongly Disagree",v:"E",w:2}]},
  {dim:"EI",pole:"I",emoji:"😟",text:"When you are stressed, your strong instinct is to withdraw and be alone rather than seek out people",opts:[{t:"Strongly Agree",v:"I",w:2},{t:"Agree",v:"I",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"E",w:1},{t:"Strongly Disagree",v:"E",w:2}]},
  {dim:"EI",pole:"I",emoji:"🎭",text:"You prefer one-on-one or very small group conversations over large group interactions almost every time",opts:[{t:"Strongly Agree",v:"I",w:2},{t:"Agree",v:"I",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"E",w:1},{t:"Strongly Disagree",v:"E",w:2}]},
  {dim:"EI",pole:"I",emoji:"🛋️",text:"Having an entire weekend to yourself with no social obligations sounds like a genuine gift",opts:[{t:"Strongly Agree",v:"I",w:2},{t:"Agree",v:"I",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"E",w:1},{t:"Strongly Disagree",v:"E",w:2}]},
  {dim:"EI",pole:"I",emoji:"🔒",text:"You guard your private inner world carefully and only let very few people truly know you deeply",opts:[{t:"Strongly Agree",v:"I",w:2},{t:"Agree",v:"I",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"E",w:1},{t:"Strongly Disagree",v:"E",w:2}]},
  {dim:"EI",pole:"I",emoji:"🌸",text:"In social situations you often think about when you can politely leave and get some alone time",opts:[{t:"Strongly Agree",v:"I",w:2},{t:"Agree",v:"I",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"E",w:1},{t:"Strongly Disagree",v:"E",w:2}]},
  {dim:"EI",pole:"I",emoji:"🎋",text:"You can be completely content and happy spending days at a time without significant social contact",opts:[{t:"Strongly Agree",v:"I",w:2},{t:"Agree",v:"I",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"E",w:1},{t:"Strongly Disagree",v:"E",w:2}]},
  {dim:"SN",pole:"N",emoji:"🌌",text:"When you encounter a new idea your mind immediately starts exploring implications, connections, and possibilities beyond the obvious",opts:[{t:"Strongly Agree",v:"N",w:2},{t:"Agree",v:"N",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"S",w:1},{t:"Strongly Disagree",v:"S",w:2}]},
  {dim:"SN",pole:"N",emoji:"🔮",text:"You are often drawn more to what something could mean or become than to what it actually is right now",opts:[{t:"Strongly Agree",v:"N",w:2},{t:"Agree",v:"N",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"S",w:1},{t:"Strongly Disagree",v:"S",w:2}]},
  {dim:"SN",pole:"N",emoji:"🎨",text:"You naturally think in metaphors, symbols, and patterns and find abstract language more expressive than purely literal speech",opts:[{t:"Strongly Agree",v:"N",w:2},{t:"Agree",v:"N",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"S",w:1},{t:"Strongly Disagree",v:"S",w:2}]},
  {dim:"SN",pole:"N",emoji:"🧠",text:"You are often more interested in the underlying theory behind something than in how it practically works",opts:[{t:"Strongly Agree",v:"N",w:2},{t:"Agree",v:"N",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"S",w:1},{t:"Strongly Disagree",v:"S",w:2}]},
  {dim:"SN",pole:"N",emoji:"🌠",text:"You frequently find yourself lost in thought imagining future scenarios, alternative realities, or what-if possibilities",opts:[{t:"Strongly Agree",v:"N",w:2},{t:"Agree",v:"N",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"S",w:1},{t:"Strongly Disagree",v:"S",w:2}]},
  {dim:"SN",pole:"N",emoji:"🔬",text:"Unsolved mysteries and open questions fascinate you more than clear proven answers",opts:[{t:"Strongly Agree",v:"N",w:2},{t:"Agree",v:"N",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"S",w:1},{t:"Strongly Disagree",v:"S",w:2}]},
  {dim:"SN",pole:"N",emoji:"🎯",text:"When reading or listening you naturally read between the lines and look for deeper meaning behind what is said",opts:[{t:"Strongly Agree",v:"N",w:2},{t:"Agree",v:"N",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"S",w:1},{t:"Strongly Disagree",v:"S",w:2}]},
  {dim:"SN",pole:"N",emoji:"💡",text:"Your most exciting ideas come when you connect two completely unrelated things in a new and unexpected way",opts:[{t:"Strongly Agree",v:"N",w:2},{t:"Agree",v:"N",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"S",w:1},{t:"Strongly Disagree",v:"S",w:2}]},
  {dim:"SN",pole:"N",emoji:"🌊",text:"You find that conventional wisdom is often the first thing you want to challenge rather than accept",opts:[{t:"Strongly Agree",v:"N",w:2},{t:"Agree",v:"N",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"S",w:1},{t:"Strongly Disagree",v:"S",w:2}]},
  {dim:"SN",pole:"N",emoji:"🎭",text:"You trust gut feelings and hunches as important sources of information even without concrete evidence",opts:[{t:"Strongly Agree",v:"N",w:2},{t:"Agree",v:"N",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"S",w:1},{t:"Strongly Disagree",v:"S",w:2}]},
  {dim:"SN",pole:"N",emoji:"🌿",text:"You are naturally drawn to philosophy, theory, and abstract concepts — they feel more alive than concrete facts",opts:[{t:"Strongly Agree",v:"N",w:2},{t:"Agree",v:"N",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"S",w:1},{t:"Strongly Disagree",v:"S",w:2}]},
  {dim:"SN",pole:"N",emoji:"🔭",text:"You think about the future far more than the present — possibilities excite you more than current realities",opts:[{t:"Strongly Agree",v:"N",w:2},{t:"Agree",v:"N",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"S",w:1},{t:"Strongly Disagree",v:"S",w:2}]},
  {dim:"SN",pole:"N",emoji:"📚",text:"When learning something new you want to understand the whole conceptual framework before tackling specific details",opts:[{t:"Strongly Agree",v:"N",w:2},{t:"Agree",v:"N",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"S",w:1},{t:"Strongly Disagree",v:"S",w:2}]},
  {dim:"SN",pole:"N",emoji:"🎲",text:"You find yourself bored by routine and repetition — your mind craves novelty, variety, and new angles",opts:[{t:"Strongly Agree",v:"N",w:2},{t:"Agree",v:"N",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"S",w:1},{t:"Strongly Disagree",v:"S",w:2}]},
  {dim:"SN",pole:"N",emoji:"🌈",text:"You have a vivid imagination and spend considerable time in rich inner worlds of ideas, stories, and scenarios",opts:[{t:"Strongly Agree",v:"N",w:2},{t:"Agree",v:"N",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"S",w:1},{t:"Strongly Disagree",v:"S",w:2}]},
  {dim:"SN",pole:"N",emoji:"🧩",text:"Patterns and connections that others miss seem to jump out at you naturally",opts:[{t:"Strongly Agree",v:"N",w:2},{t:"Agree",v:"N",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"S",w:1},{t:"Strongly Disagree",v:"S",w:2}]},
  {dim:"SN",pole:"N",emoji:"🌙",text:"Your dreams tend to be vivid, complex, and sometimes feel meaningful or symbolic",opts:[{t:"Strongly Agree",v:"N",w:2},{t:"Agree",v:"N",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"S",w:1},{t:"Strongly Disagree",v:"S",w:2}]},
  {dim:"SN",pole:"N",emoji:"🎵",text:"You find abstract art, experimental music, or unconventional storytelling more interesting than straightforward realistic work",opts:[{t:"Strongly Agree",v:"N",w:2},{t:"Agree",v:"N",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"S",w:1},{t:"Strongly Disagree",v:"S",w:2}]},
  {dim:"SN",pole:"N",emoji:"🚀",text:"You would rather work on something that has never been done before than improve something that already exists",opts:[{t:"Strongly Agree",v:"N",w:2},{t:"Agree",v:"N",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"S",w:1},{t:"Strongly Disagree",v:"S",w:2}]},
  {dim:"SN",pole:"N",emoji:"🌺",text:"In conversation you naturally drift toward big ideas, philosophical questions, and imaginative scenarios",opts:[{t:"Strongly Agree",v:"N",w:2},{t:"Agree",v:"N",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"S",w:1},{t:"Strongly Disagree",v:"S",w:2}]},
  {dim:"SN",pole:"N",emoji:"🔮",text:"You have a strong sense of intuition about people and situations that often proves right even without clear evidence",opts:[{t:"Strongly Agree",v:"N",w:2},{t:"Agree",v:"N",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"S",w:1},{t:"Strongly Disagree",v:"S",w:2}]},
  {dim:"SN",pole:"N",emoji:"🎯",text:"You find that the standard way of doing things is rarely the best way and look for alternatives almost automatically",opts:[{t:"Strongly Agree",v:"N",w:2},{t:"Agree",v:"N",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"S",w:1},{t:"Strongly Disagree",v:"S",w:2}]},
  {dim:"SN",pole:"N",emoji:"🌍",text:"When solving problems you instinctively look for creative or unconventional solutions rather than proven methods",opts:[{t:"Strongly Agree",v:"N",w:2},{t:"Agree",v:"N",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"S",w:1},{t:"Strongly Disagree",v:"S",w:2}]},
  {dim:"SN",pole:"N",emoji:"🎨",text:"You see connections between completely unrelated things — ideas, people, events, patterns — that others miss",opts:[{t:"Strongly Agree",v:"N",w:2},{t:"Agree",v:"N",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"S",w:1},{t:"Strongly Disagree",v:"S",w:2}]},
  {dim:"SN",pole:"N",emoji:"🧠",text:"The question what does this mean fascinates you far more than how does this work",opts:[{t:"Strongly Agree",v:"N",w:2},{t:"Agree",v:"N",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"S",w:1},{t:"Strongly Disagree",v:"S",w:2}]},
  {dim:"SN",pole:"S",emoji:"🌳",text:"You notice specific, concrete details of your environment that others often walk past without seeing",opts:[{t:"Strongly Agree",v:"S",w:2},{t:"Agree",v:"S",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"N",w:1},{t:"Strongly Disagree",v:"N",w:2}]},
  {dim:"SN",pole:"S",emoji:"🔧",text:"You learn best by doing — getting your hands on something and working through it practically step by step",opts:[{t:"Strongly Agree",v:"S",w:2},{t:"Agree",v:"S",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"N",w:1},{t:"Strongly Disagree",v:"N",w:2}]},
  {dim:"SN",pole:"S",emoji:"📋",text:"You trust direct personal experience and verified facts over theories or abstract ideas when making decisions",opts:[{t:"Strongly Agree",v:"S",w:2},{t:"Agree",v:"S",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"N",w:1},{t:"Strongly Disagree",v:"N",w:2}]},
  {dim:"SN",pole:"S",emoji:"🏛️",text:"History, documented events, and real case studies interest you more than philosophical speculation about what could be",opts:[{t:"Strongly Agree",v:"S",w:2},{t:"Agree",v:"S",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"N",w:1},{t:"Strongly Disagree",v:"N",w:2}]},
  {dim:"SN",pole:"S",emoji:"🌿",text:"You prefer clear, precise, literal language over metaphors and abstract expressions that leave things open to interpretation",opts:[{t:"Strongly Agree",v:"S",w:2},{t:"Agree",v:"S",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"N",w:1},{t:"Strongly Disagree",v:"N",w:2}]},
  {dim:"SN",pole:"S",emoji:"🔩",text:"Practical skills — things you can build, fix, cook, or create with your hands — are something you genuinely value",opts:[{t:"Strongly Agree",v:"S",w:2},{t:"Agree",v:"S",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"N",w:1},{t:"Strongly Disagree",v:"N",w:2}]},
  {dim:"SN",pole:"S",emoji:"📊",text:"When making a decision you want concrete data, specific examples, and evidence from the real world",opts:[{t:"Strongly Agree",v:"S",w:2},{t:"Agree",v:"S",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"N",w:1},{t:"Strongly Disagree",v:"N",w:2}]},
  {dim:"SN",pole:"S",emoji:"🌅",text:"You are generally very present in the moment — focused on what is actually happening rather than imagining what could be",opts:[{t:"Strongly Agree",v:"S",w:2},{t:"Agree",v:"S",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"N",w:1},{t:"Strongly Disagree",v:"N",w:2}]},
  {dim:"SN",pole:"S",emoji:"🗺️",text:"When planning something you focus on specific details, logistics, and practical steps rather than the big vision",opts:[{t:"Strongly Agree",v:"S",w:2},{t:"Agree",v:"S",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"N",w:1},{t:"Strongly Disagree",v:"N",w:2}]},
  {dim:"SN",pole:"S",emoji:"🎯",text:"You prefer solving real, tangible problems over exploring abstract theoretical ones",opts:[{t:"Strongly Agree",v:"S",w:2},{t:"Agree",v:"S",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"N",w:1},{t:"Strongly Disagree",v:"N",w:2}]},
  {dim:"SN",pole:"S",emoji:"🏗️",text:"You build projects, systems, and relationships methodically using proven approaches and what has worked before",opts:[{t:"Strongly Agree",v:"S",w:2},{t:"Agree",v:"S",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"N",w:1},{t:"Strongly Disagree",v:"N",w:2}]},
  {dim:"SN",pole:"S",emoji:"🌱",text:"Your memory tends to be strong on specific facts, dates, events, and concrete details you have experienced",opts:[{t:"Strongly Agree",v:"S",w:2},{t:"Agree",v:"S",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"N",w:1},{t:"Strongly Disagree",v:"N",w:2}]},
  {dim:"SN",pole:"S",emoji:"🎭",text:"When telling a story you naturally give accurate details in the correct sequence rather than impressionistic summaries",opts:[{t:"Strongly Agree",v:"S",w:2},{t:"Agree",v:"S",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"N",w:1},{t:"Strongly Disagree",v:"N",w:2}]},
  {dim:"SN",pole:"S",emoji:"📖",text:"You prefer non-fiction, how-to guides, and grounded writing over speculative or abstract material",opts:[{t:"Strongly Agree",v:"S",w:2},{t:"Agree",v:"S",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"N",w:1},{t:"Strongly Disagree",v:"N",w:2}]},
  {dim:"SN",pole:"S",emoji:"🔬",text:"You are naturally sceptical of ideas that cannot be demonstrated or verified through real-world observation",opts:[{t:"Strongly Agree",v:"S",w:2},{t:"Agree",v:"S",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"N",w:1},{t:"Strongly Disagree",v:"N",w:2}]},
  {dim:"SN",pole:"S",emoji:"🌊",text:"You find that conventional proven methods are usually correct and changing things for the sake of novelty is often unnecessary",opts:[{t:"Strongly Agree",v:"S",w:2},{t:"Agree",v:"S",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"N",w:1},{t:"Strongly Disagree",v:"N",w:2}]},
  {dim:"SN",pole:"S",emoji:"🏠",text:"Your living and working space tends to be functional, practical, and organised around what you actually use",opts:[{t:"Strongly Agree",v:"S",w:2},{t:"Agree",v:"S",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"N",w:1},{t:"Strongly Disagree",v:"N",w:2}]},
  {dim:"SN",pole:"S",emoji:"🎲",text:"You find overly theoretical or abstract conversations frustrating if they cannot be grounded in real examples",opts:[{t:"Strongly Agree",v:"S",w:2},{t:"Agree",v:"S",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"N",w:1},{t:"Strongly Disagree",v:"N",w:2}]},
  {dim:"SN",pole:"S",emoji:"🌙",text:"Before sleeping you are more likely to review the day's specific events than to drift into abstract imaginative thinking",opts:[{t:"Strongly Agree",v:"S",w:2},{t:"Agree",v:"S",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"N",w:1},{t:"Strongly Disagree",v:"N",w:2}]},
  {dim:"SN",pole:"S",emoji:"🔑",text:"You trust what you can observe, touch, measure, or test far more than hunches or abstract intuitions",opts:[{t:"Strongly Agree",v:"S",w:2},{t:"Agree",v:"S",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"N",w:1},{t:"Strongly Disagree",v:"N",w:2}]},
  {dim:"SN",pole:"S",emoji:"🛠️",text:"You have a strong practical side — you like making things work, solving concrete problems, and producing results",opts:[{t:"Strongly Agree",v:"S",w:2},{t:"Agree",v:"S",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"N",w:1},{t:"Strongly Disagree",v:"N",w:2}]},
  {dim:"SN",pole:"S",emoji:"📐",text:"Instructions, manuals, and step-by-step guides are things you actually read and follow carefully",opts:[{t:"Strongly Agree",v:"S",w:2},{t:"Agree",v:"S",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"N",w:1},{t:"Strongly Disagree",v:"N",w:2}]},
  {dim:"SN",pole:"S",emoji:"🌺",text:"Routine and consistency comfort rather than constrain you — you appreciate knowing what to expect",opts:[{t:"Strongly Agree",v:"S",w:2},{t:"Agree",v:"S",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"N",w:1},{t:"Strongly Disagree",v:"N",w:2}]},
  {dim:"SN",pole:"S",emoji:"🎨",text:"Your aesthetic preferences lean toward realistic, representational, and clearly crafted work over abstract or experimental",opts:[{t:"Strongly Agree",v:"S",w:2},{t:"Agree",v:"S",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"N",w:1},{t:"Strongly Disagree",v:"N",w:2}]},
  {dim:"SN",pole:"S",emoji:"🧩",text:"You are most engaged when working on something with clear, real-world applications and measurable outcomes",opts:[{t:"Strongly Agree",v:"S",w:2},{t:"Agree",v:"S",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"N",w:1},{t:"Strongly Disagree",v:"N",w:2}]},
  {dim:"TF",pole:"T",emoji:"⚖️",text:"When making an important decision you focus primarily on what is logically correct and objectively fair even if people do not like it",opts:[{t:"Strongly Agree",v:"T",w:2},{t:"Agree",v:"T",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"F",w:1},{t:"Strongly Disagree",v:"F",w:2}]},
  {dim:"TF",pole:"T",emoji:"🧠",text:"You believe that clear honest feedback delivered directly is more respectful than softening the truth to protect feelings",opts:[{t:"Strongly Agree",v:"T",w:2},{t:"Agree",v:"T",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"F",w:1},{t:"Strongly Disagree",v:"F",w:2}]},
  {dim:"TF",pole:"T",emoji:"🔍",text:"In a conflict your instinct is to identify who is objectively right rather than focus on how people are feeling",opts:[{t:"Strongly Agree",v:"T",w:2},{t:"Agree",v:"T",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"F",w:1},{t:"Strongly Disagree",v:"F",w:2}]},
  {dim:"TF",pole:"T",emoji:"🏛️",text:"You believe principles and rules should be applied consistently to everyone regardless of emotional context",opts:[{t:"Strongly Agree",v:"T",w:2},{t:"Agree",v:"T",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"F",w:1},{t:"Strongly Disagree",v:"F",w:2}]},
  {dim:"TF",pole:"T",emoji:"📊",text:"You find it easier to stay calm and analytical in emotionally charged situations while others around you are upset",opts:[{t:"Strongly Agree",v:"T",w:2},{t:"Agree",v:"T",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"F",w:1},{t:"Strongly Disagree",v:"F",w:2}]},
  {dim:"TF",pole:"T",emoji:"🎯",text:"When a friend asks for your advice you give them your honest analysis even if you know it is not what they hoped to hear",opts:[{t:"Strongly Agree",v:"T",w:2},{t:"Agree",v:"T",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"F",w:1},{t:"Strongly Disagree",v:"F",w:2}]},
  {dim:"TF",pole:"T",emoji:"🤔",text:"You are more frustrated by logically flawed arguments than by arguments that seem emotionally unfair",opts:[{t:"Strongly Agree",v:"T",w:2},{t:"Agree",v:"T",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"F",w:1},{t:"Strongly Disagree",v:"F",w:2}]},
  {dim:"TF",pole:"T",emoji:"💡",text:"You believe decisions made primarily on emotional grounds are almost always inferior to ones made through careful reasoning",opts:[{t:"Strongly Agree",v:"T",w:2},{t:"Agree",v:"T",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"F",w:1},{t:"Strongly Disagree",v:"F",w:2}]},
  {dim:"TF",pole:"T",emoji:"🔥",text:"You can separate how you feel about a person from whether their argument is actually correct",opts:[{t:"Strongly Agree",v:"T",w:2},{t:"Agree",v:"T",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"F",w:1},{t:"Strongly Disagree",v:"F",w:2}]},
  {dim:"TF",pole:"T",emoji:"🏆",text:"When evaluating someone's work or performance you focus on the quality of the output rather than the effort they put in",opts:[{t:"Strongly Agree",v:"T",w:2},{t:"Agree",v:"T",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"F",w:1},{t:"Strongly Disagree",v:"F",w:2}]},
  {dim:"TF",pole:"T",emoji:"⚙️",text:"You find it more important to tell someone an uncomfortable truth than to protect their feelings in the moment",opts:[{t:"Strongly Agree",v:"T",w:2},{t:"Agree",v:"T",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"F",w:1},{t:"Strongly Disagree",v:"F",w:2}]},
  {dim:"TF",pole:"T",emoji:"🌍",text:"When considering whether something is right or wrong you apply a consistent logical principle rather than asking how it makes people feel",opts:[{t:"Strongly Agree",v:"T",w:2},{t:"Agree",v:"T",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"F",w:1},{t:"Strongly Disagree",v:"F",w:2}]},
  {dim:"TF",pole:"T",emoji:"🔑",text:"You believe that being too emotionally involved in a decision is a liability that clouds your judgement",opts:[{t:"Strongly Agree",v:"T",w:2},{t:"Agree",v:"T",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"F",w:1},{t:"Strongly Disagree",v:"F",w:2}]},
  {dim:"TF",pole:"T",emoji:"🗣️",text:"In discussions and debates you argue from logic and evidence rather than personal values or emotional conviction",opts:[{t:"Strongly Agree",v:"T",w:2},{t:"Agree",v:"T",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"F",w:1},{t:"Strongly Disagree",v:"F",w:2}]},
  {dim:"TF",pole:"T",emoji:"🎭",text:"You tend to analyse rather than feel your way through difficult situations — thinking it through is your natural first move",opts:[{t:"Strongly Agree",v:"T",w:2},{t:"Agree",v:"T",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"F",w:1},{t:"Strongly Disagree",v:"F",w:2}]},
  {dim:"TF",pole:"T",emoji:"📝",text:"When giving feedback your first priority is accuracy and clarity rather than how the person will emotionally receive it",opts:[{t:"Strongly Agree",v:"T",w:2},{t:"Agree",v:"T",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"F",w:1},{t:"Strongly Disagree",v:"F",w:2}]},
  {dim:"TF",pole:"T",emoji:"🌿",text:"You are comfortable with conflict when it serves the purpose of reaching a correct or better outcome",opts:[{t:"Strongly Agree",v:"T",w:2},{t:"Agree",v:"T",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"F",w:1},{t:"Strongly Disagree",v:"F",w:2}]},
  {dim:"TF",pole:"T",emoji:"🧩",text:"You are energised by intellectual debate, rigorous argument, and having your ideas tested against sharp thinking",opts:[{t:"Strongly Agree",v:"T",w:2},{t:"Agree",v:"T",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"F",w:1},{t:"Strongly Disagree",v:"F",w:2}]},
  {dim:"TF",pole:"T",emoji:"🔬",text:"You naturally evaluate ideas based on their logical merit rather than whether you or others feel good about them",opts:[{t:"Strongly Agree",v:"T",w:2},{t:"Agree",v:"T",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"F",w:1},{t:"Strongly Disagree",v:"F",w:2}]},
  {dim:"TF",pole:"T",emoji:"🌙",text:"You tend to recover from emotional upsets relatively quickly by reframing them logically rather than processing them emotionally",opts:[{t:"Strongly Agree",v:"T",w:2},{t:"Agree",v:"T",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"F",w:1},{t:"Strongly Disagree",v:"F",w:2}]},
  {dim:"TF",pole:"T",emoji:"🏗️",text:"You find it natural to detach your personal feelings from professional decisions and maintain clear objectivity",opts:[{t:"Strongly Agree",v:"T",w:2},{t:"Agree",v:"T",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"F",w:1},{t:"Strongly Disagree",v:"F",w:2}]},
  {dim:"TF",pole:"T",emoji:"🎲",text:"You notice and point out logical errors in thinking even if doing so creates awkwardness or discomfort",opts:[{t:"Strongly Agree",v:"T",w:2},{t:"Agree",v:"T",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"F",w:1},{t:"Strongly Disagree",v:"F",w:2}]},
  {dim:"TF",pole:"T",emoji:"🌊",text:"You believe the most caring thing you can do for someone is tell them the truth even when it is hard",opts:[{t:"Strongly Agree",v:"T",w:2},{t:"Agree",v:"T",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"F",w:1},{t:"Strongly Disagree",v:"F",w:2}]},
  {dim:"TF",pole:"T",emoji:"🔮",text:"You tend to judge the quality of an idea by its internal consistency and evidence rather than by how inspiring it sounds",opts:[{t:"Strongly Agree",v:"T",w:2},{t:"Agree",v:"T",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"F",w:1},{t:"Strongly Disagree",v:"F",w:2}]},
  {dim:"TF",pole:"T",emoji:"🌺",text:"You feel more satisfied by solving a complex problem correctly than by creating a moment of emotional connection",opts:[{t:"Strongly Agree",v:"T",w:2},{t:"Agree",v:"T",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"F",w:1},{t:"Strongly Disagree",v:"F",w:2}]},
  {dim:"TF",pole:"F",emoji:"❤️",text:"When making decisions you naturally and strongly consider how every person involved will feel and be affected",opts:[{t:"Strongly Agree",v:"F",w:2},{t:"Agree",v:"F",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"T",w:1},{t:"Strongly Disagree",v:"T",w:2}]},
  {dim:"TF",pole:"F",emoji:"🤝",text:"When someone is visibly upset your instinct is to put aside whatever you are doing and focus entirely on how they are feeling",opts:[{t:"Strongly Agree",v:"F",w:2},{t:"Agree",v:"F",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"T",w:1},{t:"Strongly Disagree",v:"T",w:2}]},
  {dim:"TF",pole:"F",emoji:"🌸",text:"You believe that maintaining harmony and people feeling valued is at least as important as arriving at the objectively correct answer",opts:[{t:"Strongly Agree",v:"F",w:2},{t:"Agree",v:"F",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"T",w:1},{t:"Strongly Disagree",v:"T",w:2}]},
  {dim:"TF",pole:"F",emoji:"💔",text:"Criticism — even constructive and fair criticism — tends to land emotionally and you need time to process it",opts:[{t:"Strongly Agree",v:"F",w:2},{t:"Agree",v:"F",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"T",w:1},{t:"Strongly Disagree",v:"T",w:2}]},
  {dim:"TF",pole:"F",emoji:"🌿",text:"You find it natural and important to express care, appreciation, and warmth to the people in your life frequently",opts:[{t:"Strongly Agree",v:"F",w:2},{t:"Agree",v:"F",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"T",w:1},{t:"Strongly Disagree",v:"T",w:2}]},
  {dim:"TF",pole:"F",emoji:"🎭",text:"When watching a film or reading a story you become deeply emotionally invested in the characters and feel their experiences vividly",opts:[{t:"Strongly Agree",v:"F",w:2},{t:"Agree",v:"F",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"T",w:1},{t:"Strongly Disagree",v:"T",w:2}]},
  {dim:"TF",pole:"F",emoji:"🌈",text:"You believe how someone delivers feedback matters just as much as the content — kindness in delivery is not optional",opts:[{t:"Strongly Agree",v:"F",w:2},{t:"Agree",v:"F",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"T",w:1},{t:"Strongly Disagree",v:"T",w:2}]},
  {dim:"TF",pole:"F",emoji:"🏡",text:"The emotional atmosphere of a space — whether people feel comfortable and valued — is something you are acutely sensitive to",opts:[{t:"Strongly Agree",v:"F",w:2},{t:"Agree",v:"F",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"T",w:1},{t:"Strongly Disagree",v:"T",w:2}]},
  {dim:"TF",pole:"F",emoji:"💡",text:"You tend to make important life decisions based significantly on what feels right and aligns with your personal values",opts:[{t:"Strongly Agree",v:"F",w:2},{t:"Agree",v:"F",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"T",w:1},{t:"Strongly Disagree",v:"T",w:2}]},
  {dim:"TF",pole:"F",emoji:"🌙",text:"You can feel genuinely hurt by conflict or tension in relationships even when you know it is not about you personally",opts:[{t:"Strongly Agree",v:"F",w:2},{t:"Agree",v:"F",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"T",w:1},{t:"Strongly Disagree",v:"T",w:2}]},
  {dim:"TF",pole:"F",emoji:"🎯",text:"You find it difficult to separate logic from values — an answer that ignores human impact is never truly correct to you",opts:[{t:"Strongly Agree",v:"F",w:2},{t:"Agree",v:"F",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"T",w:1},{t:"Strongly Disagree",v:"T",w:2}]},
  {dim:"TF",pole:"F",emoji:"🌺",text:"You are deeply moved by acts of genuine kindness, sacrifice, or love — they feel more meaningful than intellectual brilliance",opts:[{t:"Strongly Agree",v:"F",w:2},{t:"Agree",v:"F",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"T",w:1},{t:"Strongly Disagree",v:"T",w:2}]},
  {dim:"TF",pole:"F",emoji:"🧩",text:"You pick up on the emotional undercurrents in a room almost immediately — you sense how people feel before they say it",opts:[{t:"Strongly Agree",v:"F",w:2},{t:"Agree",v:"F",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"T",w:1},{t:"Strongly Disagree",v:"T",w:2}]},
  {dim:"TF",pole:"F",emoji:"💬",text:"In conversations you naturally ask how are you feeling about this before telling someone what you think they should do",opts:[{t:"Strongly Agree",v:"F",w:2},{t:"Agree",v:"F",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"T",w:1},{t:"Strongly Disagree",v:"T",w:2}]},
  {dim:"TF",pole:"F",emoji:"🌊",text:"You feel a strong personal need for your work and relationships to be meaningful and aligned with your deeper values",opts:[{t:"Strongly Agree",v:"F",w:2},{t:"Agree",v:"F",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"T",w:1},{t:"Strongly Disagree",v:"T",w:2}]},
  {dim:"TF",pole:"F",emoji:"🎶",text:"You are motivated significantly by the desire to have a positive impact on people's lives and to be genuinely useful to them",opts:[{t:"Strongly Agree",v:"F",w:2},{t:"Agree",v:"F",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"T",w:1},{t:"Strongly Disagree",v:"T",w:2}]},
  {dim:"TF",pole:"F",emoji:"🔮",text:"You find it genuinely difficult to stay uninvolved when someone you care about is suffering — their pain becomes your concern",opts:[{t:"Strongly Agree",v:"F",w:2},{t:"Agree",v:"F",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"T",w:1},{t:"Strongly Disagree",v:"T",w:2}]},
  {dim:"TF",pole:"F",emoji:"🌍",text:"You believe a world with more empathy and emotional intelligence would solve more problems than one with more rational thinking",opts:[{t:"Strongly Agree",v:"F",w:2},{t:"Agree",v:"F",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"T",w:1},{t:"Strongly Disagree",v:"T",w:2}]},
  {dim:"TF",pole:"F",emoji:"🌿",text:"You give compliments, acknowledgements, and expressions of appreciation naturally and generously",opts:[{t:"Strongly Agree",v:"F",w:2},{t:"Agree",v:"F",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"T",w:1},{t:"Strongly Disagree",v:"T",w:2}]},
  {dim:"TF",pole:"F",emoji:"🏠",text:"Being perceived as cold, uncaring, or dismissive bothers you more than being seen as illogical",opts:[{t:"Strongly Agree",v:"F",w:2},{t:"Agree",v:"F",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"T",w:1},{t:"Strongly Disagree",v:"T",w:2}]},
  {dim:"TF",pole:"F",emoji:"🌸",text:"You frequently put other people's needs and feelings ahead of your own sometimes to your own detriment",opts:[{t:"Strongly Agree",v:"F",w:2},{t:"Agree",v:"F",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"T",w:1},{t:"Strongly Disagree",v:"T",w:2}]},
  {dim:"TF",pole:"F",emoji:"🎨",text:"When evaluating someone's work you naturally consider the care and effort they put in alongside the objective quality",opts:[{t:"Strongly Agree",v:"F",w:2},{t:"Agree",v:"F",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"T",w:1},{t:"Strongly Disagree",v:"T",w:2}]},
  {dim:"TF",pole:"F",emoji:"🔑",text:"You feel most satisfied when you have made a genuine, positive difference to another person's day or life",opts:[{t:"Strongly Agree",v:"F",w:2},{t:"Agree",v:"F",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"T",w:1},{t:"Strongly Disagree",v:"T",w:2}]},
  {dim:"TF",pole:"F",emoji:"🌻",text:"In a disagreement your goal is for everyone to feel heard and for the relationship to be intact — more than for one side to win",opts:[{t:"Strongly Agree",v:"F",w:2},{t:"Agree",v:"F",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"T",w:1},{t:"Strongly Disagree",v:"T",w:2}]},
  {dim:"TF",pole:"F",emoji:"💎",text:"You believe the world needs more kindness and care rather than more blunt honesty",opts:[{t:"Strongly Agree",v:"F",w:2},{t:"Agree",v:"F",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"T",w:1},{t:"Strongly Disagree",v:"T",w:2}]},
  {dim:"JP",pole:"J",emoji:"📅",text:"You feel significantly more comfortable and effective when your day is planned and structured in advance",opts:[{t:"Strongly Agree",v:"J",w:2},{t:"Agree",v:"J",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"P",w:1},{t:"Strongly Disagree",v:"P",w:2}]},
  {dim:"JP",pole:"J",emoji:"✅",text:"Completing tasks, meeting deadlines, and checking things off a list gives you a deep and genuine sense of satisfaction",opts:[{t:"Strongly Agree",v:"J",w:2},{t:"Agree",v:"J",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"P",w:1},{t:"Strongly Disagree",v:"P",w:2}]},
  {dim:"JP",pole:"J",emoji:"🗓️",text:"You plan ahead extensively — holidays, projects, and commitments are organised well before they happen",opts:[{t:"Strongly Agree",v:"J",w:2},{t:"Agree",v:"J",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"P",w:1},{t:"Strongly Disagree",v:"P",w:2}]},
  {dim:"JP",pole:"J",emoji:"⏰",text:"Being on time — arriving early where possible — is something you consider a basic sign of respect and reliability",opts:[{t:"Strongly Agree",v:"J",w:2},{t:"Agree",v:"J",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"P",w:1},{t:"Strongly Disagree",v:"P",w:2}]},
  {dim:"JP",pole:"J",emoji:"🧹",text:"A messy, disorganised space creates genuine mental discomfort for you — you need order around you to think clearly",opts:[{t:"Strongly Agree",v:"J",w:2},{t:"Agree",v:"J",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"P",w:1},{t:"Strongly Disagree",v:"P",w:2}]},
  {dim:"JP",pole:"J",emoji:"📋",text:"You almost always have a to-do list, schedule, or some form of organised system guiding your day",opts:[{t:"Strongly Agree",v:"J",w:2},{t:"Agree",v:"J",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"P",w:1},{t:"Strongly Disagree",v:"P",w:2}]},
  {dim:"JP",pole:"J",emoji:"🔑",text:"You find it much easier to relax once everything on your list is done — leaving things unfinished nags at you",opts:[{t:"Strongly Agree",v:"J",w:2},{t:"Agree",v:"J",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"P",w:1},{t:"Strongly Disagree",v:"P",w:2}]},
  {dim:"JP",pole:"J",emoji:"🏗️",text:"In any project you prefer to have clear milestones, defined roles, and a structured plan before beginning",opts:[{t:"Strongly Agree",v:"J",w:2},{t:"Agree",v:"J",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"P",w:1},{t:"Strongly Disagree",v:"P",w:2}]},
  {dim:"JP",pole:"J",emoji:"🌅",text:"You prefer to make decisions as early as possible and commit to them — keeping options perpetually open feels stressful",opts:[{t:"Strongly Agree",v:"J",w:2},{t:"Agree",v:"J",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"P",w:1},{t:"Strongly Disagree",v:"P",w:2}]},
  {dim:"JP",pole:"J",emoji:"💼",text:"Your work and personal life run on reliable routines and systems you have built and refined over time",opts:[{t:"Strongly Agree",v:"J",w:2},{t:"Agree",v:"J",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"P",w:1},{t:"Strongly Disagree",v:"P",w:2}]},
  {dim:"JP",pole:"J",emoji:"🎯",text:"Unexpected changes to your plans — even welcome ones — require a period of mental adjustment before you can enjoy them",opts:[{t:"Strongly Agree",v:"J",w:2},{t:"Agree",v:"J",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"P",w:1},{t:"Strongly Disagree",v:"P",w:2}]},
  {dim:"JP",pole:"J",emoji:"🏆",text:"You take commitments extremely seriously — when you say you will do something you do it without exception",opts:[{t:"Strongly Agree",v:"J",w:2},{t:"Agree",v:"J",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"P",w:1},{t:"Strongly Disagree",v:"P",w:2}]},
  {dim:"JP",pole:"J",emoji:"📁",text:"Your files, emails, and information are organised in clear systems you maintain consistently",opts:[{t:"Strongly Agree",v:"J",w:2},{t:"Agree",v:"J",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"P",w:1},{t:"Strongly Disagree",v:"P",w:2}]},
  {dim:"JP",pole:"J",emoji:"🌿",text:"A strong sense of closure is necessary for you after significant events — loose ends genuinely bother you",opts:[{t:"Strongly Agree",v:"J",w:2},{t:"Agree",v:"J",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"P",w:1},{t:"Strongly Disagree",v:"P",w:2}]},
  {dim:"JP",pole:"J",emoji:"🔮",text:"When starting something new you research and prepare extensively before taking the first step",opts:[{t:"Strongly Agree",v:"J",w:2},{t:"Agree",v:"J",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"P",w:1},{t:"Strongly Disagree",v:"P",w:2}]},
  {dim:"JP",pole:"J",emoji:"🌙",text:"Your bedtime, morning routine, and daily rhythms are fairly consistent — you value the stability they provide",opts:[{t:"Strongly Agree",v:"J",w:2},{t:"Agree",v:"J",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"P",w:1},{t:"Strongly Disagree",v:"P",w:2}]},
  {dim:"JP",pole:"J",emoji:"🎒",text:"You pack for trips days in advance with a checklist — last-minute packing is genuinely uncomfortable for you",opts:[{t:"Strongly Agree",v:"J",w:2},{t:"Agree",v:"J",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"P",w:1},{t:"Strongly Disagree",v:"P",w:2}]},
  {dim:"JP",pole:"J",emoji:"🧩",text:"You approach goals with a structured plan, regular check-ins, and clear metrics for success",opts:[{t:"Strongly Agree",v:"J",w:2},{t:"Agree",v:"J",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"P",w:1},{t:"Strongly Disagree",v:"P",w:2}]},
  {dim:"JP",pole:"J",emoji:"🌊",text:"Knowing what to expect and having a clear plan makes you more effective, confident, and calm",opts:[{t:"Strongly Agree",v:"J",w:2},{t:"Agree",v:"J",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"P",w:1},{t:"Strongly Disagree",v:"P",w:2}]},
  {dim:"JP",pole:"J",emoji:"🗣️",text:"In group projects you naturally take the organising role — setting the timeline, delegating, and tracking progress",opts:[{t:"Strongly Agree",v:"J",w:2},{t:"Agree",v:"J",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"P",w:1},{t:"Strongly Disagree",v:"P",w:2}]},
  {dim:"JP",pole:"J",emoji:"🏠",text:"Your home has a place for everything and you notice immediately when something is out of place",opts:[{t:"Strongly Agree",v:"J",w:2},{t:"Agree",v:"J",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"P",w:1},{t:"Strongly Disagree",v:"P",w:2}]},
  {dim:"JP",pole:"J",emoji:"🎲",text:"You find it genuinely difficult to enjoy an experience if you have not prepared adequately for it",opts:[{t:"Strongly Agree",v:"J",w:2},{t:"Agree",v:"J",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"P",w:1},{t:"Strongly Disagree",v:"P",w:2}]},
  {dim:"JP",pole:"J",emoji:"🌺",text:"You believe freedom and spontaneity are best enjoyed within a well-organised structure that provides a reliable foundation",opts:[{t:"Strongly Agree",v:"J",w:2},{t:"Agree",v:"J",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"P",w:1},{t:"Strongly Disagree",v:"P",w:2}]},
  {dim:"JP",pole:"J",emoji:"🔥",text:"Feeling behind schedule or behind on your responsibilities creates real stress and urgency in you",opts:[{t:"Strongly Agree",v:"J",w:2},{t:"Agree",v:"J",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"P",w:1},{t:"Strongly Disagree",v:"P",w:2}]},
  {dim:"JP",pole:"J",emoji:"📊",text:"You maintain clear systems for tracking your goals, progress, and responsibilities across different areas of your life",opts:[{t:"Strongly Agree",v:"J",w:2},{t:"Agree",v:"J",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"P",w:1},{t:"Strongly Disagree",v:"P",w:2}]},
  {dim:"JP",pole:"P",emoji:"🌀",text:"You thrive on flexibility and find that your best work and ideas often emerge spontaneously rather than from rigid plans",opts:[{t:"Strongly Agree",v:"P",w:2},{t:"Agree",v:"P",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"J",w:1},{t:"Strongly Disagree",v:"J",w:2}]},
  {dim:"JP",pole:"P",emoji:"🎲",text:"You genuinely enjoy keeping your options open and feel constrained when you have to commit too far in advance",opts:[{t:"Strongly Agree",v:"P",w:2},{t:"Agree",v:"P",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"J",w:1},{t:"Strongly Disagree",v:"J",w:2}]},
  {dim:"JP",pole:"P",emoji:"🚀",text:"You tend to do your most inspired and effective work under pressure close to a deadline when urgency sharpens your focus",opts:[{t:"Strongly Agree",v:"P",w:2},{t:"Agree",v:"P",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"J",w:1},{t:"Strongly Disagree",v:"J",w:2}]},
  {dim:"JP",pole:"P",emoji:"🌈",text:"Unexpected changes or disruptions to plans do not bother you — you find them interesting and adapt easily",opts:[{t:"Strongly Agree",v:"P",w:2},{t:"Agree",v:"P",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"J",w:1},{t:"Strongly Disagree",v:"J",w:2}]},
  {dim:"JP",pole:"P",emoji:"🎨",text:"You prefer to start something and discover the direction as you go rather than planning it all out before beginning",opts:[{t:"Strongly Agree",v:"P",w:2},{t:"Agree",v:"P",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"J",w:1},{t:"Strongly Disagree",v:"J",w:2}]},
  {dim:"JP",pole:"P",emoji:"🌿",text:"You have multiple projects going at once at various stages — finishing all of them before starting new ones is not how you operate",opts:[{t:"Strongly Agree",v:"P",w:2},{t:"Agree",v:"P",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"J",w:1},{t:"Strongly Disagree",v:"J",w:2}]},
  {dim:"JP",pole:"P",emoji:"🔮",text:"You find rigid schedules and detailed plans stifling — they make you feel like you are missing something better that could emerge",opts:[{t:"Strongly Agree",v:"P",w:2},{t:"Agree",v:"P",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"J",w:1},{t:"Strongly Disagree",v:"J",w:2}]},
  {dim:"JP",pole:"P",emoji:"🎯",text:"You are at your best when you have freedom to explore, pivot, and follow what is most interesting in the moment",opts:[{t:"Strongly Agree",v:"P",w:2},{t:"Agree",v:"P",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"J",w:1},{t:"Strongly Disagree",v:"J",w:2}]},
  {dim:"JP",pole:"P",emoji:"🌊",text:"You are genuinely comfortable with ambiguity and uncertainty — you do not need everything decided to feel at ease",opts:[{t:"Strongly Agree",v:"P",w:2},{t:"Agree",v:"P",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"J",w:1},{t:"Strongly Disagree",v:"J",w:2}]},
  {dim:"JP",pole:"P",emoji:"🎭",text:"Your workspace or home might look disorganised to others but you know where everything is and it works for you",opts:[{t:"Strongly Agree",v:"P",w:2},{t:"Agree",v:"P",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"J",w:1},{t:"Strongly Disagree",v:"J",w:2}]},
  {dim:"JP",pole:"P",emoji:"💡",text:"Some of your best decisions and ideas come when you stop planning and just start moving",opts:[{t:"Strongly Agree",v:"P",w:2},{t:"Agree",v:"P",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"J",w:1},{t:"Strongly Disagree",v:"J",w:2}]},
  {dim:"JP",pole:"P",emoji:"🌙",text:"You prefer to keep your evenings and weekends loosely scheduled so you can follow your energy and what feels right",opts:[{t:"Strongly Agree",v:"P",w:2},{t:"Agree",v:"P",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"J",w:1},{t:"Strongly Disagree",v:"J",w:2}]},
  {dim:"JP",pole:"P",emoji:"🛋️",text:"A completely free, unscheduled day with no plans feels genuinely wonderful rather than empty or wasted",opts:[{t:"Strongly Agree",v:"P",w:2},{t:"Agree",v:"P",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"J",w:1},{t:"Strongly Disagree",v:"J",w:2}]},
  {dim:"JP",pole:"P",emoji:"🎪",text:"You are almost always up for a spontaneous invitation — it is one of your favourite ways to experience something new",opts:[{t:"Strongly Agree",v:"P",w:2},{t:"Agree",v:"P",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"J",w:1},{t:"Strongly Disagree",v:"J",w:2}]},
  {dim:"JP",pole:"P",emoji:"🌸",text:"You believe that over-planning often closes off better possibilities that can only emerge from staying open",opts:[{t:"Strongly Agree",v:"P",w:2},{t:"Agree",v:"P",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"J",w:1},{t:"Strongly Disagree",v:"J",w:2}]},
  {dim:"JP",pole:"P",emoji:"🔑",text:"You find it easy to move on from something unfinished if your attention and energy are calling you elsewhere",opts:[{t:"Strongly Agree",v:"P",w:2},{t:"Agree",v:"P",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"J",w:1},{t:"Strongly Disagree",v:"J",w:2}]},
  {dim:"JP",pole:"P",emoji:"🌺",text:"You prefer to approach life as an exploration rather than a project — discovery matters more to you than completion",opts:[{t:"Strongly Agree",v:"P",w:2},{t:"Agree",v:"P",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"J",w:1},{t:"Strongly Disagree",v:"J",w:2}]},
  {dim:"JP",pole:"P",emoji:"🎶",text:"Structure and routine quickly begin to feel like a cage — you need variety and openness to feel alive",opts:[{t:"Strongly Agree",v:"P",w:2},{t:"Agree",v:"P",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"J",w:1},{t:"Strongly Disagree",v:"J",w:2}]},
  {dim:"JP",pole:"P",emoji:"🧩",text:"You trust your ability to handle whatever comes up more than your ability to plan for every contingency",opts:[{t:"Strongly Agree",v:"P",w:2},{t:"Agree",v:"P",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"J",w:1},{t:"Strongly Disagree",v:"J",w:2}]},
  {dim:"JP",pole:"P",emoji:"🏄",text:"You are energised by novelty, variety, and the sense that today might turn into something completely unexpected",opts:[{t:"Strongly Agree",v:"P",w:2},{t:"Agree",v:"P",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"J",w:1},{t:"Strongly Disagree",v:"J",w:2}]},
  {dim:"JP",pole:"P",emoji:"🌍",text:"You believe the best things in life cannot be planned — they happen when you are open, flexible, and present",opts:[{t:"Strongly Agree",v:"P",w:2},{t:"Agree",v:"P",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"J",w:1},{t:"Strongly Disagree",v:"J",w:2}]},
  {dim:"JP",pole:"P",emoji:"🌿",text:"Commitments that lock in your future too rigidly make you feel a little uneasy, even if they are positive",opts:[{t:"Strongly Agree",v:"P",w:2},{t:"Agree",v:"P",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"J",w:1},{t:"Strongly Disagree",v:"J",w:2}]},
  {dim:"JP",pole:"P",emoji:"🎯",text:"You are comfortable starting something without a clear plan and trusting that the right path will reveal itself",opts:[{t:"Strongly Agree",v:"P",w:2},{t:"Agree",v:"P",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"J",w:1},{t:"Strongly Disagree",v:"J",w:2}]},
  {dim:"JP",pole:"P",emoji:"🌊",text:"You tend to be a starter and explorer rather than a finisher — energy comes from beginning, not from completing",opts:[{t:"Strongly Agree",v:"P",w:2},{t:"Agree",v:"P",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"J",w:1},{t:"Strongly Disagree",v:"J",w:2}]},
  {dim:"JP",pole:"P",emoji:"🔥",text:"Following your curiosity and energy in the moment produces better results for you than following a predetermined plan",opts:[{t:"Strongly Agree",v:"P",w:2},{t:"Agree",v:"P",w:1},{t:"Neutral",v:"0",w:0},{t:"Disagree",v:"J",w:1},{t:"Strongly Disagree",v:"J",w:2}]}
];

// ── PERSONALITY DATA ──────────────────────────────────────────

// ═══════════════════════════════════════════════
// PERSONALITY DATA  — plain everyday language
// ═══════════════════════════════════════════════
var PD = {};

PD.INTJ = {
  name:'The Mastermind', icon:'🔭', group:'Analyst', pop:'~2%', strength:'Big-picture thinking',
  desc:"You think further ahead than almost anyone else. You set high goals, work hard to reach them, and prefer to figure things out on your own terms. People respect your sharp mind and your ability to see things others completely miss.",
  chars:['Thinks ahead','Sets high goals','Very determined','Independent','Loves learning','Plans everything'],
  swot:{
    strengths:['You can see long-term outcomes that most people miss entirely','You solve hard problems with calm, clear thinking','You hold yourself to high standards and always push to improve','You make confident decisions and stand behind them','You turn complicated ideas into real, working results'],
    weaknesses:['You can come across as cold or blunt without meaning to','Small talk and casual chat feels draining and pointless to you','You may keep working until you burn out because you never feel truly done','Opening up emotionally is genuinely hard for you','You often prefer doing things alone rather than letting others help'],
    opportunities:['Leadership roles where long-term thinking is valued','Starting your own project or business','Careers in technology, science, research or planning','Any role where solving complex problems is the main job','Teaching or mentoring others using your deep knowledge'],
    threats:['Spending too much time alone until you feel cut off from people','Setting goals so high that you freeze trying to meet them','Accidentally coming across as dismissive of how others feel','Burning out by taking on too much without asking for help','Missing good chances because you are too fixed in your approach'],
    actions:['Share one plan this week with someone you trust and ask for honest feedback','Pick one area where you have been avoiding asking for help and reach out today','Schedule one block of time to fully rest with no planning and no goals','Map out the three biggest risks to your most important goal and plan around each','Have one conversation this week where you focus entirely on listening rather than solving','Choose one long-term vision and write down three concrete steps you will take this month']
  },
  feedback:{
    cards:['Your greatest gift is the ability to see what others cannot — use it on purpose','Your high standards push you forward but learn when something is already good enough','The people around you often need connection more than they need correct answers'],
    main:'You were built to build things that last. Trust the vision — and remember that the right people are always worth letting in.'
  },
  famous:'Elon Musk · Nikola Tesla · Stephen Hawking · Mark Zuckerberg'
};

PD.INTP = {
  name:'The Thinker', icon:'🔬', group:'Analyst', pop:'~3%', strength:'Deep logical thinking',
  desc:"You love understanding how things truly work. You ask questions others never think to ask and can sit with a problem until you really crack it. You are independent, curious, and your thinking is genuinely original.",
  chars:['Deeply curious','Logical','Very original','Independent','Loves big ideas','Quiet but sharp'],
  swot:{
    strengths:['You break down complicated problems that confuse everyone else','You think in original ways and come up with ideas nobody else considered','You are genuinely open-minded and will change your view when the logic says so','You have deep focus and can lose yourself completely in something you care about','You are honest and direct — you say what you actually think'],
    weaknesses:['It is easy to overthink and get stuck in your head without ever acting','Finishing things is harder than starting — your interest often moves on quickly','You can seem distant or detached even with people you genuinely care about','Social situations that require small talk feel exhausting and pointless','You tend to delay decisions because you want to understand everything first'],
    opportunities:['Research, science, technology, maths or philosophy','Any problem-solving career where depth of thinking is the main value','Writing or explaining complex ideas in ways normal people understand','Roles where independent thinking and originality are genuinely rewarded','Building or designing systems that fix real-world problems'],
    threats:['Getting so lost in theories that you never act on your best ideas','Underestimating how much emotional connection matters to the people close to you','Being so blunt and honest that you hurt people without meaning to','Putting off practical action indefinitely waiting for perfect understanding','Losing motivation quickly once the interesting part of a problem is solved'],
    actions:['Pick one idea you have been thinking about and take one concrete action on it today','Write down your top three ideas right now and commit to developing just one fully','Set a 25-minute timer and finish one task before letting yourself explore anything new','Share a half-formed idea with someone this week and listen to their perspective without defending','Find one practical application for a theory you care about and test it in real life','Create a simple deadline for a project you have been refining and actually submit or share it']
  },
  feedback:{
    cards:['Your mind is one of your greatest assets — the world genuinely needs original thinkers like you','Your ideas deserve to be shared, not just explored privately inside your head','Taking imperfect action is almost always better than waiting for the perfect answer'],
    main:'The world needs people who think deeply and honestly. Share your thinking — it is far more valuable than you realise.'
  },
  famous:'Albert Einstein · Bill Gates · Charles Darwin · Isaac Newton'
};

PD.ENTJ = {
  name:'The Commander', icon:'👑', group:'Analyst', pop:'~3%', strength:'Natural leadership',
  desc:"You are a natural leader who loves taking charge and making things happen. You think clearly, aim high, and work hard to get results. People follow you because you bring direction, clarity and energy to every situation.",
  chars:['Natural leader','Very ambitious','Decides quickly','Highly organised','Confident speaker','High achiever'],
  swot:{
    strengths:['You take charge naturally and bring order to any group or situation','You set ambitious goals and do whatever it takes to reach them','You think clearly and make decisions fast even when under pressure','You are confident and convincing — when you speak, people listen','You have the drive and energy to turn big ideas into real results'],
    weaknesses:['You can push people too hard without realising the pressure you are putting on them','Being told you are wrong or being challenged can feel threatening','You may be so focused on results that you miss how people are feeling','Slowing down or resting feels uncomfortable even when your body needs it','You can come across as domineering even when you are just trying to help'],
    opportunities:['Running a team, company or major project','Any high-stakes role that needs fast thinking and clear direction','Starting something from scratch and building a team around it','Mentoring others and helping people reach their full potential','Careers in business, law, politics, strategy or leadership'],
    threats:['Driving yourself and others so hard that important relationships break down','Becoming so confident in your own judgement that you stop genuinely listening','Missing emotional signals that tell you something important is wrong','Burning out from never allowing yourself to properly rest','Creating a culture of fear rather than motivation without realising it'],
    actions:['Ask someone on your team for honest feedback on your leadership style this week','Delegate one task you would normally keep for yourself and trust someone else to handle it','At the end of each day ask yourself: did I listen more than I directed today','Schedule one hour of completely unstructured time this week with no agenda or goals','Write down the names of three people who helped you succeed and thank them specifically','Identify one area where you are being too controlling and consciously let it go this month']
  },
  feedback:{
    cards:['Your ability to lead and inspire is a genuine gift — not everyone has it','The best leaders listen just as much as they direct','Your energy is powerful — make sure the people around you feel carried, not crushed'],
    main:'You have what it takes to build something truly great. Lead with both your head and your heart.'
  },
  famous:'Steve Jobs · Napoleon Bonaparte · Margaret Thatcher · Gordon Ramsay'
};

PD.ENTP = {
  name:'The Debater', icon:'⚡', group:'Analyst', pop:'~3%', strength:'Creative problem solving',
  desc:"You are quick, curious and love a good debate. You enjoy challenging ideas, seeing things from every angle, and coming up with solutions nobody else thought of. You get bored easily and are at your best when exploring something brand new.",
  chars:['Quick thinker','Loves debate','Very creative','Questions everything','Charming and witty','Bored by routine'],
  swot:{
    strengths:['You come up with creative ideas and solutions faster than almost anyone','You can argue any side of a debate convincingly and you enjoy it','You adapt quickly to new situations and actually enjoy change','You are charming and fun to be around — people like your energy','You connect ideas from completely different areas in surprising and exciting ways'],
    weaknesses:['You start many things but finishing them is a constant struggle','You can argue just for fun and accidentally upset people in the process','Following through on the boring practical steps feels genuinely hard','You get restless easily and can lose interest before something is finished','You sometimes push people away by always finding the flaw in their ideas'],
    opportunities:['Entrepreneurship, start-ups or innovation-focused work','Debating, law, strategy or consulting','Any creative field that rewards unconventional thinking','Leadership of new projects where fresh ideas are the most valuable thing','Roles that change often and demand quick thinking and adaptation'],
    threats:['Never finishing what you start because the next exciting idea always calls louder','Burning bridges by being too blunt or argumentative with people who matter','Not appreciating how valuable consistency and follow-through actually are','Getting bored and leaving something important too early','Your love of debate making you seem unreliable or hard to pin down'],
    actions:['Pick one project from your list and commit to finishing it before starting anything new','Challenge yourself to argue the opposite side of your strongest held belief this week','Set one rule for a conversation: no new topics until the current one is fully resolved','Turn one of your ideas into a written one-page plan with real steps and deadlines','Find someone whose thinking style is very different from yours and have a deep conversation','Follow through on one commitment you made last week without changing course or pivoting']
  },
  feedback:{
    cards:['Your ideas are genuinely exciting — now finish one completely','You debate to discover truth not to win — remember that difference','The world needs your creativity but it also needs your follow-through'],
    main:'You are one of life\'s most original minds. Let your ideas land properly before you leap to the next one.'
  },
  famous:'Leonardo da Vinci · Mark Twain · Benjamin Franklin · Sacha Baron Cohen'
};

PD.INFJ = {
  name:'The Counsellor', icon:'🌙', group:'Diplomat', pop:'~1%', strength:'Deep empathy and vision',
  desc:"You are rare — someone who genuinely cares about people AND sees the big picture at the same time. You feel things deeply, understand people in ways that surprise them, and are driven by a strong sense of purpose. People trust you with their hardest problems.",
  chars:['Deeply caring','Has a sense of purpose','Sees the big picture','Quietly determined','Great listener','Reads people well'],
  swot:{
    strengths:['You understand people on a deep level that most others simply cannot reach','You are driven by real values and always try to do the right thing','You can sense where things are heading before others even realise it','You inspire people with your quiet clarity and calm presence','You are a natural at helping others work through their hardest problems'],
    weaknesses:['You take on other people\'s pain as if it were your own and it exhausts you','You set very high standards for yourself and never feel like you are doing enough','You tend to avoid conflict even when speaking up would actually help','You keep so much inside that even the people who care about you cannot reach you','You burn out when you give constantly without anyone giving back to you'],
    opportunities:['Counselling, coaching, therapy or social work','Writing, teaching or any work that helps people understand themselves better','Leadership roles where empathy and vision are both needed','Charity work, advocacy or missions driven by real values','Creative careers where your depth and insight can truly come through'],
    threats:['Absorbing too much of others\' pain until you have nothing left for yourself','Setting standards so high you always feel like you are falling short','Staying silent in relationships where you really need to speak up','Becoming so focused on others that your own needs disappear','Burnout from trying to do everything perfectly while caring for everyone at once'],
    actions:['Write in a journal for ten minutes about what you personally need right now','Say no to one request this week that does not align with your core values','Share something personal with a trusted friend instead of keeping it all inside','Take thirty minutes today to do something purely for your own joy with no purpose','Identify one boundary you need to set and have that conversation this week','Connect with one person whose worldview is different from yours with genuine curiosity']
  },
  feedback:{
    cards:['You give so much — make absolutely sure you are receiving too','Your ability to understand people is a genuine gift that changes lives','Saying what you need is not selfish — it is how you stay able to keep giving'],
    main:'You are one of the rarest and most quietly powerful types. Your depth of care and vision can change the people around you — but only if you take care of yourself first.'
  },
  famous:'Nelson Mandela · Oprah Winfrey · Martin Luther King Jr · Mother Teresa'
};

PD.INFP = {
  name:'The Dreamer', icon:'🦋', group:'Diplomat', pop:'~4%', strength:'Creativity and authenticity',
  desc:"You feel things deeply and live guided by your values and your heart. You are creative, imaginative and completely authentic — you cannot pretend to be something you are not. You want the work you do and the life you live to genuinely mean something.",
  chars:['Completely authentic','Very creative','Strong values','Imaginative','Deeply caring','Searches for meaning'],
  swot:{
    strengths:['You bring genuine care and deep feeling to everything you do','Your creativity and imagination are genuinely exceptional','You are completely true to yourself — you do not fake it or perform for others','You connect with people at an emotional level that feels real and rare','You pursue things that matter to you with quiet but powerful commitment'],
    weaknesses:['You feel criticism very personally even when it was not meant that way','Practical tasks and everyday responsibilities can feel overwhelming or meaningless','When hurt you go quiet and withdraw rather than talking about it','You can spend so long searching for the perfect path that you stay stuck','You expect so much of yourself emotionally that you often feel like you are failing'],
    opportunities:['Creative careers — writing, art, music, film or design','Counselling, therapy or any work that supports people through emotional difficulty','Teaching, especially with young people or those who are struggling','Work driven by values — charity, advocacy or social causes','Roles where your empathy and honest voice make a real difference'],
    threats:['Taking on too much emotional weight from the people you love','Getting so caught up in the ideal version of your life that you miss what is good right now','Avoiding necessary conflict because it feels too painful to face','Feeling like a failure when your real life does not match your vision','Giving up on things too early when they stop feeling meaningful'],
    actions:['Write one page about a value you hold deeply and why it matters to you','Share a creative project or idea with one person this week even if it feels vulnerable','Break one big dream into three small steps and do the first one today','Spend twenty minutes doing something creative with no goal of outcome or perfection','Reach out to one person you have been meaning to reconnect with and make plans','Identify one practical habit that supports your wellbeing and commit to it for one week']
  },
  feedback:{
    cards:['Your sensitivity is a strength not a weakness — do not let anyone convince you otherwise','The world needs people who feel deeply and create from that place','You do not need to have everything figured out — showing up as yourself is enough'],
    main:'You carry a beautiful inner world. Share it — through your art, your words, your presence. It matters more than you know.'
  },
  famous:'J.R.R. Tolkien · Princess Diana · Frida Kahlo · William Shakespeare'
};

PD.ENFJ = {
  name:'The Inspirer', icon:'🌟', group:'Diplomat', pop:'~3%', strength:'Inspiring and connecting people',
  desc:"You naturally bring people together and make them feel they can do more than they thought possible. You are warm, enthusiastic and genuinely invested in helping others grow. People feel energised and believed in when they spend time with you.",
  chars:['Naturally inspiring','Warm and caring','Brings people together','Great communicator','Driven to help','Sees the best in people'],
  swot:{
    strengths:['You bring out the best in people — they feel more capable around you','You are an excellent communicator who connects emotionally with almost everyone','You genuinely celebrate other people\'s growth and success as if it were your own','You create a warm and safe environment wherever you go','You are driven by doing good and it shows in everything you do'],
    weaknesses:['You take on everyone else\'s problems and forget your own needs entirely','Conflict and tension in your relationships can really upset and destabilise you','You find it very difficult to say no even when you are already completely stretched','You sometimes bend yourself out of shape to keep the peace when standing firm would be better','You feel personally responsible for how everyone around you is feeling'],
    opportunities:['Teaching, coaching, counselling or mentoring others','Leadership in purpose-driven organisations that care about people','Community building, charity work or social impact careers','Public speaking, HR or people-focused leadership roles','Any role where inspiring and developing others is at the heart of the work'],
    threats:['Burning out from always putting everyone else\'s needs before your own','Losing your sense of who you are by always being what others need you to be','Taking too much personal responsibility for other people\'s choices and feelings','People-pleasing in ways that slowly wear away your own needs and values','Staying in situations that drain you because you do not want to let anyone down'],
    actions:['Block one hour this week just for yourself with no helping or supporting others','Let someone solve their own problem today instead of jumping in to fix it','Ask yourself before agreeing to something: does this serve me or only others','Write down three things you are proud of that have nothing to do with helping anyone','Have one difficult but honest conversation you have been avoiding to protect harmony','Practice receiving a compliment this week by simply saying thank you without deflecting']
  },
  feedback:{
    cards:['You lift others up — make sure someone is lifting you up too','Your warmth is a superpower but it needs protecting and refuelling','The people who love you want to give back to you — let them'],
    main:'You have a rare gift for making people feel seen and capable. Keep giving — but give yourself the same care you so freely give everyone else.'
  },
  famous:'Barack Obama · Maya Angelou · Malala Yousafzai · Oprah Winfrey'
};

PD.ENFP = {
  name:'The Champion', icon:'🌈', group:'Diplomat', pop:'~8%', strength:'Enthusiasm and connection',
  desc:"You are full of energy, ideas and genuine warmth for the people around you. You love exploring possibilities, connecting deeply with others and living with passion. You see potential everywhere — in people, in ideas and in what the future could be.",
  chars:['Enthusiastic','Full of ideas','Deeply cares about people','Lives for possibility','Creative','Draws people in'],
  swot:{
    strengths:['You bring real energy and warmth to every room you walk into','You are deeply curious and find something genuinely interesting in almost anyone','You are creative, full of ideas and love seeing things in new ways','You connect emotionally with people in a way that makes them feel truly seen','You inspire others to believe in themselves and in what is possible'],
    weaknesses:['You struggle to finish things once the excitement of starting them has faded','You overcommit easily and then feel overwhelmed by everything you have promised','Your emotions run high and can cloud your judgement at times','You are easily bored by routine, admin and the repetitive parts of everyday life','You jump from idea to idea without staying in one place long enough to build it'],
    opportunities:['Creative careers — writing, art, marketing, design or entertainment','Coaching, counselling or any work that involves helping people grow','Entrepreneurship, start-ups or innovation roles','Social work, advocacy or purpose-driven missions','Any career that involves variety, people and new ideas on a regular basis'],
    threats:['Never finishing what you start because the next thing always seems more exciting','Making big promises in excited moments and then struggling to follow through','Avoiding difficult conversations until the tension becomes impossible to ignore','Getting so caught up in what something could be that you miss what it actually is','Spreading yourself so thin that you end up feeling like you are failing at everything'],
    actions:['Write down every idea you have today and then pick just one to act on immediately','Finish something small this week that has been sitting on your to-do list unfinished','Spend one hour in total silence with no stimulation and notice what comes up','Follow one routine for an entire week without changing or optimising it','Tell one person specifically and concretely how they have made a difference in your life','Turn an idea into a three-step action plan and share it with someone for accountability']
  },
  feedback:{
    cards:['Your enthusiasm is a gift — channel it into one thing at a time','You do not need to be everything to everyone — depth beats breadth every time','Finishing something is its own kind of adventure — try seeing one all the way through'],
    main:'You are someone who makes life brighter for everyone around you. Now build something that channels that magic — and see it through to the end.'
  },
  famous:'Robin Williams · Ellen DeGeneres · Walt Disney · Sandra Bullock'
};

PD.ISTJ = {
  name:'The Rock', icon:'🏛️', group:'Sentinel', pop:'~13%', strength:'Reliability and responsibility',
  desc:"You are the person others count on without question. Dependable, organised and thorough — when you commit to something you see it through no matter what. You work hard, keep your word and believe doing things properly the first time is always worth it.",
  chars:['Completely reliable','Highly organised','Strong work ethic','Keeps every promise','Eye for detail','Calm under pressure'],
  swot:{
    strengths:['You are the most reliable person in any room — people trust you without question','You are organised and do things to a high standard every single time','You keep your word without exception and take your responsibilities seriously','You stay calm and dependable in a crisis when everyone else is panicking','You build systems and processes that make everything run more smoothly for everyone'],
    weaknesses:['Change and new ways of doing things can feel threatening even when they are improvements','You can be hard on yourself and others when your high standards are not met','Expressing your feelings or asking for help does not come naturally to you','You can be so focused on getting things done that you forget to enjoy the journey','You sometimes struggle to adapt when a situation genuinely calls for flexibility'],
    opportunities:['Management, operations, finance, law or any role that demands reliability','Building systems and processes that help teams or organisations run smoothly','Leadership roles where trustworthiness and consistency are the most valued qualities','Mentoring others in discipline, organisation and personal responsibility','Any career that rewards sustained hard work and close attention to detail'],
    threats:['Staying with a situation that has stopped working because change feels too risky','Being so hard on yourself that you never feel like you are doing enough','Missing out on joy because you are always focused on what still needs to be done','Becoming quietly resentful when others do not work as hard or care as much as you do','Sticking to the old way of doing things when a better approach is right in front of you'],
    actions:['Try one new approach to a familiar task even if your usual method works perfectly fine','Share how you are feeling with someone close to you this week in clear words','Take on one task that is outside your comfort zone and reflect on what you learned','Ask a colleague or friend for their opinion on something before making a decision','Let one small thing go unfinished today and practise sitting comfortably with that','Do something spontaneous this week with no planning and notice how it feels']
  },
  feedback:{
    cards:['Your reliability is one of the rarest and most valuable qualities a person can have','You do not need to carry everything alone — let people you trust actually help','Rest is not the reward for finishing everything — it is part of doing your best work'],
    main:'You are the kind of person who makes the world actually work. Do not forget to give yourself proper credit for that.'
  },
  famous:'George Washington · Warren Buffett · Angela Merkel · Jeff Bezos'
};

PD.ISFJ = {
  name:'The Nurturer', icon:'🌸', group:'Sentinel', pop:'~14%', strength:'Quiet warmth and dedication',
  desc:"You are the kind of person who makes sure everyone around them is genuinely looked after. Warm, patient and quietly dedicated — you show love through action. People feel safe, comfortable and truly cared for when you are around.",
  chars:['Deeply caring','Patient and kind','Very dependable','Remembers what matters','Works quietly and hard','Always puts others first'],
  swot:{
    strengths:['You make people feel genuinely cared for and looked after without them even asking','You are reliable and follow through on every commitment you make','You pay close attention to what people need and act on it without being asked','You are patient, warm and create a feeling of safety wherever you are','You work hard behind the scenes without needing recognition or credit'],
    weaknesses:['You find it very hard to say no even when you are completely overwhelmed','You put everyone else first until there is genuinely nothing left for yourself','You avoid conflict even when speaking up would actually solve the problem','You can quietly resent how much you give when nobody seems to notice','You underestimate how much your contributions actually matter to other people'],
    opportunities:['Healthcare, nursing, education, social work or caring roles','Any job that involves supporting or looking after people directly','Administration or coordination where attention to detail makes a real difference','Community or family roles where your warmth has the greatest impact','Behind-the-scenes roles that keep everything running for the people who depend on it'],
    threats:['Burning out from giving constantly and never filling your own cup back up','Staying too long in situations or relationships that are not good for you','Not speaking up for yourself until the quiet resentment becomes too much','Being taken completely for granted by people who rely on you without noticing','Losing yourself in caring for others until your own needs disappear entirely'],
    actions:['Do one thing today purely for yourself without explaining or justifying it to anyone','Say no to one request this week and notice that the relationship survives','Share your own opinion first in one conversation before asking what others think','Write down three things that you need right now and ask for one of them','Try one new experience this week that breaks a habit or routine you usually follow','Express appreciation to yourself the same way you would to someone you care about']
  },
  feedback:{
    cards:['You give so much quiet care — it is seen even when it feels invisible to you','Saying no to some things is exactly how you keep saying yes to the things that matter','You deserve the same care and attention you so freely give to everyone else'],
    main:'The world is genuinely warmer because of people like you. Do not forget to let someone take care of you too.'
  },
  famous:'Kate Middleton · Rosa Parks · Beyoncé · Mother Teresa'
};

PD.ESTJ = {
  name:'The Director', icon:'📋', group:'Sentinel', pop:'~9%', strength:'Getting things done',
  desc:"You are practical, decisive and excellent at making things happen. You like clear expectations, organised systems and results you can actually see. When something needs doing, you make it happen — and you bring everyone along with you.",
  chars:['Takes charge easily','Highly organised','Results-focused','Straight talker','Strong work ethic','Keeps everyone on track'],
  swot:{
    strengths:['You take charge naturally and create clarity when everything feels chaotic','You are excellent at organising people, systems and processes','You say exactly what you mean — people always know where they stand with you','You do not wait for someone else to act — you just get it done','You hold yourself and your team to a high standard and deliver real results'],
    weaknesses:['You can come across as bossy or controlling even when you are just trying to help','You may push forward so quickly that you do not notice how people are feeling','Admitting you got something wrong does not come easily to you','You can be too rigid when the situation is actually calling for a different approach','You judge others by your own high standards and can be impatient with different working styles'],
    opportunities:['Management, operations, business or law','Running your own organisation, team or project','Any leadership role that rewards decisiveness and real results','Mentoring and teaching others structure, discipline and accountability','Community leadership or any role that needs someone to step up and take charge'],
    threats:['Coming across as harsh or uncaring when you are just being direct','Pushing people away by focusing too hard on results at the expense of relationships','Staying rigidly attached to one approach when something new would genuinely work better','Creating a tense environment by being too demanding without acknowledging people\'s effort','Missing the bigger picture by staying too focused on the immediate task in front of you'],
    actions:['Ask your team or family how they prefer to receive feedback before giving it this week','Let someone handle a task their own way even if it differs from how you would do it','Schedule something fun with no productivity goal whatsoever and fully enjoy it','Write down the names of people who supported your success and thank one of them today','Practise pausing for five seconds before responding in your next heated moment','Ask one open question in a meeting this week instead of immediately presenting your answer']
  },
  feedback:{
    cards:['Your ability to organise and lead is genuinely rare — use it with intention','People need to feel valued, not just efficient — slow down enough to actually connect','Flexibility is not weakness — sometimes the best plan is changing the plan'],
    main:'You are someone who makes things happen. Lead with both your strength and your heart and the results will be even greater.'
  },
  famous:'Michelle Obama · Henry Ford · Sonia Sotomayor · Frank Sinatra'
};

PD.ESFJ = {
  name:'The Host', icon:'🤝', group:'Sentinel', pop:'~12%', strength:'Making everyone feel welcome',
  desc:"You are the person who makes sure everyone feels included, valued and at home. You are warm, social and deeply invested in the people around you. You bring harmony, care and a real sense of community to every group you are part of.",
  chars:['Warm and welcoming','Highly social','Thoughtful and caring','Works hard for others','Brings people together','Natural organiser'],
  swot:{
    strengths:['You make everyone around you feel genuinely welcome and valued','You are excellent at bringing people together and creating a warm atmosphere','You remember what matters to the people in your life and act on it','You are hardworking, reliable and take pride in everything you do for others','You are tuned in to how people feel and respond with real care and warmth'],
    weaknesses:['You need other people\'s approval more than is healthy for you','It is very hard for you to handle criticism even when it is fair and well-meant','You can get so caught up in other people\'s problems that you lose your own perspective','You ignore your own needs to keep others happy and comfortable','Making a decision that upsets even one person feels genuinely difficult'],
    opportunities:['Healthcare, education, hospitality or any people-facing role','Community building, events planning or creating spaces where people feel they belong','HR, counselling or any work that involves caring for people professionally','Leadership in values-driven, people-first organisations','Social work, charities or any mission that involves genuinely caring for communities'],
    threats:['Making your happiness completely dependent on what other people think of you','Staying in harmful relationships because leaving feels like abandoning someone','Taking on everyone\'s emotional problems as your own personal responsibility','Losing your own identity in what everyone else around you needs','Avoiding important truths because you cannot bear to upset the harmony'],
    actions:['Check in with yourself today: what do you actually need right now in this moment','Share a genuine opinion this week even if you are not sure others will agree with it','Let one conflict resolve itself without you stepping in to smooth things over','Spend thirty minutes doing something you love that has nothing to do with anyone else','Practise separating your self-worth from whether or not everyone around you is happy','Ask for help with one thing this week instead of quietly handling everything yourself']
  },
  feedback:{
    cards:['Your warmth creates belonging — that is one of the most beautiful things a person can do','You matter as a person not just for what you do for people — let others actually see you','Healthy boundaries are not walls — they are what keep your warmth sustainable long-term'],
    main:'You are the glue that holds communities and families together. Make sure you are being held and supported too.'
  },
  famous:'Taylor Swift · Bill Clinton · Jennifer Lopez · Danny Glover'
};

PD.ISTP = {
  name:'The Craftsman', icon:'🔧', group:'Explorer', pop:'~5%', strength:'Cool-headed practical skill',
  desc:"You are calm, practical and incredibly good at working out how things function. Whether it is a machine, a problem or a situation — you analyse it clearly and find the most effective fix. You prefer actions over words and real results over theories.",
  chars:['Calm under pressure','Practical and hands-on','Solves problems quickly','Very observant','Fully independent','Says less but means it'],
  swot:{
    strengths:['You stay completely calm in a crisis when everyone else is panicking — people rely on this','You are excellent at working out how things work and figuring out how to fix them','You are practical, efficient and get straight to the point without wasting time','You are self-directed and do not need to be managed, praised or motivated by others','You observe everything quietly and almost nothing gets past you'],
    weaknesses:['Expressing emotions or showing any vulnerability is genuinely difficult for you','Long-term planning and commitment can feel uncomfortable and unnecessarily restricting','You can seem cold or uninterested even to people you genuinely care deeply about','You get bored quickly when something stops being challenging or interesting to you','You tend to deal with everything alone rather than asking for help when you need it'],
    opportunities:['Engineering, mechanics, technology or any hands-on skilled work','Emergency services, surgery or any role that demands calm performance under real pressure','Entrepreneurship or freelance work where independence is genuinely possible','Investigative roles — research, analysis, detective work or journalism','Any role that rewards practical skill, quick thinking and quiet reliable competence'],
    threats:['Staying emotionally distant until your important relationships quietly fall apart','Refusing to plan ahead and then getting caught off guard by completely avoidable problems','Moving on too quickly when something genuinely needs your longer-term commitment','Coming across as indifferent to people who actually matter a great deal to you','Getting restless and self-sabotaging when life feels too routine for too long'],
    actions:['Explain how you solved a problem to one person this week in full detail','Ask someone close to you how they are feeling and listen for at least five minutes','Commit to one plan for the week and follow it without changing or adapting as you go','Share what you are working on with your team or a friend before it is fully finished','Identify one relationship that matters to you and invest intentional time in it this week','Write down three things that motivate you deeply and reflect on whether your work reflects them']
  },
  feedback:{
    cards:['Your calm under pressure is one of the rarest and most valuable qualities anyone can have','People who matter to you need to hear it in words sometimes — not just see it in actions','A small amount of planning now can save a large amount of problems later'],
    main:'You are the person others want right next to them when things go wrong. Let the people close to you see the quiet loyalty that lives underneath your calm surface.'
  },
  famous:'Clint Eastwood · Michael Jordan · Amelia Earhart · Bruce Lee'
};

PD.ISFP = {
  name:'The Artist', icon:'🎨', group:'Explorer', pop:'~9%', strength:'Authentic creative expression',
  desc:"You live and feel life more intensely than most people ever will. You are deeply creative, genuinely kind and completely authentic — what people see is really who you are. You express yourself through what you make, how you live and how you treat the people you love.",
  chars:['Completely authentic','Deeply creative','Kind and gentle','Fully present','Strong personal values','Expresses through action'],
  swot:{
    strengths:['You are completely and refreshingly authentic — no performance, no pretending with you','You are deeply kind and gentle in a way that makes people feel genuinely safe with you','Your creativity and eye for beauty are truly exceptional','You live fully in the present and experience life with real depth and richness','You act on your values quietly and consistently without ever needing recognition for it'],
    weaknesses:['You can close off completely and become very hard to reach when you are hurting','Conflict feels so painful that you will avoid it until the situation breaks beyond repair','Planning ahead feels hard — the future is too abstract and distant to feel real to you','You seriously underestimate how talented you actually are','Criticism lands very personally and tends to stay with you far longer than it should'],
    opportunities:['Art, music, design, photography, fashion or creative performance','Work involving nature, animals or outdoor environments','Healthcare, childcare or any gentle people-facing role','Any work that lets you express who you are and what you truly value','Freelance or self-directed work that gives you real creative freedom and control'],
    threats:['Withdrawing completely when hurt and not letting anyone reach you','Avoiding conflict until the situation becomes too damaged to fix','Undervaluing your creative gifts because they feel too personal and precious to share','Getting so focused on the present that important future planning completely falls apart','Being taken for granted because your kindness is always quiet and never demanding attention'],
    actions:['Share one piece of your creative work or a value you care about with someone this week','Make a decision today using logic and write down your reasoning step by step','Set one small goal for the week and track your daily progress toward it','Express something you need to a person close to you using clear and direct words','Try one structured approach to a project you would usually handle intuitively','Spend twenty minutes reflecting on where you want to be in one year and write it down']
  },
  feedback:{
    cards:['Your authenticity is rare and precious — protect it fiercely and share it generously','You deserve to be seen as fully as you see and feel other people','Letting people in when you are hurting is strength not weakness — it is how love works'],
    main:'You experience life with a depth and beauty that most people never access. Share that — your art, your kindness, your full presence. It changes people more than you know.'
  },
  famous:'Frida Kahlo · Michael Jackson · Lana Del Rey · Jimi Hendrix'
};

PD.ESTP = {
  name:'The Dynamo', icon:'🔥', group:'Explorer', pop:'~4%', strength:'Bold action in the moment',
  desc:"You are bold, energetic and incredibly fast to act. You love real challenges, live fully in the present and can read people and situations faster than almost anyone. You do not wait for the perfect plan — you jump in and figure it out as you go.",
  chars:['Bold and confident','Acts immediately','Reads situations fast','Lives in the present','Loves a real challenge','Direct and persuasive'],
  swot:{
    strengths:['You act fast and decisively when others are still thinking about what to do','You read people and situations incredibly quickly and respond with real effectiveness','You are bold, confident and genuinely energising to be around','You thrive under pressure and actually perform better when the stakes are high','You are practical and resourceful — you find real solutions in real time'],
    weaknesses:['Thinking about long-term consequences before acting is genuinely hard for you','You can be too blunt and end up hurting people without ever meaning to','Sitting still, planning or doing repetitive routine work feels almost physically uncomfortable','You take risks that are more impulsive than they are strategic','You can come across as insensitive to the feelings of the people around you'],
    opportunities:['Sales, entrepreneurship, trading or any high-pressure performance environment','Sports, emergency services or any physically active hands-on career','Leadership in fast-moving situations where quick real-time decisions are the main need','Entertainment, public performance or media careers','Any role that genuinely rewards boldness, adaptability and fast thinking in the moment'],
    threats:['Acting so impulsively that you damage important things you cannot easily repair','Burning through relationships with bluntness and a lack of emotional awareness','Getting bored with anything long-term and moving on before it is truly done','Taking exciting risks in the moment that turn out to be genuinely costly later','Treating life as a series of thrills rather than building something that lasts'],
    actions:['Pause before reacting in one situation today and ask what the long-term impact might be','Write down three goals for the next month and check in on them at the end of each week','Have one deep conversation this week where you focus entirely on the other person','Finish one project completely before moving on to the next exciting thing','Reflect for ten minutes on a recent decision and what you would do differently','Do one thing this week that requires patience and delayed gratification to complete']
  },
  feedback:{
    cards:['Your boldness is a genuine gift — now add some patience and it becomes unstoppable','The people around you need real connection not just energy and excitement','Think one step further ahead — your instincts are already good, your strategy can be too'],
    main:'You are the kind of person who makes things happen right now. Build something with that energy that lasts longer than this moment.'
  },
  famous:'Ernest Hemingway · Madonna · Eddie Murphy · Donald Trump'
};

PD.ESFP = {
  name:'The Entertainer', icon:'🎉', group:'Explorer', pop:'~7%', strength:'Joy and living fully in the moment',
  desc:"You are the person who makes everything more fun and more alive. Warm, spontaneous and genuinely loving — you bring real energy and joy to every room. You live fully in the present and make the people around you feel like they are exactly where they should be.",
  chars:['Full of real joy','Completely present','Loves people deeply','Spontaneous and fun','Generous and warm','Lights up any room'],
  swot:{
    strengths:['You bring genuine joy and energy to everyone around you — it is not an act','You are warm, loving and make people feel completely welcome and valued','You are fully present in every moment and notice and enjoy what others completely miss','You are generous with your time, energy and affection without keeping score','You are naturally entertaining and make even ordinary moments feel special and alive'],
    weaknesses:['Planning ahead and thinking about future consequences does not come naturally to you','You can avoid difficult conversations until they become unavoidable crises','You get bored quickly with anything that requires long-term patience and commitment','You make decisions in the exciting moment that look very different in the morning','You can give so much energy to others that you completely forget to save any for yourself'],
    opportunities:['Entertainment, performance, hospitality or events','Sales, customer service or any energetic people-facing role','Teaching, childcare or working with communities who need warmth and connection','Creative work, social media or content creation','Any career that lets you bring people together and genuinely make them feel good'],
    threats:['Avoiding difficult realities through constant fun and stimulation','Making important decisions too impulsively without thinking them through properly','Letting important relationships drift because conflict feels too heavy to address','Getting so focused on the present that you miss important future planning entirely','Burning out from giving so much energy to others without enough time to genuinely rest'],
    actions:['Write down one goal for the month and take one step toward it every single day','Spend thirty minutes today planning next week instead of figuring it out as you go','Have one serious conversation you have been avoiding because it felt too heavy','Finish one task completely and carefully before moving on to what excites you next','Reflect on one pattern in your life you want to change and make one concrete commitment','Choose depth over breadth this week: invest fully in one relationship or project']
  },
  feedback:{
    cards:['Your ability to bring real joy is a genuine superpower — protect it carefully','Being present in the moment is beautiful — and the future genuinely needs you to show up too','You cannot pour from an empty cup — rest is not wasted joy, it is how you keep the joy going'],
    main:'You make the world lighter and more alive just by being in it. Take care of that energy — it belongs to you first before anyone else.'
  },
  famous:'Marilyn Monroe · Adele · Will Smith · Jamie Oliver'
};



window.PD = PD;

// ── QUIZ ENGINE ──────────────────────────────────────────
function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

function selectQuestions() {
  var seenKey = 'mm_seen_q2';
  var seen = {};
  try { var r = sessionStorage.getItem(seenKey); if (r) seen = JSON.parse(r); } catch(e) {}

  // Group by dim+pole
  var byPole = {};
  ALL_Q.forEach(function(q, idx) {
    var key = q.dim + q.pole;
    if (!byPole[key]) byPole[key] = [];
    if (!seen[idx]) byPole[key].push({q:q, idx:idx});
  });

  // Reset any exhausted pole
  ALL_Q.forEach(function(q, idx) {
    var key = q.dim + q.pole;
    if (!byPole[key] || byPole[key].length < 4) {
      ALL_Q.forEach(function(q2, idx2) {
        if (q2.dim === q.dim && q2.pole === q.pole) delete seen[idx2];
      });
      byPole[q.dim + q.pole] = [];
      ALL_Q.forEach(function(q2, idx2) {
        if (q2.dim + q2.pole === key) byPole[key].push({q:q2, idx:idx2});
      });
    }
  });

  function shuffle(arr) {
    for (var i = arr.length-1; i > 0; i--) {
      var j = Math.floor(Math.random()*(i+1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  function pick(pole, n) {
    var avail = shuffle((byPole[pole]||[]).slice());
    return avail.slice(0, n);
  }

  // Pick balanced: 4 per pole per dim → 32 total, then drop 2 random → 30
  var picks = [
    pick('EIE', 4), pick('EII', 4),
    pick('SNS', 4), pick('SNN', 4),
    pick('TFT', 4), pick('TFF', 4),
    pick('JPJ', 4), pick('JPP', 4)
  ];
  var flat = [];
  picks.forEach(function(p) { p.forEach(function(x) { flat.push(x); }); });
  flat = shuffle(flat).slice(0, 30);

  flat.forEach(function(item) { seen[item.idx] = 1; });
  try { sessionStorage.setItem(seenKey, JSON.stringify(seen)); } catch(e) {}

  return flat.map(function(item) { return item.q; });
}

function startQuiz() {
  scores = { E:0, I:0, S:0, N:0, T:0, F:0, J:0, P:0 };
  answers = [];
  currentQ = 0;
  selectedQ = selectQuestions();
  renderQ();
  goTo('quiz-page');
}
window.startQuiz = startQuiz;

function renderQ() {
  var q = selectedQ[currentQ];
  var total = selectedQ.length;
  var pct = Math.round((currentQ / total) * 100);
  document.getElementById('q-label').textContent = 'Question ' + (currentQ+1) + ' of ' + total;
  document.getElementById('q-pct').textContent = pct + '%';
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('q-number').textContent = (currentQ+1 < 10 ? '0' : '') + (currentQ+1) + ' / ' + total;
  document.getElementById('q-emoji').textContent = q.emoji;
  document.getElementById('q-text').textContent = q.text;
  ['EI','SN','TF','JP'].forEach(function(d) {
    var p = document.getElementById('pill-' + d);
    if (p) p.classList.toggle('active', q.dim === d);
  });
  var grid = document.getElementById('options-grid');
  grid.innerHTML = '';
  // Likert scale legend
  var legend = document.getElementById('likert-legend');
  if (legend) legend.style.display = 'flex';
  var likertColors = ['#a98fd4','#c9b8e8','#b0b0b0','#f4a7b9','#e8638a'];
  var likertEmoji = ['💜','🟣','⬜','🔴','❤️'];
  q.opts.forEach(function(opt, i) {
    var btn = document.createElement('button');
    btn.className = 'option-btn likert-btn' + (answers[currentQ] === i ? ' selected' : '');
    btn.innerHTML = '<div class="opt-dot" style="background:' + likertColors[i] + '"></div>' +
                    '<span class="likert-label">' + opt.t + '</span>';
    btn.setAttribute('data-idx', i);
    btn.onclick = function() { selectOpt(parseInt(this.getAttribute('data-idx'))); };
    grid.appendChild(btn);
  });
  document.getElementById('btn-prev').style.visibility = currentQ === 0 ? 'hidden' : 'visible';
  document.getElementById('btn-next').textContent = currentQ === total - 1 ? 'Submit ✦' : 'Next →';
  var card = document.getElementById('question-card');
  card.style.opacity = '0';
  card.style.transform = 'translateX(20px)';
  setTimeout(function() {
    card.style.transition = '.4s ease';
    card.style.opacity = '1';
    card.style.transform = 'none';
  }, 10);
}

function selectOpt(i) {
  answers[currentQ] = i;
  var btns = document.querySelectorAll('.option-btn');
  btns.forEach(function(b, j) { b.classList.toggle('selected', j === i); });
}
window.selectOpt = selectOpt;

function nextQ() {
  if (answers[currentQ] === undefined) { showToast('Please select an answer to continue'); return; }
  if (currentQ < selectedQ.length - 1) { currentQ++; renderQ(); }
  else { calcResults(); }
}
window.nextQ = nextQ;

function prevQ() { if (currentQ > 0) { currentQ--; renderQ(); } }
window.prevQ = prevQ;

function calcResults() {
  scores = { E:0, I:0, S:0, N:0, T:0, F:0, J:0, P:0 };
  selectedQ.forEach(function(q, i) {
    var ans = answers[i];
    if (ans === undefined) return;
    var opt = q.opts[ans];
    if (!opt || opt.v === '0') return;
    scores[opt.v] = (scores[opt.v] || 0) + opt.w;
  });
  window._scores = scores;
  // Save to history if logged in
  var type = getType();
  if (currentUser && currentUser.email) {
    saveResultToHistory(currentUser.email, type, scores);
  }
  openModal('Your Results Are Ready', 'Your personality profile has been calculated. Ready to discover your type?');
}

// ═══════════════════════════════════════════════
// RESULTS HISTORY — saved by email in localStorage
// ═══════════════════════════════════════════════

function saveResultToHistory(email, type, scores) {
  var key = 'mm_history_' + email.toLowerCase().trim();
  var history = [];
  try {
    var raw = localStorage.getItem(key);
    if (raw) history = JSON.parse(raw);
  } catch(e) { history = []; }
  
  var entry = {
    type: type,
    date: new Date().toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric'}),
    timestamp: Date.now(),
    scores: {
      E: scores.E||0, I: scores.I||0,
      S: scores.S||0, N: scores.N||0,
      T: scores.T||0, F: scores.F||0,
      J: scores.J||0, P: scores.P||0
    }
  };
  
  // Keep max 20 entries
  history.unshift(entry);
  if (history.length > 20) history = history.slice(0, 20);
  
  try { localStorage.setItem(key, JSON.stringify(history)); } catch(e) {}
}

function getHistory(email) {
  var key = 'mm_history_' + email.toLowerCase().trim();
  try {
    var raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch(e) { return []; }
}




function openHistModal() {
  var modal = document.getElementById('history-modal');
  var box = document.getElementById('history-modal-box');
  if (!modal) { alert('History panel not found'); return; }
  if (!currentUser || !currentUser.email) {
    showToast('Please log in first');
    goTo('auth'); return;
  }
  var el = document.getElementById('hist-email-display');
  if (el) el.textContent = currentUser.email;
  var hist = getHistory(currentUser.email);
  var body = document.getElementById('history-modal-body');
  if (!body) return;
  if (!hist || !hist.length) {
    body.innerHTML = '<div style="text-align:center;padding:48px 24px"><div style="font-size:3rem;margin-bottom:12px">📭</div><p style="font-size:1rem;color:#8e82a8">No results saved yet. Complete the quiz to see your history here.</p></div>';
  } else {
    body.innerHTML = hist.map(function(entry) {
      var p2 = PD[entry.type] || PD.INFJ;
      var cols = (typeColors[entry.type]||'#c9b8e8,#f4a7b9').split(',');
      var sc = entry.scores || {};
      var tEI=(sc.E+sc.I)||1, tSN=(sc.S+sc.N)||1, tTF=(sc.T+sc.F)||1, tJP=(sc.J+sc.P)||1;
      var dims = [
        {l:sc.E>=sc.I?'Extrovert':'Introvert', v:Math.round((Math.max(sc.E||0,sc.I||0)/tEI)*100)},
        {l:sc.N>=sc.S?'Intuitive':'Practical', v:Math.round((Math.max(sc.N||0,sc.S||0)/tSN)*100)},
        {l:sc.F>=sc.T?'Feeling':'Thinking',    v:Math.round((Math.max(sc.F||0,sc.T||0)/tTF)*100)},
        {l:sc.J>=sc.P?'Planned':'Flexible',    v:Math.round((Math.max(sc.J||0,sc.P||0)/tJP)*100)}
      ];
      var dimHtml = dims.map(function(d) {
        return '<div style="display:flex;align-items:center;gap:10px;margin-bottom:7px">' +
          '<span style="font-size:.75rem;font-weight:600;color:#1a1025;width:82px;flex-shrink:0">' + d.l + '</span>' +
          '<div style="flex:1;height:7px;background:rgba(169,143,212,.15);border-radius:4px;overflow:hidden">' +
            '<div style="height:100%;width:' + d.v + '%;background:linear-gradient(90deg,' + cols[0] + ',' + cols[1] + ');border-radius:4px"></div>' +
          '</div>' +
          '<span style="font-size:.72rem;color:#8e82a8;width:30px;text-align:right">' + d.v + '%</span>' +
        '</div>';
      }).join('');
      return '<div style="background:linear-gradient(135deg,' + cols[0] + '22,' + cols[1] + '15);border:1px solid rgba(169,143,212,.18);border-radius:20px;padding:22px">' +
        '<div style="display:flex;align-items:center;gap:16px;margin-bottom:16px">' +
          '<div style="width:64px;height:64px;border-radius:16px;background:linear-gradient(135deg,' + cols[0] + ',' + cols[1] + ');display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;flex-shrink:0">' +
            '<div style="font-size:1.5rem;line-height:1">' + p2.icon + '</div>' +
            '<div style="font-size:.6rem;font-weight:700;color:rgba(255,255,255,.9)">' + entry.type + '</div>' +
          '</div>' +
          '<div style="flex:1">' +
            '<div style="font-size:1.15rem;font-weight:700;color:#1a1025">' + p2.name + '</div>' +
            '<div style="font-size:.78rem;color:#8e82a8;margin:3px 0">&#128197; ' + entry.date + '</div>' +
            '<div style="font-size:.75rem;background:rgba(255,255,255,.6);display:inline-block;padding:3px 11px;border-radius:20px;color:#5a4a7a">' + p2.group + ' &middot; ' + p2.pop + '</div>' +
          '</div>' +
        '</div>' +
        dimHtml +
        '<div style="font-size:.83rem;color:#3a2f5a;line-height:1.65;padding-top:12px;border-top:1px solid rgba(169,143,212,.15);margin-top:4px">' + p2.desc + '</div>' +
      '</div>';
    }).join('');
  }
  modal.style.transition = 'opacity .3s';
  modal.style.opacity = '0';
  modal.style.pointerEvents = 'all';
  if (box) box.style.transform = 'none';
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      modal.style.opacity = '1';
    });
  });
}
window.openHistModal = openHistModal;
function closeHistoryModal() {
  var modal = document.getElementById('history-modal');
  if (!modal) return;
  modal.style.opacity = '0';
  modal.style.pointerEvents = 'none';
  document.body.style.overflow = '';
}

window.closeHistoryModal = closeHistoryModal;



function getType() {
  return (scores.E >= scores.I ? 'E' : 'I') +
         (scores.N >= scores.S ? 'N' : 'S') +
         (scores.F >= scores.T ? 'F' : 'T') +
         (scores.J >= scores.P ? 'J' : 'P');
}

// ── RESULTS ──────────────────────────────────────────
var typeColors = {
  INTJ:'#c9b8e8,#a8d8c8', INTP:'#b8d8f0,#c9b8e8', ENTJ:'#c9b8e8,#f4a7b9', ENTP:'#f7c59f,#c9b8e8',
  INFJ:'#c9b8e8,#f4a7b9', INFP:'#f4a7b9,#c9b8e8', ENFJ:'#a8d8c8,#c9b8e8', ENFP:'#f7c59f,#f4a7b9',
  ISTJ:'#b8d8f0,#a8d8c8', ISFJ:'#f4a7b9,#a8d8c8', ESTJ:'#b8d8f0,#c9b8e8', ESFJ:'#f4a7b9,#f7c59f',
  ISTP:'#a8d8c8,#b8d8f0', ISFP:'#f4a7b9,#f7c59f', ESTP:'#f7c59f,#f4a7b9', ESFP:'#f4a7b9,#f7c59f'
};
var typeFamousNames = {
  INTJ:'Elon Musk · Nikola Tesla · Stephen Hawking',
  INTP:'Albert Einstein · Bill Gates · Charles Darwin',
  ENTJ:'Steve Jobs · Napoleon · Margaret Thatcher',
  ENTP:'Leonardo da Vinci · Mark Twain · Benjamin Franklin',
  INFJ:'Nelson Mandela · Oprah Winfrey · Martin Luther King',
  INFP:'J.R.R. Tolkien · Princess Diana · Frédéric Chopin',
  ENFJ:'Barack Obama · Oprah Winfrey · Maya Angelou',
  ENFP:'Robin Williams · Ellen DeGeneres · Walt Disney',
  ISTJ:'George Washington · Warren Buffett · Angela Merkel',
  ISFJ:'Mother Teresa · Kate Middleton · Rosa Parks',
  ESTJ:'Michelle Obama · Henry Ford · Judge Judy',
  ESFJ:'Taylor Swift · Bill Clinton · Jennifer Garner',
  ISTP:'Clint Eastwood · Amelia Earhart · Michael Jordan',
  ISFP:'Frida Kahlo · Michael Jackson · Lana Del Rey',
  ESTP:'Donald Trump · Ernest Hemingway · Madonna',
  ESFP:'Marilyn Monroe · Adele · Jamie Oliver'
};
var typePopulation = {
  INTJ:'~2%',INTP:'~3%',ENTJ:'~3%',ENTP:'~3%',
  INFJ:'~2%',INFP:'~5%',ENFJ:'~2%',ENFP:'~7%',
  ISTJ:'~13%',ISFJ:'~14%',ESTJ:'~11%',ESFJ:'~12%',
  ISTP:'~5%',ISFP:'~9%',ESTP:'~4%',ESFP:'~9%'
};
var typeGroupNames = {
  INTJ:'Analyst',INTP:'Analyst',ENTJ:'Analyst',ENTP:'Analyst',
  INFJ:'Diplomat',INFP:'Diplomat',ENFJ:'Diplomat',ENFP:'Diplomat',
  ISTJ:'Sentinel',ISFJ:'Sentinel',ESTJ:'Sentinel',ESFJ:'Sentinel',
  ISTP:'Explorer',ISFP:'Explorer',ESTP:'Explorer',ESFP:'Explorer'
};
var charColors = ['#c9b8e8','#f4a7b9','#a8d8c8','#f7c59f','#b8d8f0','#e8c8f0'];

function showResults() {
  var type = getType();
  var p = PD[type] || PD.INFJ;
  var totalEI = scores.E + scores.I || 1;
  var totalSN = scores.S + scores.N || 1;
  var totalTF = scores.T + scores.F || 1;
  var totalJP = scores.J + scores.P || 1;
  var pE = Math.round((scores.E / totalEI) * 100);
  var pN = Math.round((scores.N / totalSN) * 100);
  var pF = Math.round((scores.F / totalTF) * 100);
  var pJ = Math.round((scores.J / totalJP) * 100);
  var cols = (typeColors[type] || '#c9b8e8,#f4a7b9').split(',');

  // Hero banner
  document.getElementById('rhb-orb1').style.background = cols[0];
  document.getElementById('rhb-orb2').style.background = cols[1];
  document.getElementById('rhb-orb3').style.background = 'linear-gradient(135deg,'+cols[0]+','+cols[1]+')';
  document.getElementById('res-type').textContent = type;
  document.getElementById('res-icon').textContent = p.icon;
  document.getElementById('res-name').textContent = p.name;
  document.getElementById('res-desc').textContent = p.desc;
  document.getElementById('res-chips').innerHTML = p.chars.map(function(c) {
    return '<span class="rhb-chip">'+c+'</span>';
  }).join('');

  // Stats strip
  document.getElementById('stats-strip').innerHTML = [
    {e:'👥', v: p.pop, l:'of all people', click:'showStatInfo("pop","'+p.pop+'","'+p.group+'")'},
    {e:'🏷️', v: p.group, l:'personality group', click:'showGroupDesc("'+p.group+'")'},
    {e:'💎', v: p.strength, l:'your biggest strength', click:'showStatInfo("strength","'+p.strength+'","'+type+'")'},
    {e:'🌍', v: p.swot.opportunities[0].split(' ')[0]+' roles', l:'where you thrive', click:'showStatInfo("roles","'+type+'","'+p.group+'")'}
  ].map(function(s) {
    return '<div class="stat-tile reveal" onclick="'+s.click+'" style="cursor:pointer" title="Click to learn more"><div class="stat-emoji">'+s.e+'</div><div class="stat-val">'+s.v+'</div><div class="stat-label">'+s.l+'</div><div style="font-size:.62rem;color:var(--lavender);margin-top:5px;font-weight:600;letter-spacing:.04em"></div></div>';
  }).join('');

  // Dimension score bars
  setTimeout(function() {
    var dimE = scores.E >= scores.I;
    var dimN = scores.N >= scores.S;
    var dimF = scores.F >= scores.T;
    var dimJ = scores.J >= scores.P;
    document.getElementById('trait-bars-visual').innerHTML = [
      {label: dimE ? 'Extrovert' : 'Introvert',
       desc: dimE ? 'You get energy from being around people' : 'You get energy from quiet time alone',
       pct: dimE ? pE : 100-pE, cls:'ei',
       left:'Introvert', right:'Extrovert'},
      {label: dimN ? 'Intuitive' : 'Sensor',
       desc: dimN ? 'You focus on the big picture and ideas' : 'You focus on real details and facts',
       pct: dimN ? pN : 100-pN, cls:'sn',
       left:'Sensor', right:'Intuitive'},
      {label: dimF ? 'Feeler' : 'Thinker',
       desc: dimF ? 'You lead with your heart and values' : 'You lead with logic and clear thinking',
       pct: dimF ? pF : 100-pF, cls:'tf',
       left:'Thinker', right:'Feeler'},
      {label: dimJ ? 'Planner' : 'Flexible',
       desc: dimJ ? 'You like things planned and organised' : 'You like to keep things open and flexible',
       pct: dimJ ? pJ : 100-pJ, cls:'jp',
       left:'Flexible', right:'Planner'}
    ].map(function(t) {
      return '<div class="trait-bar-visual">'+
        '<div class="tbv-top"><span class="tbv-label-left"><b>'+t.label+'</b> — <span style="font-weight:400;font-size:.8rem;color:var(--muted)">'+t.desc+'</span></span><span class="tbv-pct">'+t.pct+'%</span></div>'+
        '<div class="tbv-track"><div class="tbv-fill '+t.cls+'" style="width:'+t.pct+'%"></div></div>'+
        '<div class="tbv-poles"><span>'+t.left+'</span><span>'+t.right+'</span></div></div>';
    }).join('');
  }, 400);

  // Core characteristics — simple clickable chips
  document.getElementById('key-chars').innerHTML = p.chars.map(function(c, i) {
    return '<div class="char-pill-big"><div class="char-dot" style="background:'+charColors[i%charColors.length]+'"></div>'+c+'</div>';
  }).join('');

  // Clickable trait chips
  renderTraitPills(p.chars);

  // Famous people banner
  document.getElementById('famous-banner').innerHTML =
    '<div class="famous-left"><span class="famous-icon-big">'+p.icon+'</span><div class="famous-label">'+type+'</div></div>'+
    '<div class="famous-divider"></div>'+
    '<div class="famous-right">'+
      '<h3>Famous '+p.name+'s</h3>'+
      '<p>These well-known people share your personality type.</p>'+
      '<div class="famous-names">'+
        p.famous.split(' · ').map(function(n){return '<span class="famous-name">'+n+'</span>';}).join('')+
      '</div></div>';

  // Famous clickable
  var famContainer = document.getElementById('famous-clickable-container');
  if (famContainer) {
    famContainer.innerHTML = p.famous.split(' · ').map(function(n) {
      return '<button class="trait-chip-btn" style="background:rgba(168,216,200,.18);border-color:rgba(168,216,200,.4)" onclick="toggleFamousInfo(this,'+JSON.stringify(n)+')">'+n+'</button>';
    }).join('');
  }

  // SWOT — plain friendly labels
  var sw = p.swot;
  document.getElementById('swot-container').innerHTML = [
    {cls:'strength',  icon:'💪', title:'What you are naturally good at',   sub:'These are your built-in strengths', items: sw.strengths},
    {cls:'weakness',  icon:'🌱', title:'Where you can grow',               sub:'These are areas worth working on',  items: sw.weaknesses},
    {cls:'opportunity',icon:'🚀',title:'Where you do best in life',        sub:'Paths and careers that suit you',   items: sw.opportunities},
    {cls:'threat',    icon:'⚠️', title:'Things to watch out for',          sub:'Patterns that can hold you back',   items: sw.threats}
  ].map(function(card) {
    return '<div class="swot-card '+card.cls+'">'+
      '<div class="sc-header"><div class="sc-icon-wrap">'+card.icon+'</div>'+
      '<div><div class="sc-title">'+card.title+'</div><div class="sc-sub">'+card.sub+'</div></div></div>'+
      '<ul class="swot-list">'+card.items.map(function(s){
        return '<li><div class="sli">◆</div>'+s+'</li>';
      }).join('')+'</ul></div>';
  }).join('');

  // Feedback section — plain string cards (not objects)
  var fb = p.feedback;
  var fbIcons = ['💡','🌱','🎯'];
  var fbColors = [
    'linear-gradient(145deg,#e4f0fc,#c8e4f8)',
    'linear-gradient(145deg,#f0fce4,#c8f8d0)',
    'linear-gradient(145deg,#fce4f0,#f8c8e0)'
  ];
  document.getElementById('feedback-cards').innerHTML = fb.cards.map(function(text, i) {
    return '<div class="fb-card" style="background:'+fbColors[i%3]+';border:1px solid rgba(169,143,212,.15)">'+
      '<div class="fb-icon-big">'+fbIcons[i%3]+'</div>'+
      '<p style="font-size:.9rem;color:#1a1025;line-height:1.6;margin:0">'+text+'</p></div>';
  }).join('');
  document.getElementById('main-feedback-text').textContent = fb.main;

  // Action steps
  var actEl = document.getElementById('activity-cards');
  if (actEl && sw.actions) {
    var gIcons = ['🎯','🌱','⚡','🔥','💡','🏆'];
    var gTitles = ['This Week\'s Challenge','Build This Habit','Try This Today','Push Your Edge','Mindset Shift','Long-Term Win'];
    var gColors = [
      'linear-gradient(135deg,#c9b8e8,#a98fd4)',
      'linear-gradient(135deg,#a8d8c8,#5db89a)',
      'linear-gradient(135deg,#f4a7b9,#e8638a)',
      'linear-gradient(135deg,#ffd89b,#f0a050)',
      'linear-gradient(135deg,#a8d8f0,#6aaed6)',
      'linear-gradient(135deg,#d4b8e8,#9b6fd4)'
    ];
    var gBg = [
      'linear-gradient(135deg,rgba(201,184,232,.12),rgba(169,143,212,.08))',
      'linear-gradient(135deg,rgba(168,216,200,.14),rgba(93,184,154,.08))',
      'linear-gradient(135deg,rgba(244,167,185,.12),rgba(232,99,138,.07))',
      'linear-gradient(135deg,rgba(255,216,155,.14),rgba(240,160,80,.08))',
      'linear-gradient(135deg,rgba(168,216,240,.14),rgba(106,174,214,.08))',
      'linear-gradient(135deg,rgba(212,184,232,.12),rgba(155,111,212,.08))'
    ];
    actEl.innerHTML = sw.actions.map(function(a, i) {
      return '<div class="growth-card-new" style="background:'+gBg[i]+'">'+
        '<div class="gcn-header" style="background:'+gColors[i]+'">'+
          '<span class="gcn-icon">'+gIcons[i]+'</span>'+
          '<span class="gcn-title">'+gTitles[i]+'</span>'+
          '<span class="gcn-num">'+(i+1)+'/3</span>'+
        '</div>'+
        '<div class="gcn-body">'+
          '<p class="gcn-text">'+a+'</p>'+
          '<button class="gcn-done-btn" onclick="markGrowthDone(this)">Mark as done ✓</button>'+
        '</div>'+
      '</div>';
    }).join('');
  }

  // All 16 types grid
  var tg = document.getElementById('types-grid');
  if (tg) {
    tg.innerHTML = Object.keys(PD).map(function(t) {
      var tp = PD[t];
      var active = t === type ? ' active' : '';
      return '<div class="type-tile'+active+'" onclick="openTypeModal('+JSON.stringify(t)+')" title="'+tp.name+'">'+
        '<div class="tt-icon">'+tp.icon+'</div>'+
        '<div class="tt-code">'+t+'</div>'+
        '<div class="tt-name">'+tp.name+'</div>'+
        (active ? '<div class="tt-you">← You</div>' : '')+
      '</div>';
    }).join('');
  }

  goTo('results-page');
  renderFamousPills((p.famous || ''), p.name);
  setTimeout(function() {
    document.querySelectorAll('.reveal').forEach(function(el) { revealObs.observe(el); });
  }, 500);
}

function markGrowthDone(btn) {
  var card = btn.closest('.growth-card-new');
  if (!card) return;
  if (card.classList.contains('done')) {
    card.classList.remove('done');
    btn.textContent = 'Mark as done ✓';
  } else {
    card.classList.add('done');
    btn.textContent = '✅ Done!';
    btn.style.background = 'rgba(93,184,154,.2)';
    btn.style.borderColor = 'rgba(93,184,154,.5)';
    btn.style.color = '#2a7a5a';
  }
}
window.markGrowthDone = markGrowthDone;
window.showResults = showResults;

function retakeQuiz() {
  startQuiz();
}
window.retakeQuiz = retakeQuiz;

function demoResults() {
  currentUser = { name: 'Demo', email: 'demo" + String.fromCharCode(64) + "mindmirror.com' };
  scores = { E:3, I:5, N:6, S:2, F:6, T:2, J:5, P:3 };
  calcResults();
}
window.demoResults = demoResults;

// ── MODAL ──────────────────────────────────────────
function openModal(title, body) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').textContent = body;
  document.getElementById('modal-overlay').classList.add('open');
}
function closeModal() { document.getElementById('modal-overlay').classList.remove('open'); }
window.closeModal = closeModal;

// ── TOAST ──────────────────────────────────────────
var toastTimer;
function showToast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function() { t.classList.remove('show'); }, 3000);
}
window.showToast = showToast;

// ── TYPE MODAL (hero page) ──────────────────────────────────────────
var typeGroupMap = {
  INTJ:'analyst',INTP:'analyst',ENTJ:'analyst',ENTP:'analyst',
  INFJ:'diplomat',INFP:'diplomat',ENFJ:'diplomat',ENFP:'diplomat',
  ISTJ:'sentinel',ISFJ:'sentinel',ESTJ:'sentinel',ESFJ:'sentinel',
  ISTP:'explorer',ISFP:'explorer',ESTP:'explorer',ESFP:'explorer'
};
var typeGroupLabel = {analyst:'ANALYSTS',diplomat:'DIPLOMATS',sentinel:'SENTINELS',explorer:'EXPLORERS'};
var typeFacts = {
  INTJ:{pop:'~2%',strength:'Strategy',partner:'ENFP',famous:'Elon Musk, Nikola Tesla'},
  INTP:{pop:'~3%',strength:'Analysis',partner:'ENTJ',famous:'Albert Einstein, Bill Gates'},
  ENTJ:{pop:'~3%',strength:'Leadership',partner:'INTP',famous:'Steve Jobs, Napoleon'},
  ENTP:{pop:'~3%',strength:'Innovation',partner:'INFJ',famous:'Leonardo da Vinci, Mark Twain'},
  INFJ:{pop:'~2%',strength:'Empathy',partner:'ENTP',famous:'Nelson Mandela, Oprah Winfrey'},
  INFP:{pop:'~5%',strength:'Creativity',partner:'ENFJ',famous:'J.R.R. Tolkien, Princess Diana'},
  ENFJ:{pop:'~2%',strength:'Inspiring others',partner:'INFP',famous:'Barack Obama, Oprah'},
  ENFP:{pop:'~7%',strength:'Enthusiasm',partner:'INTJ',famous:'Robin Williams, Ellen DeGeneres'},
  ISTJ:{pop:'~13%',strength:'Reliability',partner:'ESFP',famous:'George Washington, Warren Buffett'},
  ISFJ:{pop:'~14%',strength:'Care & loyalty',partner:'ESTP',famous:'Mother Teresa, Kate Middleton'},
  ESTJ:{pop:'~11%',strength:'Organization',partner:'ISFP',famous:'Michelle Obama, Henry Ford'},
  ESFJ:{pop:'~12%',strength:'Warmth',partner:'ISFP',famous:'Taylor Swift, Bill Clinton'},
  ISTP:{pop:'~5%',strength:'Technical skill',partner:'ESFJ',famous:'Clint Eastwood, Virgil'},
  ISFP:{pop:'~9%',strength:'Authenticity',partner:'ESTJ',famous:'Frida Kahlo, Michael Jackson'},
  ESTP:{pop:'~4%',strength:'Bold action',partner:'ISFJ',famous:'Donald Trump, Ernest Hemingway'},
  ESFP:{pop:'~9%',strength:'Spontaneous joy',partner:'ISTJ',famous:'Marilyn Monroe, Adele'}
};

function openTypeModal(type) {
  var p = PD[type];
  if (!p) return;
  document.getElementById('pm-icon').textContent = p.icon;
  document.getElementById('pm-type').textContent = type;
  document.getElementById('pm-name').textContent = p.name;
  var grpEl = document.getElementById('pm-group');
  grpEl.textContent = (p.group || 'Explorer').toUpperCase();
  grpEl.className = 'pm-group ' + (p.group||'explorer').toLowerCase();
  document.getElementById('pm-desc').textContent = p.desc;
  document.getElementById('pm-traits').innerHTML = p.chars.map(function(c) {
    return '<span class="pm-trait">'+c+'</span>';
  }).join('');
  document.getElementById('pm-facts').innerHTML = [
    {label:'How common', val: p.pop || '~5%'},
    {label:'Top strength', val: p.strength || 'Unique gifts'},
    {label:'Group', val: p.group || 'Explorer'}
  ].map(function(f) {
    return '<div class="pm-fact"><div class="pf-label">'+f.label+'</div><div class="pf-val">'+f.val+'</div></div>';
  }).join('');
  document.getElementById('pm-strengths-list').innerHTML = p.swot.strengths.slice(0,3).map(function(s) {
    return '<li style="margin-bottom:8px;font-size:.88rem;line-height:1.6;color:#2a1f45">'+s+'</li>';
  }).join('');
  var pmSwot = document.getElementById('pm-swot-row');
  if (pmSwot) {
    pmSwot.innerHTML = [
      {icon:'💪', label:'Great at', text: p.swot.strengths[0]},
      {icon:'🌱', label:'Can grow in', text: p.swot.weaknesses[0]},
      {icon:'🚀', label:'Thrives doing', text: p.swot.opportunities[0]},
      {icon:'⚠️', label:'Watch out for', text: p.swot.threats[0]}
    ].map(function(s) {
      return '<div class="pm-swot-card"><div class="pm-swot-icon">'+s.icon+'</div><div class="pm-swot-label">'+s.label+'</div><div class="pm-swot-text">'+s.text+'</div></div>';
    }).join('');
  }
  var pmFamous = document.getElementById('pm-famous-row');
  if (pmFamous && p.famous) {
    pmFamous.innerHTML =
      '<div style="font-size:.75rem;font-weight:700;letter-spacing:.07em;color:#8e82a8;margin-bottom:10px;text-transform:uppercase">Famous '+p.name+'s</div>' +
      p.famous.split(' · ').map(function(n) {
        return '<span class="pm-trait" style="background:rgba(168,216,200,.18);border-color:rgba(168,216,200,.4);color:#1a5a40">'+n+'</span>';
      }).join('');
  }
  document.getElementById('pmodal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
window.openTypeModal = openTypeModal;

function closePModal(e) {
  if (e.target === document.getElementById('pmodal-overlay')) closePModalDirect();
}
function closePModalDirect() {
  document.getElementById('pmodal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}
window.closePModal = closePModal;
window.closePModalDirect = closePModalDirect;


// ── EMAIL RESULTS ─────────────────────────────────────
function openEmailModal() {
  var inp = document.getElementById('send-email');
  if (inp && currentUser) inp.value = currentUser.email || '';
  document.getElementById('email-send-status').style.display = 'none';
  document.getElementById('email-modal-overlay').classList.add('open');
}
window.openEmailModal = openEmailModal;

function closeEmailModal() {
  document.getElementById('email-modal-overlay').classList.remove('open');
}
window.closeEmailModal = closeEmailModal;

function sendResultsEmail() {
  var emailEl = document.getElementById('send-email');
  var pubkeyEl = document.getElementById('ejs-pubkey');
  var serviceEl = document.getElementById('ejs-service');
  var templateEl = document.getElementById('ejs-template');
  var status = document.getElementById('email-send-status');
  var btn = document.getElementById('btn-send-email');

  var email = emailEl ? emailEl.value.trim() : '';
  var pubkey = pubkeyEl ? pubkeyEl.value.trim() : '';
  var serviceId = serviceEl ? serviceEl.value.trim() : '';
  var templateId = templateEl ? templateEl.value.trim() : '';

  function showStatus(msg, isError) {
    status.style.display = 'block';
    status.style.background = isError ? 'rgba(244,167,185,.2)' : 'rgba(168,216,200,.2)';
    status.style.border = '1px solid ' + (isError ? 'rgba(244,167,185,.5)' : 'rgba(168,216,200,.5)');
    status.style.color = isError ? '#c0506a' : '#2d7a60';
    status.innerHTML = msg;
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    showStatus('Please enter a valid email address (e.g. name' + String.fromCharCode(64) + 'gmail.com)', true);
    return;
  }

  if (!pubkey || !serviceId || !templateId) {
    showStatus('Please fill in your EmailJS Public Key, Service ID, and Template ID above. ' +
      '<a href="https://www.emailjs.com" target="_blank" style="color:#3d2c5c;font-weight:600">Get free keys at emailjs.com</a>', true);
    return;
  }

  var type = getType();
  var p = window.PD ? window.PD[type] : null;
  if (!p) { showStatus('Could not load personality data. Please retake the quiz.', true); return; }

  var sc = scores;
  var totEI = Math.max(sc.E+sc.I,1), totSN = Math.max(sc.S+sc.N,1), totTF = Math.max(sc.T+sc.F,1), totJP = Math.max(sc.J+sc.P,1);
  var pE = Math.round(sc.E/totEI*100), pN = Math.round(sc.N/totSN*100);
  var pF = Math.round(sc.F/totTF*100), pJ = Math.round(sc.J/totJP*100);

  var swot = p.swot || {};
  var NL = String.fromCharCode(10);

  function numberedList(arr, n) {
    return (arr || []).slice(0, n).map(function(s, i) { return (i+1) + '. ' + s; }).join(NL);
  }

  var templateParams = {
    to_email:      email,
    type:          type,
    type_name:     p.name,
    type_icon:     p.icon || '',
    description:   p.desc || '',
    chars:         (p.chars || []).join(', '),
    famous:        (p.famous || []).join(', '),
    strengths:     numberedList(swot.strengths, 4),
    growth:        numberedList(swot.weaknesses, 3),
    opportunities: numberedList(swot.opportunities, 3),
    threats:       numberedList(swot.threats, 3),
    actions:       numberedList(swot.actions, 3),
    scores:        'I: '+(pE>=50?100-pE:pE)+'%  |  N: '+(pN>=50?pN:100-pN)+'%  |  F: '+(pF>=50?pF:100-pF)+'%  |  P: '+(pJ>=50?100-pJ:pJ)+'%',
    year:          '2026'
  };

  btn.textContent = 'Sending...';
  btn.disabled = true;
  status.style.display = 'none';

  try {
    emailjs.init({ publicKey: pubkey });
    emailjs.send(serviceId, templateId, templateParams)
      .then(function() {
        showStatus('Your <strong>' + type + ' - ' + p.name + '</strong> report has been sent to <strong>' + email + '</strong>! Check your inbox.', false);
        btn.textContent = 'Sent!';
        btn.style.background = 'linear-gradient(135deg,#a8d8c8,#7cb8a0)';
        if (typeof showToast === 'function') showToast('Report sent to ' + email + '!');
      }, function(err) {
        var msg = err && err.text ? err.text : (err && err.status ? 'Status ' + err.status : JSON.stringify(err));
        showStatus('Send failed: ' + msg + ' — Check your EmailJS keys and template.', true);
        btn.textContent = 'Send My Results';
        btn.disabled = false;
      });
  } catch(e) {
    showStatus('EmailJS error: ' + (e.message || e), true);
    btn.textContent = 'Send My Results';
    btn.disabled = false;
  }
}
window.sendResultsEmail = sendResultsEmail;



// ── CLICKABLE TRAITS + FAMOUS + DOWNLOAD ────────────────────
var TRAIT_INFO = {"Thinks ahead": ["Plans Far Ahead", "While others focus on today, you are already thinking about next week, next year, or even further. This gives you a huge advantage in planning and avoiding problems before they happen."], "Sets high goals": ["Sets High Goals", "You aim higher than most people dare to. This drive pushes you to achieve things others give up on — just remember to celebrate progress, not just the finish line."], "Very determined": ["Built to Push Through", "When you decide to do something, you do not easily quit. You push through obstacles and setbacks that stop other people. This is one of your most powerful qualities."], "Independent": ["Strongly Independent", "You trust your own thinking and prefer to work on your own terms. You do not need constant approval or direction — you figure things out yourself and others rely on you for it."], "Loves learning": ["Loves Learning", "You genuinely enjoy picking up new knowledge and skills. Learning does not feel like a chore to you — it feels exciting. This curiosity keeps you growing throughout your life."], "Plans everything": ["Loves Having a Plan", "You feel most comfortable when things are organised and thought through. A good plan reduces your stress and helps you perform at your best. Structure is your superpower."], "Deeply curious": ["Deeply Curious", "You ask questions others never think to ask. You want to understand not just what something is, but why it works the way it does. This curiosity drives you to think in original ways."], "Logical": ["Clear Logical Thinker", "You think through problems step by step and reach conclusions that actually make sense. When emotions are running high around you, your ability to stay logical is something others depend on."], "Very original": ["Thinks in Original Ways", "Your mind makes connections that most people miss entirely. You come at problems from unexpected angles and often come up with ideas nobody else considered. This is a rare gift."], "Quiet but sharp": ["Quiet but Very Sharp", "You may not be the loudest in the room but what you say always carries weight. You observe, think, and then speak — and when you do, people tend to pay attention."], "Loves big ideas": ["Loves Big Ideas", "Small talk and surface-level topics bore you. You come alive when conversations go deep — exploring ideas, theories, and the kind of questions that do not have easy answers."], "Bold and confident": ["Bold and Confident", "You step forward when others step back. Confidence is natural to you — you believe in your ability to handle whatever comes, and that energy is genuinely inspiring to the people around you."], "Acts immediately": ["Acts Without Hesitating", "While others are still thinking about what to do, you are already doing it. This ability to act fast — especially under pressure — makes you invaluable in urgent situations."], "Reads situations fast": ["Reads Situations Fast", "You pick up on what is really happening in a room almost instantly. You read people, pick up on the energy, and know how to respond — often before others have even noticed something is off."], "Lives in the present": ["Fully Lives in the Moment", "You are not stuck in the past or lost in the future — you are right here, right now. This makes you energised, responsive, and someone who actually experiences life rather than just planning it."], "Loves a real challenge": ["Thrives on Real Challenges", "Routine bores you. You come alive when the stakes are high and the problem is real. Difficulty does not slow you down — it actually wakes you up and sharpens your focus."], "Direct and persuasive": ["Direct and Convincing", "You say what you mean and you say it in a way that makes people listen. You do not beat around the bush — your directness and confidence make you genuinely persuasive."], "Natural leader": ["Born to Lead", "People naturally look to you when things need to happen. You bring clarity, direction and confidence to groups. Leading does not feel like a role you have to perform — it just feels natural."], "Very ambitious": ["Highly Ambitious", "You do not aim small. You set goals that push you to grow and you work hard to reach them. Your ambition is one of the main reasons you consistently achieve more than average."], "Decides quickly": ["Decides Quickly and Sticks to It", "You do not get paralysed by too many options. You gather what you need, make a call, and move forward. This decisiveness makes you reliable and effective in fast-moving situations."], "Highly organised": ["Highly Organised", "You have a system for almost everything and it shows in how smoothly your life and work run. Organisation is not a chore for you — it is actually satisfying and makes you significantly more effective."], "Confident speaker": ["Confident Communicator", "When you speak, people listen. You express yourself clearly and with confidence — whether in a small group or in front of a large audience. This is a genuine career and relationship advantage."], "High achiever": ["High Achiever", "You consistently produce results. You set standards, meet them, and then raise the bar. People around you know that if you say you will deliver something, it will get done."], "Quick thinker": ["Fast Thinker", "Your mind moves quickly. You process new information fast, spot the key point in a discussion, and come up with responses and solutions while others are still working out the question."], "Loves debate": ["Loves a Good Debate", "You enjoy the back-and-forth of a real debate. Challenging ideas and having your own ideas challenged feels exciting rather than threatening. You sharpen your thinking through argument."], "Very creative": ["Deeply Creative", "You express yourself through what you make, how you see things, and how you live. Creativity is not just something you do — it is how you process the world and communicate who you are."], "Questions everything": ["Questions Everything", "You do not accept the standard answer just because it is the standard answer. You probe, challenge, and look for what might be missing. This makes you an excellent critical thinker."], "Charming and witty": ["Charming and Funny", "You are quick with a sharp observation or a well-timed joke. People enjoy being around you because conversations with you feel alive and fun. Your natural charm opens a lot of doors."], "Bored by routine": ["Needs Variety and Novelty", "Doing the same thing day after day drains your energy fast. You need new ideas, new challenges, and new experiences to stay engaged. Change is not a problem for you — sameness is."], "Completely authentic": ["Completely and Refreshingly Authentic", "There is no gap between who you are and who you present yourself as. What people see is genuinely you. In a world full of performance and pretending, your authenticity stands out completely."], "Strong values": ["Guided by Strong Values", "You know what you believe in and you live by it. Your values are not just words — they shape your actual decisions and choices. This inner compass gives your life real direction and meaning."], "Imaginative": ["Powerfully Imaginative", "Your inner world is rich and vivid. You can imagine things that do not yet exist, picture how things could be different, and create entirely new ideas from scratch. This is a genuine creative superpower."], "Deeply caring": ["Deeply Caring", "You feel what others feel. When someone you care about is struggling, you genuinely feel it with them. This depth of care makes you someone people trust with their hardest moments."], "Searches for meaning": ["Always Searching for Meaning", "Surface-level answers do not satisfy you. You want to understand why things are the way they are, what your purpose is, and whether what you do actually matters. This drives you toward a genuinely meaningful life."], "Naturally inspiring": ["Naturally Inspires Others", "You have a gift for making people believe they can do more than they thought. Without trying to, you lift people up. This is one of the rarest and most valuable qualities a person can have."], "Warm and caring": ["Warm and Genuinely Caring", "People feel safe around you. Your warmth is not an act — it is genuinely who you are. You notice when people are struggling and you do something about it, quietly and consistently."], "Brings people together": ["Brings People Together", "You are the person who connects others, builds community, and makes groups feel like they belong together. This ability to create real togetherness around you is a gift most people simply do not have."], "Great communicator": ["Excellent Communicator", "You know how to say what you mean in a way people actually understand and connect with. Whether one-on-one or in a group, communication feels natural to you and it shows in how others respond."], "Driven to help": ["Driven to Help", "Making a real difference in people's lives is genuinely important to you. You do not help for praise or recognition — you help because it matters. This motivation gives everything you do real purpose."], "Sees the best in people": ["Sees the Best in People", "You tend to believe in people, sometimes before they believe in themselves. You notice potential others miss and you call it out. This quality changes lives — and people never forget it."], "Enthusiastic": ["Genuinely Enthusiastic", "Your energy and enthusiasm are contagious. When you care about something, everyone around you can feel it. This excitement draws people in and makes them want to be part of what you are doing."], "Full of ideas": ["Always Full of Ideas", "Your mind is constantly generating new ideas, possibilities, and approaches. This creative energy means you are rarely stuck — there is always another angle, another way, another possibility to explore."], "Deeply cares about people": ["Puts People First", "People are not just part of the background of your life — they are the main point. You invest deeply in the people you care about and they feel the difference between your attention and everyone else's."], "Lives for possibility": ["Lives for What Could Be", "Where others see what is, you see what could be. Possibilities excite you more than certainties. This future-focused energy makes you naturally entrepreneurial and genuinely inspiring to be around."], "Draws people in": ["Naturally Draws People In", "There is something magnetic about your energy. People are attracted to you — to your warmth, your ideas, your enthusiasm. You build connections easily and naturally wherever you go."], "Completely reliable": ["Completely Reliable", "You do what you say you will do. Every time, without exception. This consistency makes you one of the most trusted people in any group. When things get hard, people look to you."], "Eye for detail": ["Sharp Eye for Detail", "You notice the small things that others glide past. That tiny error, the inconsistency, the detail that everyone else missed — you catch it. This precision makes your work consistently excellent."], "Strong work ethic": ["Outstanding Work Ethic", "You do not cut corners or coast. You show up fully and do the job properly. This work ethic is noticed by everyone around you and it is the foundation of your long-term success."], "Keeps every promise": ["Never Breaks a Promise", "Your word is your bond. When you commit to something, you follow through completely. This makes you one of the most trustworthy people others will ever know. It is a genuinely rare quality."], "Calm under pressure": ["Calm When It Matters Most", "When a crisis hits, you do not panic. You stay steady, think clearly, and take the right action. This calm under pressure is one of the most valuable things you bring to any team or relationship."], "Works quietly and hard": ["Works Hard Without Needing Credit", "You do not need applause or recognition to motivate you. You just do the work because it matters and because you take pride in doing it well. This quiet dedication is genuinely powerful."], "Always puts others first": ["Always Puts Others First", "Your instinct is to think of others before yourself. You notice what people need and you act on it without being asked. This generosity of spirit is at the heart of who you are."], "Patient and kind": ["Patient and Genuinely Kind", "You do not rush people or make them feel judged. Your patience and genuine kindness create a sense of safety that makes people comfortable opening up to you. It is a gift."], "Very dependable": ["Completely Dependable", "People know they can count on you. You show up, follow through, and do not let people down. This dependability is the foundation of the trust others place in you."], "Remembers what matters": ["Remembers What Matters to People", "You notice and remember the small details about people — their birthday, what they mentioned worrying about last month, what makes them light up. This makes people feel genuinely seen and valued."], "Takes charge easily": ["Takes Charge Naturally", "When something needs to happen, you make it happen. You do not wait for permission or for someone else to step up. This ability to take charge brings clarity and momentum to any situation."], "Results-focused": ["Focused on Real Results", "You measure success by what actually gets done. You are not interested in effort for its own sake — you want outcomes you can see and measure. This focus makes you exceptionally effective."], "Straight talker": ["Says It Straight", "You say exactly what you mean without dressing it up or softening it unnecessarily. People always know where they stand with you. Your honesty can feel sharp, but it is always real."], "Keeps everyone on track": ["Keeps the Whole Team on Track", "You are the person who notices when things are slipping and brings them back. You track what needs to happen and make sure it does. Groups function better when you are involved."], "Warm and welcoming": ["Warm and Welcoming to Everyone", "You make people feel at home almost instantly. Your warmth is not selective — you genuinely want everyone around you to feel included, comfortable, and valued. Rooms feel warmer when you are in them."], "Highly social": ["Naturally Social", "You thrive around people. Social situations give you energy rather than draining it. You are comfortable with everyone from strangers to close friends and you genuinely enjoy connecting."], "Thoughtful and caring": ["Thoughtful and Caring", "You think about how others feel before you act. You notice the little things. Your thoughtfulness means people around you consistently feel seen, considered, and genuinely cared for."], "Works hard for others": ["Works Hard For the People They Love", "Much of your hard work is driven by caring about others. You put in the effort not just for yourself but for the people who depend on you. That motivation makes your dedication sustainable."], "Natural organiser": ["Natural Organiser", "You are the one who gets everyone coordinated, remembers the details, and makes sure nothing falls through the cracks. Groups run more smoothly when you are involved."], "Practical and hands-on": ["Practical and Hands-On", "You learn and work best by actually doing things. Theory is less interesting to you than getting your hands on something and figuring it out in practice. This produces real, reliable results."], "Solves problems quickly": ["Solves Problems Quickly", "When something goes wrong, you do not freeze — you assess and act. You move from problem to solution faster than most and your fixes actually work because they are practical and grounded."], "Very observant": ["Highly Observant", "Very little escapes your attention. You notice changes in people's behaviour, small inconsistencies, and details others completely miss. This sharp observation makes you perceptive in ways others rely on."], "Fully independent": ["Fully Independent", "You do not need constant direction, support, or validation. You set your own course and manage yourself effectively. This independence is a significant strength in every area of your life."], "Says less but means it": ["Says Less but Every Word Counts", "You do not talk just to fill silence. When you speak, it is because you have something real to say. This makes people pay attention to you in a way they do not with people who talk constantly."], "Full of real joy": ["Full of Genuine Joy", "Your happiness is real and it is contagious. You do not fake a smile — when you are joyful, everyone around you feels it. This authentic positive energy is one of your greatest gifts."], "Completely present": ["Completely Present", "You are fully here, right now. You do not spend social moments distracted or half-elsewhere. The people you are with feel your full attention and it means everything to them."], "Loves people deeply": ["Loves People Deeply", "Your connections are not shallow. When you care about someone, you care about them fully. This depth of love and loyalty is something the people in your life experience as genuinely rare."], "Spontaneous and fun": ["Spontaneous and Fun", "You bring spontaneity and genuine fun to life. You say yes to adventures, suggest unexpected plans, and make even ordinary moments feel like something worth remembering."], "Generous and warm": ["Generous and Genuinely Warm", "You give your time, attention, energy, and care freely. People feel the warmth coming from you — it is not performance, it is just who you are. This generosity makes you deeply loved."], "Lights up any room": ["Lights Up Any Room", "When you arrive somewhere, the energy shifts. Your presence, warmth, and enthusiasm make everything feel more alive. People are drawn to you and they feel better for having been around you."], "Sees the big picture": ["Sees the Big Picture", "You naturally zoom out and see how all the pieces connect. While others get caught in the details, you keep track of the overall direction and make sure everyone is heading somewhere worth going."], "Has a sense of purpose": ["Driven by a Sense of Purpose", "You are not just going through the motions. You have a real sense of why you are here and what matters to you. This purpose gives your life direction and makes your effort feel genuinely worthwhile."], "Quietly determined": ["Quietly Determined", "You do not make a lot of noise about your goals — you just work toward them steadily and relentlessly. This quiet determination is more powerful than loud ambition because it never fades."], "Reads people well": ["Reads People Exceptionally Well", "You sense how people are really feeling, often before they say a word. You pick up on what is beneath the surface and respond to the real person, not just the performance they are putting on."], "Great listener": ["Exceptional Listener", "You do not just wait for your turn to speak — you actually listen. People feel truly heard around you and that is rarer than it sounds. It is one of the most powerful gifts you can give someone."], "Strong personal values": ["Deeply Strong Personal Values", "Your values are not just things you say — they are things you actually live by. Even when it is hard or costly, you stay true to what you believe. This integrity defines your character."], "Kind and gentle": ["Kind and Genuinely Gentle", "Your kindness is not a strategy — it is just how you are. You treat people with care and gentleness that makes them feel safe to be themselves around you. People treasure this about you."], "Fully present": ["Completely Present in the Moment", "You are genuinely here, not half-distracted. The people you spend time with feel the full weight of your attention and care. This presence is one of the most valuable things you give others."], "Expresses through action": ["Expresses Love Through Action", "You show how you feel through what you do, not just what you say. The small things you do consistently — remembering, showing up, being there — speak more loudly than words ever could."],
  "Natural counsellor": ["Natural Counsellor", "People come to you when they are struggling — not by accident, but because you make them feel truly heard. You ask the right questions, hold space without judgment and help people find their own answers. This gift for counselling is one of your most powerful contributions."],
  "Conflict mediation": ["Conflict Mediation", "When tension rises, you are the one who brings calm. You can see all sides of a disagreement clearly and find language that bridges differences. This makes you invaluable in any team, family or community where harmony and understanding matter."],
  "Values-driven": ["Values-Driven", "Your choices are guided by a deep internal moral compass — not by trends, rules or what others expect. You know what you stand for and you live by it even when it is difficult. This integrity earns you a level of respect and trust that most people never achieve."]};

var FAMOUS_INFO = {
  "Elon Musk": ["Elon Musk (INTJ)", "Entrepreneur behind Tesla, SpaceX, and Neuralink. Known for extreme long-term thinking, massive risk-taking, and obsessive first-principles problem solving. His vision to make humanity multi-planetary is a classic INTJ pursuit of an audacious, independent goal."],
  "Nikola Tesla": ["Nikola Tesla (INTJ)", "One of history's greatest inventors, working almost entirely alone. Tesla developed ideas decades ahead of his time. He often struggled socially, the classic INTJ tension between genius and connection."],
  "Stephen Hawking": ["Stephen Hawking (INTJ)", "Theoretical physicist who explained black holes and the Big Bang. Despite being paralysed, his mind remained one of the most powerful on Earth. He combined extraordinary intellectual discipline with fierce independence."],
  "Mark Zuckerberg": ["Mark Zuckerberg (INTJ)", "Co-founder of Facebook and Meta. Known for systematic thinking, long-term vision, and willingness to make unpopular decisions in pursuit of his goals. His focus on building connecting systems at global scale is deeply INTJ."],
  "Albert Einstein": ["Albert Einstein (INTP)", "Physicist who developed the theory of relativity. Einstein was deeply curious, often lost in thought, and cared far more about ideas than social convention. A perfect INTP: pure intellectual exploration."],
  "Bill Gates": ["Bill Gates (INTP)", "Co-founder of Microsoft. Known for his analytical mind, voracious reading, and systematic approach to problems. He now applies that same INTP analytical precision to solving global health and poverty challenges."],
  "Charles Darwin": ["Charles Darwin (INTP)", "Naturalist who developed the theory of evolution. Darwin spent years carefully collecting and analysing data before forming his groundbreaking conclusions. His patience and curiosity are quintessentially INTP."],
  "Isaac Newton": ["Isaac Newton (INTP)", "Mathematician who formulated the laws of motion and universal gravitation. Newton was intensely private, worked alone for years, and built entire new branches of mathematics to satisfy his curiosity. Pure INTP."],
  "Steve Jobs": ["Steve Jobs (ENTJ)", "Co-founder of Apple. Jobs was bold, demanding, and relentlessly focused on excellence. He combined design intuition with iron-willed leadership to create products that changed how humanity lives. Classic ENTJ."],
  "Napoleon Bonaparte": ["Napoleon Bonaparte (ENTJ)", "Military and political leader who dominated Europe. A strategic genius with extraordinary organisational ability. He rose from modest origins to reshape an entire continent, ENTJ ambition at its absolute peak."],
  "Margaret Thatcher": ["Margaret Thatcher (ENTJ)", "First female Prime Minister of the UK, known as The Iron Lady. She led with decisive conviction and unwavering standards, not afraid to make deeply unpopular decisions she believed were right."],
  "Gordon Ramsay": ["Gordon Ramsay (ENTJ)", "World-famous chef and restaurateur. Known for extremely high standards, direct communication, and building high-performance kitchen teams. His drive for excellence under pressure is textbook ENTJ."],
  "Leonardo da Vinci": ["Leonardo da Vinci (ENTP)", "Renaissance genius who pursued every intellectual interest equally, from the Mona Lisa to flying machines 400 years before aeroplanes. The ultimate ENTP: endlessly curious, endlessly restless."],
  "Mark Twain": ["Mark Twain (ENTP)", "American writer and humorist who used sharp wit to challenge societal hypocrisy. He loved provoking thought and questioning everything including authority, religion, and tradition. Classic ENTP."],
  "Benjamin Franklin": ["Benjamin Franklin (ENTP)", "American Founding Father, inventor, diplomat, and writer. Curious about everything from electricity to politics. He invented the lightning rod, bifocals, and helped write the US Constitution. A true ENTP generalist."],
  "Sacha Baron Cohen": ["Sacha Baron Cohen (ENTP)", "Creator of Borat, Ali G, and Bruno. Uses provocative, debate-driven comedy to expose absurdity and hypocrisy. His willingness to challenge and shock in service of a deeper truth is powerfully ENTP."],
  "Nelson Mandela": ["Nelson Mandela (INFJ)", "Leader of the anti-apartheid movement and first Black President of South Africa. Spent 27 years in prison and emerged committed to reconciliation over revenge. His long-term moral vision and ability to inspire millions is one of history's greatest INFJ achievements."],
  "Oprah Winfrey": ["Oprah Winfrey (INFJ)", "Media mogul and philanthropist. Her extraordinary ability to connect with people, draw out their deepest truths, and help millions feel seen and understood is the hallmark of an INFJ at their best."],
  "Martin Luther King Jr": ["Martin Luther King Jr (INFJ)", "Civil rights leader whose ability to articulate a moral vision and move millions to action was extraordinary. His I Have a Dream speech is one of the most powerful expressions of the INFJ blend of deep values and inspiring communication."],
  "Mother Teresa": ["Mother Teresa (INFJ)", "Catholic nun who dedicated her entire life to serving the poorest people in Kolkata, India. Her selfless care, humility, and total devotion is one of history's most powerful expressions of love in action."],
  "J.R.R. Tolkien": ["J.R.R. Tolkien (INFP)", "Author of The Lord of the Rings. Tolkien spent decades building the world of Middle-earth, guided entirely by his creative imagination and personal values. His work is the perfect expression of the INFP rich inner world made real through storytelling."],
  "Princess Diana": ["Princess Diana (INFP)", "Princess of Wales, globally known for her compassion. Diana connected with the public in a deeply personal way, sitting with AIDS patients, hugging landmine victims, making people feel her care was completely genuine."],
  "Barack Obama": ["Barack Obama (ENFJ)", "44th President of the United States. Known for his ability to inspire, unite, and communicate hope. He led with empathy and a genuine belief in people's potential, one of the clearest examples of an ENFJ leader on the world stage."],
  "Maya Angelou": ["Maya Angelou (ENFJ)", "Poet, author, and civil rights activist. Angelou used her words to lift people up and remind them of their dignity and worth. A powerful ENFJ voice for humanity."],
  "Malala Yousafzai": ["Malala Yousafzai (ENFJ)", "Pakistani activist for girls education and Nobel Peace Prize laureate. Her extraordinary courage, moral clarity, and ability to inspire global action while maintaining deep personal warmth defines ENFJ leadership."],
  "Robin Williams": ["Robin Williams (ENFP)", "Comedian and actor loved globally. Williams had an extraordinary ability to connect with people through humour, warmth, and improvised brilliance. Behind the laughter was a deeply empathetic person who cared intensely about others."],
  "Ellen DeGeneres": ["Ellen DeGeneres (ENFP)", "Comedian and TV host who built her brand around kindness, humour, and authenticity. Her willingness to come out publicly at a career-threatening time showed the ENFP courage in living their values regardless of consequence."],
  "Walt Disney": ["Walt Disney (ENFP)", "Creator of Mickey Mouse and founder of the Disney empire. Disney was a dreamer who refused to accept the limits placed on imagination, pioneering animated film and storytelling that has shaped childhood for generations."],
  "Sandra Bullock": ["Sandra Bullock (ENFP)", "Oscar-winning actress known for her warmth, humour, and genuine connection with audiences. Known off-screen for her generosity and care for those around her. Classic ENFP."],
  "George Washington": ["George Washington (ISTJ)", "First President of the United States. Known for unshakeable duty, discipline, and refusal to seek personal power. He stepped down as President when he could have ruled for life, the highest expression of ISTJ integrity."],
  "Warren Buffett": ["Warren Buffett (ISTJ)", "The most successful long-term investor of all time. Buffett applies patient, systematic, disciplined analysis to every investment and has stuck to his principles for over 70 years. Textbook ISTJ."],
  "Angela Merkel": ["Angela Merkel (ISTJ)", "Chancellor of Germany for 16 years. Merkel governed with quiet competence, methodical reasoning, and deep reliability. Never flashy, always trusted, a model of ISTJ leadership at the highest level."],
  "Jeff Bezos": ["Jeff Bezos (ISTJ)", "Founder of Amazon. Built one of the world's most complex logistics systems through methodical planning, long-term thinking, and relentless focus on processes. His discipline and detail-orientation are powerfully ISTJ."],
  "Kate Middleton": ["Kate Middleton (ISFJ)", "Princess of Wales. Known for her warmth, composure, and dedication to family. Kate represents the ISFJ gift of making everyone around them feel cared for and valued without seeking the spotlight."],
  "Rosa Parks": ["Rosa Parks (ISFJ)", "Civil rights activist who refused to give up her seat on a segregated bus. Parks was quiet, reserved, and deeply principled. Her act of courage changed history, showing the ISFJ, pushed too far, becomes one of the most powerful forces for justice."],
  "Beyonce": ["Beyonce (ISFJ)", "Singer, songwriter, and cultural icon. Known for her extraordinary work ethic, fierce loyalty to her team and family, and ability to combine creative excellence with deep personal values."],
  "Michelle Obama": ["Michelle Obama (ESTJ)", "Former First Lady, lawyer, and author. Known for her discipline, drive, and willingness to speak direct hard truths. Her memoir Becoming is a masterclass in ESTJ self-determination."],
  "Henry Ford": ["Henry Ford (ESTJ)", "Founder of Ford Motor Company. A systematic, no-nonsense organiser who transformed manufacturing and put the world on wheels. Classic ESTJ: clear vision and ruthless organisational ability."],
  "Taylor Swift": ["Taylor Swift (ESFJ)", "Singer-songwriter and cultural phenomenon. Known for her extraordinary connection to her fans and her ability to make millions feel personally understood through her music. Classically ESFJ."],
  "Bill Clinton": ["Bill Clinton (ESFJ)", "42nd President of the United States. Famous for his charisma and his ability to make everyone in a room feel like the most important person there. Classic ESFJ people-magnetism at the highest level."],
  "Clint Eastwood": ["Clint Eastwood (ISTP)", "Actor and director. Known for his cool, quiet, self-sufficient style. He has directed over 40 films with masterful technical skill and almost no fanfare. A perfect ISTP: speaks through action, not words."],
  "Michael Jordan": ["Michael Jordan (ISTP)", "Greatest basketball player of all time. Jordan combined extraordinary technical skill with supreme competitive instinct. He did not talk much, he just performed at a level no one else could match. ISTP excellence through mastery."],
  "Amelia Earhart": ["Amelia Earhart (ISTP)", "First female aviator to fly solo across the Atlantic. Earhart was cool, practical, physically skilled, and absolutely fearless in the face of real danger. Classic ISTP: letting extraordinary actions speak for themselves."],
  "Bruce Lee": ["Bruce Lee (ISTP)", "Martial artist, actor, and philosopher. Lee mastered his craft through relentless practice and practical experimentation, stripping away everything unnecessary and keeping only what works. Pure ISTP mastery."],
  "Frida Kahlo": ["Frida Kahlo (ISFP)", "Mexican painter known for deeply personal and emotionally honest self-portraits. Kahlo turned her pain into art with a raw authenticity that spoke to people across cultures and generations. The ultimate ISFP, fully herself, fully expressed."],
  "Michael Jackson": ["Michael Jackson (ISFP)", "Singer, dancer, and performer. Jackson combined extraordinary creative instinct with a deep sensitivity that came through in every performance. His authentic artistry and love of beauty changed pop culture forever."],
  "Lana Del Rey": ["Lana Del Rey (ISFP)", "Singer and songwriter known for dreamy, melancholic, deeply personal music. Del Rey creates art that feels like a private diary set to music. Her authentic self-expression is classically ISFP."],
  "Jimi Hendrix": ["Jimi Hendrix (ISFP)", "Guitar legend. Hendrix's playing was completely personal, every note came from somewhere deep inside him. He revolutionised music through feeling, expression, and a totally original artistic voice."],
  "Ernest Hemingway": ["Ernest Hemingway (ESTP)", "Nobel Prize-winning author who lived boldly and wrote with the same directness. Bold action, direct expression, present-focused: classic ESTP."],
  "Madonna": ["Madonna (ESTP)", "Pop icon and businesswoman who reinvented herself repeatedly, thrived on controversy, and pushed boundaries throughout a five-decade career. Fearless, practical, and endlessly adaptive."],
  "Eddie Murphy": ["Eddie Murphy (ESTP)", "Comedian and actor. Murphy's work is characterised by lightning-fast thinking, bold physical energy, and fearlessness. He thinks and acts in real-time, quintessentially ESTP."],
  "Marilyn Monroe": ["Marilyn Monroe (ESFP)", "Actress and cultural icon. Monroe had an extraordinary natural presence and warmth that drew people to her irresistibly. She lived in the moment, loved people genuinely, and brought joy wherever she went."],
  "Adele": ["Adele (ESFP)", "Grammy-winning singer. Adele connects with audiences through raw emotional honesty, warmth, and humour. She is completely herself on stage and off, no performance, no mask. Her authentic emotion is what makes her one of the world's most loved artists."],
  "Will Smith": ["Will Smith (ESFP)", "Actor, rapper, and producer. Known for his explosive energy, warmth, and ability to make people feel great. His openness about personal struggles shows the depth beneath the ESFP sparkle."],
  "Jamie Oliver": ["Jamie Oliver (ESFP)", "Celebrity chef and food activist. Known for his infectious enthusiasm, warmth, and ability to make cooking feel joyful and accessible. The ESFP gift for making something good feel genuinely exciting."]
};

// Active state trackers
var _activeTraitKey = null;
var _activeFamousKey = null;

// Render clickable trait pills
function renderTraitPills(chars) {
  var container = document.getElementById("chars-clickable-container");
  var popup = document.getElementById("trait-click-popup");
  if (!container) return;
  container.innerHTML = "";
  chars.forEach(function(ch) {
    var btn = document.createElement("button");
    btn.className = "trait-chip-btn";
    btn.textContent = ch;
    btn.onclick = function() {
      var isActive = _activeTraitKey === ch;
      document.querySelectorAll("#chars-clickable-container .trait-chip-btn").forEach(function(b) {
        b.classList.remove("active");
      });
      if (isActive) {
        _activeTraitKey = null;
        if (popup) popup.style.display = "none";
      } else {
        _activeTraitKey = ch;
        btn.classList.add("active");
        var info = TRAIT_INFO[ch] || [ch, "This is one of your key personality traits. It shapes how you think, work, and connect with others every single day."];
        if (popup) {
          popup.querySelector(".popup-title").textContent = info[0];
          popup.querySelector(".popup-body").textContent = info[1];
          popup.style.display = "block";
          popup.scrollIntoView({behavior:"smooth", block:"nearest"});
        }
      }
    };
    container.appendChild(btn);
  });
  if (popup) popup.style.display = "none";
}

// Render clickable famous person pills
function renderFamousPills(famousStr, typeName) {
  var container = document.getElementById("famous-clickable-container");
  var popup = document.getElementById("famous-click-popup");
  if (!container) return;
  container.innerHTML = "";
  var names = famousStr.split(" · ");
  names.forEach(function(name) {
    var pill = document.createElement("span");
    pill.className = "famous-pill-r";
    pill.textContent = name;
    pill.onclick = function() {
      if (_activeFamousKey === name) {
        _activeFamousKey = null;
        pill.classList.remove("active");
        if (popup) popup.style.display = "none";
      } else {
        document.querySelectorAll("#famous-clickable-container .famous-pill-r").forEach(function(p) { p.classList.remove("active"); });
        _activeFamousKey = name;
        pill.classList.add("active");
        var nameKey = name.trim();
        var info = FAMOUS_INFO[nameKey] || [nameKey, nameKey + " is one of the most celebrated " + typeName + "s in history, sharing your natural strengths, values, and way of engaging with the world."];
        if (popup) {
          popup.querySelector(".popup-title").textContent = info[0];
          popup.querySelector(".popup-body").textContent = info[1];
          popup.style.display = "block";
        }
      }
    };
    container.appendChild(pill);
  });
  if (popup) popup.style.display = "none";
}


// Download aesthetic PNG report using Canvas
function downloadReport() {
  var type = getType();
  var p = window.PD[type] || window.PD.INFJ;
  var sc = scores;
  var totEI = Math.max(sc.E + sc.I, 1), totSN = Math.max(sc.S + sc.N, 1), totTF = Math.max(sc.T + sc.F, 1), totJP = Math.max(sc.J + sc.P, 1);
  var pE = Math.round(sc.E/totEI*100), pN = Math.round(sc.N/totSN*100), pF = Math.round(sc.F/totTF*100), pJ = Math.round(sc.J/totJP*100);
  var dimVals = [
    { label: (pE>=50?"E":"I")+" (E vs I)", pct: pE>=50?pE:100-pE, c1:"#b8d8f0", c2:"#c9b8e8" },
    { label: (pN>=50?"N":"S")+" (N vs S)", pct: pN>=50?pN:100-pN, c1:"#a8d8c8", c2:"#c9b8e8" },
    { label: (pF>=50?"F":"T")+" (F vs T)", pct: pF>=50?pF:100-pF, c1:"#f4a7b9", c2:"#f7c59f" },
    { label: (pJ>=50?"J":"P")+" (J vs P)", pct: pJ>=50?pJ:100-pJ, c1:"#c9b8e8", c2:"#f7c59f" }
  ];

  var W = 900, H = 1400;
  var canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  var ctx = canvas.getContext("2d");
  var dpr = window.devicePixelRatio || 1;

  // ── Background gradient ──
  var bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#f5c0d0");
  bg.addColorStop(0.35, "#d9c4f0");
  bg.addColorStop(0.7, "#c4dff5");
  bg.addColorStop(1, "#b8e8d4");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // ── Decorative orbs ──
  function orb(x, y, r, c1, c2) {
    var g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, c1); g.addColorStop(1, c2);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha = 0.28; orb(80, 80, 160, "#a98fd4", "transparent");
  ctx.globalAlpha = 0.22; orb(W-60, 200, 180, "#e8638a", "transparent");
  ctx.globalAlpha = 0.2; orb(W/2, H-100, 220, "#5db89a", "transparent");
  ctx.globalAlpha = 1;

  // ── Card background ──
  ctx.save();
  ctx.shadowColor = "rgba(100,80,150,0.14)";
  ctx.shadowBlur = 40;
  roundRect(ctx, 36, 36, W-72, H-72, 32);
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.fill();
  ctx.restore();

  // Helper: rounded rect path
  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x+r, y);
    c.lineTo(x+w-r, y); c.quadraticCurveTo(x+w, y, x+w, y+r);
    c.lineTo(x+w, y+h-r); c.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    c.lineTo(x+r, y+h); c.quadraticCurveTo(x, y+h, x, y+h-r);
    c.lineTo(x, y+r); c.quadraticCurveTo(x, y, x+r, y);
    c.closePath();
  }

  // Helper: gradient text
  function gradText(text, x, y, size, c1, c2, align) {
    var g = ctx.createLinearGradient(x-100, y, x+100, y);
    g.addColorStop(0, c1); g.addColorStop(1, c2);
    ctx.fillStyle = g;
    ctx.font = size;
    ctx.textAlign = align || "center";
    ctx.fillText(text, x, y);
  }

  // Helper: wrap text
  function wrapText(ctx, text, x, y, maxW, lineH) {
    var words = text.split(" "), line = "", lines = [], i;
    for (i = 0; i < words.length; i++) {
      var testLine = line + words[i] + " ";
      if (ctx.measureText(testLine).width > maxW && i > 0) {
        lines.push(line.trim()); line = words[i] + " ";
      } else { line = testLine; }
    }
    lines.push(line.trim());
    lines.forEach(function(l, idx) { ctx.fillText(l, x, y + idx * lineH); });
    return lines.length;
  }

  var cx = W / 2;
  var y = 80;

  // ── Logo & brand ──
  ctx.font = "500 13px 'DM Sans', sans-serif";
  ctx.fillStyle = "#8e82a8";
  ctx.textAlign = "center";
  ctx.fillText("✦  MINDMIRROR PERSONALITY REPORT  ✦", cx, y + 30);
  y += 60;

  // ── Big type code ──
  ctx.font = "300 110px 'Georgia', serif";
  var typeGrad = ctx.createLinearGradient(cx-200, y, cx+200, y+80);
  typeGrad.addColorStop(0, "#c9b8e8");
  typeGrad.addColorStop(0.5, "#f4a7b9");
  typeGrad.addColorStop(1, "#a8d8c8");
  ctx.fillStyle = typeGrad;
  ctx.textAlign = "center";
  ctx.fillText(type, cx, y + 90);
  y += 110;

  // ── Icon ──
  ctx.font = "52px serif";
  ctx.fillText(p.icon || "✦", cx, y + 20);
  y += 50;

  // ── Type name ──
  ctx.font = "italic 32px 'Georgia', serif";
  ctx.fillStyle = "#3d2c5c";
  ctx.textAlign = "center";
  ctx.fillText(p.name, cx, y + 20);
  y += 40;

  // ── Group badge ──
  var groupColors = { analyst:"#c9b8e8", diplomat:"#a8d8c8", sentinel:"#b8d8f0", explorer:"#f7c59f" };
  var gc = groupColors[p.group] || "#c9b8e8";
  var groupNames = { analyst:"ANALYSTS", diplomat:"DIPLOMATS", sentinel:"SENTINELS", explorer:"EXPLORERS" };
  var gn = groupNames[p.group] || "ANALYSTS";
  var badgeText = gn;
  ctx.font = "600 11px 'DM Sans', sans-serif";
  var bw = ctx.measureText(badgeText).width + 28;
  var bx = cx - bw/2, by = y + 10;
  ctx.fillStyle = gc + "55";
  roundRect(ctx, bx, by, bw, 26, 13); ctx.fill();
  ctx.strokeStyle = gc; ctx.lineWidth = 1.2;
  roundRect(ctx, bx, by, bw, 26, 13); ctx.stroke();
  ctx.fillStyle = "#3d2c5c";
  ctx.textAlign = "center";
  ctx.fillText(badgeText, cx, by + 17);
  y += 50;

  // ── Divider ──
  var divGrad = ctx.createLinearGradient(cx-200, 0, cx+200, 0);
  divGrad.addColorStop(0, "transparent"); divGrad.addColorStop(0.5, "#c9b8e8"); divGrad.addColorStop(1, "transparent");
  ctx.strokeStyle = divGrad; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx-200, y+8); ctx.lineTo(cx+200, y+8); ctx.stroke();
  y += 24;

  // ── Description ──
  ctx.font = "15px 'DM Sans', sans-serif";
  ctx.fillStyle = "#4a3f6b";
  ctx.textAlign = "center";
  var descLines = wrapText(ctx, p.desc || "", cx, y, 680, 22);
  y += descLines * 22 + 20;

  // ── DIMENSION SCORES ──
  ctx.font = "700 11px 'DM Sans', sans-serif";
  ctx.fillStyle = "#8e82a8";
  ctx.textAlign = "center";
  ctx.letterSpacing = "0.1em";
  ctx.fillText("DIMENSION SCORES", cx, y);
  y += 20;

  var barX = 100, barW = W - 200, barH = 18, barGap = 48;
  dimVals.forEach(function(d, i) {
    var by2 = y + i * barGap;
    // Label left
    ctx.font = "500 13px 'DM Sans', sans-serif";
    ctx.fillStyle = "#4a3f6b";
    ctx.textAlign = "left";
    ctx.fillText(d.label, barX, by2 + barH - 3);
    // Percent right
    ctx.textAlign = "right";
    ctx.fillStyle = "#3d2c5c";
    ctx.font = "600 13px 'DM Sans', sans-serif";
    ctx.fillText(d.pct + "%", barX + barW, by2 + barH - 3);
    // Track
    roundRect(ctx, barX, by2 + barH + 6, barW, barH, barH/2);
    ctx.fillStyle = "rgba(201,184,232,0.2)"; ctx.fill();
    // Fill
    var fillW = Math.max(barW * d.pct / 100, barH);
    var fillGrad = ctx.createLinearGradient(barX, 0, barX+fillW, 0);
    fillGrad.addColorStop(0, d.c1); fillGrad.addColorStop(1, d.c2);
    roundRect(ctx, barX, by2 + barH + 6, fillW, barH, barH/2);
    ctx.fillStyle = fillGrad; ctx.fill();
  });
  y += dimVals.length * barGap + 30;

  // ── TRAITS ──
  ctx.font = "700 11px 'DM Sans', sans-serif";
  ctx.fillStyle = "#8e82a8"; ctx.textAlign = "center";
  ctx.fillText("CORE TRAITS", cx, y); y += 20;

  var traits = p.chars || [];
  var pillPad = 14, pillH = 28, pillGap = 10;
  var px = barX, py = y;
  traits.forEach(function(t) {
    ctx.font = "500 12px 'DM Sans', sans-serif";
    var tw = ctx.measureText(t).width + pillPad * 2;
    if (px + tw > W - barX) { px = barX; py += pillH + pillGap; }
    roundRect(ctx, px, py - 18, tw, pillH, pillH/2);
    ctx.fillStyle = "rgba(255,255,255,0.8)"; ctx.fill();
    ctx.strokeStyle = "rgba(201,184,232,0.5)"; ctx.lineWidth = 1;
    roundRect(ctx, px, py - 18, tw, pillH, pillH/2); ctx.stroke();
    ctx.fillStyle = "#1a1025"; ctx.textAlign = "left";
    ctx.fillText(t, px + pillPad, py - 2);
    px += tw + pillGap;
  });
  y = py + pillH + 10;

  // ── SWOT ──
  ctx.font = "700 11px 'DM Sans', sans-serif";
  ctx.fillStyle = "#8e82a8"; ctx.textAlign = "center";
  ctx.fillText("YOUR SWOT PROFILE", cx, y); y += 18;

  var swot = p.swot || {};
  var swotItems = [
    { label: "STRENGTHS",    emoji: "💪", items: swot.strengths    || [], bg: "#e0f2ee", border: "#a8d8c8", textCol: "#1a4a3a" },
    { label: "GROWTH AREAS", emoji: "🌱", items: swot.weaknesses   || [], bg: "#fce4ec", border: "#f4a7b9", textCol: "#5a1a2a" },
    { label: "OPPORTUNITIES",emoji: "🚀", items: swot.opportunities || [], bg: "#ede7f6", border: "#c9b8e8", textCol: "#3a1a5a" },
    { label: "WATCH OUT FOR",emoji: "🛡️", items: swot.threats      || [], bg: "#fff8e0", border: "#f7c59f", textCol: "#5a3a00" }
  ];

  var margin = 60;
  var gutter = 14;
  var cardW = (W - margin * 2 - gutter) / 2;
  var cardPad = 16;
  var itemFontSize = 12.5;
  var lineH = 19;
  var labelH = 28;
  var maxItemsShown = 3;
  var cardH = labelH + maxItemsShown * lineH + cardPad * 2 + 10;
  var swotStartY = y;

  swotItems.forEach(function(s, i) {
    var col = i % 2;
    var row = Math.floor(i / 2);
    var sx = margin + col * (cardW + gutter);
    var sy = swotStartY + row * (cardH + gutter);

    // Card background
    roundRect(ctx, sx, sy, cardW, cardH, 14);
    ctx.fillStyle = s.bg; ctx.fill();
    ctx.strokeStyle = s.border; ctx.lineWidth = 1.2;
    roundRect(ctx, sx, sy, cardW, cardH, 14); ctx.stroke();

    // Emoji + label header
    ctx.font = "700 11px 'DM Sans', sans-serif";
    ctx.fillStyle = s.textCol;
    ctx.textAlign = "left";
    ctx.fillText(s.emoji + "  " + s.label, sx + cardPad, sy + cardPad + 13);

    // Divider under header
    ctx.strokeStyle = s.border + "99"; ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(sx + cardPad, sy + labelH + 2);
    ctx.lineTo(sx + cardW - cardPad, sy + labelH + 2);
    ctx.stroke();

    // Items — strictly clipped to card width
    ctx.font = itemFontSize + "px 'DM Sans', sans-serif";
    ctx.fillStyle = s.textCol;
    var maxTextW = cardW - cardPad * 2 - 14; // subtract bullet space
    var shown = s.items.slice(0, maxItemsShown);
    shown.forEach(function(item, ii) {
      var itemY = sy + labelH + cardPad + 8 + ii * lineH;
      // Bullet dot
      ctx.fillStyle = s.border;
      ctx.beginPath();
      ctx.arc(sx + cardPad + 4, itemY - 4, 3.5, 0, Math.PI * 2);
      ctx.fill();
      // Truncate text to fit card width exactly
      ctx.fillStyle = s.textCol;
      var txt = item;
      while (ctx.measureText(txt).width > maxTextW && txt.length > 10) {
        txt = txt.slice(0, -1);
      }
      if (txt !== item) txt = txt.trimEnd() + "…";
      ctx.textAlign = "left";
      ctx.fillText(txt, sx + cardPad + 14, itemY);
    });
  });

  y = swotStartY + 2 * (cardH + gutter) + 10;

  // ── Footer ──
  var footerY = H - 80;
  var footGrad = ctx.createLinearGradient(0, footerY, W, footerY);
  footGrad.addColorStop(0, "rgba(26,16,37,0.94)");
  footGrad.addColorStop(1, "rgba(45,31,69,0.94)");
  roundRect(ctx, 36, footerY, W-72, 52, 18);
  ctx.fillStyle = footGrad; ctx.fill();

  ctx.font = "500 12px 'DM Sans', sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.textAlign = "center";
  ctx.fillText("🪞 MindMirror © 2026  ·  theteammindmirror" + String.fromCharCode(64) + "gmail.com  ·  Based on MBTI theory", cx, footerY + 30);

  // ── Download as PNG ──
  var link = document.createElement("a");
  link.download = "MindMirror_" + type + "_Report.png";
  link.href = canvas.toDataURL("image/png");
  link.click();

  if (typeof showToast === "function") showToast("📥 Report saved as PNG!");
}
window.downloadReport = downloadReport;

// Toggle share textarea
function toggleShare() {
  var ta = document.getElementById("share-area");
  var cb = document.getElementById("copy-share-btn");
  if (!ta) return;
  var vis = ta.style.display === "block";
  ta.style.display = vis ? "none" : "block";
  if (cb) cb.style.display = vis ? "none" : "block";
  if (!vis) {
    var type = getType();
    var p = window.PD[type] || window.PD.INFJ;
    ta.value = "I just discovered I am " + type + " - " + p.name + " on MindMirror! Find your personality type free. #MindMirror #MBTI #" + type;
    ta.select();
    if (typeof showToast === "function") showToast("Copy the text to share!");
  }
}
window.toggleShare = toggleShare;

function copyShare() {
  var ta = document.getElementById("share-area");
  if (!ta) return;
  ta.select();
  try { document.execCommand("copy"); if (typeof showToast === "function") showToast("Copied!"); }
  catch(e) { if (typeof showToast === "function") showToast("Please copy the text manually"); }
}
window.copyShare = copyShare;


var GROUP_DESCS = {
  'Analyst': {
    icon:'🔷', title:'The Analyst Group', subtitle:'Strategic • Logical • Independent',
    desc:'Analysts are the architects of ideas. They see the world as a system to decode and improve. Driven by logic, curiosity and an insatiable hunger for knowledge, Analysts approach every challenge with precision and creative problem-solving. They trust evidence over emotion and clarity over comfort.',
    traits:['Strategic thinking','Systems mindset','Intellectual curiosity','Independent reasoning','Complex problem-solving'],
    careers:['Software Engineering','Research & Science','Architecture','Law & Strategy','Philosophy & Academia'],
    pct:'~10% of the population', color:'#6b8cff'
  },
  'Diplomat': {
    icon:'🟢', title:'The Diplomat Group', subtitle:'Empathetic • Idealistic • Inspiring',
    desc:'Diplomats are the heart of human connection. Guided by deep personal values and a genuine desire to help others grow, they see the best in every person. They are natural counsellors, mediators and inspirers who bring warmth, meaning and vision wherever they go. Their empathy is not just a feeling — it\'s a superpower.',
    traits:['Deep empathy','Emotional intelligence','Natural counselling','Visionary thinking','Conflict mediation'],
    careers:['Psychology & Counselling','Social Work','Teaching & Coaching','Writing & Arts','Non-profit Leadership'],
    pct:'~15% of the population', color:'#4caf84'
  },
  'Sentinel': {
    icon:'🔵', title:'The Sentinel Group', subtitle:'Reliable • Practical • Committed',
    desc:'Sentinels are the backbone of every community, family and organisation. They bring stability, order and dependability to everything they touch. Hardworking and deeply loyal, Sentinels follow through on every commitment and take genuine pride in doing things right. They are the people others count on when it matters most.',
    traits:['Exceptional reliability','Attention to detail','Strong work ethic','Deep loyalty','Community building'],
    careers:['Healthcare & Nursing','Administration & Management','Finance & Accounting','Military & Law Enforcement','Education'],
    pct:'~45% of the population', color:'#5ba3d9'
  },
  'Explorer': {
    icon:'🟠', title:'The Explorer Group', subtitle:'Adaptable • Bold • Hands-On',
    desc:'Explorers are masters of the present moment. Action-oriented and endlessly adaptable, they thrive in the real world where thinking meets doing. Whether fixing, creating, performing or leading, Explorers bring spontaneous energy, sharp observational skills and a fearless willingness to dive in.',
    traits:['Bold adaptability','Crisis response','Hands-on mastery','Spontaneous creativity','Sharp observation'],
    careers:['Entrepreneurship','Emergency Services','Performance Arts','Sports & Athletics','Engineering & Trades'],
    pct:'~30% of the population', color:'#f5a623'
  }
};
function showStatInfo(kind, val, extra) {
  var info = {
    title:'', icon:'', color:'#a98fd4', desc:'', detail:''
  };
  if (kind === 'pop') {
    var grpColors = {Analyst:'#6b8cff',Diplomat:'#4caf84',Sentinel:'#5ba3d9',Explorer:'#f5a623'};
    info.icon = '👥';
    info.color = grpColors[extra] || '#a98fd4';
    info.title = 'How Rare Is Your Type?';
    info.desc = 'Only ' + val + ' of the world\'s population share your exact personality type. This percentage reflects real-world MBTI research across thousands of people.';
    info.detail = 'Rarity doesn\'t mean better or worse — it simply means your combination of traits is unique. Rare types often bring fresh perspectives that others genuinely need. Every type exists in the proportion that the world requires.';
  } else if (kind === 'strength') {
    info.icon = '💎';
    info.color = '#e8638a';
    info.title = 'Your Core Strength';
    info.desc = val + ' is the natural gift that defines how you move through the world. It is the quality others notice in you first and the thing that comes most easily to you.';
    info.detail = 'This strength is not something you learned — it is built into how you process, feel and respond. When you are in environments that let this quality shine, you perform at your highest level and feel most like yourself. Lean into it deliberately and build your life around it.';
  } else if (kind === 'roles') {
    var roleMap = {
      Analyst:'tech, research, strategy and systems',
      Diplomat:'counselling, teaching, writing and social impact',
      Sentinel:'healthcare, administration, law and community leadership',
      Explorer:'entrepreneurship, emergency services, arts and trades'
    };
    info.icon = '🌍';
    info.color = '#5db89a';
    info.title = 'Where You Thrive';
    info.desc = 'As a ' + val + ' personality, you naturally excel in environments involving ' + (roleMap[extra] || 'roles that align with your strengths') + '.';
    info.detail = 'This is not a limit — it is a compass. Knowing which environments bring out your best helps you make smarter career choices, build better teams and find work that feels meaningful rather than draining. You can succeed anywhere, but you will flourish here.';
  }

  var existing = document.getElementById('stat-info-popup');
  if (existing) existing.remove();
  var popup = document.createElement('div');
  popup.id = 'stat-info-popup';
  popup.style.cssText = 'position:fixed;inset:0;background:rgba(15,8,40,.68);z-index:6000;display:flex;align-items:center;justify-content:center;padding:20px;cursor:default;backdrop-filter:blur(8px);opacity:0;transition:opacity .25s;';
  popup.innerHTML =
    '<div style="background:linear-gradient(145deg,#1a0f35ee,#0d1825ee);border:1.5px solid '+info.color+'44;border-radius:24px;max-width:480px;width:100%;padding:0;box-shadow:0 40px 100px rgba(0,0,0,.55);overflow:hidden;">' +
      '<div style="background:linear-gradient(135deg,'+info.color+'33,'+info.color+'11);padding:28px 30px 20px;position:relative;">' +
        '<button onclick="(function(){var p=document.getElementById(\'stat-info-popup\');p.style.opacity=\'0\';setTimeout(function(){p.remove();},250);})()" style="position:absolute;top:14px;right:16px;background:rgba(255,255,255,.12);border:none;color:#fff;font-size:1.2rem;cursor:pointer;width:32px;height:32px;border-radius:50%;">&times;</button>' +
        '<div style="font-size:2.2rem;margin-bottom:8px;">'+info.icon+'</div>' +
        '<h3 style="font-family:Cormorant Garamond,serif;font-size:1.6rem;color:#fff;margin:0;font-weight:600;">'+info.title+'</h3>' +
      '</div>' +
      '<div style="padding:22px 30px 28px;">' +
        '<p style="color:rgba(255,255,255,.9);line-height:1.75;font-size:.92rem;margin:0 0 16px;">'+info.desc+'</p>' +
        '<div style="background:rgba(255,255,255,.06);border-left:3px solid '+info.color+';border-radius:0 12px 12px 0;padding:14px 16px;">' +
          '<p style="color:rgba(255,255,255,.72);line-height:1.72;font-size:.86rem;margin:0;font-style:italic;">'+info.detail+'</p>' +
        '</div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(popup);
  requestAnimationFrame(function(){ popup.style.opacity='1'; });
  popup.addEventListener('click',function(e){ if(e.target===popup){ popup.style.opacity='0'; setTimeout(function(){popup.remove();},250); } });
}

function showGroupDesc(group) {
  var d = GROUP_DESCS[group];
  if (!d) return;
  var existing = document.getElementById('group-desc-popup');
  if (existing) existing.remove();
  var popup = document.createElement('div');
  popup.id = 'group-desc-popup';
  popup.style.cssText = 'position:fixed;inset:0;background:rgba(15,8,40,.72);z-index:6000;display:flex;align-items:center;justify-content:center;padding:20px;cursor:default;backdrop-filter:blur(10px);opacity:0;transition:opacity .25s;';
  var traitsHtml = d.traits.map(function(t) {
    return '<span style="display:inline-block;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);border-radius:20px;padding:5px 14px;font-size:.78rem;margin:3px;color:#fff;">' + t + '</span>';
  }).join('');
  var careersHtml = d.careers.map(function(c) {
    return '<div style="padding:5px 0;color:rgba(255,255,255,.82);font-size:.84rem;display:flex;align-items:center;gap:8px;"><span style="color:' + d.color + ';font-size:.6rem;">&#9679;</span>' + c + '</div>';
  }).join('');
  popup.innerHTML =
    '<div style="background:linear-gradient(145deg,#1a0f35ee,#0d1825ee);border:1.5px solid ' + d.color + '44;border-radius:26px;max-width:540px;width:100%;max-height:88vh;overflow-y:auto;padding:0;position:relative;box-shadow:0 40px 100px rgba(0,0,0,.55);">' +
      '<div style="background:linear-gradient(135deg,' + d.color + '33,' + d.color + '11);padding:30px 34px 22px;border-radius:26px 26px 0 0;">' +
        '<button onclick="(function(){var p=document.getElementById(\'group-desc-popup\');p.style.opacity=\'0\';setTimeout(function(){p.remove();},250);})()" style="position:absolute;top:14px;right:18px;background:rgba(255,255,255,.12);border:none;color:#fff;font-size:1.3rem;cursor:pointer;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;">&times;</button>' +
        '<div style="font-size:2.4rem;margin-bottom:8px;">' + d.icon + '</div>' +
        '<h2 style="font-family:Cormorant Garamond,serif;font-size:1.8rem;font-weight:600;color:#fff;margin:0 0 5px;">' + d.title + '</h2>' +
        '<p style="color:' + d.color + ';font-size:.78rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin:0;">' + d.subtitle + '</p>' +
      '</div>' +
      '<div style="padding:24px 34px 30px;">' +
        '<p style="color:rgba(255,255,255,.88);line-height:1.78;font-size:.93rem;margin:0 0 22px;">' + d.desc + '</p>' +
        '<div style="margin-bottom:20px;">' +
          '<p style="color:rgba(255,255,255,.45);font-size:.72rem;text-transform:uppercase;letter-spacing:.1em;margin:0 0 10px;font-weight:600;">KEY STRENGTHS</p>' +
          '<div>' + traitsHtml + '</div>' +
        '</div>' +
        '<div style="background:rgba(255,255,255,.06);border-radius:14px;padding:16px 18px;margin-bottom:18px;">' +
          '<p style="color:rgba(255,255,255,.45);font-size:.72rem;text-transform:uppercase;letter-spacing:.1em;margin:0 0 12px;font-weight:600;">COMMON CAREERS</p>' +
          '<div style="columns:2;column-gap:12px;">' + careersHtml + '</div>' +
        '</div>' +
        '<div style="text-align:center;background:' + d.color + '22;border-radius:12px;padding:11px;">' +
          '<span style="color:' + d.color + ';font-size:.9rem;font-weight:700;">' + d.pct + '</span>' +
        '</div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(popup);
  requestAnimationFrame(function() { popup.style.opacity = '1'; });
  popup.addEventListener('click', function(e) {
    if (e.target === popup) { popup.style.opacity = '0'; setTimeout(function() { popup.remove(); }, 250); }
  });
}
window.showStatInfo = showStatInfo;
window.showGroupDesc = showGroupDesc;

})();


(function(){

  // ── Sample texts for quick fill ────────────────────────────────────────────
  var ML_SAMPLES = [
    "I love diving deep into complex problems and theories. I prefer working alone where I can think without interruption. I make decisions based on logic and data rather than feelings. I find small talk exhausting but I can talk for hours about ideas I find fascinating. I have high standards for myself and others and I'm always planning several steps ahead.",
    "I feel most alive when I'm connecting deeply with people I care about. I can sense when someone is upset even before they say anything. When making decisions, I always consider how it will affect everyone involved. I love helping people grow and I often put others' needs before my own. I believe in the potential of every person and I'm naturally drawn to mentoring and supporting others.",
    "I prefer structure and clear expectations in everything I do. I'm extremely reliable — if I say I'll do something, I do it. I value tradition, stability and hard work. I'm practical and focused on what works in the real world rather than abstract theories. I take my responsibilities very seriously and I like to plan and prepare thoroughly before taking action.",
    "I get bored easily and love jumping between different projects and experiences. I'm very adaptable and I thrive in fast-paced environments where things change quickly. I prefer doing over planning and I learn best by trying things hands-on. I live in the moment and I'm always up for spontaneous adventures. Rules feel limiting to me and I often find creative ways around them."
  ];

  window.mlFillSample = function(i) {
    document.getElementById('ml-input').value = ML_SAMPLES[i];
  };

  window.switchMLTab = function(tab) {
    var panels = ['write','how','data'];
    panels.forEach(function(p) {
      var panel = document.getElementById('ml-panel-' + p);
      var btn   = document.getElementById('ml-tab-' + p);
      var active = p === tab;
      if(panel) panel.style.display = active ? 'block' : 'none';
      if(btn) {
        btn.style.borderBottomColor  = active ? '#a98fd4' : 'transparent';
        btn.style.color = active ? '#a98fd4' : 'rgba(255,255,255,.38)';
        btn.style.fontWeight = active ? '600' : '500';
      }
    });
  };

  window.openMLModal = function() {
    var overlay = document.getElementById('ml-modal-overlay');
    overlay.style.display = 'flex';
    requestAnimationFrame(function(){ overlay.style.opacity = '1'; });
    switchMLTab('write');
  };

  window.closeMLModal = function() {
    var overlay = document.getElementById('ml-modal-overlay');
    overlay.style.opacity = '0';
    setTimeout(function(){ overlay.style.display = 'none'; }, 300);
  };

  document.getElementById('ml-modal-overlay').addEventListener('click', function(e){
    if(e.target === this) closeMLModal();
  });

  window.runMLPrediction = function() {
    var text = (document.getElementById('ml-input').value || '').trim();
    if(text.length < 40) {
      document.getElementById('ml-input').style.borderColor = '#e8638a';
      setTimeout(function(){ document.getElementById('ml-input').style.borderColor = 'rgba(169,143,212,.28)'; }, 2000);
      return;
    }
    document.getElementById('ml-run-btn').disabled = true;
    document.getElementById('ml-result').style.display = 'none';
    document.getElementById('ml-loading').style.display = 'block';

    var systemPrompt = "You are an expert MBTI personality classifier trained on the Kaggle MBTI Personality Type Dataset (8,675 user profiles). Analyse the user's text and predict their MBTI personality type.\n\nRespond ONLY with valid JSON in this exact format (no markdown, no extra text):\n{\n  \"type\": \"INFJ\",\n  \"confidence\": 78,\n  \"dimensions\": {\n    \"EI\": {\"letter\": \"I\", \"score\": 72, \"label\": \"Introvert\", \"reason\": \"brief reason\"},\n    \"SN\": {\"letter\": \"N\", \"score\": 81, \"label\": \"Intuitive\", \"reason\": \"brief reason\"},\n    \"TF\": {\"letter\": \"F\", \"score\": 68, \"label\": \"Feeler\", \"reason\": \"brief reason\"},\n    \"JP\": {\"letter\": \"J\", \"score\": 74, \"label\": \"Planner\", \"reason\": \"brief reason\"}\n  },\n  \"alternatives\": [\"INFP\", \"INTJ\"],\n  \"insight\": \"A 2-sentence personalised insight about this person's writing style and personality.\"\n}\nBase your analysis on vocabulary, sentence structure, emotional language, abstract vs concrete thinking, and social/individual references in the text.";

    fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 600,
        system: systemPrompt,
        messages: [{ role: "user", content: "Analyse this text and predict MBTI type:\n\n" + text }]
      })
    })
    .then(function(r){ return r.json(); })
    .then(function(data){
      document.getElementById('ml-loading').style.display = 'none';
      document.getElementById('ml-run-btn').disabled = false;
      var raw = (data.content && data.content[0] && data.content[0].text) || '';
      var clean = raw.replace(/```json|```/g,'').trim();
      var result;
      try { result = JSON.parse(clean); } catch(e) {
        document.getElementById('ml-result').style.display = 'block';
        document.getElementById('ml-result').innerHTML = '<div style="background:rgba(232,99,138,.1);border:1px solid rgba(232,99,138,.3);border-radius:14px;padding:18px;color:rgba(255,255,255,.7);font-size:.87rem;">Could not parse prediction. Please try again with more text.</div>';
        return;
      }
      renderMLResult(result, text);
    })
    .catch(function(err){
      document.getElementById('ml-loading').style.display = 'none';
      document.getElementById('ml-run-btn').disabled = false;
      document.getElementById('ml-result').style.display = 'block';
      document.getElementById('ml-result').innerHTML = '<div style="background:rgba(232,99,138,.1);border:1px solid rgba(232,99,138,.3);border-radius:14px;padding:18px;color:rgba(255,255,255,.7);font-size:.87rem;">Connection error. Please check your internet and try again.</div>';
    });
  };

  function renderMLResult(r, inputText) {
    var type = r.type || 'XXXX';
    var pd = window.PD && window.PD[type];
    var group = pd ? pd.group : 'Unknown';
    var typeName = pd ? pd.name : 'Unknown Type';
    var typeIcon = pd ? pd.icon : '🪞';
    var conf = r.confidence || 0;
    var dims = r.dimensions || {};
    var dimKeys = ['EI','SN','TF','JP'];
    var dimColors = { EI:'#a98fd4', SN:'#e8638a', TF:'#5db89a', JP:'#f0a050' };
    var groupColors = { Analyst:'#6b8cff', Diplomat:'#4caf84', Sentinel:'#5ba3d9', Explorer:'#f5a623' };
    var gc = groupColors[group] || '#a98fd4';

    var dimBars = dimKeys.map(function(k){
      var d = dims[k] || {};
      var sc = d.score || 50;
      var col = dimColors[k];
      return '<div style="margin-bottom:14px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">' +
          '<span style="color:#fff;font-size:.84rem;font-weight:600;">' + (d.label || k) + '</span>' +
          '<span style="color:' + col + ';font-size:.8rem;font-weight:700;">' + sc + '%</span>' +
        '</div>' +
        '<div style="background:rgba(255,255,255,.1);border-radius:6px;height:7px;overflow:hidden;">' +
          '<div style="height:100%;width:' + sc + '%;background:' + col + ';border-radius:6px;transition:width 1s ease;"></div>' +
        '</div>' +
        '<p style="color:rgba(255,255,255,.5);font-size:.76rem;margin:4px 0 0;line-height:1.5;">' + (d.reason || '') + '</p>' +
      '</div>';
    }).join('');

    var altsHtml = (r.alternatives || []).map(function(a){
      return '<span style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:8px;padding:4px 12px;font-size:.8rem;color:rgba(255,255,255,.75);">' + a + '</span>';
    }).join(' ');

    var html =
      '<div style="animation:mlSlideUp .4s ease;">' +
        '<div style="background:linear-gradient(135deg,' + gc + '22,' + gc + '11);border:1.5px solid ' + gc + '44;border-radius:20px;padding:24px;margin-bottom:16px;text-align:center;">' +
          '<div style="font-size:3rem;margin-bottom:6px;">' + typeIcon + '</div>' +
          '<div style="font-size:2.6rem;font-family:Cormorant Garamond,serif;font-weight:700;color:#fff;letter-spacing:.08em;">' + type + '</div>' +
          '<div style="color:' + gc + ';font-size:1rem;font-weight:600;margin:4px 0 6px;">' + typeName + '</div>' +
          '<div style="display:inline-block;background:' + gc + '22;border:1px solid ' + gc + '44;border-radius:20px;padding:4px 14px;font-size:.78rem;color:' + gc + ';font-weight:600;margin-bottom:12px;">' + group + '</div>' +
          '<div style="background:rgba(255,255,255,.08);border-radius:12px;padding:10px;display:inline-flex;align-items:center;gap:8px;">' +
            '<span style="color:rgba(255,255,255,.55);font-size:.78rem;">AI Confidence</span>' +
            '<span style="font-size:1.4rem;font-weight:700;color:#fff;font-family:Cormorant Garamond,serif;">' + conf + '%</span>' +
          '</div>' +
        '</div>' +
        '<div style="background:rgba(255,255,255,.05);border-radius:16px;padding:20px;margin-bottom:14px;">' +
          '<p style="color:rgba(255,255,255,.45);font-size:.72rem;text-transform:uppercase;letter-spacing:.09em;font-weight:600;margin:0 0 14px;">DIMENSION ANALYSIS</p>' +
          dimBars +
        '</div>' +
        (r.insight ? '<div style="background:rgba(169,143,212,.1);border-left:3px solid #a98fd4;border-radius:0 12px 12px 0;padding:14px 18px;margin-bottom:14px;"><p style="color:rgba(255,255,255,.82);font-size:.88rem;line-height:1.7;margin:0;font-style:italic;">' + r.insight + '</p></div>' : '') +
        (altsHtml ? '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;"><span style="color:rgba(255,255,255,.4);font-size:.75rem;">Close alternatives:</span>' + altsHtml + '</div>' : '') +
        '<div style="margin-top:16px;display:flex;gap:10px;">' +
          '<button onclick="goTo(\'auth\');closeMLModal();" style="flex:1;padding:12px;background:linear-gradient(135deg,#a98fd4,#e8638a);border:none;border-radius:11px;color:#fff;font-size:.86rem;font-weight:600;cursor:pointer;">Take Full Quiz ✦</button>' +
          '<button onclick="document.getElementById(\'ml-input\').value=\'\';document.getElementById(\'ml-result\').style.display=\'none\';" style="flex:1;padding:12px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);border-radius:11px;color:rgba(255,255,255,.75);font-size:.86rem;cursor:pointer;">Try Again</button>' +
        '</div>'
      '</div>';

    var el = document.getElementById('ml-result');
    el.innerHTML = html;
    el.style.display = 'block';
  }

})();
