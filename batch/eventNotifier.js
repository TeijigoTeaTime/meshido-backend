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
 *   $ node batch/eventNotifier.js {year} {month} {day} {hour}
 */
var year  = Number(process.argv[2]);
var month = Number(process.argv[3]);
var day   = Number(process.argv[4]);
var hour  = Number(process.argv[5]);

if (hour !== 11 && hour !== 17) {
	// バッチ起動時刻が、"11時", "17時" でない場合はなにもせず終了
	console.log('skip: ' + year + '-' + month + '-' + day + ' ' + hour);
	process.exit(0);
}

var sendgrid  = require('sendgrid')(apiKey);

// TODO DBから取得する
var users = [
	{
		email: 'taro.yamada@example.com',
		name: 'Taro Yamada'
	},
	{
		email: 'hanako.yamada@example.com',
		name: 'Hanako Yamada'
	}
];

var toList = [];
var content = '';

users.forEach(function(user) {
	toList.push(user.email);

	content += user.name + '\r\n';
	content += user.email + '\r\n';
	content += '\r\n';
});

console.log(toList);
console.log(content);

sendgrid.send({
	to: toList,
	// TODO アプリのアドレス? or 自分のアドレス?
	from: 'no-reply@example.com',
	subject: 'メシどう？',
	text: content
}, function (err, json) {
	if (err) {
		// TODO エラーを開発者に通知?
		console.error(err);
		return;
	}

	// TODO Fixedにする
	console.log(json);
});
