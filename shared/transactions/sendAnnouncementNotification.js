"use strict";

module.exports = (params) => {

   const actions = {
      sendAnnouncementNotification: require("../actions/sendAnnouncementNotification.js")
   }

   return actions.sendAnnouncementNotification(params.teamId, params.notificationId, params.message)

   .then(
      function(result) {
         return result;
      }
   )

   .catch(
      function(err) {
         console.log(err);
      }
   );
}
