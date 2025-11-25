import mongoose from 'mongoose';
import ApiError from '../utils/ApiError.js';

export default function validateObjectId(fields = []) {
  return function (req, _res, next) {
    const invalid = [];
    for (const field of fields) {
      const val = req.body?.[field] ?? req.params?.[field] ?? req.query?.[field];
      if (val !== undefined && !mongoose.Types.ObjectId.isValid(val)) {
        invalid.push(field);
      }
    }
    if (invalid.length) {
      return next(new ApiError(400, `Invalid ObjectId for: ${invalid.join(', ')}`));
    }
    return next();
  };
}

