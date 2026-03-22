import React, { useState, useEffect, useContext } from 'react';
import './style.scss'; 
import Modal from './Modal';
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import AdminUsers from "./AdminUsers"; // Импорт твоей новой страницы
import { AuthContext } from './AuthContext';
import { ProtectedComponent } from './components/ProtectedRoute';
import { api } from '../api/index'; 

function App() {
  const { user, logout } = useContext(AuthContext); 
  const [page, setPage] = useState("products"); 
  const [theme, setTheme] = useState('dark');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const loadProducts = async () => {
    try {
      const data = await api.getproducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      console.error("Ошибка загрузки товаров", err);
    }
  };

  useEffect(() => {
    if (user) {
      loadProducts();
    } else {
      setProducts([]); 
      setFilteredProducts([]);
    }
  }, [user]); 

  useEffect(() => {
    const query = search.toLowerCase();
    const filtered = products.filter(
      p => p.name.toLowerCase().includes(query) ||
           (p.category && p.category.toLowerCase().includes(query))
    );
    setFilteredProducts(filtered);
  }, [search, products]);

  const saveProduct = async (data) => {
    try {
      if (editingProduct) {
        await api.updateproduct(editingProduct.id, data);
      } else {
        await api.createproduct(data);
      }
      setModalOpen(false);
      setEditingProduct(null);
      loadProducts();
    } catch (err) {
      alert("Недостаточно прав");
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Удалить товар?')) return;
    try {
      await api.deleteproduct(id);
      loadProducts();
    } catch (err) {
      alert("Только администратор может удалять товары");
    }
  };

  const ProductCard = ({ product }) => {
    const [bought, setBought] = useState(0);
    const [stock, setStock] = useState(product.stock || 0);

    return (
      <div className="card">
        <img src={product.image || `/pics/tovar${product.id}.jpg`} alt={product.name} className="card-image"/>
        <h2 className='card-name'>{product.name}</h2>
        <p className="card-category">{product.category || '-'}</p>
        <p className="card-price">{product.price} ₽</p>
        <p className="card-stock">В наличии: <span>{stock}</span></p>

        <div className="buy-block">
          {bought === 0 ? (
            <button onClick={() => { setBought(1); setStock(stock - 1); }}>Купить</button>
          ) : (
            <div className="counter">
              <button onClick={() => { if (bought > 0) { setBought(bought - 1); setStock(stock + 1); } }}>−</button>
              <span>{bought}</span>
              <button onClick={() => { if (stock > 0) { setBought(bought + 1); setStock(stock - 1); } }}>+</button>
            </div>
          )}
        </div>

        <div className="card-actions">
          <ProtectedComponent allowedRoles={['SELLER', 'ADMIN']}>
            <button onClick={() => { setEditingProduct(product); setModalOpen(true); }}>Ред</button>
          </ProtectedComponent>
          
          <ProtectedComponent allowedRoles={['ADMIN']}>
            <button onClick={() => deleteProduct(product.id)}>🗑</button>
          </ProtectedComponent>
        </div>
      </div>
    );
  };

  // --- ЛОГИКА ПЕРЕКЛЮЧЕНИЯ СТРАНИЦ ---
  if (page === "login") return <LoginPage setPage={setPage} />;
  if (page === "register") return <RegisterPage setPage={setPage} />;
  
  // Страница администрирования
  if (page === "admin-users") {
    return (
      <>
        <header className="header">
           <button className="logbtn" onClick={() => setPage("products")}>← К товарам</button>
           <h2 style={{color: 'white', margin: '0 auto'}}>Панель управления пользователями</h2>
           <button onClick={toggleTheme}>Темка</button>
           <div className="user-info">
              <span>{user?.email}</span>
              <button onClick={() => { logout(); setPage("products"); }}>Выйти</button>
           </div>
        </header>
        <main>
          <AdminUsers />
        </main>
      </>
    );
  }

  // Главная страница (товары)
  return (
    <>
      <header className="header">
        <nav className="nav">
          <a className="shapka" href="#home" onClick={() => setPage("products")}>Главная</a>
          <a className="shapka" href="#contact">Товары</a>
        </nav>

        <input
          type="text"
          placeholder="Поиск..."
          className="search-input"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <button onClick={toggleTheme}>Темка</button>

        {!user ? (
          <>
            <button className="logbtn" onClick={() => setPage("login")}>Вход</button>
            <button className="logbtn" onClick={() => setPage("register")}>Регистрация</button>
          </>
        ) : (
          <div className="user-info">
            {/* КНОПКА АДМИНА — Появляется только если роль ADMIN */}
            {user.role === 'ADMIN' && (
              <button 
                className="logbtn" 
                style={{backgroundColor: '#f1c40f', color: '#000', fontWeight: 'bold'}}
                onClick={() => setPage("admin-users")}
              >
                Админка 👥
              </button>
            )}
            
            <span>{user.email} ({user.role})</span>
            <button onClick={() => { logout(); setPage("products"); }}>Выйти</button>
          </div>
        )}
      </header>

      <main>
        <section className="product-cards">
          <ProtectedComponent allowedRoles={['SELLER', 'ADMIN']}>
            <div className="card add-card" onClick={() => setModalOpen(true)}>+</div>
          </ProtectedComponent>

          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      </main>

      {modalOpen && (
        <Modal
          product={editingProduct}
          onClose={() => { setModalOpen(false); setEditingProduct(null); }}
          onSave={saveProduct}
        />
      )}
    </>
  );
}

export default App;