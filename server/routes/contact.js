const { validateContact, Contact } = require("../models/Contact");
const auth = require("../middleware/auth");
const router = require("express").Router();
const mongoose = require("mongoose");
//CREATE CONTACT
router.post("/contact",auth, async (req, res) => {
  const { error } = validateContact(req.body);
  //  ITS AVERY TEDIOUS TASK TO VALIDATE ALL THE FIELDS MANUALLY FOR THE USER INPUT SO I AM GOING TO USE A LIBRARY "JOI"
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const { email, address, name, phone } = req.body; //getting name,email,adress,phone from request ki body
  try {
    const newContact = new Contact({
      //putting in a new variable named newContact
      name,
      email,
      address,
      phone,
      postedBy: req.user._id,
    });
    const result = await newContact.save(); //saving the entry into the databse
    return res.status(201).json({ ...result._doc }); //sending back the response after saving
  } catch (err) {
    console.log(err);
  }
});
//FETCH CONTACT
//In the provided code snippet, the authentication of the user is handled by the auth middleware, which is passed as the second argument to the router.get function:
router.get("/mycontacts", auth, async (req, res) => {
  try {
    const myContacts = await Contact.find({ postedBy: req.user._id }).populate(
      "postedBy",
      "-password"
    );
    //The populate() method is commonly used in Mongoose to handle relationships between different MongoDB collections. In this case, there is likely a relationship between the Contact collection and the User collection, where a contact document contains a reference to the user who posted it.
    //Replace Reference with Object: Instead of just having the ID of the user who posted a contact (postedBy field containing req.user._id), the populate() method fetches the actual user object from the User collection based on that ID and replaces the reference with the complete user object.

    return res.status(200).json({ contacts: myContacts.reverse() });
  } catch (err) {
    console.log(err);
  }
});

//UPDATE CONTACT
router.put("/contact", auth, async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: "no id specified" });
  }
  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ error: "please enter a valid id" });

  try {
    const contact = await Contact.findOne({ _id: id });

    if (req.user._id.toString() !== contact.postedBy._id.toString())
      return res
        .status(401)
        .json({ error: "you can't edit other people contacts!" });
    const updatedData = { ...req.body, id: undefined }; // This line creates an updatedData object by spreading the properties from the request body (req.body) and setting id to undefined. This is done to prevent the id from being updated along with the other properties of the contact.
    const result = await Contact.findByIdAndUpdate(id, updatedData, {
      new: true, // The { new: true } option ensures that the updated document is returned.
    });
    return res.status(200).json({ ...result._doc });
  } catch (error) {
    console.log(error);
  }
});

//DELETE A CONTACT
router.delete("/delete/:id", auth, async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ error: "no id specified." });

  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ error: "please enter a valid id" });
  try {
    const contact = await Contact.findOne({ _id: id });
    if (!contact) return res.status(400).json({ error: "no contact found" });

    if (req.user._id.toString() !== contact.postedBy._id.toString())
      return res
        .status(401)
        .json({ error: "you can't delete other people contacts!" });

    const result = await Contact.deleteOne({ _id: id });
    const myContacts = await Contact.find({ postedBy: req.user._id }).populate(
      "postedBy",
      "-password"
    );

    return res
      .status(200)
      .json({ ...contact._doc, myContacts: myContacts.reverse() });
  } catch (err) {
    console.log(err);
  }
});


// to get a single contact.
router.get("/contact/:id", auth, async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ error: "no id specified." });

  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ error: "please enter a valid id" });

  try {
    const contact = await Contact.findOne({ _id: id });
    if (!contact) {
      return res.status(404).json({ error: "contact not found" });
    }
    return res.status(200).json({ ...contact._doc });
  } catch (err) {
    console.log(err);
  }
});



module.exports = router;
