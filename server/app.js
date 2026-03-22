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
app.use('/pics', express.static(path.join(__dirname, 'pics')));

/* =========================
   ПОДКЛЮЧЕНИЕ МАРШРУТОВ
========================= */
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

/* =========================
   SWAGGER (Ручная настройка без ошибок сканирования)
========================= */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Интернет-магазина',
      version: '1.0.0',
      description: 'Документация: Регистрация, Вход и Рефреш токен',
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
      // --- РЕГИСТРАЦИЯ ---
      '/api/auth/register': {
        post: {
          summary: 'Регистрация',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', example: 'admin@test.com' },
                    password: { type: 'string', example: '12345' },
                    first_name: { type: 'string', example: 'Ivan' },
                    last_name: { type: 'string', example: 'Ivanov' },
                    role: { type: 'string', example: 'ADMIN' }
                  }
                }
              }
            }
          },
          responses: { 201: { description: 'Создано' } }
        }
      },
      // --- ВХОД ---
      '/api/auth/login': {
        post: {
          summary: 'Вход (Получение токенов)',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', example: 'admin@test.com' },
                    password: { type: 'string', example: '12345' }
                  }
                }
              }
            }
          },
          responses: { 200: { description: 'Успешно. Скопируйте refreshToken.' } }
        }
      },
      // --- РЕФРЕШ ---
      '/api/auth/refresh': {
        post: {
          summary: 'Обновление токена (Refresh)',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    refreshToken: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: { 200: { description: 'Новые токены выданы' } }
        }
      }
    }
  },
  // Оставляем пустым, чтобы не было TypeError
  apis: [], 
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* =========================
   ВНЕШНИЕ API
========================= */
app.get('/api/external/google-books', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ message: 'Параметр q обязателен' });

  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка Google API', error: error.message });
  }
});

/* =========================
   СТАРТ СЕРВЕРА
========================= */
app.listen(port, () => {
  console.log(`\n🚀 СЕРВЕР: http://localhost:${port}`);
  console.log(`📖 SWAGGER: http://localhost:${port}/api-docs\n`);
});