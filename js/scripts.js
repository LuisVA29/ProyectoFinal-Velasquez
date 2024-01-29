const serverUrl = 'http://localhost:5173';

function showNotification(message, type = 'success') {
  Toastify({
    text: message,
    duration: 2000,
    gravity: "bottom",
    position: "left",
    backgroundColor: type === 'success' ? "green" : "orange",
  }).showToast();
}

const Clickbutton = document.querySelectorAll('.button');
const tbody = document.querySelector('.tbody');
const carritoCantidadElement = document.getElementById('carritoCantidad');
let carrito = [];

Clickbutton.forEach(btn => {
  btn.addEventListener('click', async (e) => {
    const button = e.target;
    const item = button.closest('.card');
    const itemTitle = item.querySelector('.card-title').textContent;
    const itemPrice = item.querySelector('.precio').textContent;
    const itemImg = item.querySelector('.card-img-top').src;

    const newItem = {
      title: itemTitle,
      precio: itemPrice,
      img: itemImg,
      cantidad: 1
    };

    await addToCarritoItem(newItem);
    await addItemToServer(newItem);
  });
});

async function addToCarritoItem(newItem) {
  const InputElemnto = tbody.getElementsByClassName('input__elemento');
  for (let i = 0; i < carrito.length; i++) {
    if (carrito[i].title.trim() === newItem.title.trim()) {
      carrito[i].cantidad++;
      const inputValue = InputElemnto[i];
      inputValue.value++;
      await renderCarrito();
      showNotification("Producto agregado con éxito");
      return null;
    }
  }

  carrito.push(newItem);
  await renderCarrito();
  showNotification("Producto agregado con éxito");
}

async function renderCarrito() {
  tbody.innerHTML = '';
  carrito.map(item => {
    const tr = document.createElement('tr');
    tr.classList.add('ItemCarrito');
    const Content = `
      <th scope="row">1</th>
      <td class="table__productos">
        <img src=${item.img}  alt="">
        <h6 class="title">${item.title}</h6>
      </td>
      <td class="table__price"><p>${item.precio}</p></td>
      <td class="table__cantidad">
        <input type="number" min="1" value=${item.cantidad} class="input__elemento">
        <button class="delete btn btn-danger">x</button>
      </td>
    `;
    tr.innerHTML = Content;
    tbody.append(tr);

    tr.querySelector(".delete").addEventListener('click', async () => {
      await removeItemCarrito(item.title);
      await removeItemFromServer(item.title);
    });

    tr.querySelector(".input__elemento").addEventListener('change', async (e) => {
      item.cantidad = parseInt(e.target.value);
      await sumaCantidad(item.title, item.cantidad);
    });
  });
  await CarritoTotal();
}

async function CarritoTotal() {
  let Total = 0;
  const itemCartTotal = document.querySelector('.itemCartTotal');
  carrito.forEach((item) => {
    const precio = Number(item.precio.replace("$", ''));
    Total = Total + precio * item.cantidad;
  });

  itemCartTotal.innerHTML = `Total $${Total}`;
  addLocalStorage();

  carritoCantidadElement.textContent = carrito.length;
}

async function removeItemCarrito(title) {
  const index = carrito.findIndex(item => item.title === title);
  carrito.splice(index, 1);
  await renderCarrito();
  await removeItemFromServer(title);
  showNotification("Producto eliminado con éxito", 'warning');
}

async function sumaCantidad(title, cantidad) {
  const index = carrito.findIndex(item => item.title === title);
  carrito[index].cantidad = cantidad;
  await CarritoTotal();
}

function addLocalStorage() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

window.onload = async function () {
  const storage = JSON.parse(localStorage.getItem('carrito'));
  if (storage) {
    carrito = storage;
    await renderCarrito();
  }
  await getItemsFromServer();
};

const comprarButton = document.querySelector('.btn-success');
comprarButton.addEventListener('click', async function () {
  if (carrito.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: '¡Atención!',
      text: 'El carrito está vacío',
    });
  } else {
    Swal.fire({
      icon: 'success',
      title: '¡Gracias por su compra!',
      text: 'Su pedido ha sido procesado con éxito.',
    });
    carrito = [];
    await renderCarrito();
  }
});
