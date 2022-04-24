// This code based on the example: "Get User Tweet timeline by user ID"
// https://developer.twitter.com/en/docs/twitter-api/tweets/timelines/quick-start
// Source: https://raw.githubusercontent.com/twitterdev/Twitter-API-v2-sample-code/main/User-Tweet-Timeline/user_tweets.js

const needle = require('needle');

// The code below sets the bearer token from your environment variables
// To set environment variables on macOS or Linux, run the export command below from the terminal:
// export BEARER_TOKEN='YOUR-TOKEN'
const bearerToken = process.env.BEARER_TOKEN;


// Retrieve 100 tweets for the current usernameStr
// and return them in an array.
exports.getUserTweets = async (usernameStr) => {
    let userTweets = [];  // Tweets will be stored here.
    let userId;           // Unique value for each Twitter account.

    // This fails when the given profile does not exist.
    try {
        userId = await getUserId(usernameStr);
    } catch (e) {
        userId = -1;
    }

    if (userId == -1)
    {
        // Return empty array on error.
        return userTweets;
    }

    // We request the author_id expansion in case we want to print out the userId later.
    let params = {
        "max_results": 100,
        "tweet.fields": "created_at",
        "expansions": "author_id"
    }

    const options = {
        headers: {
            "User-Agent": "v2UserTweetsJS",
            "authorization": `Bearer ${bearerToken}`
        }
    }

    let hasNextPage = true;
    let nextToken = null;
    let userName;
    const timelineURL = `https://api.twitter.com/2/users/${userId}/tweets`;

    let hitTweetcap = false;
    while (hasNextPage) {
        let resp = await getPage(params, options, nextToken, timelineURL);
        // Only process if data was received.
        if (resp && resp.meta && resp.meta.result_count && resp.meta.result_count > 0) {
            // Make sure the data is relevant to the requested username.
            if (resp.includes.users) {
                userName = resp.includes.users[0].username;
            } else {
                userName = "Invalid username";
            }
            // Make sure the entries are valid.
            if (resp.data) {
                for (i = 0; i < resp.data.length && !hitTweetcap; ++i)
                {
                    if (userTweets.length < 100)
                    {
                        userTweets.push(resp.data[i]);
                    }
                    else
                    {
                        hitTweetcap = true;
                    }
                }
            }
            else
            {
                hasNextPage = false;
            }
            if (resp.meta.next_token && !hitTweetcap) {
                nextToken = resp.meta.next_token;
            } else {
                hasNextPage = false;
            }
        } else {
            hasNextPage = false;
        }
    }
    return userTweets;
}

// Private functions below. //////////////

const getUserId = async (usernameStr) => {
    // Data params for user query.
    const params = {
        usernames: usernameStr,
        "user.fields": "created_at,description",
        "expansions": "pinned_tweet_id"
    }

    // Create the HTTP request header with the app token
    // and run the query.
    const usernameURL = "https://api.twitter.com/2/users/by?usernames="
    const res = await needle('get', usernameURL, params, {
        headers: {
            "User-Agent": "v2UserLookupJS",
            "authorization": `Bearer ${bearerToken}`
        }
    });

    // Handle the response.
    if (res.body && res.body.data) {
        // Uncomment to see more metadata.
        // console.log(res.body);
        return res.body.data[0].id;
    } else {
        throw new Error("Unsuccesful request");
    }
}

const getPage = async (params, options, nextToken, timelineURL) => {
    if (nextToken) {
        params.pagination_token = nextToken;
    }

    try {
        const resp = await needle('get', timelineURL, params, options);

        if (resp.statusCode != 200) {
            console.log(`${resp.statusCode} ${resp.statusMessage}:\n${resp.body}`);
            return;
        }
        return resp.body;
    } catch (err) {
        throw new Error(`Request failed: ${err}`);
    }
}