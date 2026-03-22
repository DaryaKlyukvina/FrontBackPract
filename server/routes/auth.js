const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { createUser, findUserByEmail, getUserSafe } = require('../models/User');

const ACCESS_SECRET = "access_super_secret";
const REFRESH_SECRET = "refresh_super_secret";

const generateTokens = (payload) => {
    const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};

// РЕГИСТРАЦИЯ
router.post('/register', async (req, res) => {
    const { email, password, first_name, last_name, role } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email и пароль обязательны" });

    const exists = await findUserByEmail(email);
    if (exists) return res.status(400).json({ message: "Пользователь уже существует" });

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await createUser({ 
        email, 
        password: hashedPassword, 
        first_name, 
        last_name, 
        role: role || 'USER' 
    });

    res.status(201).json({ message: "Пользователь создан", user: getUserSafe(newUser) });
});

// ВХОД
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ message: "Пользователь не найден" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Неверный пароль" });

    const tokens = generateTokens({ id: user.id, email: user.email, role: user.role });
    res.json(tokens);
});

// ОБНОВЛЕНИЕ ТОКЕНА
router.post('/refresh', (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: "Refresh токен отсутствует" });

    try {
        const userData = jwt.verify(refreshToken, REFRESH_SECRET);
        const tokens = generateTokens({ id: userData.id, email: userData.email, role: userData.role });
        res.json(tokens);
    } catch (e) {
        res.status(401).json({ message: "Refresh токен невалиден" });
    }
});

// MIDDLEWARE
function authMiddleware(req, res, next) {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: "Нет токена" });

    const token = header.split(' ')[1];
    try {
        const decoded = jwt.verify(token, ACCESS_SECRET);
        req.user = decoded; 
        next();
    } catch (e) {
        res.status(401).json({ message: "Неверный или просроченный access токен" });
    }
}

const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Нет доступа (недостаточно прав)" });
        }
        next();
    };
};

router.get('/me', authMiddleware, (req, res) => {
    res.json(req.user);
});

// ПРАВИЛЬНЫЙ ЭКСПОРТ
module.exports = router;
module.exports.authMiddleware = authMiddleware; // Теперь это сработает
module.exports.checkRole = checkRole;