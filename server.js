import express from 'express';
import { faker } from '@faker-js/faker/locale/es';
import { Server as HttpServer } from 'http';
import { Server as IOServer } from 'socket.io';
import { URL_BASE_DE_DATOS, TIEMPO_EXPIRACION } from './DB/config.js';
import { ContenedorMongoDb } from './contenedores/ContenedorMongoDb.js';
import { ContenedorFirebase } from './contenedores/ContenedorFirebase.js';
import { ContenedorArchivo } from './contenedores/ContenedorArchivo.js';
import { Mensaje } from './models/mensaje.js';
import { User } from './models/User.js';
import { conectarDB } from './controllersdb.js';
import handlebars from 'express-handlebars';
import util from 'util';
import moment from 'moment';
import session from 'express-session';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bCrypt = require('bcrypt');
import router from './routes/router.js';

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

app.use(express.static(path.resolve(__dirname, './views')));

passport.use(
  'signup',
  new LocalStrategy(
    {
      passReqToCallback: true,
    },
    async (req, username, password, done) => {
      let user;
      try {
        user = await User.findOne({ username: username });
      } catch (error) {
        console.log('Error in SignUp: ' + err);
        return done(err);
      }

      if (user) {
        console.log('User already exists');
        return done(null, false);
      }

      const newUser = {
        username: username,
        password: await createHash(password),
      };

      let userWithId;
      try {
        userWithId = await User.create(newUser);
      } catch (error) {
        console.log('Error in Saving user: ' + err);
        return done(err);
      }

      console.log(user);
      console.log('User Registration succesful');
      return done(null, userWithId);
    }
  )
);

passport.use(
  'login',
  new LocalStrategy(async (username, password, done) => {
    let user;
    try {
      user = await User.findOne({ username });
    } catch (error) {
      return done(err);
    }

    if (!user) {
      console.log('User Not Found with username ' + username);
      return done(null, false);
    }

    if (!(await isValidPassword(user, password))) {
      console.log('Invalid Password');
      return done(null, false);
    }

    return done(null, user);
  })
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, done);
});

async function createHash(password) {
  const salt = await bCrypt.genSalt(10);
  return await bCrypt.hash(password, salt);
}

async function isValidPassword(user, password) {
  return await bCrypt.compare(password, user.password);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: 'Is this the real life? Is this just fantasy?',
    cookie: {
      httpOnly: false,
      secure: false,
      expires: 60000,
      maxAge: TIEMPO_EXPIRACION,
    },
    rolling: true,
    resave: true,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// ------------------------------------------------------------------------------
//  ROUTER
// ------------------------------------------------------------------------------
app.use('/', router);

io.on('connection', async (socket) => {
  console.log('Un cliente se ha conectado');

  socket.on('onload', async () => {
    const productos = await miContenedorProductos.getAll();
    const mensajes = await miContenedorMensajes.getAll();
    io.sockets.emit('productos', productos);
    io.sockets.emit('mensajes', mensajes);
  });

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

// ------------------------------------------------------------------------------
//  LISTEN SERVER
// ------------------------------------------------------------------------------
conectarDB(URL_BASE_DE_DATOS, (err) => {
  if (err) return console.log('error en conexión de base de datos', err);
  console.log('BASE DE DATOS CONECTADA');

  httpServer.listen(PORT, function () {
    console.log(`Servidor corriendo en ${PORT}`);
  });
});

httpServer.on('error', (error) => console.log(`Error en el servidor: ${error}`));
