const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
const bcrypt = require("bcrypt");

router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) return res.status(400).send({message:"error", error: "Invalid username or password."});

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword)
        return res.status(400).json({message:"error", error: "Invalid username or password."});

    // console.log(user._id);

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    res.status(200).json({ message:"success", token: token });
});

router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "Username already exists." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            username,
            password: hashedPassword,
        });

        const savedUser = await user.save();
        res.status(200).json({
            message: "success",
            userId: savedUser._id,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({message:"error", error: "Internal server error" });
    }
});

module.exports = router;