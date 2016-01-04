'use strict';

var gulp = require('gulp');
var eslint = require('gulp-eslint');

gulp.task('eslint', function () {
	return gulp.src(['src/**/*.js', 'tools/**/*.js'])
		.pipe(eslint({
			extends: 'xo',
			envs: [
				'node'
			],
			rules: {
				'new-cap': [2, {'capIsNewExceptions': ['express.Router']}],
				'operator-linebreak': [2, 'before', {'overrides': {'=': 'after'}}]
			}
		}))
		.pipe(eslint.format())
		.pipe(eslint.failOnError());
});

gulp.task('lint', ['eslint']);
