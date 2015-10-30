var gulp = require('gulp'),
	execSync = require('child_process').execSync,
	tap = require('gulp-tap'),
	path = require('path'),
	fs = require('fs'),
	glob = require('glob'),
	replace = require('gulp-replace');

var fakeCsprojContent = '';
var fakeCsprojFilename = '';
var xprojFilename = '';

gulp.task('getFilenames', function(cb) {

	try {
		xprojFilename = glob.sync('*.xproj')[0];
	} catch (e) {
		console.log('Couldn\'t glob for xproj!');
		throw e;
	}

	console.log('Found xproj: ' + xprojFilename);
	fakeCsprojFilename = xprojFilename.replace('.xproj', '.csproj.fake');
	console.log('Fake csproj: ' + fakeCsprojFilename);

	cb();
});

gulp.task('generateFakeCsproj', ['getFilenames'], function (cb) {

	fakeCsprojContent = '<?xml version="1.0" encoding="utf-8"?>' +
		// Set the "ToolsVersion" to VS2013, see: https://github.com/techtalk/SpecFlow/issues/471
		'\n<Project ToolsVersion="12.0" DefaultTargets="Build" xmlns="http://schemas.microsoft.com/developer/msbuild/2003">' +
		'\n  <PropertyGroup>' +
		'\n    <RootNamespace>' + xprojFilename.replace('.xproj', '') + '</RootNamespace>' +
		'\n  </PropertyGroup>' +
		'\n  <ItemGroup>' +
		'\n    <None Include="app.config">' +
		'\n      <SubType>Designer</SubType>' +
		'\n    </None>';

	gulp.src('**/**.feature')
		.pipe(tap(function (file) {
			var relativePath = file.path.replace(file.cwd + '\\', '');
			fakeCsprojContent +=
				'\n    <None Include="' + relativePath + '">' +
				'\n      <Generator>SpecFlowSingleFileGenerator</Generator>' +
				'\n      <LastGenOutput>' + path.basename(file.path) + '.cs</LastGenOutput>' +
				'\n    </None>';
		}))
		.on('end', function () {
			fakeCsprojContent +=
				'\n  </ItemGroup>' +
				'\n</Project>';

			console.log(fakeCsprojContent);

			try {
				fs.writeFileSync(fakeCsprojFilename, fakeCsprojContent);
			} catch (e) {
				console.log('Couldn\'t save fake csproj!');
				throw e;
			}
			console.log('File saved!');

			cb();
		});
});

gulp.task('generateSpecFlowGlue', ['generateFakeCsproj'], function (cb) {
	var specflowExe = path.join(process.env.USERPROFILE, '.dnx\\packages\\SpecFlow\\1.9.0\\tools\\specflow.exe');

	try {
		fs.accessSync(specflowExe, fs.F_OK | fs.X_OK);
	} catch (e) {
		console.log('Couldn\'t find specflow.exe!');
		throw e;
	}

	// Credit: http://stackoverflow.com/questions/11363202/specflow-fails-when-trying-to-generate-test-execution-report
	var configFile = specflowExe + '.config';
	var configFileContents = '<?xml version="1.0" encoding="utf-8" ?><configuration><startup><supportedRuntime version="v4.0.30319" /></startup></configuration>';

	try {
		fs.writeFileSync(configFile, configFileContents);
	} catch (e) {
		console.log('Couldn\'t write specflow config file!');
		throw e;
	}

	console.log('Created: ' + configFile);

	// Credit: http://www.marcusoft.net/2010/12/specflowexe-and-mstest.html
	var command = specflowExe + ' generateall ' + fakeCsprojFilename + ' /force /verbose';
	console.log('Calling: ' + command);

	execSync(command, { stdio: [0, 1, 2] });

	try {
		fs.unlinkSync(configFile);
	} catch (e) {
		console.log('Couldn\'t remove (clean up) specflow config file!');
		throw e;
	}
	
	console.log('Removed: ' + configFile);

	cb();
});

gulp.task('xUnitTwoFix', ['generateSpecFlowGlue'], function () {
	console.log('Fixing SpecFlow generated files for xUnit v2');
	return gulp.src('**/**.feature.cs')
		.pipe(replace(' : Xunit.IUseFixture<', ' : Xunit.IClassFixture<'))
		.pipe(gulp.dest(function (file) {
			console.log("Fixed: " + file.path);
			return file.base;
		}));
});

gulp.task('DnxFlow', ['xUnitTwoFix']);