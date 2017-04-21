const passport = require('passport');
const request = require('request');
const InstagramStrategy = require('passport-instagram').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const OpenIDStrategy = require('passport-openid').Strategy;
const OAuthStrategy = require('passport-oauth').OAuthStrategy;
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;

const User = require('../models/User');

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({
    usernameField: 'email'
}, function (email, password, done) {
    User.findOne({
        email: email.toLowerCase()
    }, function (err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, {
                msg: `Email ${email} not found.`
            });
        }
        user.comparePassword(password, function (err, isMatch) {
            if (err) {
                return done(err);
            }
            if (isMatch) {
                return done(null, user);
            }
            return done(null, false, {
                msg: 'Invalid email or password.'
            });
        });
    });
}));

/**
 * Sign in with Facebook.
 */
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_ID,
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackURL: '/auth/facebook/callback',
    profileFields: ['name', 'email', 'link', 'locale', 'timezone'],
    passReqToCallback: true
}, function (req, accessToken, refreshToken, profile, done) {
    if (req.user) {
        User.findOne({
            facebook: profile.id
        }, function (err, existingUser) {
            if (err) {
                return done(err);
            }
            if (existingUser) {
                req.flash('errors', {
                    msg: 'There is already a Facebook account that belongs to you. Sign in with that account or delete it, then link it with your current account.'
                });
                done(err);
            } else {
                User.findById(req.user.id, function (err, user) {
                    if (err) {
                        return done(err);
                    }
                    user.facebook = profile.id;
                    user.tokens.push({
                        kind: 'facebook',
                        accessToken
                    });
                    user.profile.name = user.profile.name || `${profile.name.givenName} ${profile.name.familyName}`;
                    user.profile.gender = user.profile.gender || profile._json.gender;
                    user.profile.picture = user.profile.picture || `https://graph.facebook.com/${profile.id}/picture?type=large`;
                    user.save(function (err) {
                        req.flash('info', {
                            msg: 'Facebook account has been linked.'
                        });
                        done(err, user);
                    });
                });
            }
        });
    } else {
        User.findOne({
            facebook: profile.id
        }, function (err, existingUser) {
            if (err) {
                return done(err);
            }
            if (existingUser) {
                return done(null, existingUser);
            }
            User.findOne({
                email: profile._json.email
            }, function (err, existingEmailUser) {
                if (err) {
                    return done(err);
                }
                if (existingEmailUser) {
                    req.flash('errors', {
                        msg: 'There is already an account using this email address. Sign in to that account and link it with Facebook manually from Account Settings.'
                    });
                    done(err);
                } else {
                    const user = new User();
                    user.email = profile._json.email;
                    user.facebook = profile.id;
                    user.tokens.push({
                        kind: 'facebook',
                        accessToken
                    });
                    user.profile.name = `${profile.name.givenName} ${profile.name.familyName}`;
                    user.profile.gender = profile._json.gender;
                    user.profile.picture = `https://graph.facebook.com/${profile.id}/picture?type=large`;
                    user.profile.location = (profile._json.location) ? profile._json.location.name : '';
                    user.save(function (err) {
                        done(err, user);
                    });
                }
            });
        });
    }
}));
/**
 * Sign in with Twitter.
 */
passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_KEY,
    consumerSecret: process.env.TWITTER_SECRET,
    callbackURL: '/auth/twitter/callback',
    passReqToCallback: true
}, function (req, accessToken, tokenSecret, profile, done) {
    if (req.user) {
        User.findOne({
            twitter: profile.id
        }, function (err, existingUser) {
            if (err) {
                return done(err);
            }
            if (existingUser) {
                req.flash('errors', {
                    msg: 'There is already a Twitter account that belongs to you. Sign in with that account or delete it, then link it with your current account.'
                });
                done(err);
            } else {
                User.findById(req.user.id, function (err, user) {
                    if (err) {
                        return done(err);
                    }
                    user.twitter = profile.id;
                    user.tokens.push({
                        kind: 'twitter',
                        accessToken,
                        tokenSecret
                    });
                    user.profile.name = user.profile.name || profile.displayName;
                    user.profile.location = user.profile.location || profile._json.location;
                    user.profile.picture = user.profile.picture || profile._json.profile_image_url_https;
                    user.save(function (err) {
                        if (err) {
                            return done(err);
                        }
                        req.flash('info', {
                            msg: 'Twitter account has been linked.'
                        });
                        done(err, user);
                    });
                });
            }
        });
    } else {
        User.findOne({
            twitter: profile.id
        }, function (err, existingUser) {
            if (err) {
                return done(err);
            }
            if (existingUser) {
                return done(null, existingUser);
            }
            const user = new User();
            // Twitter will not provide an email address.  Period.
            // But a person’s twitter username is guaranteed to be unique
            // so we can "fake" a twitter email address as follows:
            user.email = `${profile.username}@twitter.com`;
            user.twitter = profile.id;
            user.tokens.push({
                kind: 'twitter',
                accessToken,
                tokenSecret
            });
            user.profile.name = profile.displayName;
            user.profile.location = profile._json.location;
            user.profile.picture = profile._json.profile_image_url_https;
            user.save(function (err) {
                done(err, user);
            });
        });
    }
}));

passport.use(new InstagramStrategy({
    clientID: process.env.INSTAGRAM_ID,
    clientSecret: process.env.INSTAGRAM_SECRET,
    callbackURL: '/auth/instagram/callback',
    passReqToCallback: true
}, function (req, accessToken, refreshToken, profile, done) {
    if (req.user) {
        User.findOne({
            instagram: profile.id
        }, function (err, existingUser) {
            if (err) {
                return done(err);
            }
            if (existingUser) {
                req.flash('errors', {
                    msg: 'There is already an Instagram account that belongs to you. Sign in with that account or delete it, then link it with your current account.'
                });
                done(err);
            } else {
                User.findById(req.user.id, function (err, user) {
                    if (err) {
                        return done(err);
                    }
                    user.instagram = profile.id;
                    user.tokens.push({
                        kind: 'instagram',
                        accessToken
                    });
                    user.profile.name = user.profile.name || profile.displayName;
                    user.profile.picture = user.profile.picture || profile._json.data.profile_picture;
                    user.profile.website = user.profile.website || profile._json.data.website;
                    user.save(function (err) {
                        req.flash('info', {
                            msg: 'Instagram account has been linked.'
                        });
                        done(err, user);
                    });
                });
            }
        });
    } else {
        User.findOne({
            instagram: profile.id
        }, function (err, existingUser) {
            if (err) {
                return done(err);
            }
            if (existingUser) {
                return done(null, existingUser);
            }
            const user = new User();
            user.instagram = profile.id;
            user.tokens.push({
                kind: 'instagram',
                accessToken
            });
            user.profile.name = profile.displayName;
            // Similar to Twitter API, assigns a temporary e-mail address
            // to get on with the registration process. It can be changed later
            // to a valid e-mail address in Profile Management.
            user.email = `${profile.username}@instagram.com`;
            user.profile.website = profile._json.data.website;
            user.profile.picture = profile._json.data.profile_picture;
            user.save(function (err) {
                done(err, user);
            });
        });
    }
}));

/**
 * Login Required middleware.
 */
exports.isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};

/**
 * Authorization Required middleware.
 */
exports.isAuthorized = function (req, res, next) {
    const provider = req.path.split('/').slice(-1)[0];
    const token = req.user.tokens.find(token => token.kind === provider);
    if (token) {
        next();
    } else {
        res.redirect(`/auth/${provider}`);
    }
};
