var https = require("follow-redirects").https;
var fs = require("fs");

var options = {
  method: "POST",
  hostname: "k24n8x.api.infobip.com",
  path: "/sms/2/text/advanced",
  headers: {
    Authorization: "App 6425cb63cf8f4bbc854a39fa6fc4987d-56bd56ad-d2ff-474a-aa0a-e8092a2a9f89",
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  maxRedirects: 20,
};

var req = https.request(options, function (res) {
  var chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function (chunk) {
    var body = Buffer.concat(chunks);
    console.log(body.toString());
  });

  res.on("error", function (error) {
    console.error(error);
  });
});

var postData = JSON.stringify({
  messages: [
    {
      destinations: [{ to: "256700640450" }],
      from: "ServiceSMS",
      text: "Hello,\n\nThis is a test message from Infobip. Have a nice day!",
    },
  ],
});

req.write(postData);

req.end();
