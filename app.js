const express = require('express');
const path = require('path');

const app = express();
const port = 3000;


/* ========= MIDDLEWARE ========= */

// JSON
app.use(express.json());

// формы
app.use(express.urlencoded({ extended: false }));
// статика
app.use(express.static(path.join(__dirname)));


/* ========= ДАННЫЕ ========= */

let products = [
  { id: 1, name: 'Рыбов', price: 500, category: 'Рыба', description: 'Вкусный, поверьте на слово', rating: 4.5, stock: 123},
  { id: 2, name: 'Акул', price: 650, category: 'Хищники', description: '...Вроде не кусается', rating: 4.9, stock: 67},
  { id: 3, name: 'Медуз', price: 750, category: 'Морские', description: 'Это не желе', rating: 4.2, stock: 52 },
  { id: 4, name: 'Килька', price: 599, category: 'Консервы', description: 'Не в томатном соусе', rating: 4.0, stock: 110 },
  { id: 5, name: 'Крекер', price: 100000, category: 'Легендарные', description: 'Хрустит', rating: 5.0, stock: 1 }
];


/* ========= API ========= */

// получить все товары
app.get('/products', (req, res) => {
  res.json(products);
});

// получить по id
app.get('/products/:id', (req, res) => {
  const product = products.find(p => p.id == req.params.id);

  if (!product) return res.status(404).json({ message: 'Не найдено' });

  res.json(product);
});

// создать
app.post('/products', (req, res) => {
  const { name, category, description, price, stock, rating } = req.body;

  const newProduct = {
    id: Date.now(),
    name,
    category,
    description,
    price: Number(price),
    stock: Number(stock),
    rating: Number(rating)
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

// обновить
app.patch('/products/:id', (req, res) => {
  const product = products.find(p => p.id == req.params.id);
  if (!product) return res.status(404).json({ message: 'Не найдено' });

  const { name, price, category, description, stock } = req.body;

  if (name !== undefined && !name)
    return res.status(400).json({ message: 'Название не может быть пусто' });

  if (price !== undefined && price <= 0)
    return res.status(400).json({ message: 'Цена должна быть > 0' });

  if (stock !== undefined && stock < 0)
    return res.status(400).json({ message: 'Количество не может быть отрицательным' });

  if (name !== undefined) product.name = name;
  if (price !== undefined) product.price = price;
  if (category !== undefined) product.category = category;
  if (description !== undefined) product.description = description;
  if (stock !== undefined) product.stock = stock;

  res.json(product);
});

// удалить
app.delete('/products/:id', (req, res) => {
  products = products.filter(p => p.id != req.params.id);
  res.json({ message: 'Удалено' });
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