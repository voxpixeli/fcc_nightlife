'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
	github: {
		id: String,
		displayName: String,
		username: String,
      publicRepos: Number
	},
	search: String,
	goto: [{
		yelpid: String,
		date: String
	}]
});

module.exports = mongoose.model('User', User);
