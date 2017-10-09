'use strict';

(function () {

   var userid = document.querySelector('#userid') || null;
   var username = document.querySelector('#username') || null;
   var apiUrl = appUrl + '/api/:id';

   ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrl, function (data) {
      var user = JSON.parse(data);

      if (username !== null) {
         if (user.displayName !== null) {
            username.innerHTML = user.displayName;
         } else {
            username.innerHTML = user.username;
         }
      }
      if (userid !== null) {
         userid.innerHTML = user.id;
      }

   }));
})();
