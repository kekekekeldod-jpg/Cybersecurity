const trackerGrid = document.getElementById("tracker-grid");
const progressText = document.getElementById("progress-text");

const startDate = new Date(2026, 2, 23); // 23.03.2026
const endDate = new Date(2026, 8, 23);   // 23.09.2026

function normalizeDate(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getDayDifference(start, end) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((end - start) / msPerDay);
}

const today = normalizeDate(new Date());
const start = normalizeDate(startDate);
const end = normalizeDate(endDate);

const totalDays = getDayDifference(start, end) + 1;
let passedDays = getDayDifference(start, today) + 1;

if (today < start) {
  passedDays = 0;
}

if (today > end) {
  passedDays = totalDays;
}

progressText.textContent = `Tag ${passedDays} von ${totalDays}`;

for (let i = 0; i < totalDays; i++) {
  const dayBox = document.createElement("div");
  dayBox.classList.add("day-box");

  const currentDate = new Date(start);
  currentDate.setDate(start.getDate() + i);

  if (currentDate < today) {
    dayBox.classList.add("past");
  } else if (currentDate.getTime() === today.getTime()) {
    dayBox.classList.add("today");
  } else {
    dayBox.classList.add("future");
  }

  dayBox.style.animationDelay = `${i * 0.01}s`;
  dayBox.title = currentDate.toLocaleDateString("de-DE");

  trackerGrid.appendChild(dayBox);
}