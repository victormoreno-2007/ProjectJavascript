const API = 'https://fakestoreapi.com/products';

let cart = {}, products = [], currentProductId = null, favorites = {};

const $ = id => document.getElementById(id);

async function fetchProducts() {
    const fallbackProducts = [
        {
            id: 1,
            title: "Camiseta Deportiva Básica",
            price: 25.99,
            description: "Camiseta deportiva de alta calidad, perfecta para entrenamientos.",
            category: "Ropa",
            image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            rating: { rate: 4.5, count: 120 }
        },
        {
            id: 2,
            title: "Auriculares Inalámbricos Pro",
            price: 89.99,
            description: "Auriculares con cancelación de ruido activa y batería de larga duración.",
            category: "Electrónica",
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            rating: { rate: 4.8, count: 250 }
        },
        {
            id: 3,
            title: "Reloj Inteligente Fit",
            price: 150.00,
            description: "Reloj inteligente con monitor de ritmo cardíaco y GPS integrado.",
            category: "Electrónica",
            image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            rating: { rate: 4.6, count: 90 }
        },
        {
            id: 4,
            title: "Mochila Urbana Resistente",
            price: 45.00,
            description: "Mochila con compartimento para laptop y material impermeable.",
            category: "Accesorios",
            image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            rating: { rate: 4.7, count: 320 }
        },
        {
            id: 5,
            title: "Zapatillas Urbanas Clásicas",
            price: 60.50,
            description: "Zapatillas cómodas ideales para el día a día en la ciudad.",
            category: "Calzado",
            image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            rating: { rate: 4.4, count: 150 }
        },
        {
            id: 6,
            title: "Gafas de Sol Vintage",
            price: 20.00,
            description: "Gafas de sol con protección UV400 y diseño retro.",
            category: "Accesorios",
            image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            rating: { rate: 4.3, count: 85 }
        }
    ];

    try {
        const res = await fetch(API);
        if (!res.ok) throw new Error("API falló con status " + res.status);
        
        // Verificamos que sea verdaderamente JSON para evitar que Cloudflare rompa el código
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("La API no devolvió un JSON válido.");
        }
        
        return await res.json();
    } catch (error) {
        console.warn("Hubo un fallo con Fakestore API, activando modo de respaldo. Error:", error.message);
        return fallbackProducts;
    }
}
function savefavorites() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function loadfavorites() {
    favorites = JSON.parse(localStorage.getItem('favorites')) || {};
    updatefavorites();
}

function removeFromFavorites(id) {
    delete favorites[Number(id)];
    savefavorites();
    updatefavorites();
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart)); //guarda los datos en el navegador en string
}

