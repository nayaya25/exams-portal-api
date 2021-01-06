const verifyToken = async function (req, res, next) {
  const bearerHeader = req.headers["authorization"];

  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    console.log(bearer);
    await jwt.verify(
      req.token,
      "5b2f47da43492548593a2d0ecdc52f58",
      (err, authData) => {
        if (err) {
          return res.status(403).json({ message: "Unathorized" });
        } else if (!authData || !authData.data.active) {
          return res
            .status(403)
            .json({ message: "Sorry, This account has been deactivated" });
        } else {
          req.user = authData.data;
          next();
        }
      }
    );
  } else {
    return res.status(403).send({ message: "Please sign in as an Admin" });
  }
};

module.exports = verifyToken;
