'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Poll = new Schema({
    userid: String,
    title: String,
    info: String,
    items: [{
        itemname: String,
        votecount: Number
    }]
});

module.exports = mongoose.model('Poll', Poll);

