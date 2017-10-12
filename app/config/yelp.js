'use strict';

const request = require('request');
const yelpTokenUrl = 'https://api.yelp.com/oauth2/token';

module.exports = function() {
    request.post({url:yelpTokenUrl, form: {grant_type:'client_credentials', client_id:process.env.YELP_ID, client_secret:process.env.YELP_SECRET}},
        function(err,httpResponse,body){
            console.log(body);
            return JSON.parse(body);
        })
};
