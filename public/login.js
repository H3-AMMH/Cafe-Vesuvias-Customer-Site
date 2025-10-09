document.addEventListener("DOMContentLoaded", () => {
	const loginButton = document.getElementById("login-button");
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
					'Content-Type': 'application/json'
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