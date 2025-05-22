const Resource = require("../models/Resource");
const User = require("../models/User");
const News = require("../models/News");
const statsService = require("../utils/stats");
const taxonomy = require("../utils/taxonomy");

exports.renderHome = async (req, res, next) => {
  try {
    const { tag, dateFrom, dateTo, search } = req.query;
    const userName = req.user.username;

    // Only public OR owned by this user
    const filter = {
      $or: [{ public: true }, { "metadata.publicador": userName }],
    };

    // apply taxonomy‐tag filter
    if (tag) {
      filter["metadata.tags"] = tag;
    }
    // date range
    if (dateFrom || dateTo) {
      filter["metadata.dataCriacao"] = {};
      if (dateFrom) filter["metadata.dataCriacao"].$gte = new Date(dateFrom);
      if (dateTo) filter["metadata.dataCriacao"].$lte = new Date(dateTo);
    }
    // title search
    if (search) {
      filter["metadata.titulo"] = { $regex: search, $options: "i" };
    }

    // fetch + sort
    const resources = await Resource.find(filter)
      .sort({ "metadata.dataCriacao": -1 })
      .lean();

    const tagOptions = taxonomy.getFlatTags();

    res.render("index", {
      title: "Eu Digital – Diário",
      user: req.user,
      resources,
      tagOptions,
      filters: { tag, dateFrom, dateTo, search },
    });
  } catch (err) {
    next(err);
  }
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

exports.usersEditForm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).lean();
    if (!user) return res.status(404).send("Utilizador não encontrado");
    delete user.passwordHash; // don't pass the password into the view
    res.render("admin/userEdit", {
      title: "Editar Utilizador",
      user,
    });
  } catch (err) {
    next(err);
  }
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

exports.newsEditForm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const news = await News.findById(id).lean();
    if (!news) return res.status(404).send("Notícia não encontrada");
    res.render("admin/newsEdit", {
      title: "Editar Notícia",
      news,
    });
  } catch (err) {
    next(err);
  }
};

exports.resourcesList = async (req, res, next) => {
  try {
    const resources = await Resource.find().lean();
    res.render("admin/resourcesList", { title: "Gerir Recursos", resources });
  } catch (err) {
    next(err);
  }
};

exports.resourcesImport = async (req, res, next) => {
  try {
    res.render("admin/resourcesImport", { title: "Importar Recurso" });
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
