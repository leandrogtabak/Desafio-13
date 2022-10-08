import express from 'express';
const router = express.Router();
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const passport = require('passport');

import { getLogin, postLogin, getSignup, postSignup, getFaillogin, getFailsignup, getLogout, failRoute } from '../controllers/controller.js';

// // ------------------------------------------------------------------------------
// //  ROUTING GET POST
// // ------------------------------------------------------------------------------

router
  //LOGIN
  .get('/login', getLogin)
  .post('/login', passport.authenticate('login', { failureRedirect: '/faillogin' }), postLogin)
  .all('/faillogin', getFaillogin)
  //REGISTER
  .get('/register', getSignup)
  .post('/register', passport.authenticate('signup', { failureRedirect: '/failsignup' }), postSignup)
  .all('/failsignup', getFailsignup)
  //LOGOUT
  .get('/logout', getLogout)
  //FAIL ROUTE
  .all('*', failRoute);

export default router;
