import React, { useState } from "react";
import { api } from "../api/index"; 

function RegisterPage({ setPage }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!login || !password) {
      alert("Заполните все поля");
      return;
    }

    try {
      // ИСПРАВЛЕНИЕ: Отправляем и email, и login, 
      // чтобы сервер точно нашел то, что ему нужно
      await api.register({ 
        email: login, 
        login: login, 
        password: password 
      });
      
      alert("Регистрация успешна! Теперь войдите.");
      setPage("login");
    } catch (error) {
      console.error("Ошибка регистрации:", error);
      // Выводим сообщение от сервера, если оно есть
      const msg = error.response?.data?.message || "Ошибка данных (400) или сервера (500)";
      alert(msg);
    }
  };

  return (
    <div className="auth-page">
      <h2>Регистрация</h2>
      <input 
        placeholder="Логин (email)" 
        value={login} 
        onChange={(e) => setLogin(e.target.value)} 
      />
      <input 
        type="password" 
        placeholder="Пароль" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      />
      
      <button onClick={handleRegister}>Зарегистрироваться</button>

      <p>
        Есть аккаунт?{" "}
        <button onClick={() => setPage("login")}>Войти</button>
      </p>
      
      <button onClick={() => setPage("products")} style={{marginTop: '10px'}}>
        Назад к товарам
      </button>
    </div>
  );
}

export default RegisterPage;