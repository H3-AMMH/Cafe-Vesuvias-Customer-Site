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