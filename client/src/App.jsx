import React from 'react';
import { useState, useEffect } from 'react';
import './style.scss'; 
import Modal from './Modal';

function App() {
  const [theme, setTheme] = useState('dark');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // ====== Тема ======
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // ====== Загрузка товаров ======
  const loadProducts = async () => {
    const res = await fetch('http://localhost:3000/products');
    const data = await res.json();
    setProducts(data);
    setFilteredProducts(data);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // ====== Поиск ======
  useEffect(() => {
    const query = search.toLowerCase();
    const filtered = products.filter(
      p => p.name.toLowerCase().includes(query) ||
           (p.category && p.category.toLowerCase().includes(query))
    );
    setFilteredProducts(filtered);
  }, [search, products]);

  // ====== CRUD ======
  const saveProduct = async (data) => {
    if (editingProduct) {
      await fetch(`http://localhost:3000/products/${editingProduct.id}`, {
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
    setModalOpen(false);
    setEditingProduct(null);
    loadProducts();
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Удалить товар?')) return;
    await fetch(`http://localhost:3000/products/${id}`, { method: 'DELETE' });
    loadProducts();
  };

  // ====== Карточка товара ======
  const ProductCard = ({ product }) => {
    const [bought, setBought] = useState(0);
    const [stock, setStock] = useState(product.stock || 0);

    const renderStars = (rating = 0) => {
      const full = Math.round(rating);
      return '⭐'.repeat(full) + '☆'.repeat(5 - full);
    };

    return (
      <div className="card">
        <img src={product.image || `/pics/tovar${product.id}.jpg`} alt={product.name} className="card-image"/>
        <h2 className='card-name'>{product.name}</h2>
        <p className="card-category">{product.category || '-'}</p>
        <div className="stars">{renderStars(product.rating)}</div>
        <p className="card-info">{product.description || ''}</p>
        <p className="card-price">Цена: {product.price} ₽</p>
        <p className="card-stock">В наличии: <span>{stock}</span></p>

        <div className="buy-block">
          {bought === 0 ? (
            <button onClick={() => setBought(1) & setStock(stock - 1)}>Купить</button>
          ) : (
            <div className="counter">
              <button onClick={() => { if (bought > 0) { setBought(bought - 1); setStock(stock + 1); } }}>−</button>
              <span>{bought}</span>
              <button onClick={() => { if (stock > 0) { setBought(bought + 1); setStock(stock - 1); } }}>+</button>
            </div>
          )}
        </div>

        <div className="card-actions">
          <button onClick={() => { setEditingProduct(product); setModalOpen(true); }}>Ред</button>
          <button onClick={() => deleteProduct(product.id)}>🗑</button>
        </div>
      </div>
    );
  };

return (
  <>
    {/* ===== HEADER ===== */}
    <header className="header">
      <nav className="nav">
        <a href="#home">Главная</a>
        <a href="#about">Страница2</a>
        <a href="#services">Страница3</a>
        <a href="#contact">Страница4</a>
      </nav>

      <input
        type="text"
        id="search-input"
        placeholder="Поиск товара..."
        className="search-input"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <button id="theme-switch" onClick={toggleTheme}>
        Темка
      </button>
    </header>

    {/* ===== MAIN ===== */}
    <main>
      <section className="product-cards">
        <div
          className="card add-card"
          onClick={() => setModalOpen(true)}
        >
          +
        </div>

        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>
    </main>

    {/* ===== MODAL ===== */}
    {modalOpen && (
      <Modal
        product={editingProduct}
        onClose={() => {
          setModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={saveProduct}
      />
    )}

    {/* ===== FOOTER ===== */}
    <footer className="footer">
      <p>Футер. Все права защищены и тд.</p>
    </footer>
  </>
);}

export default App;