const toggleTheme = () => {
  if (document.body.classList.contains('light')) {
    document.body.classList.replace('light', 'dark');
  } else {
    document.body.classList.replace('dark', 'light');
  }
};

// начальная тема
document.body.classList.add('dark');

document
  .getElementById('theme-switch')
  .addEventListener('click', toggleTheme);


/* =========================
   Загрузка товаров
========================= */

const productCards = document.querySelector('.product-cards');

const modal = document.getElementById('modal');
const form = document.getElementById('product-form');
const createBtn = document.getElementById('create-btn');
const closeModalBtn = document.getElementById('close-modal');
const modalTitle = document.getElementById('modal-title');

let editingId = null;

async function loadProducts() {
  const res = await fetch('http://localhost:3000/products');
  const products = await res.json();

  productCards.innerHTML = '';

  // кнопка + карточка
  productCards.appendChild(createAddCard());

  products.forEach(p => {
    productCards.appendChild(createCard(p));
  });
}

/* =========================
   ФУНКЦИЯ ДЛЯ ЗВЕЗДОЧЕК  
========================= */
function renderStars(rating = 0) {
  const full = Math.round(rating);          // округляем до целого
  return '⭐'.repeat(full) + '☆'.repeat(5 - full);
}
/* =========================
   РЕНДЕР КАРТОЧЕК
========================= */

function createCard(product) {
  const card = document.createElement('div');
  card.className = 'card';

  let stock = product.stock ?? 0;
  let bought = 0;

  card.innerHTML = `
    <img src="pics/tovar${product.id}.jpg" alt="${product.name}" class="card-image">

    <h2>${product.name}</h2>

    <p class="card-category">${product.category || '-'}</p>
    <p class="card-info">${product.description || ''}</p>

    <p class="card-price">Цена: ${product.price} ₽</p>
    <p class="card-stock">В наличии: <span>${stock}</span></p>

    <div class="stars">${renderStars(product.rating)}</div>

    <div class="buy-block">
      <button class="buy-btn">Купить</button>
    </div>

    <div class="card-actions">
      <button class="edit-btn">Ред</button>
      <button class="delete-btn">🗑</button>
    </div>
  `;

  const stockSpan = card.querySelector('.card-stock span');
  const buyBlock = card.querySelector('.buy-block');



  /* =====================
     ПОКУПКА
  ===================== */

  function renderCounter() {
    buyBlock.innerHTML = `
      <div class="counter">
        <button class="minus">−</button>
        <span>${bought}</span>
        <button class="plus">+</button>
      </div>
    `;

    const minus = buyBlock.querySelector('.minus');
    const plus = buyBlock.querySelector('.plus');
    const count = buyBlock.querySelector('span');

    plus.onclick = () => {
      if (stock <= 0) return;
      bought++;
      stock--;
      count.textContent = bought;
      stockSpan.textContent = stock;
    };

    minus.onclick = () => {
      if (bought <= 0) return;

      bought--;
      stock++;
      count.textContent = bought;
      stockSpan.textContent = stock;

      // Если куплено 0, вернуть кнопку "Купить"
      if (bought === 0) {
        buyBlock.innerHTML = `<button class="buy-btn">Купить</button>`;
        buyBlock.querySelector('.buy-btn').onclick = renderCounter;
      }
    };
  }

  buyBlock.querySelector('.buy-btn').onclick = renderCounter;



  /* =====================
     CRUD
  ===================== */

  card.querySelector('.edit-btn').onclick = () => openEdit(product);
  card.querySelector('.delete-btn').onclick = () => deleteProduct(product.id);

  return card;
}


/* =========================
   ДОБАВЛЕНИЕ
========================= */

function createAddCard() {
  const card = document.createElement('div');
  card.className = 'card add-card';
  card.innerHTML = '+';
  card.onclick = openCreate;
  return card;
}


  /* =========================
   MODAL
========================= */

function openCreate() {
  editingId = null;
  modalTitle.textContent = 'Создание товара';
  form.reset();
  modal.classList.remove('hidden');
}

function openEdit(product) {
  editingId = product.id;
  modalTitle.textContent = 'Редактирование';

  form.name.value = product.name;
  form.category.value = product.category;
  form.description.value = product.description;
  form.price.value = product.price;
  form.stock.value = product.stock;

  modal.classList.remove('hidden');
}

closeModalBtn.onclick = () => modal.classList.add('hidden');



/* =========================
   SUBMIT
========================= */

form.onsubmit = async (e) => {
  e.preventDefault();

  const data = Object.fromEntries(new FormData(form));

  if (editingId) {
    await fetch(`http://localhost:3000/products/${editingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } else {
    await fetch('http://localhost:3000/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  modal.classList.add('hidden');
  loadProducts();
};


/* =========================
   DELETE
========================= */

async function deleteProduct(id) {
  if (!confirm('Удалить товар?')) return;

  await fetch(`http://localhost:3000/products/${id}`, { method: 'DELETE' });
  loadProducts();
}


/* =========================
   INIT
========================= */

loadProducts();

/* =========================
   ПОИСК
========================= */
const searchInput = document.getElementById('search-input');
searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();

  // фильтруем уже загруженные товары
  const filtered = allProducts.filter(product =>
    product.name.toLowerCase().includes(query) ||
    (product.category && product.category.toLowerCase().includes(query))
  );

  // очищаем контейнер и рендерим 
  productCards.innerHTML = '';
  productCards.appendChild(createAddCard()); // кнопка +

  filtered.forEach(product => {
    productCards.appendChild(createCard(product));
  });
});