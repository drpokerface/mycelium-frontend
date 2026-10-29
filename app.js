(() => {
  'use strict';
  document.body.classList.add('js-ready');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const demo = document.getElementById('loop-demo');
  const stageButtons = [...document.querySelectorAll('button[data-stage]')];
  const captions = [
    'Define success and limits before any work begins.',
    'Try distinct strategies independently. Checked partials can help later attempts.',
    'Check each result. Agreement alone is not proof; failed paths are rejected.',
    'A good result is a start. New learning must pass its own tests.'
  ];
  const playback = document.getElementById('motion-toggle');
  const announcement = document.getElementById('loop-announcement');
  let stage = motion.matches ? 3 : 0;
  let playing = !motion.matches;
  let timer = null;
  let inView = true;

  function render(announce = false) {
    demo.dataset.stage = String(stage);
    document.getElementById('stage-number').textContent = `0${stage + 1} / 04`;
    document.getElementById('stage-caption').textContent = captions[stage];
    document.querySelector('.checks').setAttribute('aria-label', stage < 2 ? 'Results are not checked yet.' : 'Illustrative results: path A verified, path B rejected, path C verified');
    document.querySelectorAll('.checks > span').forEach((check, i) => {
      check.textContent = stage < 2 ? 'Not checked' : i === 1 ? '× Rejected' : '✓ Verified';
    });
    stageButtons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === stage)));
    playback.textContent = playing ? 'Pause' : stage === 3 ? 'Play again' : 'Play';
    playback.setAttribute('aria-label', playing ? 'Pause learning illustration' : 'Play learning illustration');
    if (announce) announcement.textContent = `Step ${stage + 1} of 4. ${captions[stage]}`;
  }
  function schedule() {
    clearTimeout(timer);
    timer = null;
    if (!playing || !inView || document.hidden) return;
    timer = setTimeout(() => {
      if (stage < 3) stage += 1;
      if (stage === 3) playing = false;
      render();
      schedule();
    }, 2800);
  }
  function selectStage(next) {
    stage = next;
    playing = false;
    render(true);
    schedule();
  }
  stageButtons.forEach((button, i) => button.addEventListener('click', () => selectStage(i)));
  playback.addEventListener('click', () => {
    playing = !playing;
    if (playing && stage === 3) stage = 0;
    render(true);
    schedule();
  });
  document.getElementById('replay').addEventListener('click', () => {
    stage = 0;
    playing = !motion.matches;
    render(true);
    schedule();
  });
  motion.addEventListener('change', () => {
    if (motion.matches) {
      stage = 3;
      playing = false;
      render();
      schedule();
    }
  });
  document.addEventListener('visibilitychange', schedule);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      schedule();
    }, {threshold: 0.15}).observe(demo);
  }
  render();
  schedule();

  const releaseDemo = document.querySelector('.release-demo');
  const stableVersion = document.getElementById('stable-version');
  const candidateLabel = document.getElementById('candidate-label');
  const candidateSymbol = document.getElementById('candidate-symbol');
  const releaseStatus = document.getElementById('release-status');
  const rollback = document.getElementById('rollback');
  let releaseTimer = null;
  let stable = 1;
  function testCandidate(passes) {
    clearTimeout(releaseTimer);
    const candidate = stable + 1;
    candidateLabel.textContent = `Candidate v${candidate}`;
    candidateSymbol.textContent = '◇';
    releaseDemo.dataset.result = 'testing';
    rollback.disabled = true;
    releaseStatus.textContent = `Testing candidate v${candidate} separately. Stable v${stable} keeps serving new requests.`;
    releaseTimer = setTimeout(() => {
      if (passes) {
        stable = candidate;
        stableVersion.textContent = `v${stable}`;
        candidateSymbol.textContent = '✓';
        releaseDemo.dataset.result = 'pass';
        releaseStatus.textContent = `Illustrative pass: fresh, regression, and resource checks plus release approval succeeded. Stable v${stable} now serves new requests; v1 is retained.`;
      } else {
        candidateSymbol.textContent = '×';
        releaseDemo.dataset.result = 'fail';
        releaseStatus.textContent = `Illustrative failure: candidate v${candidate} did not pass the checks. Rejected. Stable v${stable} keeps serving new requests.`;
      }
      rollback.disabled = stable === 1;
    }, motion.matches ? 0 : 750);
  }
  document.querySelectorAll('[data-release]').forEach(button => {
    button.addEventListener('click', () => testCandidate(button.dataset.release === 'pass'));
  });
  rollback.addEventListener('click', () => {
    clearTimeout(releaseTimer);
    stable = 1;
    stableVersion.textContent = 'v1';
    candidateLabel.textContent = 'Previous releases retained';
    candidateSymbol.textContent = '↻';
    releaseDemo.dataset.result = 'rollback';
    releaseStatus.textContent = 'Rolled back to the complete v1 bundle for new requests. Past results are preserved, not rewritten.';
    rollback.disabled = true;
  });
})();
