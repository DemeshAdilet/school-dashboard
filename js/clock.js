(function () {
  const DAY_NAMES = ["ЖЕКСЕНБІ", "ДҮЙСЕНБІ", "СЕЙСЕНБІ", "СӘРСЕНБІ", "БЕЙСЕНБІ", "ЖҰМА", "СЕНБІ"];
  const COLUMNS = { 1: "mon", 2: "tue", 3: "wed", 4: "thu", 5: "fri" };

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function tick() {
    const now = new Date();
    const dayName = document.getElementById("day-name");
    const date = document.getElementById("date");
    const clock = document.getElementById("clock");
    if (dayName) dayName.textContent = DAY_NAMES[now.getDay()];
    if (date) date.textContent = pad(now.getDate()) + "-" + pad(now.getMonth() + 1) + "-" + now.getFullYear();
    if (clock) clock.textContent = pad(now.getHours()) + " : " + pad(now.getMinutes());
    document.body.dataset.today = COLUMNS[now.getDay()] || "";
    document.dispatchEvent(new CustomEvent("dashboard-tick", { detail: { now: now } }));
  }

  tick();
  setInterval(tick, 1000);
})();
