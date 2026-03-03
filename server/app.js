const express = require('express');
const path = require('path');
const cors = require('cors');
const { nanoid } = require('nanoid'); // для генерации ID
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname)));

/* =========================
   ДАННЫЕ
========================= */
let products = [
  { id: 1, name: 'Рыбов', price: 500, category: 'Рыба', description: 'Вкусный, поверьте на слово', rating: 4.5, stock: 123 },
  { id: 2, name: 'Акул', price: 650, category: 'Хищники', description: '...Вроде не кусается', rating: 4.9, stock: 67 },
  { id: 3, name: 'Медуз', price: 750, category: 'Морские', description: 'Это не желе', rating: 4.2, stock: 52 },
  { id: 4, name: 'Килька', price: 599, category: 'Консервы', description: 'Не в томатном соусе', rating: 4.0, stock: 110 },
  { id: 5, name: 'Крекер', price: 100000, category: 'Легендарные', description: 'Хрустит', rating: 5.0, stock: 1 },
];

/* =========================
   SWAGGER
========================= */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API интернет-магазина',
      version: '1.0.0',
      description: 'API для управления товарами интернет-магазина',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Локальный сервер',
      },
    ],
  },
  apis: ['./app.js'], // указываем текущий файл
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - category
 *         - stock
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный ID товара
 *         name:
 *           type: string
 *           description: Название товара
 *         category:
 *           type: string
 *           description: Категория товара
 *         description:
 *           type: string
 *           description: Описание товара
 *         price:
 *           type: number
 *           description: Цена товара
 *         stock:
 *           type: integer
 *           description: Количество на складе
 *         rating:
 *           type: number
 *           description: Рейтинг товара (опционально)
 *       example:
 *         id: "abc123"
 *         name: "Рыбов"
 *         category: "Рыба"
 *         description: "Вкусный, поверьте на слово"
 *         price: 500
 *         stock: 123
 *         rating: 4.5
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Получить список всех товаров
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
app.get('/products', (req, res) => {
  res.json(products);
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *     responses:
 *       200:
 *         description: Данные товара
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 */
app.get('/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ message: 'Товар не найден' });
  res.json(product);
});

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Создать новый товар
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Товар успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
app.post('/products', (req, res) => {
  const { name, price, category, description, stock, rating } = req.body;
  const newProduct = { id: nanoid(6), name, price, category, description, stock, rating };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Обновить данные товара
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               stock:
 *                 type: integer
 *               rating:
 *                 type: number
 *     responses:
 *       200:
 *         description: Обновленный товар
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 */
app.patch('/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ message: 'Товар не найден' });

  const { name, price, category, description, stock, rating } = req.body;
  if (name !== undefined) product.name = name;
  if (price !== undefined) product.price = price;
  if (category !== undefined) product.category = category;
  if (description !== undefined) product.description = description;
  if (stock !== undefined) product.stock = stock;
  if (rating !== undefined) product.rating = rating;

  res.json(product);
});

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Удалить товар
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *     responses:
 *       204:
 *         description: Товар удален
 *       404:
 *         description: Товар не найден
 */
app.delete('/products/:id', (req, res) => {
  const exists = products.some(p => p.id === req.params.id);
  if (!exists) return res.status(404).json({ message: 'Товар не найден' });
  products = products.filter(p => p.id !== req.params.id);
  res.status(204).send();
});

/* =========================
   СТАРТ
========================= */
app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
  console.log(`Swagger UI доступен на http://localhost:${port}/api-docs`);
});





/* ========= Google Books (public Google API) ========= */

// Поиск книг: /google/books?q=рыба
app.get('/google/books', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ message: 'Query param q is required' });

  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обращении к Google Books', error: error.message });
  }
});

// Получить книгу по id: /google/books/:id
app.get('/google/books/:id', async (req, res) => {
  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(req.params.id)}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обращении к Google Books', error: error.message });
  }
});

/* ========= Open Library (public, no key) ========= */

// Поиск в Open Library: /openlibrary/search?q=... 
app.get('/openlibrary/search', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ message: 'Query param q is required' });

  try {
    const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обращении к Open Library', error: error.message });
  }
});

// Получить работу (work) по id: /openlibrary/works/:id
app.get('/openlibrary/works/:id', async (req, res) => {
  try {
    const response = await fetch(`https://openlibrary.org/works/${encodeURIComponent(req.params.id)}.json`);
    if (!response.ok) return res.status(response.status).json({ message: 'Open Library returned error', status: response.status });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обращении к Open Library', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Сервер: http://localhost:${port}`);
});