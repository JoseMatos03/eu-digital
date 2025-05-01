const logger = require("../utils/logger");

exports.renderHome = (req, res) => {
  logger.info(`Homepage acedida por ${req.ip}`);
  res.render("index", {
    title: "Eu Digital",
    message: "Bem-vindo à plataforma Eu Digital!",
  });
};
