const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  findProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../models/Product');

// Импортируем middleware и функцию проверки ролей из auth.js
const { authMiddleware, checkRole } = require('./auth');

/**
 * @swagger
 * tags:
 * name: Products
 * description: Управление товарами (Задания 10-11)
 */

/**
 * @swagger
 * /api/products:
 * get:
 * summary: Получить список всех товаров
 * tags: [Products]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: Список товаров получен
 */
router.get('/', authMiddleware, async (req, res) => {
  const products = await getAllProducts(); // Добавили await
  res.json(products);
});

/**
 * @swagger
 * /api/products/{id}:
 * get:
 * summary: Получить товар по ID
 * tags: [Products]
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
 * description: Данные товара
 * 404:
 * description: Товар не найден
 */
router.get('/:id', authMiddleware, async (req, res) => {
  const product = await findProductById(req.params.id);
  if (!product) return res.status(404).json({ message: "Товар не найден" });
  res.json(product);
});

/**
 * @swagger
 * /api/products:
 * post:
 * summary: Создать новый товар (Продавец/Админ)
 * tags: [Products]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * name: { type: string }
 * price: { type: number }
 * category: { type: string }
 * stock: { type: integer }
 * responses:
 * 201:
 * description: Товар создан
 * 403:
 * description: Нет прав доступа
 */
router.post('/', authMiddleware, checkRole(['SELLER', 'ADMIN']), async (req, res) => {
  const product = await createProduct(req.body);
  res.status(201).json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 * patch:
 * summary: Обновить товар (Продавец/Админ)
 * tags: [Products]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * responses:
 * 200:
 * description: Товар обновлен
 */
router.patch('/:id', authMiddleware, checkRole(['SELLER', 'ADMIN']), async (req, res) => {
  const product = await updateProduct(req.params.id, req.body);
  if (!product) return res.status(404).json({ message: "Товар не найден" });
  res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 * delete:
 * summary: Удалить товар (Только Админ)
 * tags: [Products]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * responses:
 * 204:
 * description: Удалено успешно
 * 403:
 * description: Недостаточно прав (не Админ)
 */
router.delete('/:id', authMiddleware, checkRole(['ADMIN']), async (req, res) => {
  const success = await deleteProduct(req.params.id);
  if (!success) return res.status(404).json({ message: "Товар не найден" });
  res.status(204).send();
});

module.exports = router;