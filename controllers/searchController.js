const Twit = require('twit');
const gmaps = require('googlemaps');
const dotenv = require('dotenv');
const fs = require('fs');
const errorHandler = require('errorhandler');
const Sentiment = require('sentiment');

dotenv.load({ path: '.env' });
const sentiment = new Sentiment();
const Twitter = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  timeout_ms: 5 * 1000,
  strictSSL: true,
});
const publicConfig = {
  key: process.env.GOOGLE_MAPS_API_KEY
}

const gmapAPI = new gmaps(publicConfig);
let stream;
let tweets = [];
let analysisResult = [];
const analysisSummary = { positive: 0, neutral: 0, negative: 0 };
/**
 * GET Result
 */
exports.result = (req, res) => {
  const { location, keyword } = req.query;
  tweets = [];

  const streamTweets = (stream) => {
    stream.on('tweet', (tweet) => {
      const { score, comparative } = sentiment.analyze(tweet.text);

      analysisResult.push({ score, comparative });
      if (score > 0) {
        analysisSummary.positive = analysisSummary.positive + 1;
      } else if (score === 0) {
        analysisSummary.neutral = analysisSummary.neutral + 1;
      } else {
        analysisSummary.negative = analysisSummary.negative + 1;
      }

      let data = JSON.stringify(tweet);
      fs.writeFile(__dirname + '/tweets.json', data, function (err) { });
      res.end(data);

      tweets.unshift(tweet);
      if (tweets.length > 500) {
        tweets.pop();
      }
    });
  };

  /** 
   * Stop existing stream
   */
  if (keyword && stream) {
    stream.stop();
  }

  const searchPayload = { language: 'en' };
  if (keyword) {
    searchPayload.track = keyword;
    if (location) {
      gmapAPI.geocode({ address: location }, function (error, data) {
        if (!error && data.results && data.results.length) {
          const { lng, lat } = data.results[0].geometry.location;
          searchPayload.locations = `${lng}, ${lat}, ${lng + 1}, ${lat + 1}`;
          stream = Twitter.stream('statuses/filter', searchPayload);
          streamTweets(stream);
        }
      });
    } else {
      stream = Twitter.stream('statuses/filter', searchPayload);
      streamTweets(stream);
    }
  } else {
    stream = Twitter.stream('statuses/sample', searchPayload);
    streamTweets(stream);
  }

  /** 
   * Stop the stream during unexpected request failure
   */
  req.on('close', () => {
    stream.stop();
  });

  res.render('result', {
    title: 'Result',
    tweets: tweets,
  });
};

exports.updateData = (req, res) => {
  let newTweets = tweets;
  // let chartData = createSentimentChartDatset(analysisResult);
  res.json({
    tweets: newTweets,
    sentiments: analysisSummary
    // chartData: chartData
  });
}

exports.closeStream = (req, res) => {
  tweets = [];
  analysisResult = [];
  analysisSummary.positive = 0;
  analysisSummary.negative = 0;
  analysisSummary.neutral = 0;
  if (stream) {
    stream.stop();
  }
  errorHandler();
  res.redirect('/');
}
