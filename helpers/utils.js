const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./constants');

const validateToken = (req, res, next) => {
    const authorizationHeaader = req.headers.authorization;
    let result;
    if (authorizationHeaader) {
      const token = req.headers.authorization.split(' ')[1]; // Bearer <token>
      const options = {
        expiresIn: '24h',
        issuer: 'nasims'
      };
      try {

        result = jwt.verify(token, JWT_SECRET, options);
        req.decoded = result;
        next();
      } catch (err) {
        throw new Error(err);
      }
    } else {
        result = { 
        status: 'error',
        message: 'Authentication error. Token required.',
      };
      res.status(401).send(result);
    }
}

const dbErrorFormatter = error =>  error.errors.map(er => er.message)
  

module.exports = {
  validateToken,
  dbErrorFormatter
};