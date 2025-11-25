import ApiError from '../utils/ApiError.js';

export default function validate(requiredFields = []) {
  return function (req, _res, next) {
    const missing = requiredFields.filter((f) => req.body?.[f] === undefined);
    if (missing.length) return next(new ApiError(400, `Missing fields: ${missing.join(', ')}`));
    next();
  };
}

