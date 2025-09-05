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

function setupCartToggle() {
  $('cart-btn').addEventListener('click', () => { //abre carrito o cierra
    $('cart').classList.toggle('hidden-modal');
  });

  $('close-cart').addEventListener('click', () => { // al hacer clic en el cerrar se ocuelte
    $('cart').classList.add('hidden-modal');
    console.log('ak{sdñlfklñaksfj')
  });
}

function setupBuyNow() {
  $('buy-now-cart').addEventListener('click', () => {
    if (Object.keys(cart).length === 0) { //al hacer clic en el comprar si esta vacio en la alerta muestra el mensaje
      alert("Tu carrito está vacío.");
      return;
    }

    let resumen = "Resumen de compra:\n";
    let total = 0;

    for (let id in cart) {
      const p = cart[id]; //ace un resumen con todos los productos, cantidades y total y lo muestra en la alerta
      const subtotal = p.price * p.qty;
      resumen += `- ${p.title} x${p.qty} = $${subtotal.toFixed(2)}\n`;
      total += subtotal;
    }

    resumen += `\nTOTAL: $${total.toFixed(2)}\n\n¡Gracias por tu compra!`;
    alert(resumen);

    // Vaciar carrito después de la compra simulada
    cart = {};
    saveCart();
    updateCartUI();
    $('cart').classList.add('hidden');
  });
}

async function init() {
  setupCartToggle(); //configura abrir/cerrar carrito.
  loadCart(); //carga el carrito del localStorage.
  products = await fetchProducts(); //descarga productos de la API.
  renderProducts(products);//los dibuja en pantalla.
  setupFilters();//activa los filtros.
  setupBuyNow();//activa el botón comprar.
}

function openProductModal(product) { // esta es la funcion que hace lo de vaer mas o menos
  modalImg.src = product.image;
  modalTitle.textContent = product.title;

  const maxLength = 150; // límite de caracteres en descripción
  if (product.description.length > maxLength) {
    desc.textContent = product.description.slice(0, maxLength) + "...";
    toggleBtn.style.display = "inline-block";
    toggleBtn.textContent = "Ver más";

    let expanded = false;
    toggleBtn.onclick = () => {
      if (!expanded) {
        desc.textContent = product.description;
        toggleBtn.textContent = "Ver menos";
        expanded = true;
      } else {
        desc.textContent = product.description.slice(0, maxLength) + "...";
        toggleBtn.textContent = "Ver más";
        expanded = false;
      }
    };
  } else {
    desc.textContent = product.description;
    toggleBtn.style.display = "none";
  }

  modalPrice.textContent = product.price;
  modalCategory.textContent = product.category; // lo que se muestra
  modalRating.textContent = product.rating.rate;
  modalCount.textContent = product.rating.count;

  currentProductId = product.id;
  modal.style.display = "flex";
}

// Cerrar modal
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// Botón "Agregar al carrito" dentro del modal
modalAddBtn.addEventListener("click", () => {
  if (currentProductId) {
    addToCart(currentProductId); // usa tu función existente
    alert("Producto agregado al carrito 🛒");
  }
});

closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

