'use strict';

const bluebird = require('bluebird');
const request = bluebird.promisifyAll(require('request'), { multiArgs: true });
const cheerio = require('cheerio');
const graph = require('fbgraph');
const LastFmNode = require('lastfm').LastFmNode;
const Twit = require('twit');
const Linkedin = require('node-linkedin')(process.env.LINKEDIN_ID, process.env.LINKEDIN_SECRET, process.env.LINKEDIN_CALLBACK_URL);
const clockwork = require('clockwork')({ key: process.env.CLOCKWORK_KEY });
const lob = require('lob')(process.env.LOB_KEY);
const ig = bluebird.promisifyAll(require('instagram-node').instagram());
const foursquare = require('node-foursquare')({
  secrets: {
    clientId: process.env.FOURSQUARE_ID,
    clientSecret: process.env.FOURSQUARE_SECRET,
    redirectUrl: process.env.FOURSQUARE_REDIRECT_URL
  }
});

foursquare.Venues = bluebird.promisifyAll(foursquare.Venues);
foursquare.Users = bluebird.promisifyAll(foursquare.Users);
/*********/

/**
 * GET /api
 * List of API examples.
 */
exports.getApi = function (req, res)  {
  res.render('api/index', {
    title: 'API Examples'
  });
};

/**
 * GET /api/foursquare
 * Foursquare API example.
 */
exports.getFoursquare = function(req, res, next)  {
  const token = req.user.tokens.find(token => token.kind === 'foursquare');
  Promise.all([
    foursquare.Venues.getTrendingAsync('40.7222756', '-74.0022724', { limit: 50 }, token.accessToken),
    foursquare.Venues.getVenueAsync('49da74aef964a5208b5e1fe3', token.accessToken),
    foursquare.Users.getCheckinsAsync('self', null, token.accessToken)
  ])
  .then(function ([trendingVenues, venueDetail, userCheckins])  {
    res.render('api/foursquare', {
      title: 'Foursquare API',
      trendingVenues,
      venueDetail,
      userCheckins
    });
  })
  .catch(next);
};
/**
 * GET /api/facebook
 * Facebook API example.
 */
exports.getFacebook = function (req, res, next)  {
  const token = req.user.tokens.find(token => token.kind === 'facebook');
  graph.setAccessToken(token.accessToken);
  graph.get(`${req.user.facebook}?fields=id,name,email,first_name,last_name,gender,link,locale,timezone`, function(err, results)  {
    if (err) { return next(err); }
    res.render('api/facebook', {
      title: 'Facebook API',
      profile: results
    });
  });
};
/**
 * GET /api/lastfm
 * Last.fm API example.
 */
exports.getLastfm = function (req, res, next)  {
  const lastfm = new LastFmNode({
    api_key: process.env.LASTFM_KEY,
    secret: process.env.LASTFM_SECRET
  });
  const artistInfo = () =>
    new Promise(function (resolve, reject)  {
      lastfm.request('artist.getInfo', {
        artist: 'Roniit',
        handlers: {
          success: resolve,
          error: reject
        }
      });
    });
  const artistTopTracks = () =>
    new Promise(function (resolve, reject)  {
      lastfm.request('artist.getTopTracks', {
        artist: 'Roniit',
        handlers: {
          success: function (data)  {
            resolve(data.toptracks.track.slice(0, 10));
          },
          error: reject
        }
      });
    });
  const artistTopAlbums = () =>
      new Promise(function (resolve, reject)  {
        lastfm.request('artist.getTopAlbums', {
          artist: 'Roniit',
          handlers: {
            success: function (data)  {
              resolve(data.topalbums.album.slice(0, 3));
            },
            error: reject
          }
        });
      });
  Promise.all([
    artistInfo(),
    artistTopTracks(),
    artistTopAlbums()
  ])
  .then(function ([artistInfo, artistTopAlbums, artistTopTracks])  {
    const artist = {
      name: artistInfo.artist.name,
      image: artistInfo.artist.image.slice(-1)[0]['#text'],
      tags: artistInfo.artist.tags.tag,
      bio: artistInfo.artist.bio.summary,
      stats: artistInfo.artist.stats,
      similar: artistInfo.artist.similar.artist,
      topAlbums: artistTopAlbums,
      topTracks: artistTopTracks
    };
    res.render('api/lastfm', {
      title: 'Last.fm API',
      artist
    });
  })
  .catch(next);
};

/**
 * GET /api/twitter
 * Twitter API example.
 */
exports.getTwitter = function (req, res, next)  {
  const token = req.user.tokens.find(token => token.kind === 'twitter');
  const T = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: token.accessToken,
    access_token_secret: token.tokenSecret
  });
  T.get('search/tweets', { q: 'nodejs since:2013-01-01', geocode: '40.71448,-74.00598,5mi', count: 10 }, function (err, reply)  {
    if (err) { return next(err); }
    res.render('api/twitter', {
      title: 'Twitter API',
      tweets: reply.statuses
    });
  });
};

