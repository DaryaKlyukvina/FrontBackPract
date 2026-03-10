const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { createUser, findUserByLogin } = require('../models/User');

const SECRET = "super_secret_key";

router.post('/register', (req, res) => {
  const { login, password } = req.body;
  if (!login || !password) return res.status(400).json({ message: "Login и password обязательны" });
  const exists = findUserByLogin(login);
  if (exists) return res.status(400).json({ message: "Пользователь уже существует" });

  const user = createUser({ login, password });
  res.status(201).json({ message: "Пользователь создан", userId: user.id });
});

router.post('/login', async (req, res) => {
  const { login, password } = req.body;
  const user = findUserByLogin(login);
  if (!user) return res.status(401).json({ message: "Неверный логин" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: "Неверный пароль" });

  const token = jwt.sign({ id: user.id, login: user.login }, SECRET, { expiresIn: '1h' });
  res.json({ token });
});

module.exports = router;