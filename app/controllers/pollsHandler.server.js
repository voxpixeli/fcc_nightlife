'use strict';

var pug = require("pug");
var Polls = require('../models/polls.js');

var apiUrl = '/api/:id/polls';
var apiUrlUser = apiUrl + '?user';

function PollsHandler () {

	this.getPolls = function (req, res) {

		var login = "";

		if (req.url===apiUrlUser && req.user!=undefined) {
			login=req.user.github.id;
		}

		Polls
			.find( login == "" ? {} : { 'userid': login }/*, { '_id': false }*/ )
			.exec(function (err, result) {
				if (err) { throw err; }
				res.json(result);
			});

	};

	// adds new or update existing
	this.addPoll = function (req, res) {

		var body = "";

		req.on('data', function (chunk) {
			body += chunk;
		});
		req.on('end', function () {
			var data = JSON.parse(body);

			// check existing + update / add

			var login = "";

			if (req.url===apiUrlUser && req.user!=undefined) {
				login=req.user.github.id;
			}

			var items = [];
			var itnames = data.items.split(";");

			for (var i=0; i<itnames.length; i++) {
				items.push( { "itemname":itnames[i], "votecount":0 } );
			}

			Polls.findOneAndUpdate(
				{ "userid": login, "title": data.title },
				{ "info": data.info, "items": items },
				{ safe: true, upsert: true },
				function(err, result) {
					if (err) { throw err; }
					res.json(result);
				});

		});
	};

	this.deletePoll = function (req, res) {


		var body = "";

		req.on('data', function (chunk) {
			body += chunk;
		});
		req.on('end', function () {
			var data = JSON.parse(body);

			Polls.deleteOne({ '_id': data.pollid })
				.exec(function (err, result) {
						if (err) { throw err; }

						res.json(result);
					}
				);

		});
	};

	this.votePoll = function (req, res) {

		var body = "";

		req.on('data', function (chunk) {
			body += chunk;
		});
		req.on('end', function () {
			var data = JSON.parse(body);

			if (data.custom) {
				Polls.findOneAndUpdate({ '_id': data.pollid }, { $push: { 'items':  { "itemname": data.itemname, "votecount": 1 } } })
					.exec(function (err, result) {
							if (err) { throw err; }
							Polls
								.findOne( {'_id': data.pollid} )
								.exec(function (err, result) {
									if (err) { throw err; }
									res.json(result);
								});
						}
					);
			} else {
				Polls.findOneAndUpdate({ '_id': data.pollid, "items.itemname": data.itemname }, { $inc: { 'items.$.votecount': 1 } })
					.exec(function (err, result) {
							if (err) { throw err; }
							Polls
								.findOne( {'_id': data.pollid} )
								.exec(function (err, result) {
									if (err) { throw err; }
									res.json(result);
								});
						}
					);
			}

		});

	};

}

module.exports = PollsHandler;
