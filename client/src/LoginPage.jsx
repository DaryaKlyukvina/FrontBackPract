// LoginPage.jsx
import React, { useState } from "react";

function LoginPage({ setToken, setPage }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const loginUser = async () => {
    if (!login || !password) {
      alert("Введите логин и пароль");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message || "Ошибка входа");
        return;
      }

      const data = await res.json();

      localStorage.setItem("token", data.token);
      setToken(data.token);
      setPage("products");
    } catch (error) {
      console.error(error);
      alert("Ошибка сервера");
    }
  };

  return (
    <div className="auth-page">
      <h2>Вход</h2>

      <input
        placeholder="Login"
        value={login}
        onChange={(e) => setLogin(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={loginUser}>Войти</button>

      <p>
        Нет аккаунта?{" "}
        <button onClick={() => setPage("register")}>Зарегистрироваться</button>
      </p>
    </div>
  );
}

export default LoginPage;