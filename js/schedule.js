(function () {
  const PAGE_SIZE = 3;
  const ROTATE_MS = 20000;
  const board = document.getElementById("board");
  const schedule = window.SCHEDULE;
  let page = 0;
  let todayKey = document.body.dataset.today || "";
  let rotateTimer = 0;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function cell(lesson, dayId) {
    const slot = lesson[dayId];
    const today = todayKey === dayId ? " is-today" : "";
    if (!slot) return '<div class="cell is-empty' + today + '"></div>';
    return (
      '<div class="cell' + today + '">' +
        '<span class="subj">' + escapeHtml(slot.subject) + "</span>" +
        '<span class="room">' + escapeHtml(slot.room) + "</span>" +
      "</div>"
    );
  }

  function render() {
    const pages = Math.ceil(schedule.classes.length / PAGE_SIZE);
    page = (page + pages) % pages;
    const visible = schedule.classes.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
    const head = schedule.days.map(function (day) {
      const today = todayKey === day.id ? " is-today" : "";
      return '<div class="h h-day' + today + '">' + escapeHtml(day.label) + "</div>";
    }).join("");

    const blocks = visible.map(function (group) {
      const rows = group.lessons.map(function (lesson, index) {
        const nums = '<div class="num">' + (index + 1) + "</div>";
        const days = schedule.days.map(function (day) { return cell(lesson, day.id); }).join("");
        return nums + days;
      }).join("");
      return (
        '<section class="class-block">' +
          '<div class="class-label">' +
            '<span class="class-title">' + escapeHtml(group.name) + "</span>" +
            '<span class="class-shift">' + escapeHtml(group.shift) + "</span>" +
          "</div>" +
          rows +
        "</section>"
      );
    }).join("");

    board.innerHTML =
      '<div class="sched-head">' +
        '<div class="h h-class"></div>' +
        '<div class="h h-num">САБАҚ</div>' +
        head +
      "</div>" +
      '<div class="sched-body">' + blocks + "</div>";
  }

  function turn() {
    board.classList.add("is-fading");
    window.setTimeout(function () {
      page += 1;
      render();
      board.classList.remove("is-fading");
    }, 320);
  }

  render();
  rotateTimer = window.setInterval(turn, ROTATE_MS);

  document.addEventListener("dashboard-tick", function () {
    const next = document.body.dataset.today || "";
    if (next === todayKey) return;
    todayKey = next;
    render();
  });

  window.addEventListener("beforeunload", function () {
    window.clearInterval(rotateTimer);
  });
})();
