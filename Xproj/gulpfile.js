var gulp = require('gulp'),
	execSync = require('child_process').execSync,
	tap = require('gulp-tap'),
	debug = require('gulp-debug'),
	path = require('path'),
	run = require('run-sequence'),
	fs = require('fs'),
	glob = require('glob'),
	replace = require('gulp-replace'),
	file = require('gulp-file');

var fakeCsprojContent = '';
var fakeCsprojFilename = '';

gulp.task('getFakeCsprojFilename', function(cb) {
	var xproj = null;

	try {
		xproj = glob.sync('*.xproj')[0];
	} catch (e) {
		console.log('Couldn\'t glob for xproj!');
		throw e;
	}

	console.log('Found xproj: ' + xproj);
	fakeCsprojFilename = xproj.replace('.xproj', '.csproj.fake');
	console.log('Fake csproj: ' + fakeCsprojFilename);

	cb();
});

gulp.task('generateFakeCsprojContent', ['getFakeCsprojFilename'], function (cb) {

	fakeCsprojContent = '<?xml version="1.0" encoding="utf-8"?>' +
		'\n<Project ToolsVersion="14.0" DefaultTargets="Build" xmlns="http://schemas.microsoft.com/developer/msbuild/2003">' +
		'\n	<ItemGroup>' +
		'\n		<None Include="app.config">' +
		'\n			<SubType>Designer</SubType>' +
		'\n		</None>';

	gulp.src('**/**.feature')
		.pipe(tap(function (file) {
			var relativePath = file.path.replace(file.cwd + '\\', '');
			fakeCsprojContent +=
				'\n		<None Include="' + relativePath + '">' +
				'\n			<Generator>SpecFlowSingleFileGenerator</Generator>' +
				'\n			<LastGenOutput>' + path.basename(file.path) + '.cs</LastGenOutput>' +
				'\n		</None>';
		}))
		.on('end', function () {
			fakeCsprojContent +=
				'\n	</ItemGroup>' +
				'\n</Project>';

			console.log(fakeCsprojContent);
			cb();
		});
});

gulp.task('saveFakeCsproj', ['generateFakeCsprojContent'], function (cb) {
	try {
		fs.writeFileSync(fakeCsprojFilename, fakeCsprojContent);	
	} catch (e) {
		console.log('Couldn\'t save fake csproj!');
		throw e;
	}
	console.log('File saved!');
	cb();
});

gulp.task('generateAndSaveSpecFlowGlue', ['saveFakeCsproj'], function(cb) {
	var specflowExe = path.join(process.env.USERPROFILE, '.dnx\\packages\\SpecFlow\\1.9.0\\tools\\specflow.exe');

	try {
		fs.accessSync(specflowExe, fs.F_OK | fs.X_OK);
	} catch (e) {
		console.log('Couldn\'t find specflow.exe!');
		throw e;
	} 
	console.log('Using ' + specflowExe);

	execSync(specflowExe + ' generateall ' + fakeCsprojFilename + ' /force /verbose', { stdio: [0, 1, 2] });
	cb();
});

gulp.task('xUnitTwo', ['generateAndSaveSpecFlowGlue'], function () {
	console.log('Fixing SpecFlow glue files for xUnit v2');
	return gulp.src('**/**.feature.cs')
		.pipe(replace(' : Xunit.IUseFixture<', ' : Xunit.IClassFixture<'))
		.pipe(gulp.dest(function (file) {
			console.log("Fixing: " + file.path);
			return file.base;
		}));
});

gulp.task('DnxFlow', ['xUnitTwo']);