const API = 'https://fakestoreapi.com/products';

function fetchProducts() {
  return fetch(API).then(res => res.json()); // trae los productos de la api
}
let cart = {};

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart)); //guarda los datos en el navegador en string
}

function loadCart() {
  cart = JSON.parse(localStorage.getItem('cart')) || {}; //lee los datos guardados y de string los convierte a objeto
  updateCartUI(); // si no hay nada guardado lo usa un objeto vacio
}