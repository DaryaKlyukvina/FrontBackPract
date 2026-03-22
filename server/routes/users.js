const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../models/User');
const { authMiddleware, checkRole } = require('./auth');


router.get('/', authMiddleware, checkRole(['ADMIN']), async (req, res) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

module.exports = router;