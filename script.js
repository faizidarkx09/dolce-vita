/* ============================================================
   Dolce Vita — interactions
   Envelope · music · petals · reveal-on-scroll · hero parallax
   scratch-to-reveal date · confetti · gallery slider · RSVP modal
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.matchMedia('(max-width: 980px)').matches;

  /* ---------------- 1. Envelope (mobile only) ---------------- */

  var envelope = document.getElementById('envelope');
  var sealButton = document.getElementById('sealButton');
  var skipIntro = document.getElementById('skipIntro');
  var audio = document.getElementById('invitation-audio');
  var audioControl = document.getElementById('audio-control');
  var envelopeOpened = false;

  // Lock page scroll while the envelope covers the screen (mobile only).
  if (isMobile && envelope) document.body.style.overflow = 'hidden';

  // Preview hook: ?noenvelope=1 skips the envelope (for QA / direct page view).
  if (isMobile && envelope && /[?&]noenvelope=1/.test(location.search)) {
    envelopeOpened = true;
    envelope.style.display = 'none';
    document.body.style.overflow = '';
  }

  function revealAudioControl() {
    if (!isMobile) return;
    audioControl.hidden = false;
  }

  function startMusic() {
    if (!isMobile || !audio) return;
    audio.volume = 0.7;
    var p = audio.play();
    if (p && p.catch) p.catch(function () { /* autoplay blocked; user can use the toggle */ });
    audioControl.classList.add('playing');
    audioControl.setAttribute('aria-label', 'Pause music');
  }

  function openEnvelope(withMusic) {
    if (envelopeOpened || !envelope) return;
    envelopeOpened = true;
    envelope.classList.add('open');
    document.body.style.overflow = '';
    revealAudioControl();
    if (withMusic) startMusic();
    setTimeout(function () {
      envelope.style.display = 'none';
    }, 2300);
  }

  if (sealButton) {
    sealButton.addEventListener('click', function (e) {
      e.stopPropagation();
      openEnvelope(true);
    });
  }
  if (envelope) {
    envelope.addEventListener('click', function () { openEnvelope(true); });
  }
  if (skipIntro) {
    skipIntro.addEventListener('click', function (e) {
      e.stopPropagation();
      openEnvelope(false); // reveal page + show the toggle, but do not autoplay
    });
  }

  // Music toggle (mobile only; only visible after the envelope opens).
  if (audioControl && audio) {
    audioControl.addEventListener('click', function () {
      if (audio.paused) {
        var p = audio.play();
        if (p && p.catch) p.catch(function () {});
        audioControl.classList.add('playing');
        audioControl.setAttribute('aria-label', 'Pause music');
      } else {
        audio.pause();
        audioControl.classList.remove('playing');
        audioControl.setAttribute('aria-label', 'Play music');
      }
    });
  }

  /* ---------------- 2. Falling petals over the hero ---------------- */

  (function petals() {
    var canvas = document.getElementById('petals');
    var hero = document.getElementById('hero');
    if (!canvas || !hero || reduceMotion) return;
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, petalsArr = [], running = false, raf = null;
    var COUNT = 26;

    function size() {
      var r = hero.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = Math.max(1, W * dpr);
      canvas.height = Math.max(1, H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makePetal(seed) {
      return {
        x: Math.random() * W,
        y: seed ? Math.random() * H : -12 - Math.random() * 30,
        w: 5 + Math.random() * 7,
        h: 4 + Math.random() * 5,
        vy: 0.35 + Math.random() * 0.75,
        sway: 0.4 + Math.random() * 0.9,
        phase: Math.random() * Math.PI * 2,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.012,
        alpha: 0.35 + Math.random() * 0.45
      };
    }

    function tick() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < petalsArr.length; i++) {
        var p = petalsArr[i];
        p.y += p.vy;
        p.phase += 0.012;
        p.x += Math.sin(p.phase) * p.sway * 0.4;
        p.rot += p.vr;
        if (p.y > H + 14) petalsArr[i] = makePetal(false);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(0, 0, p.w / 2, p.h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    }

    function start() {
      if (running) return;
      running = true;
      size();
      petalsArr = [];
      for (var i = 0; i < COUNT; i++) petalsArr.push(makePetal(true));
      tick();
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      if (ctx) ctx.clearRect(0, 0, W, H);
    }

    // Run only while the hero is on screen.
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.isIntersecting ? start() : stop(); });
    }, { threshold: 0.02 });
    io.observe(hero);
    window.addEventListener('resize', function () { if (running) size(); });
  })();

  /* ---------------- 3. Fade-in on scroll ---------------- */

  (function reveal() {
    var els = document.querySelectorAll('.reveal, .reveal-up');
    if (!('IntersectionObserver' in window) || reduceMotion) {
      els.forEach(function (el) { el.classList.add('in-view'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ---------------- 4. Subtle hero parallax ---------------- */

  (function parallax() {
    var img = document.getElementById('heroImg');
    var hero = document.getElementById('hero');
    if (!img || !hero || reduceMotion) return;
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var r = hero.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight) {
          var offset = (window.innerHeight / 2 - (r.top + r.height / 2)) * 0.04;
          img.style.objectPosition = 'center calc(30% + ' + offset.toFixed(1) + 'px)';
        }
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
  })();

  /* ---------------- 5. Scratch-to-reveal date ---------------- */

  (function scratch() {
    var tiles = Array.prototype.slice.call(document.querySelectorAll('.scratch-tile'));
    if (!tiles.length) return;
    var marriedMsg = document.getElementById('marriedMsg');
    var goldFlash = document.getElementById('goldFlash');
    var confettiCanvas = document.getElementById('confetti');
    var celebrated = false;

    function paintCoating(canvas) {
      var r = canvas.parentElement.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, r.width * dpr);
      canvas.height = Math.max(1, r.height * dpr);
      var ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var g = ctx.createLinearGradient(0, 0, r.width, r.height);
      g.addColorStop(0, '#dce8ee');
      g.addColorStop(0.45, '#c8d7df');
      g.addColorStop(1, '#e3d3c4');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, r.width, r.height);
      // faint diagonal sheen
      ctx.strokeStyle = 'rgba(255,255,255,.35)';
      ctx.lineWidth = 1;
      for (var x = -r.height; x < r.width; x += 18) {
        ctx.beginPath();
        ctx.moveTo(x, 0); ctx.lineTo(x + r.height, r.height);
        ctx.stroke();
      }
      // sparkle dots
      ctx.fillStyle = 'rgba(255,255,255,.5)';
      for (var i = 0; i < 26; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * r.width, Math.random() * r.height, 1 + Math.random() * 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      return ctx;
    }

    function clearedFraction(canvas) {
      var ctx = canvas.getContext('2d');
      var w = canvas.width, h = canvas.height;
      var data;
      try {
        data = ctx.getImageData(0, 0, w, h).data;
      } catch (e) { return 0; }
      var cleared = 0, total = 0;
      for (var i = 3; i < data.length; i += 12 * 4) { // sample every 12th pixel
        total++;
        if (data[i] < 128) cleared++;
      }
      return total ? cleared / total : 0;
    }

    function celebrate() {
      if (celebrated) return;
      celebrated = true;
      setTimeout(function () {
        marriedMsg.classList.add('show');
        goldFlash.classList.remove('flash');
        void goldFlash.offsetWidth; // restart the animation
        goldFlash.classList.add('flash');
        launchConfetti();
      }, 550);
    }

    function checkAllDone() {
      var done = tiles.every(function (t) { return t.dataset.done === 'true'; });
      if (done) celebrate();
    }

    // Confetti: 80 pieces, gold palette, ~5 seconds.
    function launchConfetti() {
      if (!confettiCanvas) return;
      var section = confettiCanvas.parentElement;
      var r = section.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      confettiCanvas.width = Math.max(1, r.width * dpr);
      confettiCanvas.height = Math.max(1, r.height * dpr);
      var ctx = confettiCanvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var colors = ['#c8aa78', '#dfc48e', '#ede5cc', '#f5ede0', '#1a1916', '#d4c090', '#b89050', '#e8d8a8'];
      var pieces = [];
      for (var i = 0; i < 80; i++) {
        pieces.push({
          x: Math.random() * r.width,
          y: -10 - Math.random() * r.height * 0.4,
          w: 6 + Math.random() * 5,
          h: 8 + Math.random() * 6,
          vy: 1.6 + Math.random() * 2.2,
          vx: (Math.random() - 0.5) * 1.4,
          rot: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.15,
          color: colors[i % colors.length],
          circle: Math.random() < 0.3
        });
      }
      var frames = 0, maxFrames = 300;
      (function frame() {
        ctx.clearRect(0, 0, r.width, r.height);
        pieces.forEach(function (p) {
          p.y += p.vy; p.x += p.vx + Math.sin((frames + p.w * 10) * 0.02) * 0.6;
          p.rot += p.vr;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          if (p.circle) {
            ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2); ctx.fill();
          } else {
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          }
          ctx.restore();
        });
        frames++;
        if (frames < maxFrames) requestAnimationFrame(frame);
        else ctx.clearRect(0, 0, r.width, r.height);
      })();
    }

    tiles.forEach(function (tile) {
      var canvas = tile.querySelector('.scratch-canvas');
      var ctx = paintCoating(canvas);
      var scratching = false;
      var lastCheck = 0;

      function pos(e) {
        var r = canvas.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
      }

      function erase(e) {
        var p = pos(e);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 18, 0, Math.PI * 2); // 36px eraser
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        var now = Date.now();
        if (now - lastCheck > 200) {
          lastCheck = now;
          if (clearedFraction(canvas) > 0.4) finishTile();
        }
      }

      function finishTile() {
        if (tile.dataset.done === 'true') return;
        tile.dataset.done = 'true';
        tile.classList.add('done');
        checkAllDone();
      }

      canvas.addEventListener('pointerdown', function (e) {
        if (tile.dataset.done === 'true') return;
        scratching = true;
        canvas.setPointerCapture(e.pointerId);
        erase(e);
        e.preventDefault();
      });
      canvas.addEventListener('pointermove', function (e) {
        if (!scratching) return;
        erase(e);
        e.preventDefault();
      });
      function endScratch(e) {
        if (!scratching) return;
        scratching = false;
        if (clearedFraction(canvas) > 0.4) finishTile();
      }
      canvas.addEventListener('pointerup', endScratch);
      canvas.addEventListener('pointercancel', endScratch);

      // Repaint the coating if the tile resizes before it is scratched.
      window.addEventListener('resize', function () {
        if (tile.dataset.done !== 'true') ctx = paintCoating(canvas);
      });
    });
  })();

  /* ---------------- 6. Gallery slider ---------------- */

  (function slider() {
    var root = document.getElementById('gallerySlider');
    if (!root) return;
    var track = document.getElementById('slides');
    var slides = track.children.length;
    var dotsWrap = document.getElementById('sliderDots');
    var prevBtn = document.getElementById('sliderPrev');
    var nextBtn = document.getElementById('sliderNext');
    var index = 0;
    var dragX = null, dragging = false, startX = 0, curX = 0;

    for (var i = 0; i < slides; i++) {
      (function (n) {
        var d = document.createElement('button');
        d.type = 'button';
        d.className = 'slider-dot';
        d.setAttribute('role', 'tab');
        d.setAttribute('aria-label', 'Go to slide ' + (n + 1));
        d.addEventListener('click', function () { goTo(n); });
        dotsWrap.appendChild(d);
      })(i);
    }
    var dots = dotsWrap.children;

    function goTo(n) {
      index = ((n % slides) + slides) % slides;
      track.style.transform = 'translateX(-' + index * 100 + '%)';
      for (var i = 0; i < dots.length; i++) dots[i].classList.toggle('active', i === index);
    }

    prevBtn.addEventListener('click', function () { goTo(index - 1); });
    nextBtn.addEventListener('click', function () { goTo(index + 1); });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') goTo(index - 1);
      if (e.key === 'ArrowRight') goTo(index + 1);
    });

    // Drag / swipe (mouse + touch via Pointer Events).
    track.addEventListener('pointerdown', function (e) {
      dragging = true; startX = e.clientX; curX = startX; dragX = 0;
      track.classList.add('dragging');
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      curX = e.clientX;
      dragX = curX - startX;
      track.style.transform = 'translateX(calc(-' + index * 100 + '% + ' + dragX + 'px))';
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      track.classList.remove('dragging');
      if (dragX > 50) goTo(index - 1);
      else if (dragX < -50) goTo(index + 1);
      else goTo(index);
      dragX = null;
    }
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);

    goTo(0);
  })();

  /* ---------------- 7. RSVP modal ---------------- */

  (function rsvp() {
    var modal = document.getElementById('rsvpModal');
    var openBtn = document.getElementById('openRsvp');
    var form = document.getElementById('rsvpForm');
    var formWrap = document.getElementById('rsvpFormWrap');
    var successWrap = document.getElementById('rsvpSuccess');
    var successBody = document.getElementById('successBody');
    var errorEl = document.getElementById('formError');
    var nameInput = document.getElementById('guestName');
    var lastFocus = null;

    function open() {
      lastFocus = document.activeElement;
      formWrap.hidden = false;
      successWrap.hidden = true;
      errorEl.hidden = true;
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      nameInput.focus();
    }
    function close() {
      modal.hidden = true;
      document.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    openBtn.addEventListener('click', open);

    // Preview hook: ?rsvp=1 opens the modal on load (for QA).
    if (/[?&]rsvp=1/.test(location.search)) open();
    modal.querySelectorAll('[data-close]').forEach(function (el) {
      el.addEventListener('click', close);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) close();
    });

    // Single-choice checkboxes (like the reference's RSVP form).
    var attendBoxes = form.querySelectorAll('input[name="attend"]');
    attendBoxes.forEach(function (box) {
      box.addEventListener('change', function () {
        if (box.checked) {
          attendBoxes.forEach(function (b) { if (b !== box) b.checked = false; });
        }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = nameInput.value.trim();
      var attend = form.querySelector('input[name="attend"]:checked');
      var food = document.getElementById('foodNotes').value.trim();

      if (!name) {
        errorEl.textContent = 'Please enter your name.';
        errorEl.hidden = false;
        nameInput.focus();
        return;
      }
      if (!attend) {
        errorEl.textContent = 'Please tell us whether you will come.';
        errorEl.hidden = false;
        return;
      }
      errorEl.hidden = true;

      // Demo only: stored in this browser's localStorage, no backend.
      var record = { name: name, attend: attend.value, food: food, at: new Date().toISOString() };
      try {
        var list = JSON.parse(localStorage.getItem('dolcevita_rsvps') || '[]');
        list.push(record);
        localStorage.setItem('dolcevita_rsvps', JSON.stringify(list));
      } catch (err) { /* private mode / storage disabled: still show success */ }

      var attendText = attend.value === 'yes' ? 'We can’t wait to celebrate with you!'
        : attend.value === 'no' ? 'We’ll miss you — thank you for letting us know.'
        : 'No rush at all — we hope to hear from you soon.';
      successBody.textContent = 'Thank you, ' + name + '! Your RSVP has been saved. ' + attendText;

      formWrap.hidden = true;
      successWrap.hidden = false;
      form.reset();
    });
  })();

})();
