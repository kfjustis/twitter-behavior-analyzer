const express = require("express");
const path = require("path");
const bodyparser = require("body-parser");
const sentiment = require("sentiment");
const app = express();
const port = process.env.PORT || 3001;

// Init. the sentiment analysis obj.
const sent = new sentiment();

// Make css and other files available to the html.
app.use(express.static(__dirname + '/public'));
// Allows us to grab data from the dom.
app.use(bodyparser.urlencoded({ extended: true }));
// Allows us to render server-side data from the html.
app.set('view engine', 'ejs');

// Load the main index.html page.
app.get('/', function(request, response){
    response.sendFile(__dirname + '/views/index.html');
});

// Post method to handle analysis and results display.
app.post('/results', (req, res) => {
    // Grab text from the input field.
    var sentText = req.body.urlname;

    // Analyze it.
    var result = sent.analyze(sentText);

    // Store results.
    var score = result.score;
    var comparative = result.comparative;

    // Render the results page, passing in the data.
    res.render('results',
      {
        sentText: sentText,
        score: score,
        comparative: comparative
      });
});

// Start the app server.
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
