const express = require('express');
const path = require('path');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

// 1. ИМПОРТ РОУТОВ (Вся логика регистрации, товаров и ролей теперь там)
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');

/* =========================
   MIDDLEWARE (Настройка среды)
========================= */
app.use(cors()); // Чтобы React (порт 5173) мог общаться с Сервером (порт 3000)
app.use(express.json()); // Для парсинга JSON в теле запроса
app.use(express.urlencoded({ extended: false }));

// Раздача статических файлов (например, картинок товаров)
app.use('/pics', express.static(path.join(__dirname, 'pics')));

/* =========================
   ПОДКЛЮЧЕНИЕ МАРШРУТОВ (API)
========================= */
// Все маршруты начинаются с /api согласно методичке
app.use('/api/auth', authRoutes);    // Регистрация, Логин, Refresh (Задания 7, 8, 9)
app.use('/api/products', productRoutes); // Работа с товарами (Задание 10, 11)
app.use('/api/users', userRoutes);      // Список пользователей для Админа (Задание 11)

/* =========================
   SWAGGER (Документация с кнопкой Authorize)
========================= */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Интернет-магазина',
      version: '1.0.0',
      description: 'Реализация практических работ №7-11 (JWT, RBAC, JSON DB)',
    },
    servers: [
      { 
        url: `http://localhost:${port}`, 
        description: 'Локальный сервер разработки' 
      },
    ],
    // Настройка кнопки "Authorize" для JWT токенов
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./routes/*.js'], // Ищем документацию в файлах роутов
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* =========================
   ВНЕШНИЕ API (Google Books / Open Library)
========================= */
app.get('/api/external/google-books', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ message: 'Параметр запроса q обязателен' });

  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обращении к Google API', error: error.message });
  }
});

/* =========================
   СТАРТ СЕРВЕРА
========================= */
app.listen(port, () => {
  console.log(`\n--------------------------------------------`);
  console.log(`🚀 СЕРВЕР ЗАПУЩЕН: http://localhost:${port}`);
  console.log(`📖 SWAGGER UI (Тесты): http://localhost:${port}/api-docs`);
  console.log(`📁 БАЗА ДАННЫХ: database.json`);
  console.log(`--------------------------------------------\n`);
});