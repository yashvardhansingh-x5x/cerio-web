  /* ===================== STATE ===================== */
  let currentStep = 1;
  const TOTAL = 5;
  let photoDataURL = '';
  let selectedCourse = '';
  let selectedExp = '';
  let selectedMode = '';

  /* ===================== STEP NAVIGATION ===================== */
  function goToStep(n) {
    const cur = document.getElementById(`step${currentStep}`);
    const nxt = document.getElementById(`step${n}`);

    // Animate out
    cur.classList.add('exit-left');
    setTimeout(() => {
      cur.classList.remove('active', 'exit-left');
      cur.style.display = '';

      // Animate in
      nxt.style.display = 'block';
      nxt.offsetHeight; // force reflow
      nxt.classList.add('active');

      // Re-trigger child animations
      nxt.querySelectorAll('.anim-up').forEach((el, i) => {
        el.style.animation = 'none';
        el.offsetHeight;
        el.style.animation = `slideUp .5s var(--ease) both`;
        el.style.animationDelay = `${i * 0.06}s`;
      });

      currentStep = n;
      updateProgress();
      updateStepIndicators();

      if (n === 5) populateReview();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 320);
  }

  function updateProgress() {
    const pct = ((currentStep - 1) / (TOTAL - 1)) * 100;
    document.getElementById('progressFill').style.width = pct + '%';
  }

  function updateStepIndicators() {
    document.querySelectorAll('.step-item').forEach(item => {
      const s = parseInt(item.dataset.step);
      item.classList.remove('active', 'done');
      if (s === currentStep) item.classList.add('active');
      else if (s < currentStep) item.classList.add('done');

      const dot = item.querySelector('.step-dot span');
      if (s < currentStep) dot.innerHTML = '<i class="fa-solid fa-check" style="font-size:10px"></i>';
      else dot.textContent = s;
    });
  }

  /* ===================== PHOTO UPLOAD ===================== */
  document.getElementById('photoInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Photo must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = function(ev) {
      photoDataURL = ev.target.result;
      const preview = document.getElementById('photoPreview');
      preview.src = photoDataURL;
      preview.style.borderColor = 'var(--accent)';

      // Animate ring
      const ring = document.getElementById('photoRing');
      ring.style.transform = 'scale(1.08)';
      setTimeout(() => ring.style.transform = '', 300);

      const badge = document.querySelector('.photo-badge i');
      badge.className = 'fa-solid fa-check';
      badge.parentElement.style.background = 'var(--sage)';
    };
    reader.readAsDataURL(file);
  });

  /* ===================== DRAG & DROP PHOTO ===================== */
  const photoRing = document.getElementById('photoRing');
  photoRing.addEventListener('dragover', e => { e.preventDefault(); photoRing.style.transform = 'scale(1.06)'; });
  photoRing.addEventListener('dragleave', () => { photoRing.style.transform = ''; });
  photoRing.addEventListener('drop', e => {
    e.preventDefault();
    photoRing.style.transform = '';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const dt = new DataTransfer();
      dt.items.add(file);
      document.getElementById('photoInput').files = dt.files;
      document.getElementById('photoInput').dispatchEvent(new Event('change'));
    }
  });

  /* ===================== FIELD VALIDATION ===================== */
  function validateField(fieldId, inputEl) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    const val = inputEl.value.trim();
    field.classList.remove('valid', 'invalid');
    if (val.length > 1) field.classList.add('valid');
  }

  // Live validation hookup
  ['firstName', 'lastName', 'phone', 'schoolName', 'collegeName', 'cgpa',
   'percent10', 'percent12', 'school12Name'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => validateField('f-' + id.replace(/[A-Z]/g, m => m.toLowerCase()), el));
    }
  });

  // Email validation
  document.getElementById('email').addEventListener('input', function() {
    const f = document.getElementById('f-email');
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value);
    f.classList.remove('valid','invalid');
    if (this.value) f.classList.add(valid ? 'valid' : 'invalid');
    document.querySelector('#f-email .field-hint').textContent = valid ? '✓ Looks good!' : 'Enter a valid email';
  });

  // Password strength
  document.getElementById('password').addEventListener('input', function() {
    const pw = this.value;
    const fill = document.getElementById('strengthFill');
    const label = document.getElementById('strengthLabel');
    let score = 0, color = '', text = '';

    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    const configs = [
      { w:'0%', c:'transparent', t:'Enter a password' },
      { w:'25%', c:'#e53e3e', t:'Too weak' },
      { w:'50%', c:'#e8a21a', t:'Getting there…' },
      { w:'75%', c:'var(--sky)', t:'Almost strong' },
      { w:'100%', c:'var(--sage)', t:'Strong password ✓' }
    ];
    const cfg = configs[score];
    fill.style.width = cfg.w;
    fill.style.background = cfg.c;
    label.textContent = cfg.t;
    label.style.color = cfg.c === 'transparent' ? 'var(--muted)' : cfg.c;
  });

  // Confirm password
  document.getElementById('confirmPw').addEventListener('input', function() {
    const pw = document.getElementById('password').value;
    const f = document.getElementById('f-confirm');
    const hint = document.getElementById('confirmHint');
    f.classList.remove('valid','invalid');
    if (this.value) {
      const match = this.value === pw;
      f.classList.add(match ? 'valid' : 'invalid');
      hint.textContent = match ? '✓ Passwords match' : 'Passwords do not match';
      hint.style.color = match ? 'var(--sage)' : '#e53e3e';
    }
  });

  /* ===================== TOGGLE PASSWORD ===================== */
  function togglePw(inputId, btnId) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    btn.querySelector('i').className = isPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
  }

  /* ===================== COURSE CARDS ===================== */
  document.querySelectorAll('.course-card').forEach(card => {
    card.addEventListener('click', function() {
      document.querySelectorAll('.course-card').forEach(c => c.classList.remove('selected'));
      this.classList.add('selected');
      selectedCourse = this.dataset.course;

      // Highlight matching floating tag
      document.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tag').forEach(t => {
        if (selectedCourse.toLowerCase().includes(t.textContent.toLowerCase().split(' ')[0].toLowerCase())) {
          t.classList.add('active');
        }
      });

      // Ripple effect
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position:absolute; border-radius:50%;
        background:rgba(232,82,26,.2);
        width:10px; height:10px;
        transform:scale(0); animation: rippleOut .5s ease-out forwards;
        left:50%; top:50%; margin:-5px;
        pointer-events:none;
      `;
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 500);
    });
  });

  /* ===================== CHIP SELECT ===================== */
  document.querySelectorAll('#expChips .chip').forEach(chip => {
    chip.addEventListener('click', function() {
      document.querySelectorAll('#expChips .chip').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      selectedExp = this.dataset.val;
    });
  });
  document.querySelectorAll('#modeChips .chip').forEach(chip => {
    chip.addEventListener('click', function() {
      document.querySelectorAll('#modeChips .chip').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      selectedMode = this.dataset.val;
    });
  });

  /* ===================== YEAR SELECTS ===================== */
  function populateYears(selectId, from, to) {
    const sel = document.getElementById(selectId);
    for (let y = to; y >= from; y--) {
      const opt = new Option(y, y);
      sel.add(opt);
    }
  }
  const now = new Date().getFullYear();
  populateYears('year10', now - 20, now);
  populateYears('gradYear', now - 10, now + 5);

  /* ===================== REVIEW POPULATE ===================== */
  function populateReview() {
    const g = id => document.getElementById(id)?.value || '—';
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || '—'; };

    // Photo
    const photo = document.getElementById('reviewPhoto');
    if (photoDataURL) { photo.src = photoDataURL; photo.style.display = ''; }
    else { photo.src = ''; photo.style.display = 'none'; }

    const fname = g('firstName'), lname = g('lastName');
    set('reviewName', [fname, lname].filter(Boolean).join(' '));
    set('reviewEmail', g('email'));
    set('r-phone', g('phone'));
    set('r-dob', g('dob'));
    set('r-gender', g('gender'));
    set('r-city', g('address').split('\n')[0]);
    set('r-school', g('schoolName'));
    set('r-score10', g('percent10'));
    set('r-college', g('collegeName'));
    set('r-degree', g('degree'));
    set('r-course', selectedCourse);
    set('r-exp', selectedExp);
    set('r-mode', selectedMode);
  }

  /* ===================== SUBMIT ===================== */
  function submitForm() {
    const btn = document.querySelector('.btn-success');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting…';
    btn.disabled = true;

    setTimeout(() => {
      const sc = document.getElementById('successScreen');
      sc.classList.add('show');
      launchConfetti();
    }, 1600);
  }

  /* ===================== CONFETTI ===================== */
  function launchConfetti() {
    const colors = ['#e8521a','#ffa040','#4a7c59','#2563a8','#f3ede3','#1a1410'];
    for (let i = 0; i < 80; i++) {
      const dot = document.createElement('div');
      dot.className = 'confetti-dot';
      dot.style.cssText = `
        left: ${Math.random() * 100}vw;
        top: -10px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        width: ${4 + Math.random() * 8}px;
        height: ${4 + Math.random() * 8}px;
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        animation-duration: ${1.5 + Math.random() * 2}s;
        animation-delay: ${Math.random() * 0.8}s;
      `;
      document.body.appendChild(dot);
      dot.addEventListener('animationend', () => dot.remove());
    }
  }

  /* ===================== FLOATING TAGS ANIMATION ===================== */
  const tags = document.querySelectorAll('.tag');
  let tagIndex = 0;
  setInterval(() => {
    tags.forEach(t => t.classList.remove('active'));
    tags[tagIndex % tags.length].classList.add('active');
    tagIndex++;
  }, 1800);

  /* ===================== RIPPLE CSS ===================== */
  const style = document.createElement('style');
  style.textContent = `
    @keyframes rippleOut {
      to { transform: scale(20); opacity: 0; }
    }
    .photo-ring { transition: transform .3s var(--ease); }
  `;
  document.head.appendChild(style);

  /* ===================== CURSOR TRAIL ===================== */
  const trail = [];
  for (let i = 0; i < 5; i++) {
    const dot = document.createElement('div');
    dot.style.cssText = `
      position:fixed; pointer-events:none; z-index:9999;
      width:${6 - i}px; height:${6 - i}px;
      background: rgba(232,82,26,${0.5 - i*0.08});
      border-radius:50%; transition: transform .05s;
    `;
    document.body.appendChild(dot);
    trail.push({ el: dot, x: 0, y: 0 });
  }
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
  (function animateTrail() {
    trail.forEach((dot, i) => {
      const prev = i === 0 ? { x: mouseX, y: mouseY } : trail[i - 1];
      dot.x += (prev.x - dot.x) * 0.3;
      dot.y += (prev.y - dot.y) * 0.3;
      dot.el.style.left = (dot.x - 3) + 'px';
      dot.el.style.top = (dot.y - 3) + 'px';
    });
    requestAnimationFrame(animateTrail);
  })();

  /* Init */
  updateProgress();
