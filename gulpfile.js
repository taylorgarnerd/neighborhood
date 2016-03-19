var gulp 	= require('gulp'),
	htmlmin = require('gulp-htmlmin'),
	csso 	= require('gulp-csso'),
	uglify	= require('gulp-uglify');

gulp.task('html', function() {
	return gulp.src('*.html')
		.pipe(htmlmin({collapseWhitespace: true}))
		.pipe(gulp.dest('dist'))
});

gulp.task('css', function() {
	return gulp.src('css/*')
		.pipe(csso())
		.pipe(gulp.dest('dist/css'))
});

gulp.task('js', function() {
	return gulp.src('js/*')
		.pipe(uglify())
		.pipe(gulp.dest('dist/js'))
});

gulp.task('copy', function() {
	return gulp.src('js/lib/*')
		.pipe(gulp.dest('dist/js/lib'))
});

gulp.task('build', ['html', 'css', 'js', 'copy']);

gulp.task('default', ['build']);