'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');
var PollsHandler = require(path + '/app/controllers/pollsHandler.server.js');

module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/');
		}
	}

	var pollsHandler = new PollsHandler();

	app.route('/')
		.get(function (req, res) {
			res.render('index', { logged: req.isAuthenticated(), route: '/' });
		});

	app.route('/poll/:pollid')
		.get(function (req, res) {
			res.render('index', { logged: req.isAuthenticated(), route: '/poll' });
		});

	app.route('/mypolls')
		.get(isLoggedIn, function (req, res) {
			res.render('pollsManager', { logged: req.isAuthenticated(), route: '/mypolls' });
		});

	app.route('/login')
		.get(function (req, res) {
			//res.sendFile(path + '/public/login.html');
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
				res.json(req.user.github);
			} else {
				res.json({});
			}
		});

	app.route('/auth/github')
		.get(passport.authenticate('github'));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/',
			failureRedirect: '/'
		}));
/*
	app.route('/api/:id/clicks')
		.get(isLoggedIn, clickHandler.getClicks)
		.post(isLoggedIn, clickHandler.addClick)
		.delete(isLoggedIn, clickHandler.resetClicks);
*/
	app.route('/api/:id/polls')
		.get(pollsHandler.getPolls)
		.post(isLoggedIn, pollsHandler.addPoll)
		.delete(isLoggedIn, pollsHandler.deletePoll)
		.put(pollsHandler.votePoll);


};
