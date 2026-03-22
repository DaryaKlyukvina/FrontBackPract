import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Показывает контент только если роль пользователя входит в массив allowedRoles
export const ProtectedComponent = ({ allowedRoles, children }) => {
    const { user } = useContext(AuthContext);

    if (!user || !allowedRoles.includes(user.role)) {
        return null; // Ничего не показываем
    }

    return <>{children}</>;
};