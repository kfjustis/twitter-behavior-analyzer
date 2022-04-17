const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 3001;

app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response){
    response.sendFile(__dirname + '/views/index.html');
});
app.get('/results', function(request, response) {
    response.sendFile(__dirname + '/views/results.html');
});
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
