import jwt from 'jsonwebtoken';
import response from './response.js';
import msg from '../langs/en.js';
import moment from 'moment';
import JWT_TOKEN from './constant.js';


const verifyToken = async (req, res, next) => {
  // let token = req.headers['access_token'] || req.headers['authorization'];  
  let authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res
      .status(msg.responseStatus.BAD_REQUEST)
      .json(response(msg.responseStatus.BAD_REQUEST, msg.errorCode.NO_TOKEN));
  }
  jwt.verify(token, JWT_TOKEN.JWT_ACCESS_SECRET, (err, user) => {
    if (err) {
      return res
        .status(msg.responseStatus.UNAUTHORIZED)
        .json(
          response(
            msg.responseStatus.UNAUTHORIZED,
              msg.errorCode.INVALID_TOKEN
          )
        );
    }
    req.user = user;
    next();
  });
};

const getUserTokenFull = (user) => ({
  access_token: exports.getUserAccessToken(user),
  refresh_token: exports.getUserRefreshToken(user),
});

const getUserToken = (user, lifetime, secret) =>{
  return  (jwt.sign(user, secret, {
    expiresIn: lifetime,
  }));
}

  //TODO: remove parameter env
const getUserAccessToken = (user) =>
  getUserToken(
    user,
    JWT_TOKEN.JWT_ACCESS_LIFETIME,
    JWT_TOKEN.JWT_ACCESS_SECRET
  );

const getUserRefreshToken = (user) =>
  getUserToken(
    user,
    JWT_TOKEN.JWT_REFRESH_LIFETIME,
    JWT_TOKEN.JWT_REFRESH_SECRET
  );

const getUserInviteToken = (user) =>
  getUserToken(
    user,
    JWT_TOKEN.JWT_INVITE_LIFETIME,
    JWT_TOKEN.JWT_INVITE_SECRET
  );

const getTokenExpTime = (days) => {
  const number = parseInt(days.replace(/[^0-9\.]/g, ''));

  let expTime = number;
  if (days.includes('m')) expTime = number * 1;
  if (days.includes('h')) expTime = number * 60;
  if (days.includes('d')) expTime = number * 60 * 24;
  if (days.includes('w')) expTime = number * 60 * 24 * 7;

  return moment().unix() + expTime * 60;
};

const getResetToken = (user) => {
  return getUserToken(
    user,
    JWT_TOKEN.JWT_RESET_LIFETIME,
    JWT_TOKEN.JWT_RESET_SECRET
  );
};

//verify invite token, if the token is valid return error
const verifyInviteToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_TOKEN.JWT_INVITE_SECRET);
    return decoded;
  } catch (error) {
    throw new CustomError(
      msg.errorCode.INVALID_TOKEN,
      msg.responseStatus.BAD_REQUEST
    );
  }
};

export {
  verifyToken,
  getUserTokenFull,
  getUserAccessToken,
  getUserRefreshToken,
  getTokenExpTime,
  getResetToken,
  getUserInviteToken,
  verifyInviteToken,
};