function loadCart() {
    cart = JSON.parse(localStorage.getItem('cart')) || {}; //lee los datos guardados y de string los convierte a objeto
    updateCartUI(); // si no hay nada guardado lo usa un objeto vacio
}
function togglefavorite(id) {
    const p = products.find(pr => pr.id === Number(id)); 
    if (!p) return;

    if (favorites[p.id]) {
        delete favorites[p.id];
    } else {
        favorites[p.id] = p;
    }
    savefavorites();
    updatefavorites();
    applyFilters();
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
          <img src="${p.image}" alt="${p.title}" class="cart-img" />
          <span class="cart-title">${p.title}</span>
          <span class="cart-subtotal">$${(p.price * p.qty).toFixed(2)}</span>
          <div class="cart-controls">
            <button onclick="changeQty(${id}, -1)">&#8722;</button>
            <span class="cart-qty">${p.qty}</span>
            <button onclick="changeQty(${id}, 1)">&#43;</button>
            <button class="btn-remove" onclick="removeFromCart(${id})">&#128465;</button>
          </div>
        `;
        itemsContainer.appendChild(li);
    }
    const cartItems = document.getElementById("cart-items");
    if (cartItems.children.length === 0) { // si esta vacio muestra este mensaje
        cartItems.innerHTML = "<p>tu carrito esta vacio &#128532;, agrega un producto para comprar </p>";
    };

    $('cart-total').textContent = total.toFixed(2);
    $('cart-count').textContent = count; // actualiza el total y el número de productos en el botón de carrito.
}
const favoritesmodal = document.getElementById("favoritesmodal");
const closefavorite = document.querySelector(".close-btn-favorites");
// ── Overlay: abre y cierra paneles laterales ──────────────────────
const overlay = document.getElementById('panel-overlay');

function openPanel(panelEl) {
    panelEl.classList.remove('hidden-modal');
    // pequeño delay para que la transición del overlay se vea
    requestAnimationFrame(() => overlay.classList.add('active'));
}

function closeAllPanels() {
    $('cart').classList.add('hidden-modal');
    favoritesmodal.classList.add('hidden-modal');
    overlay.classList.remove('active');
}

// click en el overlay → cierra todo
overlay.addEventListener('click', closeAllPanels);

function openfavoriteModal() {
    updatefavorites(); // renderiza con el nuevo diseño
    openPanel(favoritesmodal);
}

// abrir modal
$("favorites-btn").addEventListener("click", openfavoriteModal);

// cerrar modal con botón
closefavorite.addEventListener("click", closeAllPanels);

// cerrar modal clickeando fuera → lo maneja el overlay


function updatefavorites() {
    const itemsContainer = $('favorite-items');
    itemsContainer.innerHTML = '';
    let count = 0;
    for (let id in favorites) {
        const p = favorites[id];
        count++;
        const li = document.createElement('li');
        li.classList.add("favorite-li");
        li.innerHTML = `
          <img src="${p.image}" alt="${p.title}" class="fav-img" />
          <span class="fav-title">${p.title}</span>
          <span class="fav-price">$${p.price.toFixed(2)}</span>
          <div class="fav-controls">
            <button class="btn-fav-cart" onclick="addToCart(${Number(id)})">&#128722; Al carrito</button>
            <button class="btn-fav-remove" onclick="removeFromFavorites(${id})">&#10005; Quitar</button>
          </div>`;
        itemsContainer.appendChild(li);
    }
    if (itemsContainer.children.length === 0) {
        itemsContainer.innerHTML = `<p>no hay favoritos &#128532;</p>`
    }
    $('favorites-count').textContent = count;
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
        const isFavorite = favorites[p.id];
        div.innerHTML = ` 
            <img src="${p.image}" alt="${p.title}" class="product-img" />
            <h3>${p.title}</h3>
            <p>$${p.price}</p>
            <p><small>${p.category}</small></p>
            <div id="boton">
                <button onclick="addToCart(${p.id})">🛒 Agregar</button>
                <button onclick="togglefavorite(${p.id})" 
                        class="${isFavorite ? 'fav-active' : ''}">
                        ${isFavorite ? '❌ Quitar' : '⭐ Favorito'}
                </button>
            </div>`;
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
    $('cart-btn').addEventListener('click', () => {
        const isOpen = !$('cart').classList.contains('hidden-modal');
        if (isOpen) {
            closeAllPanels();
        } else {
            openPanel($('cart'));
        }
    });

    $('close-cart').addEventListener('click', closeAllPanels);
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
            resumen += `- ${p.title} x${p.qty} = $${subtotal.toFixed(2)} \n`;
            total += subtotal;
        }

        resumen += `\nTOTAL: $${total.toFixed(2)} \n\n¡Gracias por tu compra!`;
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
    loadfavorites(); //carga los favoritos del localStorage.
    products = await fetchProducts(); //descarga productos de la API.
    renderProducts(products);//los dibuja en pantalla.
    setupFilters();//activa los filtros.
    setupBuyNow();//activa el botón comprar.
}

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;

const modal = document.getElementById("productModal");
const closeBtn = document.querySelector(".close-btn");

const modalImg = document.getElementById("modal-img");
const modalTitle = document.getElementById("modal-title");
const modalDesc = document.getElementById("modal-description");
const modalPrice = document.getElementById("modal-price");
const modalCategory = document.getElementById("modal-category");
const modalRating = document.getElementById("modal-rating");
const modalCount = document.getElementById("modal-count");
const desc = document.getElementById("desc-producto");
const toggleBtn = document.getElementById("toggle-desc");
const modalAddBtn = document.getElementById("modal-add");

toggleBtn.addEventListener("click", () => {
    desc.classList.toggle("expanded");
    if (desc.classList.contains("expanded")) { // para la opcion en la tarjeta de ver mas o menos
        toggleBtn.textContent = "Ver menos";
    } else {
        toggleBtn.textContent = "Ver más";
    }
});

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





init();