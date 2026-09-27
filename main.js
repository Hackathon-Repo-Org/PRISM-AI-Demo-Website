// ==========================================================================
// PRism-AI Interactive Website Script
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  initHeroSimulator();
  initCliTabs();
  initCopyButtons();
});

// --------------------------------------------------------------------------
// 1. Hero Simulator (Interactive PR Inspection Terminal)
// --------------------------------------------------------------------------
const SCENARIOS = {
  bad: {
    title: "PRism-AI: Inspecting candidate 7bf8c12 vs main",
    agents: {
      code: { time: "12s", status: "bad" },
      test: { time: "34s", status: "bad" },
      docs: { time: "25s", status: "bad" }
    },
    lines: [
      '<span class="t-prompt">$</span> prismai check',
      'PRism-AI  HEAD (7bf8c12) vs main  [DeepSeek: deepseek-chat]',
      'Run run-103829-7bf8c12: 3 changed file(s). Running 3 specialists in parallel...',
      '',
      '  <span class="t-bad">&#10008; tests: 8 passed, 13 failed (exit code 1)</span>',
      '  <span class="t-bad">[HIGH]</span> priority.upper() dereferences None (causes HTTP 500)',
      '         sample-project/app/service.py:47',
      '  <span class="t-bad">[HIGH]</span> No allowed-value check for priority (arbitrary string accepted)',
      '         sample-project/app/service.py:47',
      '  <span class="t-warn">[MED]</span> docs/api.md does not document the new priority field',
      '         sample-project/docs/api.md:41',
      '  <span class="t-warn">[MED]</span> No test rejects unsupported priority values',
      '         sample-project/app/service.py:48',
      '',
      '<span class="t-bad t-strong">RESULT: VERIFICATION FAILED &middot; ATTENTION REQUIRED</span>',
      'Report written to: PRISM-REPORT.md'
    ],
    explain: "PRism-AI intercepts the crash before human reviewers see it. The test runner caught 13 regressions, code review caught the unhandled null, and docs flagged the schema drift.",
    verdict: '<span class="v-badge status-bad">&#9888;&#65039; ATTENTION REQUIRED</span>'
  },

  ci: {
    title: "Traditional CI Workflow (The Blindspot)",
    agents: {
      code: { time: "N/A", status: "warn" },
      test: { time: "18s", status: "ok" },
      docs: { time: "N/A", status: "warn" }
    },
    lines: [
      '<span class="t-prompt">$</span> git push origin feature/new-priority',
      'CI Pipeline #1049: Running test suites...',
      '',
      '  Running pytest on sample-project/tests...',
      '  collected 20 items',
      '  .................... [100%]',
      '',
      '  <span class="t-ok">&#10004; 20 passed in 0.42s (exit code 0)</span>',
      '',
      '<span class="t-ok t-strong">RESULT: ALL CHECKS PASSED (Ready to Merge?)</span>',
      '',
      '<span class="t-bad">&#9888; CRITICAL BLINDSPOT:</span>',
      '  Existing 20 tests passed, but omitting priority crashes in production with HTTP 500.',
      '  Documentation was forgotten. CI is green, but the PR is broken!'
    ],
    explain: "Traditional CI passes because yesterday's tests pass. But missing tests, unhandled exceptions, and stale API docs slip silently into production.",
    verdict: '<span class="v-badge status-bad">&#10008; FALSE SENSE OF SECURITY</span>'
  },

  fixed: {
    title: "PRism-AI: Re-verification Delta (--previous last)",
    agents: {
      code: { time: "8s", status: "ok" },
      test: { time: "15s", status: "ok" },
      docs: { time: "10s", status: "ok" }
    },
    lines: [
      '<span class="t-prompt">$</span> prismai check --previous last',
      'PRism-AI  HEAD (9889d78) vs main  [DeepSeek: deepseek-chat]',
      'Run run-104520-9889d78: 3 changed file(s). Re-verifying updated snapshot...',
      '',
      '  <span class="t-ok">&#10004; tests: 23 passed, 0 failed (exit code 0)</span>',
      '',
      'Since run-103829-7bf8c12:',
      '  <span class="t-ok t-strong">&#10004; Resolved: 9</span>  (priority null check, allowed values, edge tests, docs)',
      '  <span class="t-dim">&circlearrowright; Persistent: 0</span>',
      '  <span class="t-dim">&plus; New: 0</span>',
      '',
      '<span class="t-ok t-strong">RESULT: READY FOR HUMAN REVIEW</span>',
      'All gates satisfied &middot; Full report: PRISM-REPORT.md'
    ],
    explain: "The developer applied the fix, and PRism-AI's Delta Engine confirmed that all 9 previous issues were genuinely resolved with zero regressions.",
    verdict: '<span class="v-badge status-ok">&#10004; READY FOR HUMAN REVIEW</span>'
  }
};

