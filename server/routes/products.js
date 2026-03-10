const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  findProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../models/Product');

const { authMiddleware } = require('./auth'); // импорт middleware из auth.js

// GET /api/products - получить все товары
router.get('/', (req, res) => {
  const products = getAllProducts();
  res.json(products);
});

// GET /api/products/:id - получить товар по id
router.get('/:id', (req, res) => {
  const product = findProductById(req.params.id);
  if (!product) return res.status(404).json({ message: "Товар не найден" });
  res.json(product);
});

// POST /api/products - создать новый товар (только для авторизованных)
router.post('/', authMiddleware, (req, res) => {
  const product = createProduct(req.body);
  res.status(201).json(product);
});

// PATCH /api/products/:id - обновить товар (только для авторизованных)
router.patch('/:id', authMiddleware, (req, res) => {
  const product = updateProduct(req.params.id, req.body);
  if (!product) return res.status(404).json({ message: "Товар не найден" });
  res.json(product);
});

// DELETE /api/products/:id - удалить товар (только для авторизованных)
router.delete('/:id', authMiddleware, (req, res) => {
  const success = deleteProduct(req.params.id);
  if (!success) return res.status(404).json({ message: "Товар не найден" });
  res.status(204).send();
});

module.exports = router;