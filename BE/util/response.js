const response = (statusCode, message, data) => {
  return {
    statusCode: statusCode,
    message: message || 'Success',
    data: data,
  };
};

export default response;
