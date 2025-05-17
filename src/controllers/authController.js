const bcrypt = require("bcryptjs");
const passport = require("passport");
const logger = require("../utils/logger");
const User = require("../models/User");

exports.showLogin = (req, res) => {
  logger.info("Página de login solicitada");
  res.render("login", { title: "Login" });
};

exports.login = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      logger.error(`Erro na autenticação: ${err.message}`);
      return next(err);
    }
    if (!user) {
      logger.warn(`Falha de login: utilizador não encontrado`);
      return res.redirect("/register");
    }

    req.login(user, (err) => {
      if (err) {
        logger.error(`Erro no login do utilizador: ${err.message}`);
        return next(err);
      }

      logger.info(
        `Utilizador ${user.username} autenticado com sucesso (role: ${user.role})`
      );

      // Redirecionar conforme a role
      if (user.role === "admin") {
        return res.redirect("/admin");
      } else {
        return res.redirect("/"); // utilizador normal volta à homepage
      }
    });
  })(req, res, next);
};

exports.showRegister = (req, res) => {
  logger.info("Página de registo solicitada");
  res.render("register", { title: "Registar" });
};

exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    logger.info(`A registar novo utilizador: ${username}`);
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ username, email, passwordHash });
    logger.info(`Utilizador criado: ${user._id} (${username})`);

    req.login(user, (err) => {
      if (err) {
        logger.error(`Erro no auto-login após registo: ${err.message}`);
        return next(err);
      }
      res.redirect("/");
    });
  } catch (err) {
    logger.error(`Erro no registo de utilizador: ${err.message}`);
    next(err);
  }
};

exports.logout = (req, res) => {
  const username = req.user?.username || "unknown";
  req.logout(() => {
    logger.info(`Utilizador ${username} fez logout`);
    res.redirect("/login");
  });
};
