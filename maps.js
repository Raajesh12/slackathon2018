
const GOOGLE_API = "AIzaSyCUABcby-9vvpXsSEre-LRuYdQ0UIAIXBo";

var google = require("@google/maps").createClient({
  key: GOOGLE_API,
  Promise: Promise
});
const maxDistance = 10000 // in metres

//location should have user ID too
//startLocation is the address, locationarrays is a array of 2 arrays: array of distances, and array of corresponding userIds
exports.matchLogic = function getPassengers(startLocation, locationArrays) {
  return new Promise((resolve, reject) => {

  google.distanceMatrix(
    {
      origins: [
        startLocation,
      ],
      destinations: locationArrays[0]
    })
    .asPromise()
    .then((response) => {
      const distances = response.json.rows[0].elements;
      const mapped = distances.map((element, index) => {
        return {
        distance: element.distance.value,
        duration: element.duration.value,
        index: index
        }
      });

      const filtered = mapped.filter((element) => element.distance < maxDistance).map((element) => locationArrays[1][element.index]);
      resolve(filtered);
    })
    .catch((err) => {
      reject(err);
    });
  });

}
