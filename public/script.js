document.addEventListener("DOMContentLoaded", async () => {
  // Render menu items on index.html
  const drinksCol = document.getElementById("menu-drinks-column");
  const dishesCol = document.getElementById("menu-dish-column");
  if (drinksCol && dishesCol) {
    try {
      const response = await fetch("/api/menu/available", {
        headers: { "X-API-KEY": getApiKey() }
      });
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
    method: 'DELETE',
    headers: { "X-API-KEY": getApiKey() }
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
    headers: { 'Content-Type': 'application/json', "X-API-KEY": getApiKey() },
    body: JSON.stringify({ name, category_id, description_danish, description_english, price })
  });
  if (res.ok) {
    await fetch("/api/menu/");
  } else {
    console.error("Failed to add item:", await res.text());
  }
};

async function updateItem(name, category_id, description_danish, description_english, price, id) {
  const res = await fetch(`/api/menu/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', "X-API-KEY": getApiKey() },
    body: JSON.stringify({ name, category_id, description_danish, description_english, price })
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
    method: 'DELETE',
    headers: { "X-API-KEY": getApiKey() }
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
    headers: { 'Content-Type': 'application/json', "X-API-KEY": getApiKey() },
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
    headers: { 'Content-Type': 'application/json', "X-API-KEY": getApiKey() },
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
    method: 'DELETE',
    headers: { "X-API-KEY": getApiKey() }
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
    headers: { 'Content-Type': 'application/json', "X-API-KEY": getApiKey() },
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
      headers: { 'Content-Type': 'application/json', "X-API-KEY": getApiKey() },
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
    method: 'DELETE',
    headers: { "X-API-KEY": getApiKey() }
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
    headers: { 'Content-Type': 'application/json', "X-API-KEY": getApiKey() },
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
      headers: { 'Content-Type': 'application/json', "X-API-KEY": getApiKey() },
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
          headers: { "Content-Type": "application/json", "X-API-KEY": getApiKey() },
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

//#region DASHBOARD LOGIC

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await reloadContent();
  } catch (err) {
    console.error("Failed to load menu:", err);
  }
});

async function reloadContent() {
  const itemContainer = document.getElementById("main-container");

  const menuRes = await fetch("/api/menu/");
  const items = await menuRes.json();

  itemContainer.innerHTML = "";

  const categoryRes = await fetch("/api/menu/category/");
  const categories = await categoryRes.json();

  const renderItem = (item, category) => `
    <div class="container-item" data-id="${item.id}">
      <h2>${item.name}</h2>
      <p>Kategori: ${category}</p>
      <p>Tilgængeligt: ${AvailabilityToString(item.isAvailable)}</p>
      <p>Beskrivelse Dansk: ${item.description_danish}</p>
      <p>Beskrivelse Engelsk: ${item.description_english}</p>
      <p>Pris: ${item.price.toFixed(2)},- DKK</p>
      <button class="delete-btn">Slet</button>
      <button class="edit-btn">Rediger</button>
    </div>
  `;

  items.forEach(item => {
    if (!FindCategoryName(item, categories)) {
      itemContainer.innerHTML += renderItem(item, item.category_id.toString());
    }
  });

  itemContainer.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const container = btn.closest(".container-item");
      const id = container.dataset.id;
      await removeItem(id);
      await reloadContent();
    });
  });

  itemContainer.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const container = btn.closest(".container-item");
      const id = container.dataset.id;
      await editItem(id, container);
    });
  });

  function AvailabilityToString(isAvailable) {
    return isAvailable === 1 ? "Ja" : "Nej";
  }

  function FindCategoryName(item, categories) {
    for (const category of categories) {
      if (category.id === item.category_id) {
        itemContainer.innerHTML += renderItem(item, category.name);
        return true;
      }
    }
    return false;
  }
}

async function editItem(itemId, container) {
  try {
    const response = await fetch(`/api/menu/${itemId}`, {
      headers: { "X-API-KEY": getApiKey() }
    });
    const item = await response.json();

    container.innerHTML = `
      <h2>Titel:</h2>
      <input value="${item.name}"><br>
      <p>Kategori:</p>
      <input value="${item.category_id}"><br>
      <p>Beskrivelse Dansk:</p>
      <input value="${item.description_danish}"><br>
      <p>Beskrivelse Engelsk:</p>
      <input value="${item.description_english}"><br>
      <p>Pris:</p>
      <input type="number" value="${item.price}"><br>
      <button class="delete-btn">Slet</button>
      <button class="cancel-btn">Annuller</button>
      <button class="save-btn">Gem</button>
    `;

    // re-hook buttons inside editor
    container.querySelector(".delete-btn").addEventListener("click", async () => {
      await removeItem(item.id);
      await reloadContent();
    });

    container.querySelector(".cancel-btn").addEventListener("click", async () => {
      await reloadContent();
    });

    container.querySelector(".save-btn").addEventListener("click", async () => {
      await reloadContent();
    });
  } catch (err) {
    console.error("Failed to open editor:", err);
  }
}

/*
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
*/

//#endregion

//#region LOGIN PAGE LOGIC

document.addEventListener("DOMContentLoaded", () => {
	const loginButton = document.querySelector(".login-button");
	loginButton.addEventListener("click", async () => {
		const username = document.querySelector(".name-input").value.trim();
		const password = document.querySelector(".password-input").value.trim();
		if (!username || !password) {
			alert("Please enter both username and password.");
			return;
		}
		try {
			const res = await fetch("/api/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					username,
					password
				}),
			});
			if (res.ok) {
          const data = await res.json();
          localStorage.setItem("token", data.token);
          window.location.href = "./dashboard.html";
      } else {
				console.error("Login failed:", await res.text());
				alert("Invalid username or password.");
			}
		} catch (err) {
			console.error("Error logging in:", err);
			alert("Something went wrong. Try again.");
		}
	});
});

async function signupUser(first_name, last_name, email, password, phone, user_role_id) {
	if (!first_name || !last_name || !email || !password || !phone || !user_role_id) {
		alert("Please fill out all fields.");
		return;
	}
	try {
		const res = await fetch("/api/signup", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				first_name,
				last_name,
				user_role_id,
				email,
				password,
				phone
			})
		});
		if (res.ok) {
			const data = await res.json();
			console.error(`Account created: ${data.first_name}`);
			// Optionally auto-login or redirect:
			window.location.href = "/dashboard.html";
		} else {
			const errorData = await res.json();
			console.error(`Signup failed: ${errorData.error}`);
		}
	} catch (err) {
		console.error("Signup error:", err);
	}
}

//#endregion

function getApiKey() {
  const meta = document.querySelector('meta[name="api-key"]');
  return meta ? meta.content : "";
}