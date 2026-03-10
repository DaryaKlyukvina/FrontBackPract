import { useState } from "react";

function LoginPage({ setToken, setPage }) {

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const loginUser = async () => {
    const res = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password })
    });

    const data = await res.json();

    localStorage.setItem("token", data.token);
    setToken(data.token);
    setPage("products");
  };

  return (
    <div className="auth-page">

      <h2>Вход</h2>

      <input
        placeholder="Login"
        onChange={e => setLogin(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={e => setPassword(e.target.value)}
      />

      <button onClick={loginUser}>
        Войти
      </button>

    </div>
  );
}

export default LoginPage;