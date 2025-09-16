document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("/api/timetables");
    const times = await response.json();

    const selectBox = document.getElementById("timetable-select");

    times.forEach(time => {
      if (time.available) {
        const option = document.createElement("option");
        option.value = time.clock;
        option.textContent = time.clock;
        selectBox.appendChild(option);
      }
    });

  } catch (err) {
    console.error("Failed to load available times:", err);
  }
});