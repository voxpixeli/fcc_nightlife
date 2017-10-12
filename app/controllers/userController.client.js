'use strict';

(function () {

   var userid = document.querySelector('#userid') || null;
   var username = document.querySelector('#username') || null;
   var location = document.getElementById('location')
   var apiUrl = appUrl + '/api/:id';

   ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrl, function (data) {
      if (data !== JSON.stringify({})) {
         var user = JSON.parse(data);
         if (username !== null) {
            if (user.github.displayName !== null) {
               username.innerHTML = user.github.displayName;
            } else {
               username.innerHTML = user.github.username;
            }
         }
         if (userid !== null) {
            userid.innerHTML = user.github.id;
         }
         if (location !== null) {
            if (location.value=="" && user.search!==undefined) {

               console.log("userController : autofill", user.search);

               location.value = user.search;
               updateBars();
            }
         }
      }
   }));
})();
