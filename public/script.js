document.addEventListener("DOMContentLoaded", async () => {
  // Render menu items on index.html
  const drinksCol = document.getElementById("menu-drinks-column");
  const dishesCol = document.getElementById("menu-dish-column");
  if (drinksCol && dishesCol) {
    try {
      const response = await fetch("/api/menu/available");
      const items = await response.json();

      const renderItem = (item) => `
        <div class="menu-item menu-item-header">
          <h2>${item.name}</h2>
          <h3>${item.description_danish}</h3>
          <h4>${item.description_english}</h4>
          <h2>${item.price.toFixed(2)},- DKK</h2>
        </div>
      `;

      items.forEach(item => {
        if (item.category_id == 2) {
          drinksCol.innerHTML += renderItem(item);
        } else if (item.category_id == 1) {
          dishesCol.innerHTML += renderItem(item);
        }
      });
    } catch (err) {
      console.error("Failed to load menu:", err);
    }
  }
});

//#region MENU SYSTEM

async function removeItem(id) {
  const res = await fetch(`/api/menu/${id}`, {
    method: 'DELETE'
  });
  if (res.ok) {
    await fetch("/api/menu/");
  } else {
    console.error("Failed to delete item:", await res.text());
  }
};

async function addItem(name, category_id, description_danish, description_english, price) {
  const res = await fetch('/api/menu', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, category_id, description_danish, description_english, price })
  });
  if (res.ok) {
    await fetch("/api/menu/");
  } else {
    console.error("Failed to add item:", await res.text());
  }
};

async function updateItemFull(name, category_id, description_danish, description_english, price, isAvailable, id) {
  const res = await fetch(`/api/menu/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', "X-API-KEY": getPublicApiKey() },
    body: JSON.stringify({ name, category_id, description_danish, description_english, price, isAvailable })
  });
  if (res.ok) {
    await fetch("/api/menu/");
  } else {
    console.error("Failed to update item:", await res.text());
  }
};

async function updateItem(isAvailable, id) {
  const res = await fetch(`/api/menu/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isAvailable })
  });
  if (res.ok) {
    await fetch("/api/menu/");
  } else {
    console.error("Failed to update item availability:", await res.text());
  }
};

//#endregion

//#region RESERVATION SYSTEM

async function removeReservation(id) {
  const res = await fetch(`/api/reservation/${id}`, {
    method: 'DELETE'
  });
  if (res.ok) {
    await fetch("/api/reservation/");
  } else {
    console.error("Failed to delete reservation:", await res.text());
  }
};

async function addReservation(phone, table_id, date, time) {
  reservation_time = `${date} ${time}`;
  const res = await fetch('/api/reservation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({phone, table_id, reservation_time})
  });
  if (res.ok) {
    await fetch("/api/reservation/");
  } else {
    console.error("Failed to add reservation:", await res.text());
  }
};

