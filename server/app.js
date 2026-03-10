const express = require('express');
const path = require('path');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

/* =========================
   ПОЛЬЗОВАТЕЛИ И АУТЕНТИФИКАЦИЯ
========================= */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET = "super_secret_key";

//let users = [];
/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname)));

/* =========================
   ДАННЫЕ
========================= 
let products = [
  { id: '1a', name: 'Рыбов', price: 500, category: 'Рыба', description: 'Вкусный, поверьте на слово', rating: 4, stock: 123 },
  { id: '2a', name: 'Акул', price: 650, category: 'Хищники', description: '...Вроде не кусается', rating: 4, stock: 67 },
  { id: '3a', name: 'Медуз', price: 750, category: 'Морские', description: 'Это не желе', rating: 3, stock: 52 },
  { id: '4a', name: 'Килька', price: 599, category: 'Консервы', description: 'Не в томатном соусе', rating: 4, stock: 110 },
  { id: '5a', name: 'Крекер', price: 100000, category: 'Легендарные', description: 'Хрустит', rating: 5, stock: 1 },
];
*/
/* =========================
   РЕГИСТРАЦИЯ
========================= */
app.post('/auth/register', async (req, res) => {
  const { login, password } = req.body;

  if (!login || !password) {
    return res.status(400).json({ message: "Login и password обязательны" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: Date.now(),
    login,
    password: hashedPassword
  };

  users.push(newUser);

  res.status(201).json({ message: "Пользователь создан" });
});


/* =========================
    ЛОГИН
========================= */
app.post('/auth/login', async (req, res) => {

  const { login, password } = req.body;

  const user = users.find(u => u.login === login);

  if (!user) {
    return res.status(401).json({ message: "Неверный логин" });
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return res.status(401).json({ message: "Неверный пароль" });
  }

  const token = jwt.sign(
    { id: user.id, login: user.login },
    SECRET,
    { expiresIn: '1h' }
  );

  res.json({ token });

});

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
      { url: `http://localhost:${port}`, description: 'Локальный сервер' },
    ],
  },
  apis: ['./routes/*.js'], // указываем файлы с роутами
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
  const { name, price, category, description, stock, rating, image } = req.body;
  const newProduct = { id: nanoid(6), name, price, category, description, stock, rating, image };
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
  const product = products.find(p => p.id == req.params.id);

  if (!product) return res.status(404).json({ message: 'Не найдено' });

  Object.assign(product, req.body);

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