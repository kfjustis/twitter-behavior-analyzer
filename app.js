const express = require("express");
const path = require("path");
const bodyparser = require("body-parser");
const sentiment = require("sentiment");
const app = express();
const port = process.env.PORT || 3001;

var sent = new sentiment();
var inputText = "empty";

// Routes.
app.use(express.static(__dirname + '/public'));
app.use(bodyparser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.get('/', function(request, response){
    response.sendFile(__dirname + '/views/index.html');

    // Set up callback for the analyze button.
    //const btnAnalyze = document.querySelector("#btnAnalyze");
    //const inputURL = document.querySelector("#basic-url");
    //btnAnalyze.onclick = () => {
    //  //const name = prompt('What is your name?');
    //  //alert(`Hello ${name}, nice to see you!`);
    //  //headingA.textContent = `Welcome ${name}`;
    //  const textInput = inputUrl.textContent;
    //  console.log("text: " + textInput);
    //}
});
app.post('/results', (req, res) => {
    //res.sendFile(__dirname + '/views/results.html');
    //var example = "Example text is very stupid.";
    //var result = sent.analyze(example);
    //console.log("ex: " + example);
    //console.log(result);

    var sentText = req.body.urlname;
    var result = sent.analyze(sentText);
    var score = result.score;
    var comparative = result.comparative;
    res.render('results',
      {
        sentText: sentText,
        score: score,
        comparative: comparative
      });
});
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
