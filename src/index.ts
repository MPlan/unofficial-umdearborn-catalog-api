import * as express from 'express';
import * as path from 'path';
import { api } from './endpoints/api';
const app = express();
const port = process.env.PORT || '8080';
const swaggerUi = require('swagger-ui-express');
const Yaml = require('yamljs');
const swaggerDocument = Yaml.load(path.resolve(__dirname, '../../swagger.yaml'));

app.use('/api', api);
app.use('/swagger-ui', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/', (req, res) => {
  res.redirect('/swagger-ui');
});

app.listen(port, () => console.log(`Listening on port: ${port}`));
