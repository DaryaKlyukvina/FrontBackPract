let products = [
    { id: '1a', name: 'Рыбов', price: 500, category: 'Рыба', description: 'Вкусный, поверьте на слово', rating: 4, stock: 123 }, 
    { id: '2a', name: 'Акул', price: 650, category: 'Хищники', description: '...Вроде не кусается', rating: 4, stock: 67 }, 
    { id: '3a', name: 'Медуз', price: 750, category: 'Морские', description: 'Это не желе', rating: 3, stock: 52 }, { id: '4a', name: 'Килька', price: 599, category: 'Консервы', description: 'Не в томатном соусе', rating: 4, stock: 110 }, 
    { id: '5a', name: 'Крекер', price: 100000, category: 'Легендарные', description: 'Хрустит', rating: 5, stock: 1 }
];

function getAllProducts() {
  return products;
}

function findProductById(id) {
  return products.find(p => p.id === id);
}

function createProduct(data) {
  const newProduct = { id: Date.now().toString(), ...data };
  products.push(newProduct);
  return newProduct;
}

function updateProduct(id, data) {
  const product = findProductById(id);
  if (!product) return null;
  Object.assign(product, data);
  return product;
}

function deleteProduct(id) {
  const exists = products.some(p => p.id === id);
  products = products.filter(p => p.id !== id);
  return exists;
}

module.exports = { getAllProducts, findProductById, createProduct, updateProduct, deleteProduct };