var express = require('express');
var router = express.Router();

var mongoskin = require('mongoskin');
var db = mongoskin.db('mongodb://localhost:27017/meshido');
var bluebird = require('bluebird');
bluebird.promisifyAll(mongoskin);
var validator = require('validator');

// var API_VERSION = '1.0';

/**
 * validate join params
 */
var isValidJoinParameters = function (req) {
	var isValid = true;
	if (validator.isNull(req.params.group)) {
		isValid = false;
	}
	if (validator.isNull(req.body.year)) {
		isValid = false;
	}
	if (validator.isNull(req.body.month)) {
		isValid = false;
	}
	if (validator.isNull(req.body.day)) {
		isValid = false;
	}
	if (req.body.eventType !== 'lunch' && req.body.eventType !== 'dinner') {
		isValid = false;
	}
	if (!validator.isDate(req.body.year + '-' + req.body.month + '-' + req.body.day)) {
		isValid = false;
	}
	return isValid;
};

/**
 * join event
 */
router.post('/:group/event/join', function (req, res) {
	// accepting request and validation
	// <TODO> 上位処理に移行予定
	if (!isValidJoinParameters(req)) {
		res.status(400).send({error: 'some parameters are not correct.'});
		return;
	}

	var xToken = req.get('X-Meshido-UserToken');
	if (xToken === undefined) {
		res.status(401).send({error: 'no token was send.'});
		return;
	}

	var user = [];

	Promise.resolve()
	.then(function () {
		// check if group exists.
		return db.collection('groups').findOneAsync({id: req.params.group})
			.then(function (result) {
				if (result === null) {
					var errBody = {error: 'group does not exists.'};
					res.status(404).send(errBody);
					return Promise.reject(errBody);
				}
			});
	})
	.then(function () {
		// check if user exists
		return db.collection('users').findOneAsync({token: xToken})
			.then(function (result) {
				if (result === null) {
					var errBody = {error: 'user does not exists.'};
					res.status(404).send(errBody);
					return Promise.reject(errBody);
				}

				user = result;
			});
	})
	.then(function () {
		// check if user has already joined
		return db.collection('events').findOneAsync(
			{
				'group': req.params.group,
				'year': req.body.year,
				'month': req.body.month,
				'day': req.body.day,
				'type': req.body.eventType,
				'user.email': user.email
			}
		)
			.then(function (result) {
				if (result !== null) {
					var errBody = {error: 'user has already joined.'};
					res.status(401).send(errBody);
					return Promise.reject(errBody);
				}
			});
	})
	.then(function () {
		// join event
		var event = {
			group: req.params.group,
			year: req.body.year,
			month: req.body.month,
			day: req.body.day,
			type: req.body.eventType,
			user: {
				name: user.name,
				email: user.email
			}
		};

		return db.collection('events').insertAsync(event)
			.then(function (result) {
				if (result) {
					console.log('add new event [' + result.insertedIds + ']');
				}
			});
	})
	.then(function () {
		// create response body
		var response = 'now implementing.';
		res.send(response);
	})	.catch(function (err) {
		console.log(err);
	});
});

module.exports = router;
