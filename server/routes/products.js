const express = require('express');
const router = express.Router();
const { getAllProducts, findProductById, createProduct, updateProduct, deleteProduct } = require('../models/Product');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "Нет токена" });

  const token = header.split(' ')[1];
  try {
    const decoded = require('jsonwebtoken').verify(token, "super_secret_key");
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Неверный токен" });
  }
}

router.get('/', (req, res) => {
  res.json(getAllProducts());
});

router.get('/:id', (req, res) => {
  const product = findProductById(req.params.id);
  if (!product) return res.status(404).json({ message: "Товар не найден" });
  res.json(product);
});

router.post('/', authMiddleware, (req, res) => {
  const product = createProduct(req.body);
  res.status(201).json(product);
});

router.patch('/:id', authMiddleware, (req, res) => {
  const product = updateProduct(req.params.id, req.body);
  if (!product) return res.status(404).json({ message: "Товар не найден" });
  res.json(product);
});

router.delete('/:id', authMiddleware, (req, res) => {
  const success = deleteProduct(req.params.id);
  if (!success) return res.status(404).json({ message: "Товар не найден" });
  res.status(204).send();
});

module.exports = router;