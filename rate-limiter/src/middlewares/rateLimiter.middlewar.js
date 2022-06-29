const redis = require('redis');
const client = redis.createClient();

client.on('connect', function() {
  console.log('Connected!');
});

const connectToReddis = async () => {
  await client.connect();
}

connectToReddis();

const THRESHOLD = 10;
const WINDOW = 20000;

// Server-side logging function
const logger = (previousBucketRequests, currentBucketRequests, percentage) => {
  console.log("---------------------------------------------------------");
  console.log("Our threshold is:", THRESHOLD);
  console.log("Percentage of previous window still in play:", percentage)
  console.log("Previous window contribution to limit:", percentage * previousBucketRequests);
  console.log("Current window contribution to limit:", currentBucketRequests);
  console.log("Sum of contributions:", currentBucketRequests + (percentage * previousBucketRequests));
  console.log("Result:", currentBucketRequests + (percentage * previousBucketRequests) >= THRESHOLD ? "Threshold reached" : "Request can proceed");
  console.log("---------------------------------------------------------");
  console.log("")
}

const calculateBucketNumber = (ipAddressObject) => {
  const { startTimestamp } = ipAddressObject;
  const timeElapsed = new Date() - new Date(startTimestamp);
  const currentBucketNumber = timeElapsed / WINDOW;

  return Math.floor(currentBucketNumber);
}

const calculateWeightedRequests = (ipAddressObject) => {
  const currentBucketNumber = calculateBucketNumber(ipAddressObject);
  const previousBucketNumber = currentBucketNumber - 1;

  const timeElapsed = new Date() - new Date(ipAddressObject.startTimestamp);

  const currentBucketRequests = ipAddressObject[currentBucketNumber];
  const previousBucketRequests = ipAddressObject[previousBucketNumber] ? ipAddressObject[previousBucketNumber] : 0;

  const percentage = (WINDOW - (timeElapsed % WINDOW)) / WINDOW;

  logger(previousBucketRequests, currentBucketRequests, percentage);
  
  return currentBucketRequests + (previousBucketRequests * percentage);
}

const rateLimiter = async (request, response, next) => {
  const ipHeader = request.headers['x-forwarded-for'] || request.socket.remoteAddress;
  const ipAddress = ipHeader.match(/[^:][0-9.]*$/g)[0];

  let ipAddressObject =  await client.hGet('ipAddresses', ipAddress);
  
  if (!ipAddressObject) {
    ipAddressObject = {
      startTimestamp: new Date(),
      "0": 0
    }
  } else {
    ipAddressObject = JSON.parse(ipAddressObject)
  }

  const currentBucketNumber = calculateBucketNumber(ipAddressObject);

  if (!ipAddressObject[currentBucketNumber]) {
    ipAddressObject[currentBucketNumber] = 0;
  }

  console.log("---------------------------------------------------------");
  console.log(`ipAddress: ${ipAddress} has ${ipAddressObject[currentBucketNumber]} requests`);

  if (calculateWeightedRequests(ipAddressObject) >= THRESHOLD) {
    client.hSet('ipAddresses', ipAddress, JSON.stringify(ipAddressObject))
    response.status(429).send("Too many requests; please wait");
  } else {
    ipAddressObject[currentBucketNumber] += 1;
    client.hSet('ipAddresses', ipAddress, JSON.stringify(ipAddressObject))
    next();
  }
}

exports.rateLimiter = rateLimiter;







// setTimeout(() => {
//   ipAddresses[ipAddress] -= 1
//   console.log(ipAddresses)
// }, WINDOW);



// old implementation
// let ipAddresses = {};

// const THRESHOLD = 10;
// const WINDOW = 20000;



// const resetRequests = setInterval(() => {
//   const ipAddressList = Object.keys(ipAddresses);

//   ipAddressList.forEach(address => {
//     ipAddresses[address].prevWindow = ipAddresses[address].currWindow
//     ipAddresses[address].currWindow = 0;
//     ipAddresses[address].currTimestamp = new Date();
//   })
// }, WINDOW)

// // We want to reset at the hour
// // const timeUntilNextMinute = new Date("desired date") - new Date() // 90000

// // setTimeout(() => {}, timeUntilNextMinute)
// /*
// 1. Calculate how much time until next unit of time
// 2.
// */

// // Server-side logging function
// const logger = (prevWindow, currWindow, percentage) => {
//   console.log("---------------------------------------------------------");
//   console.log("Our threshold is:", THRESHOLD);
//   console.log("Percentage of previous window still in play:", percentage)
//   console.log("Previous window contribution to limit:", percentage * prevWindow);
//   console.log("Current window contribution to limit:", currWindow);
//   console.log("Sum of contributions:", currWindow + (percentage * prevWindow));
//   console.log("Result:", currWindow + (percentage * prevWindow) >= THRESHOLD ? "Threshold reached" : "Request can proceed");
//   console.log("---------------------------------------------------------");
//   console.log("")
// }

// const calculateWeightedRequests = (ipAddress) => {
//   /*
//     const a = currTime / 1000 --> time (secs)
//     a / 60 --> currBucketNumber
//   */
//   const { prevWindow, currWindow, currTimestamp } = ipAddress;
//   const percentage = (WINDOW - (new Date() - currTimestamp)) / WINDOW

//   logger(prevWindow, currWindow, percentage);

//   return currWindow + (percentage * prevWindow);
// }

// const rateLimiter = (request, response, next) => {
//   const ipHeader = request.headers['x-forwarded-for'] || request.socket.remoteAddress;
//   const ipAddress = ipHeader.match(/[^:][0-9.]*$/g)[0];

//   console.log("---------------------------------------------------------");
//   console.log(`ipAddress: ${ipAddress} has ${ipAddresses[ipAddress] ? ipAddresses[ipAddress].currWindow : 0} requests`);
  
//   if (ipAddresses[ipAddress] && calculateWeightedRequests(ipAddresses[ipAddress]) >= THRESHOLD) {
//     response.status(429).send("Too many requests; please wait");
//   } else {
//     if (ipAddresses[ipAddress]) {
//       ipAddresses[ipAddress].currWindow += 1;
//     } else {
//       ipAddresses[ipAddress] = {
//         currTimestamp: new Date(),
//         prevWindow: 0,
//         currWindow: 1
//       }
//     }
//     next()
//   }
// }