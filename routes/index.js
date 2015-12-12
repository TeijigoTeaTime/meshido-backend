var express = require('express');
var router = express.Router();
var randtoken = require('rand-token');

var mongoskin = require('mongoskin');
var db = mongoskin.db('mongodb://localhost:27017/meshido');
var bluebird = require('bluebird');
bluebird.promisifyAll(mongoskin);

var API_VERSION = '1.0';

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
		group: req.body.group,
		token: userToken
	};

	// check if group is exists.
	db.collection('groups').findOneAsync({id: newUser.group})
	.then(function (result) {
		if (result === null) {
			var errBody = {error: 'group does not exists.'};
			res.status(404).send(errBody);
			return Promise.reject(errBody);
		}

		// insert new user record
		return db.collection('users').insertAsync(newUser);
	})
	.then(function (result) {
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
	})
	.catch(function (err) {
		console.log(err);
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
	db.collection('users').findOne({token: xToken},
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

router.get('/logout', function (req, res) {
	// accepting request and validation
	// <TODO> 上位処理に移行予定
	var xToken = req.get('X-Meshido-UserToken');
	if (xToken === undefined) {
		var errBody = {error: 'no token was send.'};
		res.status(400).send(errBody);
		return;
	}

	db.collection('users').remove({token: xToken},
		function (err) {
			if (err) {
				console.log('faild to retrieve user');
				throw err;
			}

			// create response body
			var response = {
				v: API_VERSION,
				message: 'logout was succeeded.'
			};

			res.send(response);
		}
	);
});

module.exports = router;
