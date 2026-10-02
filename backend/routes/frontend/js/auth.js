const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const message = document.getElementById("message");

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                message.textContent = data.message;
                message.style.color = "green";

                registerForm.reset();
            } else {
                message.textContent = data.message;
                message.style.color = "red";
            }

        } catch (error) {
            console.error(error);

            message.textContent = "Unable to connect to server";
            message.style.color = "red";
        }
    });
}
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        const message = document.getElementById("loginMessage");

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                // Save login information
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));

                message.textContent = "Login successful!";
                message.style.color = "green";

                // Go to dashboard
                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 1000);

            } else {
                message.textContent = data.message;
                message.style.color = "red";
            }

        } catch (error) {
            console.error(error);

            message.textContent = "Unable to connect to server";
            message.style.color = "red";
        }
    });
}