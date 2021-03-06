[![Build Status](https://travis-ci.org/DanielAmah/eDocCabinet.svg?branch=fix-all-badge)](https://travis-ci.org/DanielAmah/eDocCabinet)
[![Coverage Status](https://coveralls.io/repos/github/DanielAmah/eDocCabinet/badge.svg?branch=development)](https://coveralls.io/github/DanielAmah/eDocCabinet?branch=development)
[![Code Climate](https://codeclimate.com/github/DanielAmah/eDocCabinet/badges/gpa.svg)](https://codeclimate.com/github/DanielAmah/eDocCabinet)
[![Issue Count](https://codeclimate.com/github/DanielAmah/eDocCabinet/badges/issue_count.svg)](https://codeclimate.com/github/DanielAmah/eDocCabinet)
<img src="https://camo.githubusercontent.com/23ee7a697b291798079e258bbc25434c4fac4f8b/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f50726f7465637465645f62792d486f756e642d6138373364312e737667" alt="" data-canonical-src="https://img.shields.io/badge/Protected_by-Hound-a873d1.svg" style="max-width:100%;">
# EDocCabinet - Document Management API

EDocCabinet - document management API provides an interface for users to create and manage documents, it uses JWT as its authentication mechanism.

## Technologies Used
- JavaScript (ES6)
- Node.js
- Express
- Postgresql 
- Sequelize ORM.  

## Prerequisites
- [Postgresql](https://www.postgresql.org/) and
-  [Node.js](http://nodejs.org/) >= v6.8.0.

## Project Dependencies
### Dependencies
+  **[babel-cli](https://www.npmjs.com/package/babel-cli)** - Allows running the app in ES6 mode on the fly without having to transpile down to ES5
+ **[babel-preset-es2015](https://www.npmjs.com/package/babel-preset-es2015)**, **[babel-preset-stage-0](https://www.npmjs.com/package/babel-preset-stage-0)** - These packages provide Babel presets for es2015 plugins, stage 0 plugins
+  **[bcryptjs](https://www.npmjs.com/package/bcryptjs)** - Used to hash passwords
+  **[body-parser](https://www.npmjs.com/package/body-parser)** - Node.js body parsing middleware. Parse incoming request bodies in a middleware before your handlers, available under the `req.body` property.
+  **[dotenv](https://www.npmjs.com/package/dotenv)** - Loads environment variables
+  **[express](https://www.npmjs.com/package/express)** - Used as the web server for this application
+  **[express-validator](https://www.npmjs.com/package/express-validator)** - Validates input on request body, params and query
+  **[jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)** - Generates JWT tokens and can verify them
+  **[lodash](https://www.npmjs.com/package/lodash)** - Provides utility functions
+  **[pg](https://www.npmjs.com/package/pg)** - Non-blocking PostgreSQL client for node.js. Pure JavaScript and optional native libpq bindings
+  **[pg-hstore](https://www.npmjs.com/package/pg-hstore)** - A node package for serializing and deserializing JSON data to hstore format
+  **[sequelize](https://www.npmjs.com/package/sequelize)** - Sequelize is a promise-based Node.js ORM for Postgres, MySQL, SQLite and Microsoft SQL Server. It features solid transaction support, relations, read replication and more
+  **[sequelize-cli](https://www.npmjs.com/package/sequelize-cli)** - The Sequelize Command Line Interface (CLI)

### Development Dependencies
+  **[chai](https://www.npmjs.com/package/chai)** - Chai is a BDD / TDD assertion library for node and the browser that can be delightfully paired with any javascript testing framework.
+  **[coveralls](https://www.npmjs.com/package/coveralls)** - Coveralls.io support for node.js. Get the great coverage reporting of coveralls.io and add a cool coverage button to your README.
+  **[gulp](https://www.npmjs.com/package/gulp)** - gulp is a toolkit that helps you automate painful or time-consuming tasks in your development workflow.
+  **[gulp-babel](https://www.npmjs.com/package/gulp-babel)** - Use next generation JavaScript, today, with Babel
+  **[gulp-exit](https://www.npmjs.com/package/gulp-exit)** - ensures that the task is terminated after finishing.
+  **[gulp-inject-modules](https://www.npmjs.com/package/gulp-inject-modules)** - Loads JavaScript files on-demand from a Gulp stream into Node's module loader.
+  **[gulp-istanbul](https://www.npmjs.com/package/gulp-istanbul)** - Istanbul unit test coverage plugin for gulp.
+  **[gulp-jasmine-node](https://www.npmjs.com/package/gulp-jasmine-node)** - This is a very basic implementation of a gulp task for jasmine-node
+  **[gulp-nodemon](https://www.npmjs.com/package/gulp-nodemon)** - it's gulp + nodemon + convenience
+  **[supertest](https://www.npmjs.com/package/supertest)** - HTTP assertions made easy via superagent.

## Installation and Setup
1. Clone this repository from a terminal `git clone https://github.com/DanielAmah/eDocCabinet.git`.
1. Move into the project directory `cd eDocCabinet`
1. Install project dependencies `npm install`
1. Create Postgresql database and run migrations `npm run migrate`.
1. Populate database with data `npm run seed`.
1. Start the express server `npm start`.
1. Run test `npm test`.

## Postman Collection
[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/6733658ab0d5e0f6e2fc)

## API Documentation
The API has routes, each dedicated to a single task that uses HTTP response codes to indicate request success or errors. The full document can be found [here](https://edoccabinet.herokuapp.com) 

## Authentication
Users are assigned a token when signup or signin. This token is then used for subsequent HTTP requests to the API for authentication and should be sent as one of the header values.


## Below are the API endpoints and their functions
EndPoint                        |   Functionality
------------------------------  |------------------------
POST /api/v1/users/login         |   Logs a user in.
POST /api/v1/users/              |   Creates a new user.
GET /api/v1/users/               |   Find matching instances of user.
GET /api/v1/users-docs/          |    Find matching instances of users and documents
GET /api/v1/users/<id>           |   Find user.
PUT /api/v1/users/<id>           |   Update user attributes.
DELETE /api/v1/users/<id>        |   Delete user.
POST /api/v1/documents/          |   Creates a new document instance.
POST /api/v1/roles/              |   Creates a new role instance.
GET /api/v1/roles/               |   Find matching instances of role
GET /api/v1/roles-users/         |   Find matching instances of roles and users
GET /api/v1/documents/           |   Find matching instances of document.
GET /api/v1/documents/<id>       |   Find document.
PUT /api/v1/documents/<id>       |   Update document attributes.
DELETE /api/v1/documents/<id>    |   Delete document.
GET /api/v1/users/<id>/documents |   Find all documents belonging to the user.
GET /api/v1/search/users/<search-term>      |   Gets all users with username, firstname or lastname matching or containing the searcht erm
GET /api/v1/search/documents/<search-term> | Gets all documents with title or content matching or containing the search term
GET /api/v1/users/page/?limit={integer}&offset={integer} | Pagination for users.
GET /api/v1/documents/page/?limit={integer}&offset={integer} | Pagination for docs.


## How to contribute

Please see [CONTRIBUTING.md](CONTRIBUTING.md)

## FAQs and Issues

Click **[FAQs and Issues](https://github.com/DanielAmah/eDocCabinet/issues)**. for issues and questions.


### Do I need to pay to use the API ?

No, its free for everyone.

### How do I connect to the API?

You need to request a resource from one of the endpoints using HTTPS. Generally, reading any data is done through a request with GET method. If you want our server to create, update or delete a given resource, POST or PUT methods are required.

### What return formats do you support?

eDocCabinet API currently returns data in ```JSON``` format.

### What kind of authentication is required?

All endpints except login and signup are protected. Users requre ```token``` to access all protected endpoints. ```Token``` is sent to client after successful signup and login. Token must be set as authorization in the ```http request header``` to access the protected routes


## Limitations
The application uses shared database package, this may lead to slow in response at some point. It also has query limit per day, once exceeded client won't get any response till the next day.

## License

(The MIT License)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Author
Daniel Amah  - daniel.amah@andela.com