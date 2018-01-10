require('./server/config/config');

const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const path = require('path');
const { ObjectID } = require('mongodb');

const users = require('./server/routes/users');
const books = require('./server/routes/books');
const authors = require('./server/routes/authors');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'dist')));

app.use('/api', users);
app.use('/api', books);
app.use('/api', authors);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});

const port = process.env.PORT || '3000';
app.set('port', port);

const server = http.createServer(app);

server.listen(port, () => console.log(`Running on localhost:${port}`));

module.exports = { app };