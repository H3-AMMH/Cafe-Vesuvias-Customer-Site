document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("/api/menu");
    const items = await response.json();

    const drinksCol = document.getElementById("menu-drinks-column");
    const dishesCol = document.getElementById("menu-dish-column");

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
});

// MENU SYSTEM

async function removeItem(id) {
  const res = await fetch(`/api/menu/${id}`, {
    method: 'DELETE'
  });
  //${id}
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

async function updateItem(name, category_id, description_danish, description_english, price, id) {
  const res = await fetch(`/api/menu/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, category_id, description_danish, description_english, price })
  });
  if (res.ok) {
    await fetch("/api/reservation/");
  } else {
    console.error("Failed to update item:", await res.text());
  }
};

// RESERVATION SYSTEM

async function removeReservation(id) {
  const res = await fetch(`/api/reservation/${id}`, {
    method: 'DELETE'
  });
  //${id}
  if (res.ok) {
    await fetch("/api/reservation/");
  } else {
    console.error("Failed to delete item:", await res.text());
  }
};

async function addReservation(customer_id, table_id, time) {
  const res = await fetch('/api/reservation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({customer_id, table_id, time})
  });
  if (res.ok) {
    await fetch("/api/reservation/");
  } else {
    console.error("Failed to add item:", await res.text());
  }
};

async function updateReservation(customer_id, table_id, time, id) {
  const res = await fetch(`/api/reservation/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({customer_id, table_id, time})
  });
  if (res.ok) {
    await fetch("/api/reservation/");
  } else {
    console.error("Failed to update item:", await res.text());
  }
};