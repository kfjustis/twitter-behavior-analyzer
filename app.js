const express = require("express");
const path = require("path");
const bodyparser = require("body-parser");
const sentiment = require("sentiment");
const twitter = require("./twitter.js");
const util = require("./util.js");
const client = require("./client.js");
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
    let profileURL = req.body.urlname;
    let error = false;
    let username;
    let score = 0;
    let comparative = 0;
    let bestTweet = "";
    let worstTweet = "";
    let numOrganicTweets = 0;
    let numRetweets = 0;
    let elapsedTimeMsg = "No elapsed time.";

    // Validate the URL format here.
    if (util.isValidProfileURL(profileURL)) {
      // Get the username from the profile url.
      username = util.convertURLtoProfileName(profileURL);

      // Retrieve last 100 tweets from the user. This can be 0.
      let tweets = await twitter.getUserTweets(username);

      // Uncomment when testing locally to see all tweet results in console.
      // Keep commented out when committing since this will spam the server logs.
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

      // Process the found tweets.
      let minScore = 99;
      let maxScore = -99;
      let minScoreIdx = -1;
      let maxScoreIdx = -1;
      let tempComparative = 0;
      let oldestTweet = null;
      for (let i = 0; i < tweets.length; ++i) {
        let tweet = tweets[i];

        // Sentiment analysis
        let currentRes = sent.analyze(tweet.text);
        score += currentRes.score;                 // Total score is just a sum.
        tempComparative += currentRes.comparative; // Comparative is avg. score for the tweet.

        // Min/max scores.
        if (currentRes.score < minScore)
        {
          minScore = currentRes.score;
          minScoreIdx = i;
        }
        if (currentRes.score > maxScore)
        {
          maxScore = currentRes.score;
          maxScoreIdx = i;
        }

        // Check if retweet.
        if (tweet.text.startsWith("RT @"))
        {
          numRetweets += 1;
        }
      }

      // Set calcs / final data if tweets were found. Otherwise, set error messages.
      if (tweets.length > 0) {
        comparative = tempComparative / tweets.length;
        bestTweet = tweets[maxScoreIdx].text;
        worstTweet = tweets[minScoreIdx].text;
        numOrganicTweets = tweets.length - numRetweets;
        oldestTweet = tweets[tweets.length-1];

        // Calculate time since oldest tweet.
        let elapsedTime = new Date() - new Date(oldestTweet.created_at);
        if (elapsedTime > 0)
        {
          let days = elapsedTime / (1000 * 60 * 60 * 24);
          elapsedTimeMsg = username + " tweeted " + tweets.length +
                            " times in the last " + days.toFixed(2) + " days.";
        }
      } else {
        username = "No tweets found for " + username;
        error = true;
      }
    } else {
      username = "Invalid Twitter URL";
      error = true;
    }

    // Render the results page, passing in the data.
    res.render('results',
      {
        client: client, // Just call `client.whateverFunction()`` in an EJS tag
                        // to execute JS on the page.
        username: username,
        score: score,
        comparative: comparative,
        bestTweet: bestTweet,
        worstTweet: worstTweet,
        numOrganicTweets: numOrganicTweets,
        numRetweets: numRetweets,
        elapsedTimeMsg: elapsedTimeMsg
      });
  } catch (e) {
    res.end(e.message || e.toString());
  }
});

// Start the app server.
app.listen(port, () => console.log(`Example app listening on port ${port}!`));