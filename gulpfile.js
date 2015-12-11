'use strict';

var gulp = require('gulp');
var eslint = require('gulp-eslint');

gulp.task('eslint', function () {
	return gulp.src(['**/*.js', '!node_modules/**'])
		.pipe(eslint({
			extends: 'xo',
			envs: [
				'node'
			]
		}))
		.pipe(eslint.format())
		.pipe(eslint.failOnError());
});

gulp.task('lint', ['eslint']);