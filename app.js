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
  { id: 1, name: 'Рыбов', price: 500 },
  { id: 2, name: 'Рыбов2', price: 650 },
  { id: 3, name: 'Рыбов3', price: 750 }
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
  const { name, price } = req.body;

  // Валидация на пустые значения
  if (!name || !price) {
    return res.status(400).json({ message: 'Название и цена обязательны' });
  }

  const newProduct = {
    id: Date.now(),
    name,
    price
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

// обновить
app.patch('/products/:id', (req, res) => {
  const product = products.find(p => p.id == req.params.id);

  if (!product) return res.status(404).json({ message: 'Не найдено' });

  // валидация на пустые значения
  if (req.body.name !== undefined && !req.body.name) {
    return res.status(400).json({ message: 'Название не может быть пусто' });
  }
  if (req.body.price !== undefined && !req.body.price) {
    return res.status(400).json({ message: 'Цена не может быть пусто' });
  }

  if (req.body.name !== undefined) product.name = req.body.name;
  if (req.body.price !== undefined) product.price = req.body.price;

  res.json(product);
});

// удалить
app.delete('/products/:id', (req, res) => {
  products = products.filter(p => p.id != req.params.id);
  res.json({ message: 'Удалено' });
});


/* ========= ВНЕШНИЙ API (FishWatch) ========= */

// получить все виды рыб
app.get('/fish', async (req, res) => {
  try {
    const response = await fetch('https://www.fishwatch.gov/api/species', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'nodejs-server'
      }
    });
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({ message: 'Внешний сервис вернул не JSON', raw: text.slice(0,200) });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении данных', error: error.message });
  }
});

// получить рыбу по названию
app.get('/fish/search/:name', async (req, res) => {
  try {
    const response = await fetch(`https://www.fishwatch.gov/api/species?name=${req.params.name}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'nodejs-server'
      }
    });
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({ message: 'Внешний сервис вернул не JSON', raw: text.slice(0,200) });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при поиске', error: error.message });
  }
});

// получить информацию о конкретной рыбе по ID
app.get('/fish/:id', async (req, res) => {
  try {
    const response = await fetch(`https://www.fishwatch.gov/api/species/${req.params.id}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'nodejs-server'
      }
    });
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({ message: 'Внешний сервис вернул не JSON', raw: text.slice(0,200) });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении данных', error: error.message });
  }
});


/* ========= START ========= */

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