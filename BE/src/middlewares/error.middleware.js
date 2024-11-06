import response from '../../util/response.js';
import msg from '../../langs/en.js';

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || msg.responseStatus.INTERNAL_SERVER_ERROR;

  // Check if the error is a validation error
  if (err.details) {
    let messages = [];
    if (err.details.get('query')) {
      messages = err.details.get('query').details.map((value) => value.message);
    } else if (err.details.get('body')) {
      messages = err.details.get('body').details.map((value) => value.message);
    }

    return res
      .status(statusCode)
      .json(response(statusCode, messages));
  }
  console.log(err);

  // For other errors
  return res
    .status(statusCode)
    .json(response(statusCode, err.message));
};

export default errorHandler;
