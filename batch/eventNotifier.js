// SendGridのAPI KEY
// 環境変数で指定する
var apiKey = process.env['MESHIDO_SENDGRID_API_KEY'];
if (!apiKey) {
	console.error('API KEY is not specified.');
	process.exit(1);
}

/**
 * USAGE:
 *
 *   $ node batch/eventNotifier.js {jstYear} {jstMonth} {jstDay} {jstHour}
 */
var jstYear  = Number(process.argv[2]);
var jstMonth = Number(process.argv[3]);
var jstDay   = Number(process.argv[4]);
var jstHour  = Number(process.argv[5]);

var event = {
	type: '',
	ja: ''
};

if (jstHour == 11) {
	event.type = 'lunch';
	event.ja = 'ランチ';
} else if (jstHour == 17) {
	event.type = 'dinner';
	event.ja = 'ディナー';
} else {
	// バッチ起動時刻が、"11時", "17時" でない場合はなにもせず終了
	console.log('skip: ' + jstYear + '-' + jstMonth + '-' + jstDay + ' ' + jstHour);
	process.exit(0);
}

//var sendgrid  = require('sendgrid')(apiKey);
// FIXME: スタブ
var sendgrid =  {
	send: function(params, callback) {
		console.log('[sendgrid.send] ' + JSON.stringify(params));

		callback(null, {
			message: "success"
		});
	}
};
//var mongoskin = require('mongoskin');
//var db = mongoskin.db('mongodb://localhost:27017/meshido');
//var bluebird = require('bluebird');
//bluebird.promisifyAll(mongoskin);
// FIXME: スタブ
var db = {
	collection: function (collection) {
		console.log('[db.collection] ' + collection);

		return {
			find: function(condition) {
				console.log('[db.collection.find] ' + JSON.stringify(condition));

				return {
					then: function(done, fail) {
						done([
							{
								email: 'taro.yamada@example.com',
								name: 'Taro Yamada'
							},
							{
								email: 'hanako.yamada@example.com',
								name: 'Hanako Yamada'
							}
						]);
					}
				}
			}
		}
	}
};



db.collection('events').find({
	group: 'group',
	year: jstYear,
	month: jstMonth,
	day: jstDay,
	type: event.type
}).then(function(users) {

	var content = '';
	users.forEach(function(user) {
		content += user.name + '\r\n';
		content += user.email + '\r\n';
		content += '\r\n';
	});

	var promises = [];
	users.forEach(function(user) {
		var promise = sendNotify(user, content);
		promises.push(promise);
	});

	Promise.all(promises).then(function() {
		console.log('success');
		process.exit(0);

	}, function(err) {
		console.error(err);
		process.exit(1);
	});

}, function(err) {
	console.error(err);
	process.exit(1);
});

/**
 * 通知メールを送信する
 *
 * @param {Object} user ユーザ情報( {email: 'メアド', name: '名前'} )
 * @param {String} content メール本文
 * @returns {Promise}
 */
function sendNotify(user, content) {
	var params = {
		to: user.email,
		from: user.email,
		subject: 'メシどう？',
		text: content
	};

	return new Promise(function(resolve, reject) {
		sendgrid.send(params, function (err, json) {
			if (err) {
				reject(err);
			} else {
				resolve(json);
			}
		});
	});
}
