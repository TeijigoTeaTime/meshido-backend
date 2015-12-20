// starting log
console.log('--- Meshido DB initializing. ---');
console.log(' env:NODE_ENV=' + process.env.NODE_ENV);
console.log(' env:MONGO_URI=' + process.env.MONGO_URI);
console.log(' env:TZ=' + process.env.TZ);
console.log('--------------------------------');

var mongoskin = require('mongoskin');
var mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/meshido';
var db = mongoskin.db(mongoURI);
var bluebird = require('bluebird');
bluebird.promisifyAll(mongoskin);

var testUsers = [
	{name: 'テスト太郎1', email: 'corda.tigre.net+100@gmail.com', group: 'test1', token: 'testtoken001'},
	{name: 'テスト太郎2', email: 'corda.tigre.net+101@gmail.com', group: 'test1', token: 'testtoken002'},
	{name: 'テスト太郎3', email: 'corda.tigre.net+102@gmail.com', group: 'test1', token: 'testtoken003'}
];

var testEvents = [
	{group: 'test1', year: 2015, month: 11, day: 10, type: 'dinner',
		user: {name: 'テスト太郎1', email: 'corda.tigre.net+100@gmail.com'}},
	{group: 'test1', year: 2015, month: 11, day: 10, type: 'lunch',
		user: {name: 'テスト太郎1', email: 'corda.tigre.net+100@gmail.com'}},
	{group: 'test1', year: 2015, month: 11, day: 15, type: 'dinner',
		user: {name: 'テスト太郎1', email: 'corda.tigre.net+100@gmail.com'}},
	{group: 'test1', year: 2015, month: 11, day: 15, type: 'lunch',
		user: {name: 'テスト太郎1', email: 'corda.tigre.net+100@gmail.com'}},
	{group: 'test1', year: 2015, month: 11, day: 20, type: 'dinner',
		user: {name: 'テスト太郎1', email: 'corda.tigre.net+100@gmail.com'}},
	{group: 'test1', year: 2015, month: 11, day: 20, type: 'lunch',
		user: {name: 'テスト太郎1', email: 'corda.tigre.net+100@gmail.com'}},

	{group: 'test1', year: 2015, month: 11, day: 10, type: 'dinner',
		user: {name: 'テスト太郎2', email: 'corda.tigre.net+101@gmail.com'}},
	{group: 'test1', year: 2015, month: 11, day: 16, type: 'dinner',
		user: {name: 'テスト太郎2', email: 'corda.tigre.net+101@gmail.com'}},
	{group: 'test1', year: 2015, month: 11, day: 21, type: 'dinner',
		user: {name: 'テスト太郎2', email: 'corda.tigre.net+101@gmail.com'}},

	{group: 'test1', year: 2015, month: 11, day: 10, type: 'lunch',
		user: {name: 'テスト太郎3', email: 'corda.tigre.net+102@gmail.com'}},
	{group: 'test1', year: 2015, month: 11, day: 14, type: 'lunch',
		user: {name: 'テスト太郎3', email: 'corda.tigre.net+102@gmail.com'}},
	{group: 'test1', year: 2015, month: 11, day: 19, type: 'lunch',
		user: {name: 'テスト太郎3', email: 'corda.tigre.net+102@gmail.com'}},

	{group: 'test1', year: 2015, month: 12, day: 5, type: 'dinner',
		user: {name: 'テスト太郎1', email: 'corda.tigre.net+100@gmail.com'}},
	{group: 'test1', year: 2015, month: 12, day: 5, type: 'lunch',
		user: {name: 'テスト太郎1', email: 'corda.tigre.net+100@gmail.com'}},
	{group: 'test1', year: 2015, month: 12, day: 10, type: 'dinner',
		user: {name: 'テスト太郎1', email: 'corda.tigre.net+100@gmail.com'}},
	{group: 'test1', year: 2015, month: 12, day: 10, type: 'lunch',
		user: {name: 'テスト太郎1', email: 'corda.tigre.net+100@gmail.com'}},
	{group: 'test1', year: 2015, month: 12, day: 15, type: 'dinner',
		user: {name: 'テスト太郎1', email: 'corda.tigre.net+100@gmail.com'}},
	{group: 'test1', year: 2015, month: 12, day: 15, type: 'lunch',
		user: {name: 'テスト太郎1', email: 'corda.tigre.net+100@gmail.com'}},

	{group: 'test1', year: 2015, month: 12, day: 5, type: 'dinner',
		user: {name: 'テスト太郎2', email: 'corda.tigre.net+101@gmail.com'}},
	{group: 'test1', year: 2015, month: 12, day: 11, type: 'dinner',
		user: {name: 'テスト太郎2', email: 'corda.tigre.net+101@gmail.com'}},
	{group: 'test1', year: 2015, month: 12, day: 16, type: 'dinner',
		user: {name: 'テスト太郎2', email: 'corda.tigre.net+101@gmail.com'}},

	{group: 'test1', year: 2015, month: 12, day: 5, type: 'lunch',
		user: {name: 'テスト太郎3', email: 'corda.tigre.net+102@gmail.com'}},
	{group: 'test1', year: 2015, month: 12, day: 9, type: 'lunch',
		user: {name: 'テスト太郎3', email: 'corda.tigre.net+102@gmail.com'}},
	{group: 'test1', year: 2015, month: 12, day: 14, type: 'lunch',
		user: {name: 'テスト太郎3', email: 'corda.tigre.net+102@gmail.com'}},

	{group: 'test1', year: 2016, month: 1, day: 1, type: 'dinner',
		user: {name: 'テスト太郎1', email: 'corda.tigre.net+100@gmail.com'}},
	{group: 'test1', year: 2016, month: 1, day: 1, type: 'lunch',
		user: {name: 'テスト太郎1', email: 'corda.tigre.net+100@gmail.com'}},
	{group: 'test1', year: 2016, month: 1, day: 11, type: 'dinner',
		user: {name: 'テスト太郎1', email: 'corda.tigre.net+100@gmail.com'}},
	{group: 'test1', year: 2016, month: 1, day: 11, type: 'lunch',
		user: {name: 'テスト太郎1', email: 'corda.tigre.net+100@gmail.com'}},
	{group: 'test1', year: 2016, month: 1, day: 21, type: 'dinner',
		user: {name: 'テスト太郎1', email: 'corda.tigre.net+100@gmail.com'}},
	{group: 'test1', year: 2016, month: 1, day: 21, type: 'lunch',
		user: {name: 'テスト太郎1', email: 'corda.tigre.net+100@gmail.com'}},

	{group: 'test1', year: 2016, month: 1, day: 1, type: 'dinner',
		user: {name: 'テスト太郎2', email: 'corda.tigre.net+101@gmail.com'}},
	{group: 'test1', year: 2016, month: 1, day: 12, type: 'dinner',
		user: {name: 'テスト太郎2', email: 'corda.tigre.net+101@gmail.com'}},
	{group: 'test1', year: 2016, month: 1, day: 22, type: 'dinner',
		user: {name: 'テスト太郎2', email: 'corda.tigre.net+101@gmail.com'}},

	{group: 'test1', year: 2016, month: 1, day: 1, type: 'lunch',
		user: {name: 'テスト太郎3', email: 'corda.tigre.net+102@gmail.com'}},
	{group: 'test1', year: 2016, month: 1, day: 10, type: 'lunch',
		user: {name: 'テスト太郎3', email: 'corda.tigre.net+102@gmail.com'}},
	{group: 'test1', year: 2016, month: 1, day: 20, type: 'lunch',
		user: {name: 'テスト太郎3', email: 'corda.tigre.net+102@gmail.com'}}
];

var promisses = [];

for (var i = 0; i < testUsers.length; i++) {
	promisses.push(
		db.collection('users').insertAsync(testUsers[i])
	);
}

for (var j = 0; j < testEvents.length; j++) {
	promisses.push(
		db.collection('events').insertAsync(testEvents[j])
	);
}

console.log('insert test data');
Promise.all(promisses)
.then(function () {
	console.log('finish insert test data');
	process.exit(0);
})
.catch(function (err) {
	console.log(err);
	process.exit(1);
});

