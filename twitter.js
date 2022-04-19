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
    const userId = await getUserId(usernameStr);
    const timelineURL = `https://api.twitter.com/2/users/${userId}/tweets`;

    // Tweets will be stored here.
    let userTweets = [];

    // we request the author_id expansion so that we can print out the user name later
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

    while (hasNextPage) {
        let resp = await getPage(params, options, nextToken, timelineURL);
        if (resp && resp.meta && resp.meta.result_count && resp.meta.result_count > 0) {
            userName = resp.includes.users[0].username;
            if (resp.data && userTweets.length < 100) {
                userTweets.push.apply(userTweets, resp.data);
            }
            else
            {
                hasNextPage = false;
            }
            if (resp.meta.next_token) {
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
    if (res.body) {
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