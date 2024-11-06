import { verifyToken } from '../../util/auth.js';

const isAuth = (req, res, next) => {
  verifyToken(req, res, next);
};
export default {
  isAuth,
};
