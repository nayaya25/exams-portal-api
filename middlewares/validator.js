const { check, validationResult, query } = require('express-validator');
const jwt = require("jsonwebtoken")

const questionCreateValidationRules = () => {
  return [
    // Question Field Validation
    check('questions.*.question')
      .notEmpty()
      .withMessage("Question Cannot be empty"),
    // Answer Field Validation
    check('questions.*.answer')
      .notEmpty()
      .withMessage("Answer Cannot be empty"),
    // options Field Validation
    check('questions.*.options')
      .notEmpty()
      .withMessage("Options Cannot be Empty")
      .isArray({ min: 3, max: 5 })
      .withMessage("Options Must Be Array of not less than 3 or Greater than 5 values")
  ];
}

const testSubmitValidationRules = () => {
  return [
     // NASSIMS ID query string validation
     query('nasimsId')
     .notEmpty()
     .withMessage("Please Provide NASIMS ID"),
    // Question Field Validation
    check('attempts.*.question')
      .notEmpty()
      .withMessage("Question Cannot be empty"),
    // ID Field Validation
    check('attempts.*.id')
      .notEmpty()
      .withMessage("Question ID must be present"),
    // Answer Field Validation
    check('attempts.*.answer')
      .notEmpty()
      .withMessage("Answer Cannot be empty"),
    // options Field Validation
    check('attempts.*.options')
      .notEmpty()
      .withMessage("Options Cannot be Empty")
      .isArray({ min: 3, max: 5 })
      .withMessage("Options Must Be Array of not less than 3 or Greater than 5 values")
  ];
}

const nasimsIdValidationRule = () => {
  return [
    // NASSIMS ID query string validation
    query('nasimsId')
      .notEmpty()
      .withMessage("Please Provide NASIMS ID"),
  ];
}

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));

  return res.status(422).json({
    status: 'Validation Error',
    errors: extractedErrors,
  });
}

 const verifyToken = async function (req, res, next){
  const bearerHeader = req.headers['authorization']
  
  if(typeof bearerHeader !== 'undefined'){
      const bearer = bearerHeader.split(" ")
      const bearerToken = bearer[1]
      req.token = bearerToken
      console.log(bearer)
      await jwt.verify(req.token, "5b2f47da43492548593a2d0ecdc52f58", (err, authData) => {
          if(err){
              return res.status(403).json({message: "Unathorized"})
          }else if(!authData || !authData.data.active){
                 return res.status(403).json({message: "Sorry, This account has been deactivated"})
          }else{
              req.user = authData.data
              next()
          }
      })
  }else{
      return res.status(403).send({message: "Please sign in as an Admin"})
  }
}


module.exports = {
  nasimsIdValidationRule,
  questionCreateValidationRules,
  validate,
  testSubmitValidationRules,
  verifyToken
}