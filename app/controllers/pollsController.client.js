'use strict';

const apiUrl = appUrl + '/api/:id/polls';
const apiUrlUser = apiUrl + '?user';

const username = document.querySelector('#username') || null;

var voteClickHandler;

(function () {

   var validateButton = document.querySelector('.validate');
   var deleteButton = document.querySelector('.delete');

   var editMode = document.getElementById("polltitle")!=null;

   ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', editMode ? apiUrlUser : apiUrl, updatePolls));

   if (validateButton) {
      validateButton.addEventListener('click', function () {
         var data = {
            "pollid": document.getElementById("pollid").innerHTML,
            "title": document.getElementById("polltitle").value,
            "info": document.getElementById("pollinfo").value,
            "items": document.getElementById("pollitems").value
         }

         if(data.title.replace(" ","")=="") {
            alert("title must not be empty");
            return;
         }
         if(data.items.replace(" ","")=="") {
            alert("items must not be empty");
            return;
         }

         ajaxFunctions.ajaxRequest('POST', apiUrlUser, function (req, res) {
            ajaxFunctions.ajaxRequest('GET', apiUrlUser, updatePolls);
         }, JSON.stringify(data));
      }, false);

      deleteButton.addEventListener('click', function () {
         var data = {
            "pollid": document.getElementById("pollid").innerHTML,
            "title": document.getElementById("polltitle").value,
         }
         ajaxFunctions.ajaxRequest('DELETE', apiUrlUser, function () {
            ajaxFunctions.ajaxRequest('GET', apiUrlUser, updatePolls);
         }, JSON.stringify(data));
      }, false);
   }

})();


   function updatePolls (data) {

      var listdiv = document.querySelector('.list');

      var polls = JSON.parse(data);

      var editMode = document.getElementById("polltitle")!=null;

      var pollid = window.location.pathname.substring(6);   // direct access to a specified poll

      var select = -1;

      // clear form
      if (editMode) {
         document.getElementById("pollid").innerHTML = "";
         document.getElementById("polltitle").value = "";
         document.getElementById("pollinfo").value = "";
         document.getElementById("pollitems").value = "";
         document.getElementById("share").innerHTML = "";
         if (document.getElementById("chart") !== null) { document.getElementById("chart").remove(); }
      }

      var list = "";
      var p = 0;

      polls.forEach(function(poll){
         list += "<div class='poll'>";
         list += "<span class='title pointer' onclick='pollClickHandler("+p+");'>" + poll.title + "</span>";
         list += "<span class='info'>" + poll.info + "</span>";
         if (editMode) {
            list += "<br/>";
            list += "<span class='items'><span class='item'>" + poll.items.reduce(function(a,b){return a.concat(b.itemname)},[]).join("</span><span class='item'>") + "</span></span>";
         }
         list += "<div id='poll-"+p+"' style='display: none;'>"+JSON.stringify(poll)+"</div>"
         list += "</div>";
         if (pollid!=="" && poll._id===pollid) {
            select = p;
         }
         p++;
      });

      listdiv.innerHTML = list;

      if (select > -1) {
         pollClickHandler(select);
      }

   }


   function pollClickHandler(p) {

      var editMode = document.getElementById("polltitle")!=null;

      if (editMode) {
         var poll = JSON.parse(document.getElementById("poll-"+p).innerHTML);
         var pollurl = appUrl + "/poll/" + poll._id;

         document.getElementById("pollid").innerHTML = poll._id;
         document.getElementById("polltitle").value = poll.title;
         document.getElementById("pollinfo").value = poll.info;
         document.getElementById("pollitems").value = poll.items.reduce(function(a,b){return a.concat(b.itemname)},[]).join(";");

         var shareLinks = '';
         shareLinks += '<div class="link"><a href="https://www.addtoany.com/add_to/facebook?linkurl='+pollurl+'&amp;linkname='+poll.title+'" target="_blank"><img src="/public/img/facebook.svg" width="32" height="32"></a></div>'
         shareLinks += '<div class="link"><a href="https://www.addtoany.com/add_to/twitter?linkurl='+pollurl+'&amp;linkname='+poll.title+'" target="_blank"><img src="/public/img/twitter.svg" width="32" height="32"></a></div>'

         document.getElementById("share").innerHTML = shareLinks;

      }

      displayChart(p);

      if (!editMode) {
         displayVote(p);
      }
   }

   function randomColors(count) {
      var colors = ['#3366CC','#DC3912','#FF9900','#109618','#990099','#3B3EAC','#0099C6','#DD4477','#66AA00','#B82E2E','#316395','#994499','#22AA99','#AAAA11','#6633CC','#E67300','#8B0707','#329262','#5574A6','#3B3EAC'];
      var result = [];
      var k = 0;
      for (var i=0; i<count; i++) {
         k = Math.floor(colors.length*Math.random());
         result.push(colors[k]);
         colors.splice(k,1);
      }
      return result;
   }

   function displayVote(p) {
      var poll = JSON.parse(document.getElementById("poll-"+p).innerHTML);
      var list = "";
      var i = 0;

      for (i=0; i<poll.items.length; i++) {
         list += "<input type='radio' name='vote' value='" + poll.items[i].itemname + "' ";
         if (i==0) { list += "checked " };
         list += "class='voteitem' id="+i+">" + poll.items[i].itemname + "</input><br/>";
      }

      if (username !== null) {
         list += "<input type='radio' name='vote' value='_custom_item_' ";
         if (i==0) { list += "checked " };
         list += "class='voteitem' id="+i+">custom: <input type='text' id='custom_input' /></input><br/>";
      }

      document.getElementById("votetitle").innerHTML = poll.title;
      document.getElementById("voteinfo").innerHTML = poll.info;
      document.getElementById("voteoptions").innerHTML = list;
      document.getElementById("votebutton").innerHTML = "<div class='btn dovote'>Vote</div>";

      var voteButton = document.getElementById("votebutton");

      if(voteClickHandler) {
         voteButton.removeEventListener('click', voteClickHandler, false);
      }

      voteClickHandler = function () {

         // selected item ??
         var sel = document.querySelector(':checked');
         var custom = sel.id > poll.items.length-1;

         if (!custom) {
            var data = {
               "pollid": poll._id,
               "pollname": poll.title,
               "itemname": poll.items[sel.id].itemname,
               "custom": false
            }
         } else {
            var customInput = document.getElementById('custom_input');
            if(customInput.value.replace(" ","")=="") {
               alert("custom item must not be empty");
               return;
            }
            var data = {
               "pollid": poll._id,
               "pollname": poll.title,
               "itemname": customInput.value,
               "custom": true
            }
         }

         ajaxFunctions.ajaxRequest('PUT', apiUrl, function (poll) {
            document.getElementById("poll-"+p).innerHTML = poll;
            displayChart(p);
            if(custom) {
               displayVote(p);
            }
         }, JSON.stringify(data));

      }

      voteButton.addEventListener('click', voteClickHandler, false);

   }


   function displayChart(p) {

      var poll = JSON.parse(document.getElementById("poll-"+p).innerHTML);
      var ptitle = poll.title;
      var plabels = [];
      var pdata = [];
      var pcolors = randomColors(poll.items.length);

      poll.items.forEach(function(item) {
         plabels.push(item.itemname);
         pdata.push(item.votecount);
      });

      if (document.getElementById("chart") !== null) { document.getElementById("chart").remove(); }
      document.getElementById("chartdiv").innerHTML = '<canvas id="chart"><canvas>';
      var ctx = document.getElementById("chart").getContext('2d');

      var theChart = new Chart(ctx, {
         type: 'doughnut',
         data: {
            labels: plabels,
            datasets: [{
               backgroundColor: pcolors,
               data: pdata
            }]
         },
         options: {
            responsive: true,
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: ptitle
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
         }
      });

   }
