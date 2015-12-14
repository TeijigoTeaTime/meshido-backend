var mongoskin = require('mongoskin');
var db = mongoskin.db('mongodb://localhost:27017/meshido');
var bluebird = require('bluebird');
bluebird.promisifyAll(mongoskin);

// initializing in serial
console.log('remove all user data');
db.collection('users').removeAsync()
.then(function () {
	console.log('remove all groups data');
	return db.collection('groups').find().toArrayAsync();
})
.then(function () {
	console.log('remove all events data');
	return db.collection('events').find().toArrayAsync();
})
.then(function () {
	console.log('insert initial data for group');
	return db.collection('groups').insertAsync({id: 'test1', name: 'テストグループ1'});
})
.then(function () {
	console.log('insert initial data for group');
	return db.collection('groups').insertAsync({id: 'test2', name: 'テストグループ2'});
})

.then(function () {
	console.log('done initializing db');
	process.exit();
})
.catch(function (err) {
	console.log(err);
	process.exit();
});

