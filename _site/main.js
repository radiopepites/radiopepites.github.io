var fs = require("fs");
var songs2 = fs.readFile('/music', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  console.log(data);
});