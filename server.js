import express from 'express';
import { faker } from '@faker-js/faker/locale/es';
import { Server as HttpServer } from 'http';
import { Server as IOServer } from 'socket.io';
import { urlJson, urlDb, urlMongo } from './DB/config.js';
import { ContenedorMongoDb } from './contenedores/ContenedorMongoDb.js';
import { ContenedorFirebase } from './contenedores/ContenedorFirebase.js';
import { ContenedorArchivo } from './contenedores/ContenedorArchivo.js';
import { Mensaje } from './models/mensaje.js';
import handlebars from 'express-handlebars';
import util from 'util';
import moment from 'moment';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import MongoStore from 'connect-mongo';
import router from './routes/router.js';

const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true };

const app = express();
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

app.use(express.static(path.resolve(__dirname, './views')));

const PORT = 8080;
httpServer.listen(PORT, function () {
  console.log(`Servidor corriendo en ${PORT}`);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
// Session Setup
app.use(
  session({
    store: MongoStore.create({
      mongoUrl: 'mongodb+srv://newuser:tfDLXnPCGy4RCE97@cluster0.wc4ea7z.mongodb.net/test',
      mongoOptions: advancedOptions,
    }),
    secret: 'Is this the real life? Is this just fantasy?',
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60000,
      maxAge: 600000,
    },
  })
);

// const miContenedorMongoDB = new ContenedorMongoDb(urlMongo, Mensaje);   //probar mongo descomentando esto y usand en las funciones de abajo, a este contenedor
// const miContenedorFirebase = new ContenedorFirebase(urlJson, urlDb, 'ecommerce'); //probar firebase descomentando esto y usand en las funciones de abajo, a este contenedor
const miContenedorMensajes = new ContenedorArchivo('./mensajes.json');
const miContenedorProductos = new ContenedorArchivo('./productos.json');

app.engine(
  'hbs',
  handlebars.engine({
    extname: '.hbs',
    defaultLayout: 'index.hbs',
    layoutsDir: './views/layouts/',
    partialsDir: './views/partials/',
  })
);

// establecemos el motor de plantilla que se utiliza
app.set('view engine', 'hbs');
// establecemos directorio donde se encuentran los archivos de plantilla
app.set('views', './views');

/* Utilizo router */

app.use('/', router);

io.on('connection', async (socket) => {
  console.log('Un cliente se ha conectado');
  const productos = await miContenedorProductos.getAll();
  const mensajes = await miContenedorMensajes.getAll();
  io.sockets.emit('productos', productos);
  io.sockets.emit('mensajes', mensajes);

  socket.on('new-message', async (newMessage) => {
    await miContenedorMensajes.save(newMessage);
    const mensajes = await miContenedorMensajes.getAll();
    io.sockets.emit('mensajes', mensajes);
  });
  socket.on('new-product', async (newProduct) => {
    await miContenedorProductos.save(newProduct);
    const productos = await miContenedorProductos.getAll();
    io.sockets.emit('productos', productos);
  });
});

httpServer.on('error', (error) => console.log(`Error en el servidor: ${error}`));
