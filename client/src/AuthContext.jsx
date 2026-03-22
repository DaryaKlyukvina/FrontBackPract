import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Проверка токена при загрузке приложения (Задание №8)
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token && typeof token === 'string') {
            try {
                const decoded = jwtDecode(token);
                setUser(decoded);
            } catch (e) {
                console.error("Ошибка при чтении сохраненного токена:", e);
                localStorage.removeItem('accessToken');
            }
        }
        setLoading(false);
    }, []);

    // Функция входа: принимает ТОКЕНЫ, сохраняет их и декодирует данные юзера
    const login = (accessToken, refreshToken) => {
        if (!accessToken || typeof accessToken !== 'string') {
            console.error("Ошибка: Передан невалидный accessToken в функцию login");
            return;
        }

        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
        }

        try {
            // Декодируем токен, чтобы получить { id, email, role }
            const decoded = jwtDecode(accessToken);
            setUser(decoded);
        } catch (e) {
            console.error("Ошибка декодирования токена:", e);
        }
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};