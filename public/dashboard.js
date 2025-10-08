document.addEventListener("DOMContentLoaded", async () => {
    try {
        await reloadContent();
    } catch (err) {
        console.error("Failed to load menu:", err);
    }
});

async function reloadContent() {
    const itemContainer = document.getElementById("main-container");
    itemContainer.innerHTML = "";

    // Get the token from wherever you store it (e.g., localStorage after login)
    const token = localStorage.getItem("token"); 

    const menuRes = await fetch("/api/menu", {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!menuRes.ok) {
        console.error("Failed to fetch menu:", menuRes.status);
        return;
    }

    const items = await menuRes.json();

    const renderItem = (item, category) => `
        <div class="container-item" data-id="${item.id}">
            <h2>${item.name}</h2>
            <p>Kategori: ${category.name}</p>
            <p>Tilgængeligt?: ${AvailabilityToString(item.isAvailable)}</p>
            <p>Beskrivelse Dansk: ${item.description_danish}</p>
            <p>Beskrivelse Engelsk: ${item.description_english}</p>
            <p>Pris: ${item.price.toFixed(2)},- DKK</p>
            <button class="delete-btn">Slet</button>
            <button class="edit-btn">Rediger</button>
        </div>
    `;

    const itemsHTML = await Promise.all(items.map(async item => {
        const categoryRes = await fetch(`/api/menu/category/${item.category_id}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        const data = await categoryRes.json();
        const category = data[0];
        return renderItem(item, category);
    }));

    itemContainer.innerHTML = itemsHTML.join("");

    itemContainer.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const container = btn.closest(".container-item");
            const id = container.dataset.id;
            await removeItem(id, token);
            await reloadContent();
        });
    });

    itemContainer.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const container = btn.closest(".container-item");
            const id = container.dataset.id;
            await editItem(id, container, token);
        });
    });

    function AvailabilityToString(isAvailable) {
        return isAvailable === 1 ? "Ja" : "Nej";
    }
}

async function editItem(itemId, container) {
    try {
        const response = await fetch(`/api/menu/${itemId}`);
        const data = await response.json();
        const item = data[0];

        const renderItem = (item) => `
            <h2>Titel:</h2>
            <textarea id="name">${item.name}</textarea><br>
            <p>Kategori:</p>
            <textarea id="category-id">${item.category_id}</textarea><br>
            <p>Tilgængeligt?:</p>
            <input id="availability" class="checkbox" type="checkbox" ${item.isAvailable ? "checked" : ""}><br>
            <p>Beskrivelse Dansk:</p>
            <textarea id="description-dk">${item.description_danish}</textarea><br>
            <p>Beskrivelse Engelsk:</p>
            <textarea id="description-en">${item.description_english}</textarea><br>
            <p>Pris:</p>
            <input id="price" type="number" value="${item.price}"><br>
            <button class="delete-btn">Slet</button>
            <button class="cancel-btn">Annuller</button>
            <button class="save-btn">Gem</button>
        `;

        container.innerHTML = renderItem(item);
        
        container.querySelector(".delete-btn").addEventListener("click", async () => {
            console.log(item.id);
            await removeItem(item.id);
            await reloadContent();
        });

        container.querySelector(".cancel-btn").addEventListener("click", async () => {
            await reloadContent();
        });

        container.querySelector(".save-btn").addEventListener("click", async () => {
            await updateItemFull(
                container.querySelector("#name").value.toString(),
                container.querySelector("#category-id").value,
                container.querySelector("#description-dk").value.toString(),
                container.querySelector("#description-en").value.toString(),
                container.querySelector("#price").value,
                container.querySelector("#availability").checked == true ? 1 : 0,
                container.dataset.id
            );
            await reloadContent();
        });

    } catch (err) {
        console.error("Failed to open editor:", err);
    }
}

async function newItem() {
    try {
        const itemContainer = document.getElementById("main-container");

        const renderItem = () => `
            <div class="container-item">
                <h2>Titel:</h2>
                <textarea id="name"></textarea><br>
                <p>Kategori:</p>
                <textarea id="category-id"></textarea><br>
                <p>Beskrivelse Dansk:</p>
                <textarea id="description-dk"></textarea><br>
                <p>Beskrivelse Engelsk:</p>
                <textarea id="description-en"></textarea><br>
                <p>Pris:</p>
                <input id="price" type="number" value=""><br>
                <button class="cancel-btn">Annuller</button>
                <button class="create-btn">Gem</button>
            </div>
        `;

        itemContainer.innerHTML = renderItem() + itemContainer.innerHTML;

        const container = itemContainer.querySelector(".container-item");

        container.querySelector(".cancel-btn").addEventListener("click", async () => {
            await reloadContent();
        });

        container.querySelector(".create-btn").addEventListener("click", async () => {
            await addItem(
                container.querySelector("#name").value.toString(),
                container.querySelector("#category-id").value,
                container.querySelector("#description-dk").value.toString(),
                container.querySelector("#description-en").value.toString(),
                container.querySelector("#price").value,
            );
            await reloadContent();
        });

    } catch (err) {
        console.error("Failed to open editor:", err);
    }
}