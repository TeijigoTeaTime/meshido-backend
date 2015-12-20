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
var isValidJoinParameters = function (group, year, month, day, eventType) {
	var isValid = true;
	if (validator.isNull(group)) {
		isValid = false;
	}
	if (validator.isNull(year)) {
		isValid = false;
	}
	if (validator.isNull(month)) {
		isValid = false;
	}
	if (validator.isNull(day)) {
		isValid = false;
	}
	if (eventType !== 'lunch' && eventType !== 'dinner') {
		isValid = false;
	}
	if (!validator.isDate(year + '-' + month + '-' + day)) {
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

	var joinGroup = String(req.params.group);
	var joinYear = Number(req.body.year);
	var joinMonth = Number(req.body.month);
	var joinDay = Number(req.body.day);
	var joinEventType = String(req.body.eventType);

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
		if (!isValidJoinParameters(joinGroup, joinYear, joinMonth, joinDay, joinEventType)) {
			var errBody = {error: 'some parameters are not correct.'};
			res.status(400).send(errBody);
			return Promise.reject(errBody);
		}
	})
	.then(function () {
		// check if the requested event has been fixed event
		if (isFixedDate(joinYear + '-' + joinMonth + '-' + joinDay, joinEventType)) {
			var errBody = {error: 'already fixed.'};
			res.status(400).send(errBody);
			return Promise.reject(errBody);
		}
	})
	.then(function () {
		// check if group exists.
		return db.collection('groups').findOneAsync({id: joinGroup})
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
				'group': joinGroup,
				'year': joinYear,
				'month': joinMonth,
				'day': joinDay,
				'type': joinEventType,
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
				group: joinGroup,
				year: joinYear,
				month: joinMonth,
				day: joinDay,
				type: joinEventType,
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
				'group': joinGroup,
				'year': joinYear,
				'month': joinMonth,
				'day': joinDay,
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
						group: joinGroup,
						year: joinYear,
						month: joinMonth,
						day: joinDay
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
 * validate join params
 */
var isValidCalendarParameters = function (group, year, month) {
	var isValid = true;
	if (validator.isNull(group)) {
		isValid = false;
	}
	if (validator.isNull(year)) {
		isValid = false;
	}
	if (validator.isNull(month)) {
		isValid = false;
	}
	if (!validator.isDate(year + '-' + month + '-01')) {
		isValid = false;
	}
	console.log(validator.isDate(year + '-' + month + '-01'));
	return isValid;
};

/**
 * calendar
 */
var getCalendarAction = function (req, res) {
	// accepting request and validation
	// <TODO> 上位処理に移行予定
	var xToken = req.get('X-Meshido-UserToken');
	if (xToken === undefined) {
		res.status(401).send({error: 'no token was send.'});
		return;
	}

	var currentMoment = moment();
	var searchYear = (req.params.year === undefined) ? currentMoment.format('YYYY') : req.params.year;
	var searchMonth = (req.params.month === undefined) ? currentMoment.format('M') : req.params.month;

	var searchGroup = String(req.params.group);
	searchYear = Number(searchYear);
	searchMonth = Number(searchMonth);

	var user = [];
	var joinedEvents = [];
	var days = [];

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
		if (!isValidCalendarParameters(searchGroup, searchYear, searchMonth)) {
			var errBody = {error: 'some parameters are not correct.'};
			res.status(400).send(errBody);
			return Promise.reject(errBody);
		}
	})
	.then(function () {
		// check if group exists.
		return db.collection('groups').findOneAsync({id: searchGroup})
			.then(function (result) {
				if (result === null) {
					var errBody = {error: 'group does not exists.'};
					res.status(404).send(errBody);
					return Promise.reject(errBody);
				}
			});
	})
	.then(function () {
		// retribe my joined events
		return db.collection('events').find(
			{
				'group': searchGroup,
				'year': searchYear,
				'month': searchMonth,
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
		var searchMoment = moment().year(searchYear).month(searchMonth - 1);
		// create mock response
		var daysInMonth = searchMoment.daysInMonth();

		// initializing this month's days
		for (var i = 1; i <= daysInMonth; i++) {
			var aDayMoment = searchMoment.date(i);
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
	})
	.then(function () {
		// aggregate event's participants
		var aggregateCondition =
			[
				// matching condition
				{
					$match: {
						group: searchGroup,
						year: searchYear,
						month: searchMonth
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
					var aDayIndex = aRow._id.d - 1;
					var eventType = aRow._id.type;

					var anEvent = days[aDayIndex][eventType];
					anEvent.hasJoined = (joinedEvents[date.format('D') + '-' + eventType] !== undefined);
					anEvent.participantCount = aRow.count;
				});
			});
	})
	.then(function () {
		// create response body
		var response = {
			v: API_VERSION,
			days: days
		};

		res.send(response);
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

/**
 * validate cancel params
 */
var isValidCancelParameters = function (group, year, month, day, eventType) {
	var isValid = true;
	if (validator.isNull(group)) {
		isValid = false;
	}
	if (validator.isNull(year)) {
		isValid = false;
	}
	if (validator.isNull(month)) {
		isValid = false;
	}
	if (validator.isNull(day)) {
		isValid = false;
	}
	if (eventType !== 'lunch' && eventType !== 'dinner') {
		isValid = false;
	}
	if (!validator.isDate(year + '-' + month + '-' + day)) {
		isValid = false;
	}
	return isValid;
};

/**
 * cancel event
 */
router.post('/:group/event/cancel', function (req, res) {
	// accepting request and validation
	// <TODO> 上位処理に移行予定
	var xToken = req.get('X-Meshido-UserToken');
	if (xToken === undefined) {
		res.status(401).send({error: 'no token was send.'});
		return;
	}

	var cancelGroup = String(req.params.group);
	var cancelYear = Number(req.body.year);
	var cancelMonth = Number(req.body.month);
	var cancelDay = Number(req.body.day);
	var cancelEventType = String(req.body.eventType);

	var user = [];
	var joinedEvents = [];
	var days = [];

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
		if (!isValidCancelParameters(cancelGroup, cancelYear, cancelMonth, cancelDay, cancelEventType)) {
			var errBody = {error: 'some parameters are not correct.'};
			res.status(400).send(errBody);
			return Promise.reject(errBody);
		}
	})
	.then(function () {
		// check if the requested event has been fixed event
		if (isFixedDate(cancelYear + '-' + cancelMonth + '-' + cancelDay, cancelEventType)) {
			var errBody = {error: 'already fixed.'};
			res.status(400).send(errBody);
			return Promise.reject(errBody);
		}
	})
	.then(function () {
		// check if group exists.
		return db.collection('groups').findOneAsync({id: cancelGroup})
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
		return db.collection('events').removeAsync(
			{
				'group': cancelGroup,
				'year': cancelYear,
				'month': cancelMonth,
				'day': cancelDay,
				'type': cancelEventType,
				'user.email': user.email
			}
		);
	})
	.then(function () {
		// retribe my joined events
		return db.collection('events').find(
			{
				'group': cancelGroup,
				'year': cancelYear,
				'month': cancelMonth,
				'day': cancelDay,
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
						group: cancelGroup,
						year: cancelYear,
						month: cancelMonth,
						day: cancelDay
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

		var dateYMDStr = [cancelYear, cancelMonth, cancelDay].join('-');
		var date = moment(dateYMDStr);

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

		return db.collection('events').aggregateAsync(aggregateCondition)
			.then(function (result) {
				result.forEach(function (aRow) {
					var eventType = aRow._id.type;

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

module.exports = router;
