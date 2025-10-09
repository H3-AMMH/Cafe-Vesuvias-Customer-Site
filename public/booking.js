document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("/api/timetables", {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const times = await response.json();

    const selectBox = document.getElementById("timetable-select");

    times.forEach(time => {
      if (time.occupied_tables < 28) {
        const option = document.createElement("option");
        option.value = time.clock;
        option.textContent = time.clock;
        selectBox.appendChild(option);
      }
    });

    document.getElementById(`booking-button`).addEventListener("click", async () => {
      await addReservation(
        document.getElementById("name-input").value,
        document.getElementById("tlf-input").value,
        document.getElementById("dato-input").value,
        document.getElementById("timetable-select").value,
        document.getElementById("bord-input").value
      );
    });

  } catch (err) {
    console.error("Failed to load available times:", err);
  }
});