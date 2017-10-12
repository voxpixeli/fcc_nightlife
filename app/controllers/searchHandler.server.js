'use strict';

const pug = require("pug");
const Users = require('../models/users.js');
const url = require('url');
const request = require('request');
const async = require('async');

var apiUrl = '/api/:id/search';
//var apiUrlUser = apiUrl + '?user';

const yelpApiUrl = 'https://api.yelp.com/v3/businesses/search';

function today() {
	var d = new Date();
	return d.getFullYear() +"-"+ d.getMonth() +"-"+ d.getDate();
}

function BarsHandler () {

    //
	this.getBars = function (req, res) {

		var login = "";

		if (req.user!=undefined) {
			login=req.user.github.id;
		}


	    var keywords = url.parse(req.url, true).query.keywords;

		if (login != "") {

			console.log("updating user search... " + login + " ; " + keywords);

			Users.findOneAndUpdate({ 'github.id': login }, { 'search': keywords })
				.exec(function (err, result) {
						if (err) { throw err; }
						console.log("updated");
					}
				);
		}

	    console.log("calling Yelp search api... " + keywords);

	    var options = { method: 'GET',
	        url: yelpApiUrl+'?term=bars&location='+encodeURI(keywords),
	        headers: { authorization: 'Bearer '+process.env.YELP_TOKEN } };

	    request(options, function (error, response, body) {
	        if (error) throw new Error(error);

	        console.log("GET YELP");

			// + number of users going to bar, for each yelp result
			// + current user going ?

			var bars = JSON.parse(body);

			var fn = [];
			var now = today();

			for (var i=0; i<bars.businesses.length; i++) {
				(function(index) {
					var barid = bars.businesses[index].id;
					fn.push(
						function(callback) {
							Users.find({ "goto.date": now, "goto.yelpid": barid }, function(err, result) {
								callback(err, result );
							});
						}
					);
				})(i);
			}
			async.parallel(fn, function(err, results) {
				if (err) throw err;
				for (var i=0; i<bars.businesses.length; i++) {
					bars.businesses[i]["going"] = { "count": results[i].length, "igo": false };
					for (var u=0; u<results[i].length; i++) {
						if (results[i][u].github.id === login) {
							bars.businesses[i].going.igo = true;
						}
					}
				}
		        res.json(bars);
			});

	    });
	};


	// adds new or update existing
	this.addBar = function (req, res) {

		console.log("addBar");

		var body = "";

		req.on('data', function (chunk) {
			body += chunk;
		});
		req.on('end', function () {

			if (req.user!=undefined) {

				var login = req.user.github.id;

				var data = JSON.parse(body);

				//console.log(data);
				console.log("update user.goto");

				Users.findOneAndUpdate({ 'github.id': login }, { $push: { 'goto':  { "yelpid": data.barid, "date": today() } } })
					.exec(function (err, result) {
							if (err) { throw err; }
							res.json({});
						}
					);

			}

		});
	};

	this.deleteBar = function (req, res) {

		console.log("deleteBar");

		var body = "";

		req.on('data', function (chunk) {
			body += chunk;
		});
		req.on('end', function () {

			if (req.user!=undefined) {

				var login = req.user.github.id;

				var data = JSON.parse(body);

				Users.findOneAndUpdate({ 'github.id': login }, { $pull: { 'goto':  { "yelpid": data.barid, "date": today() } } })
					.exec(function (err, result) {
							if (err) { throw err; }
							res.json({});
						}
					);

			}

		});
	};

}

module.exports = BarsHandler;
