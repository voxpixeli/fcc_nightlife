'use strict';

const apiUrl = appUrl + '/api/:id/search';
//const apiUrlUser = apiUrl + '?user';
const yelpApiUrl = 'https://api.yelp.com/v3/businesses/search';
const yelpTokenUrl = '/yelp/token';


const username = document.querySelector('#username') || null;

(function () {

   var searchButton = document.getElementById('searchbtn');

    if (username !== null) {
        ajaxFunctions.ready(updateBars);
    }

    console.log("searchController");

   if (searchButton) {
      searchButton.addEventListener('click', function () {

        console.log("searchButton.addEventListener");

        updateBars();

      }, false);

   }

})();

    function fillList(data) {

        console.log("fillList");

        var listdiv = document.querySelector('.list');
        var yelpdiv = document.querySelector('#yelp');

        //console.log(data);

        var bars = JSON.parse(data);

        console.log(bars);


        var list = "";
        var b = 0;

        bars.businesses.forEach(function(bar){
            var even = b%2==0 ? "even" : "odd";
            var count = bar.going==null ? 0 : bar.going.count;
            var igo = bar.going==null ? false : bar.going.igo;
            list += '<div class="bar '+even+'"><div class="photo block">';
            if (bar.image_url!="") {
                list += '<img src="' + bar.image_url + '" style="width:120px; height:120px;" />';
            } else {
                list += '<svg width="120" height="120"><rect width="120" height="120" style="fill:rgb(100,100,100);" /></svg>';
            }
            list += '</div>'

            list += '<div class="info block">';
            list += '<span class="name"> ' + bar.name + '</span>';
            list += '<span class="location"> ' + bar.location.city + '</span>';

            list += '<div id=info_'+bar.id+'>';
            list += generateInfoDiv(bar.id, count, igo);
            list += '</div>';

            list += '</div>';

            list += '</div>';
            b++;
        });


        listdiv.innerHTML = list;

        yelpdiv.innerHTML = 'results provided by <a href="https://www.yelp.com" target="_blank">Yelp</a>';

    }

    function generateInfoDiv(barid, count, igo) {

        var list = '';

        list += '<br/><span class="going' + (count==0 ? ' zero' : '') + '"> ' + count + ' going</span>';
        if (username !== null) {
            if (igo) {
                list += '<span class="igo pointer" onclick="goClickHandler(\''+barid+'\',\'-\','+count+');">I\'m going</span>';
            } else {
                list += '<span class="go pointer" onclick="goClickHandler(\''+barid+'\',\'+\','+count+');">add me</span>';
            }
        }

        return list;

    }


    function goClickHandler(barid, mode, oldcount) {
        //
        // mode : +/- (add/remove)

        console.log("goClickHandler", barid, mode, oldcount);

        if (mode == "+") {
            ajaxFunctions.ajaxRequest('POST', apiUrl, function() {
                updateStatus(barid, true, oldcount+1);
            }, JSON.stringify({ "barid": barid}));
        } else {
            ajaxFunctions.ajaxRequest('DELETE', apiUrl, function() {
                updateStatus(barid, false, oldcount-1);
            }, JSON.stringify({ "barid": barid}));
        }

    }

    function updateStatus(barid, igo, count) {

        console.log("updateStatus", barid, igo, count);

        var infodiv = document.getElementById('info_'+barid);

        console.log("updateStatus : infodiv = ", infodiv);

        if (infodiv !== null) {
            infodiv.innerHTML = generateInfoDiv(barid, count, igo);
            console.log("updateStatus : updated");
        }

    }

    function updateBars () {

        var location = document.getElementById('location');

        console.log("updateBars", location.value);

        if (location && location.value!=="") {
            ajaxFunctions.ajaxRequest('GET', apiUrl + '?keywords='+encodeURI(location.value), fillList);
        }

   }

