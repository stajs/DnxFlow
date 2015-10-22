var gulp = require('gulp'),
	exec = require('gulp-exec'),
	tap = require('gulp-tap'),
	debug = require('gulp-debug'),
	path = require('path'),
	file = require('gulp-file');

gulp.task('default', function () {

	var features = [];

	var csProjHeader = '<?xml version="1.0" encoding="utf-8"?>' +
		'\n<Project ToolsVersion="14.0" DefaultTargets="Build" xmlns="http://schemas.microsoft.com/developer/msbuild/2003">' +
		'\n	<ItemGroup>' +
		'\n		<None Include="app.config">' +
		'\n			<SubType>Designer</SubType>' +
		'\n		</None>';

	var csProjFooter = '\n</Project>';

	return gulp.src('**/**.feature')
		.pipe(debug())
		.pipe(tap(function(file) {
			var feature = file.path.replace(file.cwd + '\\', '');
			//console.log('Adding: ' + feature);
			features.push(feature);

			var item = 
				'\n		<None Include="Features\InFolder.feature">' +
				'\n			<Generator>SpecFlowSingleFileGenerator</Generator>' +
				'\n			<LastGenOutput>' + feature +'</LastGenOutput>' +
				'\n		</None>';

			console.log('Features: ' + features);
			console.log(item);
		}));


//return file('Xproj.csproj.fake', str, { src: true })
	//	.pipe(gulp.dest('DnxFlow'));
});