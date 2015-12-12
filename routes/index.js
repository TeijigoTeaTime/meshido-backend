var express = require('express');
var router = express.Router();
var randtoken = require('rand-token');

var API_VERSION = 1.0;

var mongoskin = require('mongoskin');
var db = mongoskin.db('mongodb://localhost:27017/meshido');
db.bind('user');

/* GET home page. */
router.get('/', function (req, res) {
	res.render('index', {
		title: 'Express'
	});
});

router.post('/login', function (req, res) {
	// <TODO> accepting request and validation

	// generate token
	var userToken = randtoken.uid(24);

	// create user array
	var newUser = {
		name: req.body.name,
		email: req.body.email,
		token: userToken
	};

	// insert new user record
	db.user.insert(newUser, function (err, result) {
		if (err) {
			console.log('faild to insert user');
			throw err;
		}
		if (result) {
			console.log('add new user [' + result.insertedIds + ']');
		}
	});

	// create response body
	var response = {
		v: API_VERSION,
		token: userToken,
		user: newUser,
		_links: {
			self: {
				method: 'GET',
				href: '/me',
				headers: {
					'Content-Type': 'application/json',
					'X-Meshido-ApiVerion': API_VERSION,
					'X-Meshido-UsrToken': newUser.token
				},
				parameters: ''
			}
		},
		_embeded: ''
	};

	res.send(response);
});

module.exports = router;
