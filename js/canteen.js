(function () {
  const STORAGE_KEY = "otan-canteen-v1";
  const PASS_EVERY_MS = 5000;
  const RESERVED_FOR_LIVE = 6;
  const students = window.STUDENTS.slice();
  const byId = {};
  students.forEach(function (pupil) { byId[pupil.id] = pupil; });

  const countEl = document.getElementById("meal-count");
  const lastEl = document.getElementById("last-pupil");
  const listEl = document.getElementById("pass-list");
  let state = load();
  let timer = 0;
  let knownDate = state.date;

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function dateKey(date) {
    return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function hash(text) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffled(list, seed) {
    const copy = list.slice();
    const random = rng(seed);
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      const swap = copy[i];
      copy[i] = copy[j];
      copy[j] = swap;
    }
    return copy;
  }

  function orderFor(date) {
    return shuffled(students, hash(dateKey(date)));
  }

  function seedVisits(now) {
    const start = new Date(now);
    start.setHours(8, 0, 0, 0);
    if (now < start) return [];
    const minutes = (now.getTime() - start.getTime()) / 60000;
    const want = Math.min(
      Math.max(0, students.length - RESERVED_FOR_LIVE),
      Math.floor(minutes / 4)
    );
    if (want <= 0) return [];
    const chosen = orderFor(now).slice(0, want);
    const span = Math.max(0, now.getTime() - start.getTime() - 5000);
    return chosen.map(function (pupil, index) {
      const at = new Date(start.getTime() + Math.round((span * (index + 1)) / (chosen.length + 1)));
      return { id: pupil.id, at: at.toISOString() };
    });
  }

  function freshState(now) {
    return { date: dateKey(now), visits: seedVisits(now) };
  }

  function load() {
    const now = new Date();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && saved.date === dateKey(now) && Array.isArray(saved.visits)) {
          const seen = {};
          saved.visits = saved.visits.filter(function (visit) {
            if (!visit || !byId[visit.id] || seen[visit.id]) return false;
            seen[visit.id] = true;
            return true;
          });
          return saved;
        }
      }
    } catch (error) {
      /* Private mode and a full disk both fall through to a memory-only day. */
    }
    return freshState(now);
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      /* The board still runs for this page view. */
    }
  }

  function formatTime(iso) {
    const date = new Date(iso);
    return pad(date.getHours()) + ":" + pad(date.getMinutes());
  }

  function orderedVisits() {
    return state.visits.slice().sort(function (a, b) {
      return new Date(b.at) - new Date(a.at);
    });
  }

  function renderLast(visit) {
    if (!visit) {
      lastEl.innerHTML = '<p class="last-empty">Әзірге ешкім өткен жоқ</p>';
      return;
    }
    const pupil = byId[visit.id];
    lastEl.innerHTML =
      '<img class="last-photo" src="' + escapeHtml(pupil.photo) + '" alt="' + escapeHtml(pupil.lastName + " " + pupil.firstName) + '">' +
      '<p class="last-surname">' + escapeHtml(pupil.lastName) + "</p>" +
      '<p class="last-name">' + escapeHtml(pupil.firstName) + "</p>" +
      '<p class="last-meta"><span class="last-grade">' + escapeHtml(pupil.grade) + '</span><span class="last-time">' + formatTime(visit.at) + "</span></p>";
  }

  function renderList(visits, highlightId) {
    if (!visits.length) {
      listEl.innerHTML = '<p class="list-empty">Әзірге өткендер жоқ</p>';
      return;
    }
    listEl.innerHTML = visits.map(function (visit) {
      const pupil = byId[visit.id];
      return (
        '<article class="pass' + (visit.id === highlightId ? " is-new" : "") + '">' +
          '<img src="' + escapeHtml(pupil.photo) + '" alt="">' +
          '<div class="pass-who">' +
            '<p class="pass-name">' + escapeHtml(pupil.lastName + " " + pupil.firstName) + "</p>" +
            '<p class="pass-grade">' + escapeHtml(pupil.grade) + "</p>" +
          "</div>" +
          '<time class="pass-time">' + formatTime(visit.at) + "</time>" +
        "</article>"
      );
    }).join("");
    while (listEl.scrollHeight > listEl.clientHeight + 1 && listEl.lastElementChild) {
      listEl.removeChild(listEl.lastElementChild);
    }
  }

  function render(highlightId) {
    const visits = orderedVisits();
    countEl.textContent = String(state.visits.length);
    renderLast(visits[0]);
    renderList(visits, highlightId || "");
  }

  function seenIds() {
    const seen = {};
    state.visits.forEach(function (visit) { seen[visit.id] = true; });
    return seen;
  }

  function nextPupil(now) {
    const seen = seenIds();
    const queue = orderFor(now);
    for (let i = 0; i < queue.length; i += 1) {
      if (!seen[queue[i].id]) return queue[i];
    }
    return null;
  }

  function record(pupil, at) {
    if (seenIds()[pupil.id]) return false;
    state.visits.push({ id: pupil.id, at: at.toISOString() });
    save();
    render(pupil.id);
    countEl.classList.remove("is-bump");
    void countEl.offsetWidth;
    countEl.classList.add("is-bump");
    return true;
  }

  function step() {
    ensureDay();
    const pupil = nextPupil(new Date());
    if (!pupil) {
      window.clearInterval(timer);
      timer = 0;
      return;
    }
    record(pupil, new Date());
  }

  function arm() {
    if (timer) window.clearInterval(timer);
    timer = window.setInterval(step, PASS_EVERY_MS);
    if (state.visits.length === 0) window.setTimeout(step, 800);
  }

  function ensureDay() {
    const today = dateKey(new Date());
    if (today === knownDate) return;
    state = freshState(new Date());
    knownDate = state.date;
    save();
    render();
    arm();
  }

  render();
  save();
  arm();
  window.addEventListener("resize", render);
  document.addEventListener("dashboard-tick", ensureDay);
})();
