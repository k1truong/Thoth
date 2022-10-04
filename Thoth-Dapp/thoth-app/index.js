var express = require("express");
var fs = require("fs");
var app = express();

var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("src"));
app.use(express.static("../thoth-contract/build/contracts"));

app.get("/", function (req, res) {
  res.render("index.html");
});

app.post("/log", function (req, res) {

  var from = req.body.fromAddress;
  var to = req.body.toAddress;

  var entry = "From: " + from + " To: " + to + " Requesting Equipment\n";
    
    fs.appendFile('./db/Equipment.txt', entry, function(err) {

      if (err) {
          return console.error(err);
      }

    });

});

app.post("/member", function (req, res) {

  var type = parseInt(req.body.type);
  var address = req.body.address;

  var member = "";


  switch(type) {
    case 1:
      member = "Hospital";
      break;
    case 2:
      member = "Manufacturer";
      break;
    case 3:
      member = "Insurance";
      break;
    case 4:
      member = "Doctor";
      break;
    case 5:
      member = "Patient";
      break;
    default:
      member = "";
  }


  var entry = address + " Membership: " + member + "\n";
    
    fs.appendFile('./db/Membership.txt', entry, function(err) {

      if (err) {
          return console.error(err);
      }

    });

});

app.listen(3000, function () {
    console.log("Thoth Dapp listening on port 3000!");
  });
  