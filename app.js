const express = require("express");
const path = require("path");
const bodyparser = require("body-parser");
const sentiment = require("sentiment");
const twitter = require("./twitter.js");
const util = require("./util.js");
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
app.post('/results', async function (req, res) {
  try {
    // Grab text from the input field.
    var profileURL = req.body.urlname;
    var username;

    // Validate the URL format here.
    if (util.isValidProfileURL(profileURL))
    {
      // Get the username from the profile url.
      username = util.convertURLtoProfileName(profileURL);

      // Retrieve last 100 tweets from the user.
      var tweets = await twitter.getUserTweets(username);

      // Uncomment when testing locally to see all results in console.
      //util.consoleLogTweets(tweets, username);

      /* Tweet data layout example.
      //{
      //  created_at: '2022-04-19T00:18:51.000Z',
      //  id: '1516209675758362626',
      //  text: '@DJaagjit What kind of kicks are we talking about? -SMRT',
      //  author_id: '22258315'
      //},
      //{
      //  created_at: '2022-04-19T00:01:25.000Z',
      //  id: '1516205289577533443',
      //  text: '@97Titans Have you played it yet?! -SMRT',
      //  author_id: '22258315'
      //},...*/

      // Calculate the score for found tweets.
      let totalScore = 0;
      let totalComparative = 0;
      for (let i = 0; i < tweets.length; ++i)
      {
        let tweet = tweets[i];
        let currentRes = sent.analyze(tweet.text);

        // Total score is just a sum.
        totalScore += currentRes.score;

        // How handle this value?
        totalComparative += currentRes.comparative;

        // TODO
        // Update highest score so far.
        // Update lowest score so far.
      }

      // Save the final score value.
      score = totalScore;
      // TODO Not sure about this value.
      comparative = 0;
    }
    else
    {
      username = "Invalid Twitter URL";
      score = 0;
      comparative = 0;
    }

    // Render the results page, passing in the data.
    res.render('results',
      {
        username: username,
        score: score,
        comparative: comparative
      });
  } catch (e) {
    res.end(e.message || e.toString());
  }
});

// Start the app server.
app.listen(port, () => console.log(`Example app listening on port ${port}!`));