/**
 * POST /api/twitter
 * Post a tweet.
 */
exports.postTwitter = function (req, res, next)  {
  req.assert('tweet', 'Tweet cannot be empty').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/api/twitter');
  }

  const token = req.user.tokens.find(token => token.kind === 'twitter');
  const T = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: token.accessToken,
    access_token_secret: token.tokenSecret
  });
  T.post('statuses/update', { status: req.body.tweet }, function (err)  {
    if (err) { return next(err); }
    req.flash('success', { msg: 'Your tweet has been posted.' });
    res.redirect('/api/twitter');
  });
};

/**
 * GET /api/steam
 * Steam API example.
 */
exports.getSteam = function (req, res, next)  {
  const steamId = '76561197982488301';
  const params = { l: 'english', steamid: steamId, key: process.env.STEAM_KEY };
  const playerAchievements = function ()  {
    params.appid = '49520';
    return request.getAsync({ url: 'http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/', qs: params, json: true })
      .then(function ([request, body])  {
        if (request.statusCode === 401) {
          throw new Error('Invalid Steam API Key');
        }
        return body;
      });
  };
  const playerSummaries = function ()  {
    params.steamids = steamId;
    return request.getAsync({ url: 'http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/', qs: params, json: true })
      .then(function ([request, body])  {
        if (request.statusCode === 401) {
          throw Error('Missing or Invalid Steam API Key');
        }
        return body;
      });
  };
  const ownedGames = function ()  {
    params.include_appinfo = 1;
    params.include_played_free_games = 1;
    return request.getAsync({ url: 'http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/', qs: params, json: true })
      .then(function ([request, body])  {
        if (request.statusCode === 401) {
          throw new Error('Missing or Invalid Steam API Key');
        }
        return body;
      });
  };
  Promise.all([
    playerAchievements(),
    playerSummaries(),
    ownedGames()
  ])
  .then(function ([playerAchievements, playerSummaries, ownedGames])  {
    res.render('api/steam', {
      title: 'Steam Web API',
      ownedGames: ownedGames.response.games,
      playerAchievemments: playerAchievements.playerstats,
      playerSummary: playerSummaries.response.players[0]
    });
  })
  .catch(next);
};
/**
 * GET /api/clockwork
 * Clockwork SMS API example.
 */
exports.getClockwork = function (req, res)  {
  res.render('api/clockwork', {
    title: 'Clockwork SMS API'
  });
};

/**
 * POST /api/clockwork
 * Send a text message using Clockwork SMS
 */
exports.postClockwork = function (req, res, next)  {
  const message = {
    To: req.body.telephone,
    From: 'Hackathon',
    Content: 'Hello from the Hackathon Starter'
  };
  clockwork.sendSms(message, function (err, responseData)  {
    if (err) { return next(err.errDesc); }
    req.flash('success', { msg: `Text sent to ${responseData.responses[0].to}` });
    res.redirect('/api/clockwork');
  });
};
/**
 * GET /api/instagram
 * Instagram API example.
 */
exports.getInstagram = function (req, res, next)  {
  const token = req.user.tokens.find(token => token.kind === 'instagram');
  ig.use({ client_id: process.env.INSTAGRAM_ID, client_secret: process.env.INSTAGRAM_SECRET });
  ig.use({ access_token: token.accessToken });
  Promise.all([
    ig.user_searchAsync('richellemead'),
    ig.userAsync('175948269'),
    ig.media_popularAsync(),
    ig.user_self_media_recentAsync()
  ])
  .then(function([searchByUsername, searchByUserId, popularImages, myRecentMedia])  {
    res.render('api/instagram', {
      title: 'Instagram API',
      usernames: searchByUsername,
      userById: searchByUserId,
      popularImages,
      myRecentMedia
    });
  })
  .catch(next);
};
/**
 * GET /api/lob
 * Lob API example.
 */
exports.getLob = function (req, res, next)  {
  lob.routes.list({ zip_codes: ['10007'] }, function (err, routes)  {
    if (err) { return next(err); }
    res.render('api/lob', {
      title: 'Lob API',
      routes: routes.data[0].routes
    });
  });
};

/**
 * GET /api/upload
 * File Upload API example.
 */

exports.getFileUpload = function (req, res)  {
  res.render('api/upload', {
    title: 'File Upload'
  });
};

exports.postFileUpload = function (req, res)  {
  req.flash('success', { msg: 'File was uploaded successfully.' });
  res.redirect('/api/upload');
};

exports.getGoogleMaps = (req, res) => {
  res.render('api/google-maps', {
    title: 'Google Maps API'
  });
};