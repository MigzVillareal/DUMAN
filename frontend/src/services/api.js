export async function login(email, password) {
  const response = await fetch("/api/v1/auths/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  return response.json();
}
