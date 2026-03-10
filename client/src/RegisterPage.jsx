import { useState } from "react";

function RegisterPage({ setPage }) {

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const registerUser = async () => {
    await fetch("http://localhost:3000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password })
    });

    alert("Пользователь создан");
    setPage("login");
  };

  return (
    <div className="auth-page">

      <h2>Регистрация</h2>

      <input
        placeholder="Login"
        onChange={e => setLogin(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={e => setPassword(e.target.value)}
      />

      <button onClick={registerUser}>
        Зарегистрироваться
      </button>

    </div>
  );
}

export default RegisterPage;