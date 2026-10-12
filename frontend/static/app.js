const descriptions = {
  aws: "Cloud infrastructure, core AWS services and architecture.",
  terraform: "Infrastructure as Code, reusable modules and state.",
  docker: "Container images, networking and application packaging.",
  jenkins: "CI/CD pipelines, automation and deployment workflows."
};

const symbols = { aws: "A", terraform: "T", docker: "D", jenkins: "J" };

function normalise(value) {
  return String(value ?? "").toLowerCase();
}

function findField(obj, candidates, fallback = undefined) {
  if (!obj || typeof obj !== "object") return fallback;
  for (const key of candidates) {
    if (obj[key] !== undefined && obj[key] !== null) return obj[key];
  }
  return fallback;
}

function unwrapArray(payload, candidates) {
  if (Array.isArray(payload)) return payload;
  for (const key of candidates) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
}

function courseKey(item) {
  return normalise(findField(item, ["name", "title", "technology", "course", "path", "learning_path"], ""))
    .replace(/[^a-z]/g, "");
}

function progressFor(path, records) {
  const key = courseKey(path);
  return records.find(record => {
    const candidate = courseKey(record);
    return candidate && (candidate === key || candidate.includes(key) || key.includes(candidate));
  }) || {};
}

function percentage(record) {
  const raw = findField(record, ["progress_percentage", "completion_percentage", "completion", "progress_percent"]);
  if (raw !== undefined && Number.isFinite(Number(raw))) return Math.max(0, Math.min(100, Number(raw)));

  const completed = Number(findField(record, ["completed", "completed_lessons", "completed_modules"], 0));
  const total = Number(findField(record, ["total", "total_lessons", "total_modules"], 0));
  if (total > 0) return Math.max(0, Math.min(100, completed / total * 100));
  return 0;
}

function scoreFor(record) {
  const score = findField(record, ["quiz_score", "score", "latest_quiz_score", "average_score"]);
  if (score === undefined || score === null || score === "") return null;
  const value = Number(score);
  return Number.isFinite(value) ? value : null;
}

function safeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function renderPaths(paths, records) {
  const container = document.getElementById("learning-paths");
  const courses = paths.map(path => {
    const name = findField(path, ["name", "title", "technology", "course", "path", "learning_path"], "Learning path");
    const record = progressFor(path, records);
    const pct = percentage(record);
    const score = scoreFor(record);
    const key = normalise(name);
    const status = pct >= 100 ? "Completed" : pct > 0 ? "In progress" : "Not started";
    const active = pct > 0 && pct < 100;
    return {
      name, pct, score, status, active,
      symbol: symbols[key] || safeText(String(name).charAt(0).toUpperCase()),
      description: descriptions[key] || "Explore concepts, practical labs and real-world projects."
    };
  });

  document.getElementById("path-count").textContent = courses.length;
  document.getElementById("active-count").textContent = courses.filter(c => c.active).length;

  const scores = courses.map(c => c.score).filter(s => s !== null);
  document.getElementById("average-score").textContent =
    scores.length ? `${Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)}%` : "—";

  if (!courses.length) {
    container.innerHTML = '<div class="error-card">The learning API returned no learning paths. Check the API response and try refreshing.</div>';
    return;
  }

  container.innerHTML = courses.map(course => `
    <article class="course-card">
      <div class="course-top">
        <div class="course-symbol">${course.symbol}</div>
        <span class="pill ${course.active ? "active" : ""}">${safeText(course.status)}</span>
      </div>
      <h3 class="course-name">${safeText(course.name)}</h3>
      <div class="course-description">${safeText(course.description)}</div>
      <div class="progress-labels">
        <span>Course progress</span>
        <strong>${Math.round(course.pct)}%</strong>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${course.pct}%"></div></div>
      <div class="course-bottom">
        <span>Quiz score</span>
        <strong>${course.score === null ? "No score yet" : `${safeText(course.score)}%`}</strong>
      </div>
    </article>
  `).join("");
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return response.json();
}

async function loadDashboard() {
  const button = document.getElementById("refresh-btn");
  const status = document.getElementById("system-status");
  const dot = document.querySelector(".status-dot");
  button.disabled = true;
  status.textContent = "Loading live data...";
  dot.className = "status-dot";

  try {
    const [learningPayload, progressPayload] = await Promise.all([
      fetchJson("/api/learning-paths"),
      fetchJson("/api/progress")
    ]);

    const paths = unwrapArray(learningPayload, ["learning_paths", "paths", "data", "courses"]);
    const records = unwrapArray(progressPayload, ["progress", "records", "data", "courses"]);

    renderPaths(paths, records);
    status.textContent = "All services connected";
    dot.className = "status-dot online";
  } catch (error) {
    console.error("Dashboard load failed:", error);
    status.textContent = "Service connection issue";
    dot.className = "status-dot offline";
    document.getElementById("learning-paths").innerHTML =
      '<div class="error-card">Could not load dashboard data. Check that both Flask APIs and the Nginx frontend are running, then refresh.</div>';
  } finally {
    button.disabled = false;
  }
}

loadDashboard();
