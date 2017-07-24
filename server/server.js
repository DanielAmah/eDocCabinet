import express from 'express';
import logger from 'morgan';
import bodyParser from 'body-parser';
import http from 'http';


// Set up the express app
const app = express();


// Log requests to the console.
app.use(logger('dev'));

// Parse incoming requests data (https://github.com/expressjs/body-parser)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const port = parseInt(process.env.PORT, 10) || 8080;
app.set('port', port);

require('./routes')(app);

const server = http.createServer(app);
server.listen(port);
