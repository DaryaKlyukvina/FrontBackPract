const express = require('express');
const router = express.Router();
// Добавляем импорт новых функций из модели
const { getAllUsers, updateUser, findUserById } = require('../models/User');
const { authMiddleware, checkRole } = require('./auth');

/**
 * GET /api/users
 * Получение списка всех пользователей (Только для ADMIN)
 */
router.get('/', authMiddleware, checkRole(['ADMIN']), async (req, res) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Ошибка сервера при получении списка" });
    }
});

/**
 * PATCH /api/users/:id
 * Редактирование данных или блокировка (Только для ADMIN)
 */
router.patch('/:id', authMiddleware, checkRole(['ADMIN']), async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body; // Здесь могут быть { role: "..." } или { isBlocked: true }

        // Проверяем, существует ли такой пользователь
        const user = await findUserById(id);
        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        // Защита: админ не может заблокировать самого себя (по желанию)
        if (user.email === req.user.email && updateData.isBlocked !== undefined) {
             return res.status(400).json({ message: "Вы не можете заблокировать самого себя" });
        }

        const updatedUser = await updateUser(id, updateData);
        res.json({ message: "Данные обновлены", user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка сервера при обновлении пользователя" });
    }
});

module.exports = router;