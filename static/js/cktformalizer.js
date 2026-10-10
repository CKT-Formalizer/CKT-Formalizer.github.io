(function () {
  'use strict';

  const benchmarkData = {
    VerilogEval: {
      count: '156 problems',
      rows: [
        { method: 'Verilog Agent', hdl: 'SystemVerilog', compile: 98.1, sim: 94.2, synth: 100.0, pnr: 95.9, gls: 93.9, pd: 95.9 },
        { method: 'ICL', hdl: 'SystemVerilog', compile: 98.1, sim: 94.2, synth: 100.0, pnr: 96.2, gls: 94.7, pd: 96.2 },
        { method: 'CKTFormalizer', hdl: 'CKTLean', compile: 99.4, sim: 83.3, synth: 100.0, pnr: 95.4, gls: 94.6, pd: 95.4, ours: true }
      ],
      summary: [
        ['99.4%', 'compile pass'],
        ['95.4%', 'physical-design pass'],
        ['94.6%', 'gate-level sim after P&R']
      ]
    },
    RTLLM: {
      count: '50 problems',
      rows: [
        { method: 'Verilog Agent', hdl: 'SystemVerilog', compile: 94.0, sim: 74.0, synth: 97.3, pnr: 97.3, gls: 78.4, pd: 97.3 },
        { method: 'ICL', hdl: 'SystemVerilog', compile: 100.0, sim: 74.0, synth: 97.1, pnr: 97.1, gls: 80.0, pd: 97.1 },
        { method: 'CKTFormalizer', hdl: 'CKTLean', compile: 98.0, sim: 68.0, synth: 100.0, pnr: 100.0, gls: 88.2, pd: 100.0, ours: true }
      ],
      summary: [
        ['98.0%', 'compile pass'],
        ['100%', 'physical-design pass'],
        ['88.2%', 'gate-level sim after P&R']
      ]
    },
    ResBench: {
      count: '56 problems',
      rows: [
        { method: 'Verilog Agent', hdl: 'SystemVerilog', compile: 100.0, sim: 83.9, synth: 57.4, pnr: 57.4, gls: 55.3, pd: 57.4 },
        { method: 'ICL', hdl: 'SystemVerilog', compile: 100.0, sim: 84.0, synth: 60.5, pnr: 60.5, gls: 58.1, pd: 60.5 },
        { method: 'CKTFormalizer', hdl: 'CKTLean', compile: 98.2, sim: 78.6, synth: 100.0, pnr: 100.0, gls: 100.0, pd: 100.0, ours: true }
      ],
      summary: [
        ['98.2%', 'compile pass'],
        ['100%', 'physical-design pass'],
        ['100%', 'gate-level sim after P&R']
      ]
    },
    CVDP: {
      count: '168 problems',
      rows: [
        { method: 'Verilog Agent', hdl: 'SystemVerilog', compile: 98.8, sim: 50.0, synth: 89.3, pnr: 88.1, gls: 29.8, pd: 88.1 },
        { method: 'ICL', hdl: 'SystemVerilog', compile: 98.8, sim: 50.0, synth: 89.7, pnr: 88.5, gls: 33.3, pd: 88.5 },
        { method: 'CKTFormalizer', hdl: 'CKTLean', compile: 91.1, sim: 40.5, synth: 100.0, pnr: 97.1, gls: 27.9, pd: 97.1, ours: true }
      ],
      summary: [
        ['91.1%', 'compile pass'],
        ['97.1%', 'physical-design pass'],
        ['27.9%', 'gate-level sim after P&R']
      ]
    }
  };

  const tracePatterns = {
    rising: [0x00, 0x01, 0x01, 0x80, 0x81, 0x00],
    burst: [0x00, 0x0f, 0x00, 0xf0, 0xff, 0x00],
    steady: [0x00, 0xff, 0xff, 0xff, 0xff, 0xff]
  };

  // These are the goal states produced by the local CktFormalizer Lean REPL
  // for Benchmark/Prob054_edgedetect.lean. The browser replays the verified
  // trace; it does not claim to execute Lean in JavaScript.
  const proofSteps = [
    {
      command: 'Initial goal',
      note: 'one goal',
      explanation: 'The specification asks for the detector output at cycle 1.',
      goal: 'dom : DomainConfig\ninput : Signal dom (BitVec 8)\n⊢ (prob054_edgedetect input).val 1 =\n    input.val 0 &&& ~~~0#8',
      remaining: 1,
      timing: 'ready'
    },
    {
      command: 'unfold prob054_edgedetect',
      note: 'expose definition',
      explanation: 'Unfold the generated circuit so Lean can see its two register stages.',
      goal: 'dom : DomainConfig\ninput : Signal dom (BitVec 8)\n⊢ (have d_last := Signal.register (0#8) input;\n        have edges := input &&& ~~~d_last;\n        Signal.register (0#8) edges).val\n      1 =\n    input.val 0 &&& ~~~0#8',
      remaining: 1,
      timing: '12 ms'
    },
    {
      command: 'dsimp only',
      note: 'inline local lets',
      explanation: 'Inline the local names without simplifying the circuit primitives away.',
      goal: 'dom : DomainConfig\ninput : Signal dom (BitVec 8)\n⊢ (Signal.register (0#8)\n      (input &&& ~~~Signal.register (0#8) input)).val 1 =\n    input.val 0 &&& ~~~0#8',
      remaining: 1,
      timing: '8 ms'
    },
    {
      command: 'change ((input &&& (~~~(Signal.register 0#8 input))).val 0) = _',
      note: 'show cycle 0',
      explanation: 'Expose the register equation: cycle 1 reads the edge mask from cycle 0.',
      goal: 'dom : DomainConfig\ninput : Signal dom (BitVec 8)\n⊢ (input &&& ~~~Signal.register (0#8) input).val 0 =\n    input.val 0 &&& ~~~0#8',
      remaining: 1,
      timing: '6 ms'
    },
    {
      command: 'rfl',
      note: 'kernel accepted',
      explanation: 'The definitions reduce to the same term. Lean’s kernel closes the goal.',
      goal: '✓ KERNEL ACCEPTED\n\nNo remaining goals.',
      remaining: 0,
      timing: '4 ms'
    }
  ];

  const formatPct = (value) => `${Number(value).toFixed(value % 1 === 0 ? 0 : 1)}%`;

  function renderBenchmark(name) {
    const data = benchmarkData[name];
    const table = document.querySelector('#results-table');
    const summary = document.querySelector('#benchmark-summary');
    const label = document.querySelector('#benchmark-count');
    if (!data || !table || !summary) return;

    label.textContent = `${name} · ${data.count}`;
    table.innerHTML = `
      <thead>
        <tr>
          <th scope="col">Method</th>
          <th scope="col">HDL</th>
          <th scope="col">Compile</th>
          <th scope="col">Sim pass</th>
          <th scope="col">Synth</th>
          <th scope="col">P&amp;R</th>
          <th scope="col">GLS · P&amp;R</th>
          <th scope="col">PD pass</th>
        </tr>
      </thead>
      <tbody>
        ${data.rows.map((row) => `
          <tr class="${row.ours ? 'ours' : ''}">
            <td class="method">${row.method}</td>
            <td class="muted-cell">${row.hdl}</td>
            <td>${formatPct(row.compile)}</td>
            <td>${formatPct(row.sim)}</td>
            <td>${formatPct(row.synth)}</td>
            <td>${formatPct(row.pnr)}</td>
            <td>${formatPct(row.gls)}</td>
            <td>${formatPct(row.pd)}</td>
          </tr>
        `).join('')}
      </tbody>
    `;
    summary.innerHTML = data.summary.map(([value, caption]) => `
      <div class="summary-chip"><strong>${value}</strong><span>${caption}</span></div>
    `).join('');
  }

  function setupNavigation() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (!toggle || !links) return;
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => links.classList.remove('is-open'));
    });
  }

  function setupTabs() {
    document.querySelectorAll('.benchmark-tab').forEach((button) => {
      button.addEventListener('click', () => {
        document.querySelectorAll('.benchmark-tab').forEach((item) => {
          item.classList.toggle('is-active', item === button);
          item.setAttribute('aria-selected', String(item === button));
        });
        renderBenchmark(button.dataset.benchmark);
      });
    });
  }

  function setupProofDemo() {
    const traceTable = document.querySelector('#trace-table');
    const tracePattern = document.querySelector('#trace-pattern');
    const tracePlay = document.querySelector('#trace-play');
    const traceReset = document.querySelector('#trace-reset');
    const traceStatus = document.querySelector('#trace-status');
    const traceExplanation = document.querySelector('#trace-explanation');
    const proofStepList = document.querySelector('#proof-step-list');
    const proofGoal = document.querySelector('#proof-goal code');
    const goalFrame = document.querySelector('#goal-frame');
    const goalCount = document.querySelector('#goal-count');
    const proofExplanation = document.querySelector('#proof-explanation');
    const proofStatus = document.querySelector('#proof-status');
    const proofTiming = document.querySelector('#proof-timing');
    const proofPrev = document.querySelector('#proof-prev');
    const proofNext = document.querySelector('#proof-next');
    const proofRun = document.querySelector('#proof-run');
    const proofReset = document.querySelector('#proof-reset');
    const proofAuto = document.querySelector('#proof-auto');

    if (!traceTable || !tracePattern || !proofStepList || !proofGoal) return;

    let selectedPattern = tracePattern.value || 'rising';
    let activeCycle = 0;
    let traceTimer = null;
    let proofIndex = 0;
    let proofTimer = null;

    const formatHex = (value) => `0x${(value & 0xff).toString(16).padStart(2, '0').toUpperCase()}`;
    const formatBits = (value) => (value & 0xff).toString(2).padStart(8, '0');

    function computeTrace(values) {
      let previousEdges = 0;
      return values.map((input, cycle) => {
        const dLast = cycle === 0 ? 0 : values[cycle - 1];
        const edges = input & ((~dLast) & 0xff);
        const pedge = cycle === 0 ? 0 : previousEdges;
        previousEdges = edges;
        return { cycle, input, dLast, edges, pedge };
      });
    }

    function byteChip(value, kind) {
      const hot = value !== 0 ? ' is-hot' : '';
      return `<span class="byte-chip ${kind}${hot}" title="${formatBits(value)}">${formatHex(value)}</span>`;
    }

    function describeCycle(row) {
      const edgeText = row.edges
        ? `rising mask <strong>${formatHex(row.edges)}</strong>`
        : 'no rising bit';
      const outputText = row.pedge
        ? `pedge exposes the previous mask <strong>${formatHex(row.pedge)}</strong>`
        : 'pedge is still low';
      return `<strong>t=${row.cycle}</strong> · in ${formatHex(row.input)} &amp; ~d_last ${formatHex(row.dLast)} → ${edgeText}; ${outputText}.`;
    }

    function selectTraceCycle(cycle, announce = true) {
      const rows = traceTable.querySelectorAll('tbody tr[data-cycle]');
      if (!rows.length) return;
      activeCycle = Math.max(0, Math.min(cycle, rows.length - 1));
      rows.forEach((row) => {
        const isActive = Number(row.dataset.cycle) === activeCycle;
        row.classList.toggle('is-active', isActive);
        row.setAttribute('aria-selected', String(isActive));
      });
      const row = computeTrace(tracePatterns[selectedPattern])[activeCycle];
      traceStatus.textContent = `CYCLE ${activeCycle} / ${rows.length - 1}`;
      traceStatus.classList.add('is-active');
      traceExplanation.innerHTML = describeCycle(row);
      if (!announce) traceStatus.classList.remove('is-active');
    }

    function renderTrace() {
      const rows = computeTrace(tracePatterns[selectedPattern]);
      traceTable.innerHTML = `
        <thead>
          <tr><th scope="col">cycle</th><th scope="col">in</th><th scope="col">d_last</th><th scope="col">edge mask</th><th scope="col">pedge</th></tr>
        </thead>
        <tbody>
          ${rows.map((row) => `
            <tr data-cycle="${row.cycle}" tabindex="0" aria-selected="false">
              <td><span class="cycle-label">t=${row.cycle}</span></td>
              <td>${byteChip(row.input, 'input')}</td>
              <td>${byteChip(row.dLast, 'delay')}</td>
              <td>${byteChip(row.edges, 'edge')}</td>
              <td>${byteChip(row.pedge, 'output')}</td>
            </tr>
          `).join('')}
        </tbody>
      `;
      traceTable.querySelectorAll('tbody tr[data-cycle]').forEach((row) => {
        const choose = () => selectTraceCycle(Number(row.dataset.cycle));
        row.addEventListener('click', choose);
        row.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            choose();
          }
        });
      });
      selectTraceCycle(activeCycle, false);
    }

    function stopTrace() {
      if (traceTimer) window.clearInterval(traceTimer);
      traceTimer = null;
      tracePlay.textContent = 'Play trace';
    }

    function playTrace() {
      if (traceTimer) {
        stopTrace();
        return;
      }
      if (activeCycle >= tracePatterns[selectedPattern].length - 1) selectTraceCycle(0);
      tracePlay.textContent = 'Pause trace';
      traceTimer = window.setInterval(() => {
        if (activeCycle >= tracePatterns[selectedPattern].length - 1) {
          stopTrace();
          return;
        }
        selectTraceCycle(activeCycle + 1);
      }, 680);
    }

    function stopProof() {
      if (proofTimer) window.clearInterval(proofTimer);
      proofTimer = null;
      proofAuto.textContent = 'Autoplay';
    }

    function escapeHtml(value) {
      return value.replace(/[&<>"']/g, (character) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      }[character]));
    }

    function renderProofSteps() {
      proofStepList.innerHTML = proofSteps.map((step, index) => `
        <button class="proof-step" type="button" role="listitem" data-step="${index}" aria-label="${escapeHtml(step.command)}">
          <span class="proof-step-number">${index === 0 ? '·' : index}</span>
          <span class="proof-step-command">${escapeHtml(step.command)}</span>
          <span class="proof-step-note">${escapeHtml(step.note)}</span>
        </button>
      `).join('');
      proofStepList.querySelectorAll('[data-step]').forEach((button) => {
        button.addEventListener('click', () => {
          stopProof();
          setProofStep(Number(button.dataset.step));
        });
      });
    }

    function setProofStep(index, animate = true) {
      proofIndex = Math.max(0, Math.min(index, proofSteps.length - 1));
      const step = proofSteps[proofIndex];
      proofGoal.textContent = step.goal;
      if (proofExplanation) proofExplanation.textContent = step.explanation;
      goalCount.textContent = step.remaining === 0 ? 'NO GOALS' : `${step.remaining} goal`;
      proofStatus.textContent = step.remaining === 0 ? 'KERNEL ACCEPTED' : `GOAL ${proofIndex + 1} / ${proofSteps.length}`;
      proofStatus.classList.toggle('is-complete', step.remaining === 0);
      proofStatus.classList.toggle('is-active', step.remaining !== 0 && proofIndex > 0);
      goalFrame.classList.toggle('is-complete', step.remaining === 0);
      goalFrame.classList.remove('is-updating');
      if (animate && proofIndex > 0) {
        window.requestAnimationFrame(() => goalFrame.classList.add('is-updating'));
        window.setTimeout(() => goalFrame.classList.remove('is-updating'), 260);
      }
      proofTiming.textContent = proofIndex === 0
        ? 'Waiting for tactic'
        : `${step.timing} · ${step.remaining === 0 ? 'no goals remain' : `${step.remaining} goal remaining`}`;
      proofPrev.disabled = proofIndex === 0;
      proofNext.disabled = proofIndex === proofSteps.length - 1;
      proofNext.textContent = proofIndex === proofSteps.length - 1 ? 'Proof complete' : 'Next tactic →';
      proofStepList.querySelectorAll('[data-step]').forEach((button) => {
        const buttonIndex = Number(button.dataset.step);
        button.classList.toggle('is-current', buttonIndex === proofIndex);
        button.classList.toggle('is-done', buttonIndex < proofIndex);
        button.setAttribute('aria-current', buttonIndex === proofIndex ? 'step' : 'false');
      });
    }

    function runProof() {
      stopProof();
      if (proofIndex >= proofSteps.length - 1) setProofStep(0, false);
      proofAuto.textContent = 'Stop autoplay';
      proofTimer = window.setInterval(() => {
        if (proofIndex >= proofSteps.length - 1) {
          stopProof();
          return;
        }
        setProofStep(proofIndex + 1);
        if (proofIndex >= proofSteps.length - 1) stopProof();
      }, 820);
    }

    tracePattern.addEventListener('change', () => {
      selectedPattern = tracePattern.value;
      stopTrace();
      activeCycle = 0;
      renderTrace();
    });
    tracePlay.addEventListener('click', playTrace);
    traceReset.addEventListener('click', () => {
      stopTrace();
      activeCycle = 0;
      renderTrace();
    });
    proofPrev.addEventListener('click', () => {
      stopProof();
      setProofStep(proofIndex - 1);
    });
    proofNext.addEventListener('click', () => {
      stopProof();
      setProofStep(proofIndex + 1);
    });
    proofRun.addEventListener('click', runProof);
    proofAuto.addEventListener('click', () => {
      if (proofTimer) stopProof();
      else runProof();
    });
    proofReset.addEventListener('click', () => {
      stopProof();
      setProofStep(0);
    });

    renderTrace();
    renderProofSteps();
    setProofStep(0, false);
  }

  function setupCopy() {
    const button = document.querySelector('#copy-bibtex');
    const source = document.querySelector('#bibtex-source');
    if (!button || !source || !navigator.clipboard) return;
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(source.textContent.trim());
        const previous = button.textContent;
        button.textContent = 'Copied';
        setTimeout(() => { button.textContent = previous; }, 1500);
      } catch (_) {
        button.textContent = 'Select text';
      }
    });
  }

  function setupReveal() {
    const elements = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        instance.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    elements.forEach((element) => observer.observe(element));
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupTabs();
    setupProofDemo();
    setupCopy();
    setupReveal();
    renderBenchmark('VerilogEval');
  });
})();
