import express from 'express';
const router = express.Router();
import { ContenedorArchivo } from '../contenedores/ContenedorArchivo.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function auth(req, res, next) {
  if (req.session?.userLogin) {
    return next();
  }
  return res.status(401).send('Error de autorizacion');
}

const miContenedorMensajes = new ContenedorArchivo('./mensajes.json');
const miContenedorProductos = new ContenedorArchivo('./productos.json');

router
  .get('/api', auth, async (req, res) => {
    const productos = await miContenedorProductos.getAll();
    const mensajes = await miContenedorMensajes.getAll();

    res.render('main', { usuario: req.session.userLogin, productos: productos, mensajes: mensajes });
  })
  .get('/api/login', async (req, res) => {
    res.render('login');
  })
  .post('/api/login', async (req, res) => {
    const { userLogin } = req.body;
    req.session.userLogin = userLogin;
    return res.redirect('/api');
  })

  .get('/api/logout', async (req, res) => {
    res.render('logout', { usuario: req.session.userLogin });
    req.session.destroy();
  })

  .post('/api/login', async (req, res) => {
    const { userLogin } = req.body;
    req.session.userLogin = userLogin;
    return res.redirect('/api');
  });

export default router;