async function updateReservation(phone, table_id, date, time, id) {
  reservation_time = `${date} ${time}`;
  const res = await fetch(`/api/reservation/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({phone, table_id, reservation_time})
  });
  if (res.ok) {
    await fetch("/api/reservation/");
  } else {
    console.error("Failed to update reservation:", await res.text());
  }
};

//#endregion

//#region ORDER SYSTEM

async function removeOrder(id) {
  const res = await fetch(`/api/orders/${id}`, {
    method: 'DELETE'
  });
  //${id}
  if (res.ok) {
    await fetch("/api/orders/");
  } else {
    console.error("Failed to delete order:", await res.text());
  }
};

async function addOrder(reservation_id, table_id) {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reservation_id, table_id })
  });
  if (res.ok) {
    await fetch("/api/orders/");
  } else {
    console.error("Failed to add order:", await res.text());
  }
};

async function updateOrder(reservation_id, table_id, status, id) {
  try {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reservation_id,
        table_id,
        status
      })
    });

    if (res.ok) {
      const updatedOrder = await res.json();

      await fetch("/api/orders/");

      return updatedOrder;
    } else {
      console.error("Failed to update order:", await res.text());
    }
  } catch (err) {
    console.error("Error updating order:", err);
  }
}

//#endregion

//#region ORDER-LINE SYSTEM

async function removeOrderLine(id) {
  const res = await fetch(`/api/orderlines/${id}`, {
    method: 'DELETE'
  });
  //${id}
  if (res.ok) {
    await fetch("/api/orderlines/");
  } else {
    console.error("Failed to delete order-line:", await res.text());
  }
};

async function addOrderLine(order_id, menu_item_id, quantity, unit_price) {
  const res = await fetch('/api/orderlines', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({order_id, menu_item_id, quantity, unit_price})
  });
  if (res.ok) {
    await fetch("/api/orderlines/");
  } else {
    console.error("Failed to add order-line:", await res.text());
  }
};

async function updateOrderLine(order_id, menu_item_id, quantity, unit_price, id) {
  try {
    const res = await fetch(`/api/orderlines/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id, menu_item_id, quantity, unit_price
      })
    });

    if (res.ok) {
      const updatedOrder = await res.json();

      await fetch("/api/orderlines/");

      return updatedOrder;
    } else {
      console.error("Failed to update order-line:", await res.text());
    }
  } catch (err) {
    console.error("Error updating order-line:", err);
  }
}

//#endregion

//#region BOOKING PAGE LOGIC

document.addEventListener("DOMContentLoaded", () => {
  // Populate time select if it exists
  const timeSelect = document.querySelector(".tidspunkt-input");
  if (timeSelect && timeSelect.tagName === "SELECT") {
    timeSelect.innerHTML = ""; // Clear any existing options
    // Example: 10:00 to 22:00 every 30 minutes
    for (let hour = 10; hour <= 22; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const h = hour.toString().padStart(2, "0");
        const m = min.toString().padStart(2, "0");
        const timeStr = `${h}:${m}`;
        const option = document.createElement("option");
        option.value = timeStr;
        option.textContent = timeStr;
        timeSelect.appendChild(option);
      }
    }
    // Optionally, add a default empty option
    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "Vælg tidspunkt";
    emptyOption.selected = true;
    emptyOption.disabled = true;
    timeSelect.insertBefore(emptyOption, timeSelect.firstChild);
  }

  const bookingButton = document.querySelector(".booking-button");
  if (bookingButton) {
    bookingButton.addEventListener("click", async (e) => {
      e.preventDefault();

      const name = document.querySelector(".name-input").value.trim();
      const tel = document.querySelector(".tlf-input").value.trim();
      const party_size = document.querySelector(".bord-input").value.trim();
      const date = document.querySelector(".dato-input").value;
      let time = timeSelect ? timeSelect.value : "";

      // If no time selected, use current time (HH:MM)
      if (!time) {
        const now = new Date();
        time = now.toTimeString().slice(0,5);
      }

      if (!name || !tel || !party_size || !date) {
        alert("Udfyld alle felter.");
        return;
      }

      try {
        const res = await fetch("/api/reservations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, tel, date, time, party_size })
        });
        const data = await res.json();
        if (res.ok) {
          alert("Reservation oprettet!");
          // Optionally reset form fields here
        } else {
          alert(data.error || "Noget gik galt.");
        }
      } catch (err) {
        alert("Server fejl.");
      }
    });
  }
});

//#endregion

//#region JW TOKEN LOGIC

const jwt = require("jsonwebtoken");

const METABASE_SITE_URL = "http://10.130.54.25:3001";
const METABASE_SECRET_KEY = "759b14cb2dbecd0536e0534029c2df074ad6949b55f5f246455da1d7c1cab796";

const payload = {
  resource: { dashboard: 5 },
  params: {},
  exp: Math.round(Date.now() / 1000) + (10 * 60) // 10 minute expiration
};
const token = jwt.sign(payload, METABASE_SECRET_KEY);

const iframeUrl = METABASE_SITE_URL + "/embed/dashboard/" + token +
  "#theme=night&bordered=true&titled=true";

document.getElementById("metabase-iframe").src = iframeUrl;

//#endregion