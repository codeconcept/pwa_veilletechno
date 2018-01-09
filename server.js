var express = require('express');
const config = require('./config');
const mongodbConnectionString = require('./config').mongoUrl;
var app = express();
var port = process.env.PORT || 8080;

// cors
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// mongoose config
const mongoose = require('mongoose');
mongoose.Promise = Promise;
mongoose.connect(mongodbConnectionString);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: cannot connect to my DB on mLab :('));
db.once('open', function () {
    console.log('connected to the DB :)')
});

// body parser config
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// creating a techno mongoose model
const technoSchema = mongoose.Schema({
    name: String,
    description: String,
    url: String
});
const Techno = mongoose.model('Techno', technoSchema);

// routes
app.get('/technos', function(req, res) {
    Techno.find((err, technos) => {
        if(err) {
            console.log('could not retrieve technos from DB');
            res.json({});
        } else {            
            res.json(technos);
        }
    });   
})

app.post('/technos', function (req, res) {

    if (!req.body) {
        return res.sendStatus(500);
    } else {
        var name = req.body.name;
        var description = req.body.description;
        var url = req.body.url;

        const myTechno = new Techno({ name, description, url });

        myTechno.save((err, savedTechno) => {
            if (err) {
                console.error(err);
                return;
            } else {
                console.log(savedTechno);
            }
        });

        res.sendStatus(201);
    }
});

// listening
app.listen(port);
console.log('Server started! At http://localhost:' + port);