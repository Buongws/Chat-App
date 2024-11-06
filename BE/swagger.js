import { serve, setup } from 'swagger-ui-express';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import yaml from 'js-yaml';

// Load the Swagger document
const swaggerDocument = yaml.load(
  readFileSync(resolve('./swagger-main.yaml'), 'utf8')
);

export default (app) => {
  app.use('/api-docs', serve, setup(swaggerDocument));
};
