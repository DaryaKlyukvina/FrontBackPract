const express = require('express');
const router = express.Router();
const { getAllUsers, findUserById } = require('../models/User');
const { authMiddleware, checkRole } = require('./auth');

/**
 * @swagger
 * tags:
 * name: Users
 * description: Управление пользователями (Задание №11 - Только для Администратора)
 */

/**
 * @swagger
 * /api/users:
 * get:
 * summary: Получить список всех пользователей
 * tags: [Users]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: Список пользователей успешно получен
 * 403:
 * description: Доступ запрещен (недостаточно прав)
 * 401:
 * description: Не авторизован
 */
// Добавляем async перед (req, res)
router.get('/', authMiddleware, checkRole(['ADMIN']), async (req, res) => {
    try {
        const users = await getAllUsers(); // Добавляем await
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Ошибка при получении пользователей" });
    }
});

/**
 * @swagger
 * /api/users/{id}:
 * get:
 * summary: Получить пользователя по ID
 * tags: [Users]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * responses:
 * 200:
 * description: Данные пользователя получены
 * 404:
 * description: Пользователь не найден
 */
router.get('/:id', authMiddleware, checkRole(['ADMIN']), async (req, res) => {
    try {
        const user = await findUserById(req.params.id); // Добавляем await
        if (!user) return res.status(404).json({ message: "Пользователь не найден" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

module.exports = router;