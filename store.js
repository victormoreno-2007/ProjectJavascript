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

function updateCartUI() {
  const itemsContainer = $('cart-items');//
  itemsContainer.innerHTML = '';        //  limpia el contenedor del carro y comienza todo en 0
  let total = 0, count = 0;             //

  for (let id in cart) {
    const p = cart[id];// recorre los productos del carrito y suma el total y la cantidad
    total += p.price * p.qty;
    count += p.qty;

    const li = document.createElement('li');
    li.classList.add("cart-li"); // crea un li con las caracteristicas del producto
    li.innerHTML = `
      <br>${p.title}</br> 
      <img src="${p.image}" alt="${p.title}" class="img-cart" /> 
      <br>- $${(p.price * p.qty).toFixed(2)}</br> 
      <br>
      <div class="icons">
        <span class="price"> ${p.qty} </span>
        <button onclick="changeQty(${id}, -1)">➖</button>
        <button onclick="changeQty(${id}, 1)">➕</button>
        <button onclick="removeFromCart(${id})">🗑️</button>
      </div>
    `;
    itemsContainer.appendChild(li);
  }
  const cartItems = document.getElementById("cart-items");
  if (cartItems.children.length === 0) { // si esta vacio muestra este mensaje
    cartItems.innerHTML = "<p>tu carrito esta vacio 😔, agrega un producto para comprar </p>";
  };

  $('cart-total').textContent = total.toFixed(2);
  $('cart-count').textContent = count; // actualiza el total y el número de productos en el botón de carrito.
}

function changeQty(id, delta) {
  if (!cart[id]) return;

  cart[id].qty += delta;
  if (cart[id].qty <= 0) { // es la que se encarga de sumar mas ese producto o restar 
    delete cart[id];
  }
  saveCart();
  updateCartUI();
}

function addToCart(id) {
  const p = products.find(p => p.id === id);// busca el producto en el array products
  if (cart[id]) {           // si ya esta en el carro le aumenta la cantidad si no esta lo agrega
    cart[id].qty++;
  } else {
    cart[id] = { ...p, qty: 1 };
  }
  saveCart();
  updateCartUI();
}

function removeFromCart(id) {
  delete cart[id];
  saveCart(); // remueve los productos del carrito
  updateCartUI();
}


