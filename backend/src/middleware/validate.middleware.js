import { validationResult } from "express-validator";

export const validate = (validations) => {
  return async (req, res, next) => {
    for (const validation of validations) {
      const result = await validation.run(req);
      if (!result.isEmpty()) {
        break;
      }
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: "fail",
        errors: errors.array(),
      });
    }
    next();
  };
};

