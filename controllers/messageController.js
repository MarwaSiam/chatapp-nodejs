const { User, Message } = require("../models");
const { asyncHandler } = require("../middleware/errorHandler");
const { validateMessageContent } = require("../utils/validators");

exports.editMessage = asyncHandler(async (req, res) => {
    const messageId = req.params.id;

    const contentResult = validateMessageContent(req.body.content);
    if (!contentResult.valid) {
        return res.status(400).json({ ok: false, message: contentResult.message });
    }

    const newContent = contentResult.value;
    const message = await Message.findByPk(messageId);

    if (!message) {
        return res.status(404).json({ ok: false, message: "Message not found." });}

    if (message.userId !== req.session.user.id) {
        return res.status(403).json({ ok: false, message: "You can only edit your own messages." });
    }

    message.content = newContent;
    await message.save();

    return res.json({ ok: true, message: "Message updated successfully." });
});

exports.getMessages = asyncHandler(async (req, res) => {
    const lastUpdate = req.query.lastUpdate || null;

    const messages = await Message.findAll({
        include: [{ model: User, as: "sender" }],
        order: [["createdAt", "DESC"]],
    });

    let latestUpdate = null;
    if (messages.length > 0) {
        latestUpdate = Math.max(...messages.map(m => new Date(m.updatedAt).getTime()));
    }

    if (lastUpdate && latestUpdate && Number(lastUpdate) >= latestUpdate) {
        return res.json({ ok: true, hasUpdates: false });
    }

    return res.json({
        ok: true,
        hasUpdates: true,
        lastUpdate: latestUpdate,
        messages: messages.map(m => ({
            id: m.id,
            content: m.content,
            createdAt: m.createdAt,
            updatedAt: m.updatedAt,
            userId: m.userId,
            sender: {
                id: m.sender.id,
                firstName: m.sender.firstName,
            }
        }))
    });
});
