var sendgrid = require('sendgrid')(process.env.MESHIDO_SENDGRID_API_KEY);
var mongoskin = require('mongoskin');
var db = mongoskin.db(process.env.MONGO_URI);
var bluebird = require('bluebird');
bluebird.promisifyAll(mongoskin);

/**
 * USAGE:
 *
 * a) Specific date
 *
 *   $ node batch/eventNotifier.js {jstYear} {jstMonth} {jstDay} {jstHour} {threshold}
 *
 * b) Current date
 *
 *   $ node batch/eventNotifier.js `env TZ='Asia/Tokyo' date +'%Y %m %d %H'` {threshold}
 */
var jstYear = Number(process.argv[2]);
var jstMonth = Number(process.argv[3]);
var jstDay = Number(process.argv[4]);
var jstHour = Number(process.argv[5]);
var threshold = Number(process.argv[6]) || 2;

var event = {
	type: '',
	ja: ''
};

if (jstHour === 11) {
	event.type = 'lunch';
	event.ja = 'ランチ';
} else if (jstHour === 17) {
	event.type = 'dinner';
	event.ja = 'ディナー';
} else {
	// バッチ起動時刻が、'11時', '17時' でない場合はなにもせず終了
	console.log('It is not the time to send notification. (' + jstYear + '-' + jstMonth + '-' + jstDay + ' ' + jstHour + ')');
	process.exit(0);
}

db.collection('events').find({
	group: 'test1',
	year: jstYear,
	month: jstMonth,
	day: jstDay,
	type: event.type
}).toArrayAsync().then(function (events) {
	if (events.length < threshold) {
		// 参加人数が {threshold} 未満の場合は通知しない（イベント成立しない）
		console.log('Participant count (' + events.length + ') is less than threshold (' + threshold + ').');
		process.exit(0);
	}

	var content = '';

	events.forEach(function (e) {
		content += e.user.name + '<br />';
		content += e.user.email + '<br />';
		content += '<br />';
	});

	var promises = [];
	events.forEach(function (e) {
		var body = '';
		body += e.user.name + 'さん、' + event.ja + 'どう？<br />';
		body += '<br />';
		body += content;

		var promise = sendNotify(e.user.email, 'メシどう？', body);
		promises.push(promise);
	});

	Promise.all(promises).then(function () {
		console.log('success');
		process.exit(0);
	}, function (err) {
		console.error(err);
		process.exit(1);
	});
}, function (err) {
	console.error(err);
	process.exit(1);
});

/**
 * 通知メールを送信する
 *
 * @param {Object} toAddr 送信先アドレス
 * @param {String} subject 件名
 * @param {String} body メール本文(HTML)
 * @returns {Promise}
 */
function sendNotify(toAddr, subject, body) {
	var params = {
		to: toAddr,
		from: toAddr,
		subject: subject,
		html: body
	};

	return new Promise(function (resolve, reject) {
		sendgrid.send(params, function (err, json) {
			if (err) {
				reject(err);
			} else {
				resolve(json);
			}
		});
	});
}
