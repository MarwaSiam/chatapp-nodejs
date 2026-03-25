const { Op } = require("sequelize");
const { User, Message } = require("../models");
const { asyncHandler } = require("../middleware/errorHandler");
const { validateMessageContent, normalizeText } = require("../utils/validators");

exports.getChatPage = asyncHandler(async (req, res) => {
    const messages = await Message.findAll({
        include: [{ model: User, as: "sender" }],
        order: [["createdAt", "DESC"]],
    });

    res.render("chat", {
        user: req.session.user,
        messages
    });
});


exports.addMessage = asyncHandler(async (req, res) => {
    const contentResult = validateMessageContent(req.body.content);

    if (!contentResult.valid) {
        return res.redirect("/chat");
    }

    await Message.create({
        content: contentResult.value,
        userId: req.session.user.id,
    });

    res.redirect("/chat");
});


exports.deleteMessage = asyncHandler(async (req, res) => {
    const messageId = parseInt(req.params.id, 10);

    // Validate message ID
    if (isNaN(messageId) || messageId <= 0) {
        return res.redirect("/chat");
    }

    const message = await Message.findByPk(messageId);

    if (message && message.userId === req.session.user.id) {
        await message.destroy();
    }

    res.redirect("/chat");
});


exports.searchMessages = asyncHandler(async (req, res) => {
    // Normalize and sanitize search query
    const rawQuery = normalizeText(req.query.q);

    if (!rawQuery) {
        return res.redirect("/chat");
    }

    // Limit query length for performance
    const query = rawQuery.substring(0, 100);

    // Escape special LIKE characters to prevent pattern injection
    const escapedQuery = query
        .replace(/\\/g, '\\\\')
        .replace(/%/g, '\\%')
        .replace(/_/g, '\\_');

    const messages = await Message.findAll({
        where: {
            content: {
                [Op.like]: `%${escapedQuery}%`
            }
        },
        include: [{ model: User, as: "sender" }],
        order: [["createdAt", "DESC"]],
        limit: 100 // Limit results for performance
    });

    res.render("chat", {
        user: req.session.user,
        messages,
        query // Return original query for display
    });
});