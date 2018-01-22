import * as express from 'express';
import { api } from './endpoints/api';
const app = express();
const port = process.env.PORT || '8080';

app.use('/api', api);

app.listen(port, () => console.log(`Listening on port: ${port}`));
