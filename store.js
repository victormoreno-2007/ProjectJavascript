const API = 'https://fakestoreapi.com/products';
function fetchProducts() {
  return fetch(API).then(res => res.json()); // trae los productos de la api
}