/* ══════════════════════════════════════════════════════
   bounce.js  —  Breakout-style Bounce
   Red ball · Yellow bricks · White background
   ══════════════════════════════════════════════════════ */

const Bounce = (() => {

  const SPEEDS = { easy: 2.5, medium: 4, hard: 6.5 };

  const BRICK_ROWS = 4;
  const BRICK_COLS = 7;
  const PAD_H      = 8;

  let canvas, ctx;
  let overlayBtn = null;
  let W, H, BRICK_W, BRICK_H, PAD_W, BALL_R;
  let state = null;
  let animId = null;
  let difficulty = 'medium';
  let onScoreCb = null;

  // ── INIT ────────────────────────────────────────────
  function init(cvs, diff, onScore) {
    canvas     = cvs;
    ctx        = canvas.getContext('2d');
    difficulty = diff || 'medium';
    onScoreCb  = onScore || (() => {});
    W          = canvas.width;
    H          = canvas.height;
    BRICK_W    = Math.floor((W - BRICK_COLS * 3) / BRICK_COLS);
    BRICK_H    = 14;
    PAD_W      = 64;
    BALL_R     = 7;

    canvas.style.touchAction = 'none';

    // mouse / touch / pointer paddle control
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchend', onTouchEnd, { passive: true });
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('click', handleCanvasClick);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    // global fallback for iOS Safari tap-to-retry
    window.addEventListener('touchend', onGlobalTouchEnd, { passive: true });
    window.addEventListener('click', onGlobalClick);

    // create a transparent overlay button to guarantee tap/click across devices
    overlayBtn = document.createElement('button');
    overlayBtn.setAttribute('aria-label', 'Retry Bounce');
    overlayBtn.style.position = 'fixed';
    overlayBtn.style.left = '0px';
    overlayBtn.style.top = '0px';
    overlayBtn.style.width = '0px';
    overlayBtn.style.height = '0px';
    overlayBtn.style.zIndex = '9999';
    overlayBtn.style.background = 'transparent';
    overlayBtn.style.border = 'none';
    overlayBtn.style.padding = '0';
    overlayBtn.style.margin = '0';
    overlayBtn.style.display = 'none';
    overlayBtn.style.cursor = 'pointer';
    document.body.appendChild(overlayBtn);
    overlayBtn.addEventListener('pointerdown', () => { if (state && (state.dead || state.won)) { reset(); start(); } });
    overlayBtn.addEventListener('click', () => { if (state && (state.dead || state.won)) { reset(); start(); } });
    window.addEventListener('resize', updateOverlayPosition);

    reset();
  }

  function buildBricks() {
    const bricks = [];
    const COLORS = ['#ffcc00', '#ffaa00', '#ff8800', '#ff5500'];
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        bricks.push({
          x:     c * (BRICK_W + 3) + 2,
          y:     r * (BRICK_H + 4) + 28,
          alive: true,
          color: COLORS[r],
        });
      }
    }
    return bricks;
  }

  function reset() {
    const sp = SPEEDS[difficulty] || 4;
    state = {
      px:     W / 2 - PAD_W / 2,
      py:     H - 22,
      bx:     W / 2,
      by:     H - 50,
      vx:     sp * (Math.random() > 0.5 ? 1 : -1),
      vy:     -sp,
      bricks: buildBricks(),
      score:  0,
      dead:   false,
      won:    false,
      keys:   { left: false, right: false },
    };
    draw();
    hideOverlay();
  }

  // ── PADDLE INPUT ─────────────────────────────────────
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function setPaddleFromClientX(clientX) {
    if (!state) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    state.px = clamp((clientX - rect.left) * scaleX - PAD_W / 2, 0, W - PAD_W);
  }

  function onMouseMove(e) {
    if (!state) return;
    setPaddleFromClientX(e.clientX);
  }

  function onTouchMove(e) {
    if (!state || !e.touches[0]) return;
    setPaddleFromClientX(e.touches[0].clientX);
  }

  function onTouchStart(e) {
    if (!state) return;
    if (state.dead || state.won) {
      reset();
      start();
      return;
    }
    if (e.touches[0]) setPaddleFromClientX(e.touches[0].clientX);
  }

  function onTouchEnd(e) {
    if (!state) return;
    if (state.dead || state.won) { reset(); start(); }
  }

  function onPointerDown(e) {
    if (!state) return;
    if (state.dead || state.won) {
      reset();
      start();
      return;
    }
    canvas.setPointerCapture?.(e.pointerId);
    setPaddleFromClientX(e.clientX);
  }

  function onPointerMove(e) {
    if (!state) return;
    if (e.pointerType === 'mouse' && e.buttons === 0) return;
    setPaddleFromClientX(e.clientX);
  }

  function onPointerUp(e) {
    if (canvas.hasPointerCapture?.(e.pointerId)) {
      canvas.releasePointerCapture?.(e.pointerId);
    }
    if (!state) return;
    if (state.dead || state.won) { reset(); start(); }
  }

  function onKeyDown(e) {
    if (!state) return;
    if (e.key === 'ArrowLeft' || e.key === 'Left' || e.key === 'a' || e.key === 'A') {
      state.keys.left = true;
      e.preventDefault();
    } else if (e.key === 'ArrowRight' || e.key === 'Right' || e.key === 'd' || e.key === 'D') {
      state.keys.right = true;
      e.preventDefault();
    }
  }

  function onKeyUp(e) {
    if (!state) return;
    if (e.key === 'ArrowLeft' || e.key === 'Left' || e.key === 'a' || e.key === 'A') {
      state.keys.left = false;
    } else if (e.key === 'ArrowRight' || e.key === 'Right' || e.key === 'd' || e.key === 'D') {
      state.keys.right = false;
    }
  }

  function handleCanvasClick() {
    if (state && (state.dead || state.won)) { reset(); start(); }
  }

  function onGlobalTouchEnd() {
    if (state && (state.dead || state.won)) { reset(); start(); }
  }

  function onGlobalClick() {
    if (state && (state.dead || state.won)) { reset(); start(); }
  }

  function updateOverlayPosition() {
    if (!overlayBtn || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    overlayBtn.style.left = rect.left + 'px';
    overlayBtn.style.top  = rect.top + 'px';
    overlayBtn.style.width = rect.width + 'px';
    overlayBtn.style.height = rect.height + 'px';
  }

  function showOverlay() {
    if (!overlayBtn) return;
    updateOverlayPosition();
    overlayBtn.style.display = 'block';
  }

  function hideOverlay() {
    if (!overlayBtn) return;
    overlayBtn.style.display = 'none';
  }

  // ── GAME LOOP ────────────────────────────────────────
  function loop() {
    if (!state || state.dead || state.won) return;

    const s = state;

    if (s.keys.left && !s.keys.right) {
      s.px -= 7;
    } else if (s.keys.right && !s.keys.left) {
      s.px += 7;
    }
    s.px = Math.max(0, Math.min(W - PAD_W, s.px));

    // move ball
    s.bx += s.vx;
    s.by += s.vy;

    // wall bounce
    if (s.bx - BALL_R < 0)  { s.bx = BALL_R;      s.vx =  Math.abs(s.vx); }
    if (s.bx + BALL_R > W)  { s.bx = W - BALL_R;  s.vx = -Math.abs(s.vx); }
    if (s.by - BALL_R < 0)  { s.by = BALL_R;       s.vy =  Math.abs(s.vy); }

    // paddle bounce
    if (
      s.by + BALL_R >= s.py &&
      s.by - BALL_R <= s.py + PAD_H &&
      s.bx >= s.px &&
      s.bx <= s.px + PAD_W
    ) {
      s.vy = -Math.abs(s.vy);
      // add spin based on where ball hits paddle
      const hitPos = (s.bx - (s.px + PAD_W / 2)) / (PAD_W / 2); // -1 to 1
      s.vx += hitPos * 1.2;
      // clamp speed
      const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
      const maxSp = SPEEDS[difficulty] * 1.8;
      if (speed > maxSp) { s.vx = (s.vx / speed) * maxSp; s.vy = (s.vy / speed) * maxSp; }
    }

    // dead
    if (s.by > H + 20) {
      s.dead = true;
      onScoreCb(s.score);
      draw();
      showOverlay();
      return;
    }

    // brick collision
    for (const b of s.bricks) {
      if (!b.alive) continue;
      if (
        s.bx + BALL_R > b.x &&
        s.bx - BALL_R < b.x + BRICK_W &&
        s.by + BALL_R > b.y &&
        s.by - BALL_R < b.y + BRICK_H
      ) {
        b.alive = false;
        s.score += 5;
        s.vy *= -1;
      }
    }

    // win
    if (s.bricks.every(b => !b.alive)) {
      s.won = true;
      onScoreCb(s.score);
      draw();
      showOverlay();
      return;
    }

    draw();
    animId = requestAnimationFrame(loop);
  }

  // ── DRAW ─────────────────────────────────────────────
  function draw() {
    if (!state) return;
    const s = state;

    // white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // bricks (yellow shades)
    for (const b of s.bricks) {
      if (!b.alive) continue;
      ctx.fillStyle   = b.color;
      ctx.fillRect(b.x, b.y, BRICK_W, BRICK_H);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth   = 1;
      ctx.strokeRect(b.x + 0.5, b.y + 0.5, BRICK_W - 1, BRICK_H - 1);
    }

    // paddle (dark)
    ctx.fillStyle   = '#222222';
    ctx.fillRect(s.px, s.py, PAD_W, PAD_H);
    ctx.fillStyle   = '#444444';
    ctx.fillRect(s.px + 2, s.py + 2, PAD_W - 4, 2);

    // ball (red)
    ctx.beginPath();
    ctx.arc(s.bx, s.by, BALL_R, 0, Math.PI * 2);
    ctx.fillStyle   = '#cc0000';
    ctx.fill();
    ctx.strokeStyle = '#880000';
    ctx.lineWidth   = 2;
    ctx.stroke();
    // shine
    ctx.beginPath();
    ctx.arc(s.bx - 2, s.by - 2, 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,150,150,0.6)';
    ctx.fill();

    // score
    ctx.fillStyle = '#000000';
    ctx.font      = `7px 'Press Start 2P', monospace`;
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${s.score}`, 4, 14);

    // overlays
    if (s.dead || s.won) {
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(0, 0, W, H);

      ctx.textAlign = 'center';
      ctx.font      = `8px 'Press Start 2P', monospace`;
      ctx.fillStyle = s.won ? '#00cc00' : '#ff0000';
      ctx.fillText(s.won ? 'YOU WIN!' : 'GAME OVER', W / 2, H / 2 - 14);

      ctx.fillStyle = '#ffffff';
      ctx.font      = `7px 'Press Start 2P', monospace`;
      ctx.fillText(`SCORE: ${s.score}`, W / 2, H / 2 + 4);
      ctx.fillText('TAP TO RETRY', W / 2, H / 2 + 22);
      ctx.textAlign = 'left';
    }
  }

  // ── START / STOP ──────────────────────────────────────
  function start() {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    animId = requestAnimationFrame(loop);
  }

  function stop() {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    if (canvas) {
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('click', handleCanvasClick);
    }
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('touchend', onGlobalTouchEnd);
    window.removeEventListener('click', onGlobalClick);
    window.removeEventListener('resize', updateOverlayPosition);
    if (overlayBtn && overlayBtn.parentNode) overlayBtn.parentNode.removeChild(overlayBtn);
  }

  return { init, start, stop };

})();
