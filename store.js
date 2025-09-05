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

function renderProducts(list) {
  const container = $('product-list');
  container.innerHTML = ''; // crea el container
  list.forEach(p => { //recorre la lista de productos
    const div = document.createElement('div');
    div.className = 'card product';
    div.setAttribute("data-id", p.id);// lo que va a tener el container
    div.innerHTML = ` 
      <img src="${p.image}" alt="${p.title}" class="product-img" />
      <h3>${p.title}</h3>
      <p>$${p.price}</p>
      <p><small>${p.category}</small></p>
      <div id= "boton">
        <button onclick="addToCart(${p.id})">🛒 Agregar</button>
      </div>
    `;
    container.appendChild(div);
    div.querySelector(".product-img").addEventListener("click", () => { // si le da clic lo abre
      openProductModal(p);
    });
  });
}
function setupFilters() { // set elimina duplicados
  const categories = [...new Set(products.map(p => p.category))]; //Saca todas las categorías de los productos
  categories.forEach(c => {
    const opt = document.createElement('option'); // crea un option por cada categoria 
    opt.value = c;
    opt.textContent = c;
    $('filter-category').appendChild(opt);
  });

  $('search').addEventListener('input', applyFilters);
  $('filter-category').addEventListener('change', applyFilters); //Pone listeners en búsqueda, categoría y orden
  $('sort').addEventListener('change', applyFilters);
}

function applyFilters() {
  let list = [...products];
  const search = $('search').value.toLowerCase();
  const cat = $('filter-category').value;
  const sort = $('sort').value;

  if (search) {
    list = list.filter(p =>
      p.title.toLowerCase().includes(search) ||
      p.description.toLowerCase().includes(search)
    );
  }

  if (cat) {
    list = list.filter(p => p.category === cat);
  }

  if (sort) {
    const [field, dir] = sort.split('-');
    list.sort((a, b) => dir === 'asc' ? a[field] - b[field] : b[field] - a[field]);
  }

  renderProducts(list);
}

