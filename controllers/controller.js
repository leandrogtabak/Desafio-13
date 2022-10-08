export function getLogin(req, res) {
  if (req.isAuthenticated()) {
    var user = req.user;
    console.log('user logueado');
    res.render('main', {
      usuario: user.username,
    });
  } else {
    console.log('user NO logueado');
    res.render('login');
  }
}

export function postLogin(req, res) {
  var user = req.user;

  res.redirect('/login');
}

export function getSignup(req, res) {
  res.render('register');
}

export function postSignup(req, res) {
  var user = req.user;
  getLogin(req, res);
}

export function getFaillogin(req, res) {
  console.log('error en login');
  res.render('faillogin', {});
}

export function getFailsignup(req, res) {
  console.log('error en signup');
  res.render('failsignup', {});
}

export function getLogout(req, res) {
  var user = req.user;

  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.session.destroy(function (err) {
      res.render('logout', {
        usuario: user.username,
      });
    });
  });
}

export function failRoute(req, res) {
  res.status(404).send('Error en ruta');
}
