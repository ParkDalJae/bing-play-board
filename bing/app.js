const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('querystring');
const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'board'
});

connection.connect();

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  const pathName = parsedUrl.pathname;
  if (pathName === '/') {
    fs.readFile('./index.html', 'utf8', (err, data) => {
      if (err) throw err;
      connection.query('SELECT * FROM posts', (err, results) => {
        if (err) throw err;
        let postList = '';
        results.forEach((post) => {
          postList += `<li>${post.title} - ${post.content}</li>`;
        });
        data = data.replace('{POST_LIST}', postList);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      });
    });
  } else if (pathName === '/post') {
    let body = '';
    req.on('data', (data) => {
      body += data;
    });
    req.on('end', () => {
      const post = qs.parse(body);
      connection.query('INSERT INTO posts SET ?', post, (err) => {
        if (err) throw err;
        res.writeHead(302, { Location: '/' });
        res.end();
      });
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(3000);