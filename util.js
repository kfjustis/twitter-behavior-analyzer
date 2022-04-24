// Contains helper methods.

// Checks whether the given url matches the format: 'https:/twitter.com/username'
exports.isValidProfileURL = function(url) {
   // Regex from: https://regexr.com/4tsfr
   const globalRegex = new RegExp('(?:https:\/\/)?(?:www\.)?twitter.com\/(?![a-zA-Z0-9_]+\/)([a-zA-Z0-9_]+)', 'g');
   return globalRegex.test(url);
}

exports.convertURLtoProfileName = function(url) {
   //Source: https://stackoverflow.com/questions/8376525/get-value-of-a-string-after-last-slash-in-javascript

   var n = url.lastIndexOf('/');
   var result = url.substring(n + 1);
   return result;
}

exports.consoleLogTweets = function (tweets, userName) {
   console.dir(tweets, {
       depth: null
   });
   console.log(`Got ${tweets.length} Tweets from ${userName}!`);
}