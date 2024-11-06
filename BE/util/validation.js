import Joi from 'joi';

const stringField = (min, max) =>
  Joi.string()
    .min(min)
    .max(max)
    .messages({
      'string.base': `Must be a string`,
      'string.min': `Must be at least ${min} characters`,
      'string.max': `Must be no more than ${max} characters`,
      'any.required': `This field is required`,
    });

const positiveNumberField = () =>
  Joi.number().positive().messages({
    'number.base': `Must be a number`,
    'number.positive': `Must be a positive number`,
    'any.required': `This field is required`,
  });

const optionalStringField = (min, max) =>
  Joi.string()
    .min(min)
    .max(max)
    .allow(null)
    .optional()
    .messages({
      'string.base': 'Must be a string',
      'string.min': `Must be at least ${min} characters`,
      'string.max': `Must be no more than ${max} characters`,
    });

const optionalPositiveNumberField = () =>
  Joi.number().positive().allow(null).optional().messages({
    'number.base': 'Must be a number',
    'number.positive': 'Must be a positive number',
  });

const decimalField = () =>
  Joi.number().precision(2).positive().allow(null).optional().messages({
    'number.base': 'Must be a number',
    'number.positive': 'Must be a positive number',
    'number.precision': 'Must have at most 2 decimal places',
  });

const passwordField = () =>
  Joi.string()
    .min(6)
    .max(100)
    .pattern(new RegExp('^(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])'))
    .messages({
      'string.base': 'Password must be a string',
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password must be no more than 100 characters long',
      'string.pattern.base':
        'Password must contain at least one number and one special character',
      'any.required': 'Password is required',
    });

const userSchema = Joi.object({
  name: stringField(3, 20),
  password: passwordField().required(),
  email: Joi.string().email().required().messages({
    'string.base': 'Email must be a string',
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required',
  }),
  imageUrl: optionalStringField(3, 512),
  status: Joi.string().valid('ACTIVE', 'OFFLINE'),
  refreshToken: optionalStringField(3, 512),
});

const updateUserSchema = Joi.object({
  name: stringField(3, 20),
  email: Joi.string().email().messages({
    'string.base': 'Email must be a string',
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required',
  }),
});

const updateUserPasswordSchema = Joi.object({
  oldPassword: passwordField().required(),
  newPassword: passwordField().required(),
});

const channelCreateSchema = Joi.object({
  channelName: stringField(3, 20).required().messages({
    'string.base': 'Channel name must be a string',
    'string.min': 'Channel name must be at least 3 characters long',
    'string.max': 'Channel name must be no more than 20 characters long',
    'any.required': 'Channel name is required',
  }),
  serverId: stringField(3, 32).required(),
  channelType: Joi.string().valid('TEXT', 'VOICE').required(),
});

const channelUpdateSchema = Joi.object({
  channelName: stringField(3, 20).required().messages({
    'string.base': 'Channel name must be a string',
    'string.min': 'Channel name must be at least 3 characters long',
    'string.max': 'Channel name must be no more than 32 characters long',
    'any.required': 'Channel name is required',
  }),
});

export {
  userSchema,
  updateUserSchema,
  channelCreateSchema,
  channelUpdateSchema,
  updateUserPasswordSchema,
};
