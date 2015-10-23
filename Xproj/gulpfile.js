var gulp = require('gulp'),
	exec = require('gulp-exec'),
	tap = require('gulp-tap'),
	debug = require('gulp-debug'),
	path = require('path'),
	run = require('run-sequence'),
	fs = require('fs'),
	file = require('gulp-file');

var fakeCsproj = '';

var saveCsproj = function(content) {
	fs.writeFile('Xproj.csproj.fake', content, function (err) {
		if (err) {
			return console.log(err);
		}

		console.log('The file was saved!');
	});
};

gulp.task('DnxFlow', function () {

	fakeCsproj = '<?xml version="1.0" encoding="utf-8"?>' +
		'\n<Project ToolsVersion="14.0" DefaultTargets="Build" xmlns="http://schemas.microsoft.com/developer/msbuild/2003">' +
		'\n	<ItemGroup>' +
		'\n		<None Include="app.config">' +
		'\n			<SubType>Designer</SubType>' +
		'\n		</None>';

	return gulp.src('**/**.feature')
		//.pipe(debug())
		.pipe(tap(function(file) {
			var relativePath = file.path.replace(file.cwd + '\\', '');
			fakeCsproj +=
				'\n		<None Include="' + relativePath + '">' +
				'\n			<Generator>SpecFlowSingleFileGenerator</Generator>' +
				'\n			<LastGenOutput>' + path.basename(file.path) + '.cs</LastGenOutput>' +
				'\n		</None>';
		}))
		.on('end', function () {
			fakeCsproj +=
				'\n	</ItemGroup>' +
				'\n</Project>';

			console.log(fakeCsproj);
			saveCsproj(fakeCsproj);

		});
});

gulp.task('default', ['DnxFlow'], function() {
	console.log("callback: " + fakeCsproj);
	saveCsproj(fakeCsproj);
});