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
  { id: 1, name: 'Ноутбук', price: 80000 },
  { id: 2, name: 'Телефон', price: 50000 }
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


/* ========= START ========= */

app.listen(port, () => {
  console.log(`Сервер: http://localhost:${port}`);
});