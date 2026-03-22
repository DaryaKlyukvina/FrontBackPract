import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext'; // Путь к твоему контексту

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const { user: currentUser } = useContext(AuthContext); // Берем текущего админа из контекста
  
  // ВАЖНО: используем 'accessToken', как в AuthProvider
  const token = localStorage.getItem('accessToken'); 

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) { 
      console.error("Ошибка загрузки", err); 
    }
  };

  useEffect(() => { 
    if (token) fetchUsers(); 
  }, [token]);

  const handleUpdate = async (id, data) => {
    // Защита: не даем админу заблокировать самого себя через интерфейс
    if (id === currentUser?.id && data.isBlocked !== undefined) {
      alert("Вы не можете заблокировать самого себя!");
      return;
    }

    try {
      await axios.patch(`http://localhost:3000/api/users/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers(); 
    } catch (err) { 
      alert(err.response?.data?.message || "Ошибка при обновлении"); 
    }
  };

  return (
    <div style={{ padding: '20px', background: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Управление пользователями</h1>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#252525', borderRadius: '8px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #444', height: '60px', background: '#333' }}>
              <th>ID</th>
              <th>Email</th>
              <th>Роль</th>
              <th>Статус</th>
              <th>Действие</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #333', height: '55px', textAlign: 'center' }}>
                <td style={{ fontSize: '12px', color: '#888' }}>{u.id}</td>
                <td>{u.email}</td>
                <td>
                  <select 
                    value={u.role} 
                    onChange={(e) => handleUpdate(u.id, { role: e.target.value })}
                    style={{ 
                      background: '#444', 
                      color: 'white', 
                      border: '1px solid #555', 
                      padding: '5px',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="USER">USER</option>
                    <option value="SELLER">SELLER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    fontSize: '14px',
                    background: u.isBlocked ? 'rgba(220, 53, 69, 0.2)' : 'rgba(40, 167, 69, 0.2)',
                    color: u.isBlocked ? '#ff4d4d' : '#2ecc71' 
                  }}>
                    {u.isBlocked ? 'Заблокирован' : 'Активен'}
                  </span>
                </td>
                <td>
<button 
  onClick={() => handleUpdate(u.id, { isBlocked: !u.isBlocked })}
  // Дизейблим кнопку, если это ТЫ сам ИЛИ если у пользователя роль ADMIN
  disabled={u.id === currentUser?.id || u.role === 'ADMIN'} 
  style={{ 
    padding: '6px 12px', 
    background: u.isBlocked ? '#28a745' : '#dc3545', 
    color: 'white', 
    border: 'none', 
    borderRadius: '4px',
    // Меняем курсор и прозрачность для наглядности
    cursor: (u.id === currentUser?.id || u.role === 'ADMIN') ? 'not-allowed' : 'pointer',
    opacity: (u.id === currentUser?.id || u.role === 'ADMIN') ? 0.3 : 1,
  }}
>
  {u.isBlocked ? 'Разблокировать' : 'Заблокировать'}
</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;