const socket = io.connect();

window.addEventListener('load', (e) => {
  e.preventDefault();
  socket.emit('onload');
});

/* Seleccion de elementos HTML */
const inputEmailMessage = document.querySelector('#emailMessage');
const inputNombreMessage = document.querySelector('#nombreMessage');
const inputApellidoMessage = document.querySelector('#apellidoMessage');
const inputEdadMessage = document.querySelector('#edadMessage');
const inputAliasMessage = document.querySelector('#aliasMessage');
const inputAvatarMessage = document.querySelector('#avatarMessage');
const inputTextMessage = document.querySelector('#textMessage');
const textAlert = document.querySelector('#alert');

const inputNombre = document.querySelector('#nombre');
const inputPrecio = document.querySelector('#precio');
const inputFotoUrl = document.querySelector('#fotoUrl');

const btnSendProduct = document.querySelector('#addProduct');
btnSendProduct?.addEventListener('click', sendProduct);

const btnSendMessage = document.querySelector('#sendMessage');
btnSendMessage?.addEventListener('click', sendMessage);

const btnToRegister = document.querySelector('#toRegister');
btnToRegister?.addEventListener('click', () => redirectTo('/register'));

const btnToLogin = document.querySelector('#toLogin');
btnToLogin?.addEventListener('click', () => redirectTo('/login'));

function redirectTo(route) {
  window.location.assign(route);
}

function validateEmail(mail) {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
    return true;
  }
  return false;
}

function sendMessage() {
  const fyh = moment().format('DD/MM/YYYY HH:mm:ss');
  if (validateEmail(inputEmailMessage.value)) {
    const newMensaje = {
      author: {
        email: inputEmailMessage.value,
        nombre: inputNombreMessage.value,
        apellido: inputApellidoMessage.value,
        edad: inputEdadMessage.value,
        alias: inputAliasMessage.value,
        avatar: inputAvatarMessage.value,
      },
      text: inputTextMessage.value,
      fyh: `[${fyh}]`,
    };
    socket.emit('new-message', newMensaje);

    inputTextMessage.value = '';
    textAlert.innerText = '';
  } else {
    textAlert.innerText = 'Por favor, ingresa una dirección de email válida';
  }
}

function sendProduct() {
  const newProduct = {
    nombre: inputNombre.value,
    precio: inputPrecio.value,
    fotoUrl: inputFotoUrl.value,
  };
  socket.emit('new-product', newProduct);

  inputNombre.value = '';
  inputPrecio.value = '';
  inputFotoUrl.value = '';
}

function renderMensajes(mensajes) {
  const html =
    `<div>` +
    mensajes
      .map((mensaje) => {
        return ` <div class='d-flex align-items-center'>
                  <p>
  <span class='fw-bold text-primary'>${mensaje.author.email}</span>
  <span style='color:brown;'>${mensaje.fyh}</span>
  :
  <span class='fst-italic text-success'>${mensaje.text}</span>
</p>
<img src=${mensaje.author.avatar} class='thumbnail' alt='' />
</div>

`;
      })
      .join('') +
    `</div>`;

  document.getElementById('listaMensajes').innerHTML = html;
}

function renderTabla(productos) {
  const header = `<style>
                   .thumbnail {
                      height: 48px;
                              }
                  </style>
<div class='container bg-light p-4 my-2 mx-auto'>
  <hr />
  <h1 class='text-primary mb-5'>Vista de productos</h1>`;

  let html = header;

  let tabla =
    productos.length > 0
      ? `
      <table class='table'>
      <thead>
        <tr class='table-dark'>
  
          <th scope='col'>Nombre</th>
          <th scope='col'>Precio</th>
          <th scope='col'>Foto</th>
        </tr>
      </thead>
      <tbody>` +
        productos
          .map((prod) => {
            return `<tr class='table-dark align-middle'>
                <td>${prod.nombre}</td>
                <td>${prod.precio}</td>
                <td><img src="${prod.fotoUrl}" class="thumbnail" alt="" /></td>
        
              </tr>`;
          })
          .join(' ') +
        `  </tbody>
        </table>`
      : `  <div class='p-3 bg-white mb-4'>
      <h2 class='text-danger'>No se encontraron productos</h2>
    </div>`;
  document.getElementById('tablaProductos').innerHTML = html + tabla;
}

socket.on('productos', (productos) => {
  renderTabla(productos);
});

socket.on('mensajes', function (mensajes) {
  renderMensajes(mensajes);
});
