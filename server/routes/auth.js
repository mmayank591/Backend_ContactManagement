const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth=require("../middleware/auth")
require("dotenv").config({ path: "./config/config.env" });

//register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  //check all the missing fields,
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: `please enter all the required fields` });
  }
  // VALIDATE NAME

  if (name.length > 50) {
    return res.status(400).json({
      error: "name can only be less than 50 characters",
    });
  }

  //EMAIL VALIDATION USING REGEX CODE EXPRESSION
  const emailReg =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if (!emailReg.test(email)) {
    return res.status(400).json({
      error: "please enter a valid email address",
    });
  }
  // VALIDATION OF PASSWORD

  if (password.length <= 6) {
    return res.status(400).json({
      error: "password must be atleast 6 characters long",
    });
  }
  try {
    const doesUserAlreadyExist = await User.findOne({ email });
    if (doesUserAlreadyExist) {
      return res
        .status(400)
        .json({ error: ` A user with the [${email}] already exists` });
    }
                                                    //salt
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ name, email, password: hashedPassword });
    // SAVE THE USER
    const result = await newUser.save();
    result._doc.password = undefined;

    //In the context of Mongoose, a popular Object Data Modeling (ODM) library for MongoDB and Node.js, the _doc property is used to access the document's data.

    return res.status(201).json({ ...result._doc });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: err.message,
    });
  }
});
//login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "please enter all the required fields" });
  }
  //EMAIL VALIDATION USING REGEX CODE EXPRESSION
  const emailReg =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if (!emailReg.test(email)) {
    return res.status(400).json({
      error: "please enter a valid email address",
    });
  }
  try {
    const doesUserExists = await User.findOne({ email });
    if (!doesUserExists)
      return res.status(400).json({ error: "Invalid email or password" });

    //if there were any user
    const doesPasswordMatch = await bcrypt.compare(
      password,
      doesUserExists.password
    );
    if (!doesPasswordMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    const payload = { _id: doesUserExists._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
const user={...doesUserExists._doc,password:undefined}
    return res.status(200).json({ token ,user});
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.message });
  }
});
module.exports = router;

router.get("/me",auth,async(req,res)=>{
  return res.status(200).json({...req.user._doc});
})