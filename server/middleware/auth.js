const jwt = require("jsonwebtoken");

const User = require("../models/User");
module.exports = (req, res, next) => {
  // req: This is an object representing the incoming HTTP request. It contains information about the request such as headers, body, URL, etc.
  // .headers: This is a property of the req object which contains all the headers sent with the HTTP request.
  // .authorization: This is accessing the Authorization header specifically. The Authorization header typically contains credentials for authenticating the client with the server.

  const authHeader = req.headers.authorization;

  if (authHeader) {
    // if (authHeader): This line checks if the authHeader variable has a truthy value. In JavaScript, an empty string, null, undefined, and false are considered falsy, while any other value is considered truthy. So this condition ensures that there is actually a value in authHeader before proceeding.

    // const token = authHeader.split(" ")[1];: If authHeader has a value, this line splits the authHeader string by spaces (assuming that the authorization header is in the format "Bearer <token>"). It then assigns the second element of the resulting array (index 1) to the token variable. This effectively extracts the token portion of the Authorization header.

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
      if (err) {
        return res.status(401).json({ error: "unauthorized" });
      }
      try {
        const user = await User.findOne({ _id: payload._id }).select(
          "-password"
        );
        req.user = user;
        next();
        //next();: This function call is used to pass control to the next middleware function in the request-response cycle. It's typically used in Express.js to move to the next middleware function or route handler.
      } catch (error) {
        console.log(error);
      }
    });
  } else {
    return res.status(403).json({ error: "Fordidden!!!!" });
  }
};
