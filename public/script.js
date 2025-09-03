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
