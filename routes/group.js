var express = require('express');
var router = express.Router();

var mongoskin = require('mongoskin');
var mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/meshido';
var db = mongoskin.db(mongoURI);
var bluebird = require('bluebird');
bluebird.promisifyAll(mongoskin);
var validator = require('validator');
var moment = require('moment');

var API_VERSION = 1.0;

/**
 * dicide the date sent whether fixed
 */
var isFixedDate = function (ymdStr, evenType) {
	var fixDate;
	// fix time
	if (evenType === 'lunch') {
		fixDate = moment(ymdStr + ' 11:00:00');
	} else {
		fixDate = moment(ymdStr + ' 17:00:00');
	}
	var currentDate = moment();
	// compare current date
	return fixDate.isBefore(currentDate);
};

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
	var xToken = req.get('X-Meshido-UserToken');
	if (xToken === undefined) {
		res.status(401).send({error: 'no token was send.'});
		return;
	}

	var user = [];
	var joinedEvents = [];
	var days = [];
	var isNeedCreateJoinRecord = true;

	Promise.resolve()
	.then(function () {
		// check if user exists
		return db.collection('users').findOneAsync({token: xToken})
			.then(function (result) {
				if (result === null) {
					var errBody = {error: 'user does not exists.'};
					res.status(401).send(errBody);
					return Promise.reject(errBody);
				}

				user = result;
			});
	})
	.then(function () {
		if (!isValidJoinParameters(req)) {
			var errBody = {error: 'some parameters are not correct.'};
			res.status(400).send(errBody);
			return Promise.reject(errBody);
		}
	})
	.then(function () {
		// check if the requested event has been fixed event
		if (isFixedDate(req.body.year + '-' + req.body.month + '-' + req.body.day, req.body.eventType)) {
			var errBody = {error: 'already fixed.'};
			res.status(400).send(errBody);
			return Promise.reject(errBody);
		}
	})
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
				isNeedCreateJoinRecord = false;
			}
		});
	})
	.then(function () {
		// join event
		if (isNeedCreateJoinRecord) {
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
		}
	})
	.then(function () {
		// retribe my joined events
		return db.collection('events').find(
			{
				'group': req.params.group,
				'year': req.body.year,
				'month': req.body.month,
				'day': req.body.day,
				'user.email': user.email
			}
		)
		.toArrayAsync()
		.then(function (result) {
			result.forEach(function (aRow) {
				// key is 'day-type'
				joinedEvents[aRow.day + '-' + aRow.type] = aRow;
			});
		});
	})
	.then(function () {
		// !!!! TOO dirty !!!
		// aggregate event's participants
		var aggregateCondition =
			[
				// matching condition
				{
					$match: {
						group: req.params.group,
						year: req.body.year,
						month: req.body.month,
						day: req.body.day
					}
				},
				// sorting condition
				{
					$sort: {
						day: -1,
						type: 1
					}
				},
				// grouping condition
				{
					$group: {
						_id: {
							group: '$group',
							y: '$year',
							m: '$month',
							d: '$day',
							type: '$type'
						},
						// grouping function
						count: {
							$sum: 1
						}
					}
				}
			];

		return db.collection('events').aggregateAsync(aggregateCondition)
			.then(function (result) {
				result.forEach(function (aRow) {
					var dateYMDStr = [aRow._id.y, aRow._id.m, aRow._id.d].join('-');
					var date = moment(dateYMDStr);
					var eventType = aRow._id.type;

					if (days[0] === undefined) {
						// initialize default data
						days.push(
							{
								dayOfMonth: parseInt(date.format('D'), 10),
								weekday: date.format('ddd'),
								dinner: {
									hasJoined: false,
									isFixed: isFixedDate(dateYMDStr, 'dinner'),
									participantCount: 0,
									// <TODO> まだ
									_links: []
								},
								lunch: {
									hasJoined: false,
									isFixed: isFixedDate(dateYMDStr, 'lunch'),
									participantCount: 0,
									// <TODO> まだ
									_links: []
								}
							}
						);
					}

					days[0][eventType] = {
						hasJoined: (joinedEvents[date.format('D') + '-' + eventType] !== undefined),
						// compare eventdate and current date
						isFixed: isFixedDate(dateYMDStr, eventType),
						participantCount: aRow.count,
						// <TODO> まだ
						_links: []
					};
				});
			});
	})
	.then(function () {
		// create response body
		var response = {
			v: API_VERSION,
			result: 'success',
			days: days
		};
		res.send(response);
	})
	.catch(function (err) {
		console.log(err);
	});
});



/**
 * calendar
 */
var getCalendarAction = function (req, res) {

	var days = [];

	Promise.resolve()
	.then(function () {
		// create mock response
		var daysInMonth = moment().daysInMonth();
		// initializing this month's days
		for (i=1; i <= daysInMonth; i++) {
			var aDayMoment = moment().date(i);
			var aDay =
				{
					dayOfMonth: parseInt(aDayMoment.format('D'), 10),
					weekday: aDayMoment.format('ddd'),
					dinner: {
						hasJoined: false,
						isFixed: isFixedDate(aDayMoment.format('YYYY-MM-DD'), 'dinner'),
						participantCount: 0,
						// <TODO> まだ
						_links: []
					},
					lunch: {
						hasJoined: false,
						isFixed: isFixedDate(aDayMoment.format('YYYY-MM-DD'), 'lunch'),
						participantCount: 0,
						// <TODO> まだ
						_links: []
					}
				};
			days.push(aDay);
		}

		// apply mock data
		for (i=0; i < daysInMonth; i++) {
			days[i].dinner.hasJoined = (i % 3 === 0);
			days[i].dinner.participantCount = i % 4;
			days[i].lunch.hasJoined = (i % 5 === 0);
			days[i].lunch.participantCount = i % 6;
		}

		res.send(days);
	})
	.catch(function (err) {
		console.log(err);
	});
};

/**
 * routing calendar
 */
router.get('/:group/calendar', getCalendarAction);
router.get('/:group/calendar/year/:year', getCalendarAction);
router.get('/:group/calendar/year/:year/month/:month', getCalendarAction);
router.get('/:group/calendar/year/:year/month/:month/day/:day', getCalendarAction);

module.exports = router;
