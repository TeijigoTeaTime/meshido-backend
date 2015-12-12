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
	// <TODO> 上位処理に移行予定

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
						'X-Meshido-UserToken': newUser.token
					},
					parameters: ''
				}
			},
			_embeded: ''
		};

		res.send(response);
	});
});

router.get('/me', function (req, res) {
	// accepting request and validation
	// <TODO> 上位処理に移行予定
	var xToken = req.get('X-Meshido-UserToken');
	if (xToken === undefined) {
		var errBody = {error: 'no token was send.'};
		res.status(400).send(errBody);
		return;
	}

	// find an user by token in request header
	db.user.findOne({token: xToken},
		function (err, result) {
			if (err) {
				console.log('faild to retrieve user');
				throw err;
			}

			// no result
			if (result === null) {
				var errBody = {error: 'user does not exist.'};
				res.status(401).send(errBody);
				return;
			}

			// exists.
			var me = {
				name: result.name,
				email: result.email
			};

			// create response body
			var response = {
				v: API_VERSION,
				user: me,
				_links: {
					self: {
						method: 'GET',
						href: '/me',
						headers: {
							'Content-Type': 'application/json',
							'X-Meshido-ApiVerion': API_VERSION,
							'X-Meshido-UserToken': xToken
						},
						parameters: ''
					}
				},
				_embeded: ''
			};

			res.send(response);
		}
	);
});

module.exports = router;
