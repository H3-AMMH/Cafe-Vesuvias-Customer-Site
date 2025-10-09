document.addEventListener("DOMContentLoaded", async () => {
    try {
        document.getElementById(`create-item-button`).addEventListener("click", async () => {
            newItem();
        });

        document.getElementById(`create-user-button`).addEventListener("click", async () => {
            newUser();
        });

        document.getElementById(`log-out-button`).addEventListener("click", async () => {
            logoutUser();
        });

        await reloadMenuContent();
        await reloadUserContent();
    } catch (err) {
        console.error("Failed to load menu:", err);
    }
    try {
        const resp = await fetch("/metabase-dashboard", { credentials: "include" });
        if (!resp.ok) throw new Error("Failed to get embed URL");
        const { url } = await resp.json();
        // set the existing iframe src
        const iframe = document.getElementById("metabase-iframe");
        iframe.src = url;
    } catch (err) {
        console.error("Metabase embed error:", err);
        document.querySelector(".metabase-embed").innerText = "Could not load dashboard.";
    }
});

async function logoutUser() {
	localStorage.removeItem("token");

	window.location.href = "/";
}

async function reloadUserContent() {
    const token = localStorage.getItem("token");

    const apiKey = await fetchApiKey(token);

    const itemContainer = document.getElementById("user-container");
    itemContainer.innerHTML = "";

    const userRes = await fetch("/api/users", {
        headers: {
            "x-api-key": apiKey
        }
    });

    if (!userRes.ok) {
        console.error("Failed to fetch users:", userRes.status);
        return;
    }

    const users = await userRes.json();

    const renderItem = (user, role) => `
        <div class="user-entry" data-id="${user.id}">
            <h2>Navn: ${user.first_name} ${user.last_name}</h2>
            <p>Rolle: ${role.role_name}</p>
            <p>E-mail: ${user.email}</p>
            <p>Tlf: ${user.phone}</p>
            <button class="delete-btn">Slet</button>
            <button class="edit-btn">Rediger</button>
        </div>
    `;

    const itemsHTML = await Promise.all(users.map(async user => {
        const roleRes = await fetch(`/api/roles/${user.user_role_id}`, {
        headers: {
            "x-api-key": apiKey
        }
        });
        const data = await roleRes.json();
        const role = data[0];
        return renderItem(user, role);
    }));

    itemContainer.innerHTML = itemsHTML.join("");

    itemContainer.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const container = btn.closest(".user-entry");
            const id = container.dataset.id;
            await deleteUser(id, apiKey);
            await reloadUserContent();
        });
    });

    itemContainer.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const container = btn.closest(".user-entry");
            const id = container.dataset.id;
            await editUser(id, container, apiKey);
        });
    });
}

async function editUser(userId, container, apiKey) {
    try {
        const response = await fetch(`/api/users/${userId}`, {
        headers: {
            "x-api-key": apiKey
        }
        });
        const data = await response.json();
        const user = data[0];

        const renderItem = (user) => `
            <div class="user-item">
                <h2>Navn:</h2>
                <input id="first-name" placeholder="Fornavn" value="${user.first_name}">
                <input id="last-name" placeholder="Efternavn" value="${user.last_name}"><br>
                <p>Rolle:</p>
                <select class="role-select" id="role-select"></select><br>
                <p>E-mail:</p>
                <input id="email" value="${user.email}"><br>
                <p>Tlf:</p>
                <input id="phone" value="${user.phone}"><br>
                <button class="delete-btn">Slet</button>
                <button class="cancel-btn">Annuller</button>
                <button class="save-btn">Gem</button>
            </div>
        `;

        const temp = document.createElement("div");
        temp.innerHTML = renderItem(user);
        const item = temp.firstElementChild;

        const selectBox = item.querySelector("#role-select");

        const rolesRes = await fetch(`/api/roles`, {
        headers: { "x-api-key": apiKey }
        });
        const roleData = await rolesRes.json();

        roleData.forEach(role => {
        const option = document.createElement("option");
        option.value = role.id;
        option.textContent = role.role_name;
        selectBox.appendChild(option);
        });

        selectBox.value = user.user_role_id;
        
        container.innerHTML = "";
        container.appendChild(item);
        
        container.querySelector(".delete-btn").addEventListener("click", async () => {
            await deleteUser(user.id);
            await reloadUserContent();
        });

        container.querySelector(".cancel-btn").addEventListener("click", async () => {
            await reloadUserContent();
        });

        container.querySelector(".save-btn").addEventListener("click", async () => {
            await updateUser(
                container.querySelector("#first-name").value.toString(),
                container.querySelector("#last-name").value.toString(),
                container.querySelector("#role-select").value,
                container.querySelector("#email").value.toString(),
                container.querySelector("#phone").value.toString(),
                container.dataset.id,
                apiKey
            );
            await reloadUserContent();
        });

    } catch (err) {
        console.error("Failed to open editor:", err);
    }
}

