'use strict';
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionButton = document.getElementById('motion-toggle');
  let paused = reducedMotion.matches;
  function updateMotion() {
    document.body.classList.toggle('motion-paused', paused);
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.disabled = reducedMotion.matches;
    motionButton.textContent = reducedMotion.matches ? 'Reduced motion on' : paused ? 'Resume motion' : 'Pause motion';
  }
  motionButton.addEventListener('click', () => { paused = !paused; updateMotion(); });
  reducedMotion.addEventListener('change', e => { paused = e.matches; updateMotion(); });
  updateMotion();
  const stages = [
    ['FOREGROUND / USEFUL MISSIONS','MISSION','Research','Create','Review','A useful, checked result','Make something worth keeping.','Mushrooms are AI workers. They divide a mission, produce artifacts and check results. Think research, content production or software maintenance, with people setting the scope and permissions.','Useful output comes first. Training is a separate decision.'],
    ['OBSERVATION / FIND A SHORTCOMING','REAL WORK','Broken code','Weak sources','Missed rules','A specific, recurring gap','Notice what keeps falling short.','Failed checks and reviewed outcomes reveal possible capability gaps. A worker’s reflection can point toward a problem, but the model’s opinion about itself is not evidence that training is needed.','A suspected weakness is a lead, not a verdict.'],
    ['VALIDATION / INDEPENDENT CHECKS','PROPOSED GAP','Fresh tasks','Objective tests','Review','A gap worth investigating','Make the problem prove itself.','Use fresh examples and objective checks to establish a real shortcoming. Separate creation from review, and explicitly authorize the data before a bounded training experiment.','Independent validation is a requirement. Local reviewer identities alone cannot establish it.'],
    ['EXPERIMENT / BOUNDED TRAINING','VALIDATED GAP','New expert','Token router','Frozen base','One versioned candidate','Grow capacity where it may help.','Train a compatible neural specialist and its token router, initially keeping the rest of the shared backbone frozen. Bind weights, data lineage and resource limits into a reproducible candidate.','A smaller training loss is a signal to investigate, never a release decision.'],
    ['EVALUATION / THE WHOLE MODEL','CANDIDATE VS BASELINE','Target tasks','Other skills','Resources','Fresh, cross-domain evidence','Test the system, not just the skill.','Compare the complete candidate against the stable model on fresh tasks. Check target improvement, regressions, latency, memory and failure recovery. An isolated expert score is not enough.','Better at one task must not conceal worse performance elsewhere.'],
    ['DECISION / SELECTIVE GROWTH','RELEASE GATES','Promote','Retain','Archive','Stable release + rollback','Keep only what earns its place.','Promote candidates only when the agreed checks pass. Preserve promising experiments, archive weak ones, evaluate pruning, and keep a versioned rollback path. Then return to useful work.','Growth is selective. A rejected experiment is a valid outcome.']
  ];
  const fields = ['step-category','visual-origin','visual-a','visual-b','visual-c','visual-result','step-title','step-copy','step-rule'];
  let active = 0;
  const steps = [...document.querySelectorAll('.step')];
  function selectStep(index) {
    active = index;
    fields.forEach((id,i) => { document.getElementById(id).textContent = stages[index][i]; });
    document.getElementById('step-count').textContent = String(index + 1).padStart(2,'0') + ' — 06';
    steps.forEach((button,i) => { button.classList.toggle('active',i===index); button.setAttribute('aria-pressed',String(i===index)); });
    document.querySelector('.next-step').innerHTML = index===5 ? 'Back to useful work <span aria-hidden="true">←</span>' : 'Next stage <span aria-hidden="true">→</span>';
  }
  steps.forEach((button,i) => button.addEventListener('click', () => selectStep(i)));
  document.querySelector('.next-step').addEventListener('click', () => selectStep((active+1)%6));
  let token = 0;
  const selections = [[0,1],[1,2],[0,2]];
  document.getElementById('route-token').addEventListener('click', () => {
    token++;
    const selected = selections[token%3];
    document.querySelectorAll('.expert').forEach((expert,i) => {
      const isSelected = selected.includes(i);
      expert.classList.toggle('selected',isSelected);
      expert.querySelector('small').textContent = isSelected ? 'Selected' : 'Not selected';
    });
    document.getElementById('route-caption').textContent = 'Token ' + String(token+1).padStart(2,'0') + ' → Experts ' + selected.map(i=>['A','B','C'][i]).join(' + ') + '. Their weighted outputs return to the same model.';
  });
  let failed = false;
  const replicaButton = document.getElementById('replica-toggle');
  replicaButton.addEventListener('click', () => {
    failed = !failed;
    document.querySelector('.replica-demo').classList.toggle('failed',failed);
    replicaButton.setAttribute('aria-pressed',String(failed));
    replicaButton.textContent = failed ? 'Restore primary ←' : 'Simulate primary dropout →';
    document.querySelector('.primary-replica .replica-status').textContent = failed ? '× OFFLINE' : '● ONLINE';
    document.querySelector('.backup-replica .replica-status').textContent = failed ? '● SERVING' : '○ STANDBY';
    document.getElementById('replica-message').textContent = failed ? 'The identical backup takes over. Same expert version, same computation.' : 'The primary serves the request. An identical backup is ready.';
  });
})();
