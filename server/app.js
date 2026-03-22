const express = require('express');
const path = require('path');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

// 1. ИМПОРТ РОУТОВ
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');

/* =========================
   MIDDLEWARE
========================= */
app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));

// Раздача статических файлов
app.use('/pics', express.static(path.join(__dirname, 'pics')));

/* =========================
   SWAGGER (Настройка документации)
========================= */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Shop',
      version: '1.0.0',
      description: 'Документация API',
    },
    servers: [{ url: `http://localhost:${port}` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
    paths: {
      '/api/products': {
        get: {
          summary: 'Список товаров',
          responses: {
            200: { description: 'Успешно' }
          }
        }
      },
      '/api/users': {
        get: {
          summary: 'Список пользователей (Admin)',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Успешно' }
          }
        }
      }
    }
  },
  apis: [], // Оставляем пустым! Мы всё прописали выше вручную.
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* =========================
   ПОДКЛЮЧЕНИЕ МАРШРУТОВ (API)
========================= */
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

/* =========================
   ВНЕШНИЕ API
========================= */
app.get('/api/external/google-books', async (req, res) => {
  const { q } = req.query;
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
  console.log(`📖 SWAGGER UI: http://localhost:${port}/api-docs`);
  console.log(`--------------------------------------------\n`);
});