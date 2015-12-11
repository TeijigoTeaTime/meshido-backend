'use strict';

var gulp = require('gulp');
var eslint = require('gulp-eslint');

gulp.task('eslint', function () {
	return gulp.src(['**/*.js', '!gulpfile.js', '!node_modules/**'])
		.pipe(eslint({
			extends: 'xo',
			envs: [
				'node'
			],
			rules: {
				'new-cap': [2, {'capIsNewExceptions': ['express.Router']}]
			}
		}))
		.pipe(eslint.format())
		.pipe(eslint.failOnError());
});

gulp.task('lint', ['eslint']);
