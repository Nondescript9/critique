const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
  res.render('users/register');
};

module.exports.saveUser = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const user = new User({ username, email });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash('success', 'Welcome to Critique');
      return res.redirect('/albums');
    });
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/register');
  }
};

module.exports.renderLogin = (req, res) => {
  res.render('users/login');
};

module.exports.login = async (req, res) => {
  req.flash('success', 'You are logged in');
  const redirectUrl = res.locals.returnTo || '/albums';
  res.redirect(redirectUrl);
};

module.exports.logout = async (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash('success', "You've been logged out");
    res.redirect('/albums');
  });
};
