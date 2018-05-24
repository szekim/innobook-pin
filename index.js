var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var http = require('http');

var Schema = mongoose.Schema;
const PORT = process.env.PORT || 5000


const dbURI =
  "mongodb://szekim:kim12345678@licenseserver-shard-00-00-rxced.mongodb.net:27017,licenseserver-shard-00-01-rxced.mongodb.net:27017,licenseserver-shard-00-02-rxced.mongodb.net:27017/test?ssl=true&replicaSet=LicenseServer-shard-0&authSource=admin";


//var dbURI = "mongodb://localhost/innobook"

const options = {
    reconnectTries: Number.MAX_VALUE,
    poolSize: 10
};

mongoose.connect(dbURI, options).then(
    () => {
        console.log("Database connection established!");
    },
    err => {
        console.log("Error connecting Database instance due to: ", err);
    }
);

var registerSchema = mongoose.Schema({
    pin: String
});
var availablePinData = mongoose.model('availablepins', registerSchema)

var registeredSchema = mongoose.Schema({
    pin:  String,
    uuid: String,
    name: String
})
var registeredData = mongoose.model('registeredpins', registeredSchema)

var app = express();
app.use(bodyParser.json());


http.createServer(app).listen(PORT);
console.log("The server is start listening on port " +PORT);

app.post('/register', function (req, res) {
    var register = new availablePinData({
        pin: req.body.pin,
        uuid: req.body.uuid,
        name: req.body.name
    })
    try {
        availablePinData.find({
            'pin': req.body.pin
        }, function (err, result) {
            if (result.length > 0) {
                availablePinData.remove({
                    'pin': req.body.pin
                }, function (err, result) {
                    console.log("remove")
                });
                var newRegister = new registeredData({
                    pin: req.body.pin,
                    uuid: req.body.uuid,
                    name: req.body.name
                });
                newRegister.save(function (err) {
                    console.log("saved")
                    res.send("Pin valid. your device is now registered")
                    res.end()
                });
            } else {
                res.send("Invalid Pin")
                res.end()
            }
        });
    } catch (err) {
        console.error(err)
        res.send("Error:" + err)
        res.end()
    }
});

app.post('/addpin', function (req, res) {
    try {
        availablePinData.find({
            'pin': req.body.pin
        }, function (err, result) {
            if (result.length > 0) {
                res.send("Duplicate pin found")
                res.end()
            } else {
                var newpin = new availablePinData({
                    pin: req.body.pin
                });
                newpin.save(function (err) {
                    console.log("New pin saved")
                    res.send("New pin save")
                    res.end()
                })
            }
        });
    } catch (err) {
        console.error(err)
        res.send("Error:" + err)
        res.end()
    }
});

app.post('/checkpin', function (req, res) {
    try {
        registeredData.find({
            'pin': req.body.pin,
            'uuid': req.body.uuid
        }, function (err, result) {
            if (result.length > 0) {
                res.send("OK")
                res.end()
            } else {
                res.send("Pin check fail")
                res.end()
            }
        })
    } catch (err) {
        console.error(err)
        res.send("Error:" + err)
        res.end()
    }
});

app.post('/releasepin', function (req, res) {
    try {
        registeredData.find({
            'pin': req.body.pin
        }, function (err, result) {
            if (result.length > 0) {
                 registeredData.remove({
                    'pin': req.body.pin
                }, function (err, result) {
                });
                 var newpin = new availablePinData({
                    'pin': req.body.pin
                });
                newpin.save()
                res.send("OK")
                res.end()
            } else {
                res.send("Pin not found")
                res.end()
            }
        })
    } catch (err) {
        console.error(err)
        res.send("Error:" + err)
        res.end()
    }
});

app.get('/availablepin', function (req, res) {
    try {
        availablePinData.find({}, function (err, result) {
            if (result.length > 0) {
                res.send(result)
                res.end()
            } else {
                res.send("No Available pin")
            }
        });
    } catch (err) {
        console.error(err)
        res.send("Error:" + err)
        res.end()
    }
});

app.get('/registereddevice', function (req, res) {
    try {
        registeredData.find({}, function (err, result) {
            if (result.length > 0) {
                res.send(result)
                res.end()
            } else {
                res.send("No registered data found")
            }
        });
    } catch (err) {
        console.error(err)
        res.send("Error:" + err)
        res.end()
    }
});