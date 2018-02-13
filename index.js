const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const morgan = require('morgan');

const server = express();
server.use(morgan('dev'));
server.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

server.use(bodyParser.json());

server.post('/get-movie-details', function(req, res) {
  let movieToSearch =
    req.body.result &&
    req.body.result.parameters &&
    req.body.result.parameters.movie
      ? req.body.result.parameters.movie
      : 'The Godfather';
  const apiKey = process.env.MOVIE_API_KEY || '';
  const url = `http://www.omdbapi.com/?apikey=${apiKey}&t=`;
  let reqUrl = encodeURI(`${url}${movieToSearch}`);
  http.get(
    reqUrl,
    responseFromAPI => {
      let data = '';

      responseFromAPI.on('data', function(chunk) {
        data += chunk;
      });

      responseFromAPI.on('end', () => {
        let movie = JSON.parse(data);
        let dataToSend =
          movieToSearch === 'The Godfather'
            ? "I don't have the required info on that. Here's some info on 'The Godfather' instead.\n"
            : '';
        dataToSend +=
          movie.Title +
          ' is a ' +
          movie.Genre +
          ' movie, released in ' +
          movie.Year +
          '. It was directed by ' +
          movie.Director;

        return res.json({
          speech: dataToSend,
          displayText: dataToSend,
          source: 'get-movie-details',
        });
      });
    },
    error => {
      return res.json({
        speech: 'Something went wrong!',
        displayText: 'Something went wrong!',
        source: 'get-movie-details',
      });
    },
  );
});

server.listen(process.env.PORT || 8000, function() {
  console.log('Server is up and running...');
});
