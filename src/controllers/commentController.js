const Comment = require("../models/Comment");
const Resource = require("../models/Resource");
const { bailIf } = require("../utils/helpers");
const logger = require("../utils/logger");

exports.listComments = async (req, res, next) => {
  try {
    const { id: resourceId } = req.params;

    const resource = await Resource.findById(resourceId).lean();
    bailIf(!resource, "Recurso não encontrado", next);

    const comments = await Comment.find({ resource: resourceId })
      .sort({ createdAt: -1 })
      .populate("author", "username") // bring in the username
      .lean();

    res.json(comments);
  } catch (err) {
    next(err);
  }
};

exports.createComment = async (req, res, next) => {
  try {
    const { id: resourceId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    bailIf(
      !content || !content.trim(),
      "Comentário não pode estar vazio",
      next
    );

    const resource = await Resource.findById(resourceId).lean();
    bailIf(!resource, "Recurso não encontrado", next);

    const comment = await Comment.create({
      resource: resourceId,
      author: userId,
      content: content.trim(),
    });

    logger.info(`Comentário criado por ${req.user.username} em ${resourceId}`);

    await comment.populate("author", "username");

    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
};
