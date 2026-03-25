const { User } = require("../models");
const validator = require("../utils/validators");
const { asyncHandler } = require("../middleware/errorHandler");

exports.registerStep1 = asyncHandler(async (req, res) => {
    // 1. Validate inputs using centralized validator
    const emailCheck = validator.validateEmail(req.body.email);
    const firstNameCheck = validator.validateName(req.body.firstName, "First Name");
    const lastNameCheck = validator.validateName(req.body.lastName, "Last Name");

    if (!emailCheck.valid) {
        return res.status(400).json({ ok: false, message: emailCheck.message });
    }
    if (!firstNameCheck.valid) {
        return res.status(400).json({ ok: false, message: firstNameCheck.message });
    }
    if (!lastNameCheck.valid) {
        return res.status(400).json({ ok: false, message: lastNameCheck.message });
    }

    const email = emailCheck.value;
    const firstName = firstNameCheck.value;
    const lastName = lastNameCheck.value;

    // 2. Check if email exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        return res.status(409).json({ ok: false, message: "Email already in use." });
    }

    // 3. Set cookies for step 2
    const cookieOptions = { maxAge: 30000, httpOnly: false };
    res.cookie("reg_email", email, cookieOptions);
    res.cookie("reg_first", firstName, cookieOptions);
    res.cookie("reg_last", lastName, cookieOptions);
    res.cookie("reg_started", Date.now().toString(), cookieOptions);

    return res.json({ ok: true });
});


exports.registerStep2 = asyncHandler(async (req, res) => {
    // 1. Check for timeout / cookies existence
    if (!req.cookies.reg_email || !req.cookies.reg_started) {
        return res.status(408).json({ ok: false, message: "Timeout! Please register again." });
    }

    const { password, confirmPassword } = req.body;

    // 2. Validate password format
    const passCheck = validator.validatePassword(password);
    if (!passCheck.valid) {
        return res.status(400).json({ ok: false, message: passCheck.message });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ ok: false, message: "Passwords do not match." });
    }

    const email = req.cookies.reg_email;

    // 3. Final availability check
    if (await User.findOne({ where: { email } })) {
        return res.status(409).json({ ok: false, message: "Email already taken." });
    }

    // 4. Create User
    await User.create({
        firstName: req.cookies.reg_first,
        lastName: req.cookies.reg_last,
        email: email,
        password: passCheck.value
    });

    // 5. Cleanup cookies
    res.clearCookie("reg_email");
    res.clearCookie("reg_first");
    res.clearCookie("reg_last");
    res.clearCookie("reg_started");

    return res.json({ ok: true });
});


exports.login = asyncHandler(async (req, res) => {
    // 1. Validate email format
    const emailCheck = validator.validateEmail(req.body.email);
    if (!emailCheck.valid) {
        return res.status(400).json({ ok: false, message: "Invalid email format." });
    }

    const email = emailCheck.value;
    const password = req.body.password;

    // 2. Find User
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ ok: false, message: "Invalid email or password." });
    }

    // 3. Create Session
    req.session.user = { id: user.id, firstName: user.firstName, email: user.email };
    return res.json({ ok: true });
});


exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("connect.sid");
        return res.json({ ok: true });
    });
};