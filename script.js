const toggleTheme = () => {
  if (document.body.classList.contains('light')) {
    document.body.classList.remove('light');
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
    document.body.classList.add('light');
  }
}

// установим начальную темму
document.body.classList.add('dark');

document.getElementById('theme-switch').addEventListener('click', toggleTheme);

// Получить товары с сервера и отобразить их
fetch('/products')
  .then(r => r.json())
  .then(products => {
    const productCards = document.querySelector('.product-cards');
    
    // Очистим старые карточки
    productCards.innerHTML = '';
    
    // Создадим новые карточки из данных сервера
    products.forEach(product => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="pics/tovar1.jpg" alt="${product.name}" class="card-image">
        <h2 class="card-name">${product.name}</h2>
        <p class="card-price">Цена: ${product.price} руб</p>
        <p class="card-info">Очень вкусный, но лучше поверьте на слово</p>
      `;
      productCards.appendChild(card);
    });
  })
  .catch(error => console.error('Ошибка при загрузке товаров:', error));