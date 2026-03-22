import React from 'react'; // Добавь этот импорт
import { useContext } from 'react';
import { AuthContext } from '../AuthContext';

// Показывает контент только если роль пользователя входит в массив allowedRoles
export const ProtectedComponent = ({ allowedRoles, children }) => {
    const { user } = useContext(AuthContext);

    if (!user || !allowedRoles.includes(user.role)) {
        return null; // Ничего не показываем
    }

    return <>{children}</>;
};