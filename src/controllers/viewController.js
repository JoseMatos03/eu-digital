const Resource = require("../models/Resource");
const User = require("../models/User");
const News = require("../models/News");
const statsService = require("../utils/stats");

const logger = require("../utils/logger");

exports.renderHome = (req, res) => {
  logger.info(`Homepage acedida por ${req.ip}`);
  res.render("index", {
    title: "Eu Digital",
    message: "Bem-vindo à plataforma Eu Digital!",
  });
};

exports.renderAdmin = (req, res) => {
  res.render("admin", {
    title: "Admin Dashboard",
    user: req.user,
  });
};

exports.usersList = async (req, res, next) => {
  try {
    const users = await User.find().lean();
    res.render("admin/usersList", { title: "Gerir Utilizadores", users });
  } catch (err) {
    next(err);
  }
};

exports.usersCreateForm = (req, res) => {
  res.render("admin/userForm", { title: "Criar Utilizador", user: {} });
};

exports.newsList = async (req, res, next) => {
  try {
    const news = await News.find().lean();
    res.render("admin/newsList", { title: "Gerir Notícias", news });
  } catch (err) {
    next(err);
  }
};

exports.newsCreateForm = (req, res) => {
  res.render("admin/newsForm", { title: "Criar Notícia", news: {} });
};

exports.resourcesList = async (req, res, next) => {
  try {
    const resources = await Resource.find().lean();
    res.render("admin/resourcesList", { title: "Gerir Recursos", resources });
  } catch (err) {
    next(err);
  }
};

exports.statsPage = async (req, res, next) => {
  try {
    const stats = await statsService.computeUsageStatistics();
    res.render("admin/statsPage", { title: "Estatísticas", stats });
  } catch (err) {
    next(err);
  }
};