async function newUser() {
    try {
        const token = localStorage.getItem("token");

        const apiKey = await fetchApiKey(token);

        const itemContainer = document.getElementById("user-container");

        const renderItem = () => `
            <div class="user-entry">
                <h2>Navn:</h2>
                <input id="first-name" placeholder="Fornavn">
                <input id="last-name" placeholder="Efternavn"><br>
                <p>Kodeord:</p>
                <input type="password" id="password"><br>
                <p>Rolle:</p>
                <select class="role-select" id="role-select"></select><br>
                <p>E-mail:</p>
                <input type="email" id="email"><br>
                <p>Tlf:</p>
                <input id="phone"><br>
                <button class="cancel-btn">Slet</button>
                <button class="create-btn">Opret Bruger</button>
            </div>
        `;

        const temp = document.createElement("div");
        temp.innerHTML = renderItem();
        const item = temp.firstElementChild;

        // populate roles
        const selectBox = item.querySelector("#role-select");
        const rolesRes = await fetch(`/api/roles`, { headers: { "x-api-key": apiKey } });
        const roleData = await rolesRes.json();

        roleData.forEach(role => {
            const option = document.createElement("option");
            option.value = role.id;
            option.textContent = role.role_name;
            selectBox.appendChild(option);
        });

        // append item
        itemContainer.innerHTML = ""; // clear previous
        itemContainer.appendChild(item);


        const container = itemContainer.querySelector(".user-entry");

        container.querySelector(".cancel-btn").addEventListener("click", async () => {
            await reloadUserContent();
        });

        container.querySelector(".create-btn").addEventListener("click", async () => {
            await createUser(
                container.querySelector("#first-name").value.toString(),
                container.querySelector("#last-name").value.toString(),
                container.querySelector("#password").value.toString(),
                container.querySelector("#role-select").value,
                container.querySelector("#email").value.toString(),
                container.querySelector("#phone").value.toString(),
                apiKey
            );
            await reloadUserContent();
        });

    } catch (err) {
        console.error("Failed to open editor:", err);
    }
}

async function reloadMenuContent() {
    const token = localStorage.getItem("token");

    const apiKey = await fetchApiKey(token);

    const itemContainer = document.getElementById("main-container");
    itemContainer.innerHTML = "";

    const menuRes = await fetch("/api/menu", {
        headers: {
            "x-api-key": apiKey
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
            "x-api-key": apiKey
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
            await removeItem(id, apiKey);
            await reloadMenuContent();
        });
    });

    itemContainer.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const container = btn.closest(".container-item");
            const id = container.dataset.id;
            await editItem(id, container, apiKey);
        });
    });

    function AvailabilityToString(isAvailable) {
        return isAvailable === 1 ? "Ja" : "Nej";
    }
}

async function editItem(itemId, container, apiKey) {
    try {
        const response = await fetch(`/api/menu/${itemId}`, {
        headers: {
            "x-api-key": apiKey
        }
        });
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
            await reloadMenuContent();
        });

        container.querySelector(".cancel-btn").addEventListener("click", async () => {
            await reloadMenuContent();
        });

        container.querySelector(".save-btn").addEventListener("click", async () => {
            await updateItemFull(
                container.querySelector("#name").value.toString(),
                container.querySelector("#category-id").value,
                container.querySelector("#description-dk").value.toString(),
                container.querySelector("#description-en").value.toString(),
                container.querySelector("#price").value,
                container.querySelector("#availability").checked == true ? 1 : 0,
                container.dataset.id,
                apiKey
            );
            await reloadMenuContent();
        });

    } catch (err) {
        console.error("Failed to open editor:", err);
    }
}

async function newItem() {
    try {
        const token = localStorage.getItem("token");

        const apiKey = await fetchApiKey(token);

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
            await reloadMenuContent();
        });

        container.querySelector(".create-btn").addEventListener("click", async () => {
            await addItem(
                container.querySelector("#name").value.toString(),
                container.querySelector("#category-id").value,
                container.querySelector("#description-dk").value.toString(),
                container.querySelector("#description-en").value.toString(),
                container.querySelector("#price").value,
                apiKey
            );
            await reloadMenuContent();
        });

    } catch (err) {
        console.error("Failed to open editor:", err);
    }
}

async function fetchApiKey(token) {
    const res = await fetch("/api/key", {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!res.ok) throw new Error("Failed to fetch API key");
    const data = await res.json();
    return data.apiKey;
}
