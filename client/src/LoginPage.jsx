import React, { useState, useContext } from "react";
import { api } from "../api/index"; 
import { AuthContext } from "./AuthContext"; 

function LoginPage({ setPage }) {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    
    // Получаем функцию login из нашего AuthContext
    const { login: contextLogin } = useContext(AuthContext);

    const loginUser = async () => {
        if (!login || !password) {
            alert("Введите логин и пароль");
            return;
        }

        try {
            // 1. Отправляем запрос на сервер (используем и email, и login для надежности)
            const data = await api.login({ 
                email: login, 
                login: login, 
                password: password 
            });

            // 2. Проверяем, что сервер вернул токены
            if (data && data.accessToken) {
                // ПЕРЕДАЕМ ТОЛЬКО ТОКЕНЫ в контекст. 
                // Контекст сам расшифрует роль и email из accessToken.
                if (contextLogin) {
                    contextLogin(data.accessToken, data.refreshToken);
                }

                alert("Вход выполнен успешно!");
                setPage("products"); // Переходим на страницу товаров
            } else {
                alert("Ошибка: Сервер не вернул токен доступа.");
            }
            
        } catch (error) {
            console.error("Ошибка при входе:", error);
            const message = error.response?.data?.message || "Неверный логин или пароль";
            alert(message);
        }
    };

    return (
        <div className="auth-page">
            <h2>Вход</h2>
            
            <div className="form-group">
                <input
                    placeholder="Email или Логин"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    autoComplete="email"
                />
            </div>

            <div className="form-group">
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                />
            </div>

            <button className="btn-login" onClick={loginUser}>Войти</button>

            <div className="auth-footer">
                <p>
                    Нет аккаунта?{" "}
                    <button className="link-btn" onClick={() => setPage("register")}>
                        Зарегистрироваться
                    </button>
                </p>
                <button 
                    className="link-btn back-btn" 
                    onClick={() => setPage("products")}
                    style={{ marginTop: '10px' }}
                >
                    Назад к товарам
                </button>
            </div>
        </div>
    );
}

export default LoginPage;