// RegisterPage.jsx
import { useState } from "react";

function RegisterPage({ setPage }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const registerUser = async () => {
    if (!login || !password) {
      alert("Введите логин и пароль");
      return;
    }

    if (password !== confirmPassword) {
      alert("Пароли не совпадают");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message || "Ошибка регистрации");
        return;
      }

      alert("Регистрация прошла успешно! Теперь войдите.");
      setPage("login");
    } catch (error) {
      console.error(error);
      alert("Ошибка сервера");
    }
  };

  return (
    <div className="auth-page">
      <h2>Регистрация</h2>

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

      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <button onClick={registerUser}>Зарегистрироваться</button>

      <p>
        Уже есть аккаунт?{" "}
        <button onClick={() => setPage("login")}>Войти</button>
      </p>
    </div>
  );
}

export default RegisterPage;