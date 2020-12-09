const { check, validationResult, query } =  require('express-validator')

const questionCreateValidationRules = () => {
  return [
    // Question Field Validation
    check('question')
      .notEmpty()
      .withMessage("Question Cannot be empty"),
    // Answer Field Validation
    check('answer')
      .notEmpty()
      .withMessage("Answer Cannot be empty"),
    // options Field Validation
    check('options')
      .notEmpty()
      .withMessage("Options Cannot be Empty")
      .isArray({ min: 3, max: 5 })
      .withMessage("Options Must Be Array of not less than 3 or Greater than 5 values")
  ]
}

const nasimsIdValidationRules = () => {
  return [
    // NASSIMS ID query string validation
    query('nasimsId')
      .notEmpty()
      .withMessage("Please Provide NASIMS ID"),
  ]
}

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    return next()
  }
  const extractedErrors = []
  errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }))

  return res.status(422).json({
    status: 'Validation Error',
    errors: extractedErrors,
  })
}

module.exports = {
  nasimsIdValidationRules,
  questionCreateValidationRules,
  validate
}