function initHeroSimulator() {
  const visor = document.querySelector(".visor");
  if (!visor) return;

  const buttons = visor.querySelectorAll(".seg button");
  const terminalContent = document.getElementById("terminal-content");
  const explanation = document.getElementById("visor-explanation");
  const verdictEl = document.getElementById("visor-verdict");
  const btnReplay = document.getElementById("btn-replay");

  const chipCode = document.getElementById("chip-code");
  const chipTest = document.getElementById("chip-test");
  const chipDocs = document.getElementById("chip-docs");

  let currentScenario = "bad";
  let typingTimer = null;

  function setAgentChip(chip, time, status) {
    if (!chip) return;
    const timeEl = chip.querySelector(".agent-time");
    const badgeEl = chip.querySelector(".agent-status-badge");
    if (timeEl) timeEl.textContent = time;
    if (badgeEl) {
      badgeEl.className = "agent-status-badge " + (status === "ok" ? "status-ok" : status === "bad" ? "status-bad" : "status-warn");
      badgeEl.innerHTML = status === "ok" ? "&check;" : status === "bad" ? "&times;" : "&minus;";
    }
  }

  function renderScenario(key, animate = true) {
    currentScenario = key;
    const data = SCENARIOS[key];
    if (!data) return;

    // Update buttons state
    buttons.forEach(btn => {
      btn.setAttribute("aria-checked", btn.dataset.scenario === key ? "true" : "false");
    });

    // Update chips
    setAgentChip(chipCode, data.agents.code.time, data.agents.code.status);
    setAgentChip(chipTest, data.agents.test.time, data.agents.test.status);
    setAgentChip(chipDocs, data.agents.docs.time, data.agents.docs.status);

    // Update explanation & verdict
    explanation.textContent = data.explain;
    verdictEl.innerHTML = data.verdict;

    // Render terminal lines
    if (typingTimer) clearTimeout(typingTimer);
    terminalContent.innerHTML = "";

    if (!animate) {
      terminalContent.innerHTML = data.lines.join("<br>");
      return;
    }

    let lineIndex = 0;
    function printNextLine() {
      if (lineIndex < data.lines.length) {
        const line = data.lines[lineIndex];
        const lineEl = document.createElement("div");
        lineEl.innerHTML = line || "&nbsp;";
        terminalContent.appendChild(lineEl);
        terminalContent.scrollTop = terminalContent.scrollHeight;
        lineIndex++;
        typingTimer = setTimeout(printNextLine, 65);
      }
    }
    printNextLine();
  }

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      renderScenario(btn.dataset.scenario, true);
    });
  });

  if (btnReplay) {
    btnReplay.addEventListener("click", () => {
      renderScenario(currentScenario, true);
    });
  }

  // Initial load
  renderScenario("bad", false);
}

// --------------------------------------------------------------------------
// 2. Command Reference Tabs Switcher
// --------------------------------------------------------------------------
function initCliTabs() {
  const tabs = document.querySelectorAll(".cli-tab");
  const panels = document.querySelectorAll(".cli-panel");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;

      tabs.forEach(t => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      panels.forEach(p => p.classList.remove("active"));

      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");

      const activePanel = document.getElementById("panel-" + target);
      if (activePanel) {
        activePanel.classList.add("active");
      }
    });
  });
}

// --------------------------------------------------------------------------
// 3. Copy to Clipboard Functionality
// --------------------------------------------------------------------------
function initCopyButtons() {
  const copyButtons = document.querySelectorAll("[data-copy], .btn-copy-code, .copy-btn");

  copyButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const textToCopy = btn.getAttribute("data-copy") || btn.closest(".install-pill-box, .cmd-block")?.querySelector("code")?.innerText;
      if (!textToCopy) return;

      navigator.clipboard.writeText(textToCopy.trim()).then(() => {
        const span = btn.querySelector("span") || btn;
        const originalText = span.textContent;
        span.textContent = "Copied!";
        btn.classList.add("copied");

        setTimeout(() => {
          span.textContent = originalText;
          btn.classList.remove("copied");
        }, 1800);
      }).catch(err => {
        console.error("Clipboard copy failed:", err);
      });
    });
  });
}
