
import React, { useState, useEffect } from 'react';

export default function Modal({ product, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    stock: '',
    rating: '',
    image: ''
  });

  useEffect(() => {
    if (product) setFormData(product);
    else setFormData({ name:'', category:'', description:'', price:'', stock:'', rating:'', image:'' });
  }, [product]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div id="modal" className="modal">
      <div className="modal-content">
        <h2>{product ? 'Редактирование' : 'Создание товара'}</h2>
        <form id="product-form" onSubmit={handleSubmit}>
          <input name="image" placeholder="Ссылка на изображение (URL или /pics/...)" value={formData.image || ''} onChange={handleChange}/>
          <input name="name" placeholder="Название" value={formData.name} onChange={handleChange} required />
          <input name="category" placeholder="Категория" value={formData.category} onChange={handleChange} />
          <input name="description" placeholder="Описание" value={formData.description} onChange={handleChange} />
          <input name="price" type="number" placeholder="Цена" value={formData.price} onChange={handleChange} required />
          <input name="stock" type="number" placeholder="Количество" value={formData.stock} onChange={handleChange} />
          <input name="rating" type="number" min="0" max="5" placeholder="Рейтинг" value={formData.rating} onChange={handleChange} />
          <button type="submit">Сохранить</button>
          <button type="button" onClick={onClose}>Закрыть</button>
        </form>
      </div>
    </div>
  );
}