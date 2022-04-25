// Functions made available to EJS.

let positiveWords = "none";
let negativeWords = "none";
let clientTweets = ["none"];

exports.getPositiveWordsAsString = async () => {
   return positiveWords;
}

exports.getNegativeWordsAsString = async () => {
   return negativeWords;
}

// Takes an array of words and stores them as a space separated string.
// This format is easier to send via res.send().
exports.setPositiveWords = function(arr) {
   let tempStr = arr.toString();
   positiveWords = tempStr.split(",").join(" ");
}

// Takes an array of words and stores them as a space separated string.
// This format is easier to send via res.send().
exports.setNegativeWords = function(arr) {
   let tempStr = arr.toString();
   negativeWords = tempStr.split(",").join(" ");
}

exports.clearAllWords = function() {
   positiveWords = "none";
   negativeWords = "none";
}

exports.getCachedTweets = async() => {
   return clientTweets;
}

exports.cacheTweets = function(tweets) {
   clientTweets = JSON.parse(JSON.stringify(tweets))
}

exports.clearAllTweets = function() {
   // Ensures other references get emptied as well if there are any.
   while (clientTweets.length > 0) {
      clientTweets.pop();
   }
}