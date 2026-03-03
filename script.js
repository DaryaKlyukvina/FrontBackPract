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

let allProducts = [];

const productCards = document.querySelector('.product-cards');
const searchInput = document.getElementById('search-input');


/* =========================
   РЕНДЕР КАРТОЧЕК
========================= */

function renderProducts(products) {
  productCards.innerHTML = '';

  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'card';

    const stars = '⭐'.repeat(Math.round(product.rating));

    card.innerHTML = `
      <img src="pics/tovar${product.id}.jpg" alt="${product.name}" class="card-image">

      <h2 class="card-name">${product.name}</h2>

      <p class="card-price">${product.price} ₽</p>
      <p class="card-category">Категория: ${product.category}</p>
      <p class="card-quantity">В наличии: ${product.quantity}</p>
      <p class="card-rating">${stars}</p>

      <button class="buy-btn">Купить</button>
    `;

    productCards.appendChild(card);
  });
}


/* =========================
   ЗАГРУЗКА С СЕРВЕРА
========================= */

fetch('/products')
  .then(r => r.json())
  .then(products => {
    allProducts = products;
    renderProducts(allProducts);
  });


/* =========================
   ПОИСК
========================= */

searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();

  const filtered = allProducts.filter(product =>
    product.name.toLowerCase().includes(query) ||
    product.category.toLowerCase().includes(query)
  );

  renderProducts(filtered);
})
  .catch(error =>
    console.error('Ошибка при загрузке товаров:', error)
  );