'use strict';

var path = process.cwd();
var SearchHandler = require(path + '/app/controllers/searchHandler.server.js');
var yelp = require(path + '/app/config/yelp.js');

module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/');
		}
	}

	var searchHandler = new SearchHandler();

	app.route('/')
		.get(function (req, res) {
			res.render('index', { logged: req.isAuthenticated(), route: '/' });
		});

	app.route('/login')
		.get(function (req, res) {
			res.redirect("/auth/github");
		});

	app.route('/logout')
		.get(isLoggedIn, function (req, res) {
			req.logout();
			res.redirect('/');
		});

	app.route('/api/:id')
		.get(function (req, res) {
			if (req.isAuthenticated()) {
				res.json(req.user);
			} else {
				res.json({});
			}
		});

	app.route('/yelp/token')
		.get(function (req, res) {
			res.json( { "token": process.env.YELP_TOKEN } );
		});

	app.route('/auth/github')
		.get(passport.authenticate('github'));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/',
			failureRedirect: '/'
		}));

	app.route('/api/:id/search')
		.get(searchHandler.getBars)
		.post(isLoggedIn, searchHandler.addBar)
		.delete(isLoggedIn, searchHandler.deleteBar)


};
