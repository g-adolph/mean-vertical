'use strict';

/**
 * Module dependencies.
 */
var root = './app',
	express = require('express'),
	fs = require('fs'),
	path = require('path');

// Walk function to recursively get files
var _walk = function(root, includeRegex, excludeRegex, removePath, addPrefix) {
	var output = [];
	var directories = [];

	// First read through files 
	fs.readdirSync(root).forEach(function(file) {
		var newPath = root + '/' + file;
		var stat = fs.statSync(newPath);

		if (stat.isFile()) {
			if (includeRegex.test(file) && (!excludeRegex || !excludeRegex.test(file))) {
				output.push(((addPrefix) ? addPrefix : '') + newPath.replace(removePath, ''));
			}
		} else if (stat.isDirectory()) {
			directories.push(newPath);
		}
	});

	// Then recursively add directories
	directories.forEach(function(directory) {
		output = output.concat(_walk(directory, includeRegex, excludeRegex, removePath, addPrefix));
	});

	return output;
};

/**
 * Expose the walk function
 */
exports.walk = _walk;

/**
 * Get the modules CSS files
 */
exports.getClientCSSFiles = function() {
	var output = [];
	var cssFolderSuffix = 'client/css';

	// First we need to include the core module
	var coreModuleCSSFolderPath = root + '/core/' + cssFolderSuffix;

	if (fs.existsSync(coreModuleCSSFolderPath)) {
		var stat = fs.statSync(coreModuleCSSFolderPath);

		if (stat.isDirectory()) {
			output = output.concat(_walk(coreModuleCSSFolderPath, /(.*)\.(css)/, null, coreModuleCSSFolderPath, 'core/css'));
		}
	}

	// Then we'll include other modules 
	fs.readdirSync(root).forEach(function(folder) {
		var moduleCSSFolderPath = root + '/' + folder + '/' + cssFolderSuffix;

		if (moduleCSSFolderPath !== coreModuleCSSFolderPath && fs.existsSync(moduleCSSFolderPath)) {
			var stat = fs.statSync(moduleCSSFolderPath);

			if (stat.isDirectory()) {
				output = output.concat(_walk(moduleCSSFolderPath, /(.*)\.(css)/, null, moduleCSSFolderPath, folder + '/css'));
			}
		}
	});

	return output;
};

/**
 * Get the modules JavaScript files
 */
exports.getClientJavaScriptFiles = function() {
	var output = [];
	var jsFolderSuffix = 'client/js';

	// First we need to include the core module
	var coreModuleJSFolderPath = root + '/core/' + jsFolderSuffix;

	if (fs.existsSync(coreModuleJSFolderPath)) {
		var stat = fs.statSync(coreModuleJSFolderPath);

		if (stat.isDirectory()) {
			output = output.concat(_walk(coreModuleJSFolderPath, /(.*)\.(js)/, null, coreModuleJSFolderPath, 'core/js'));
		}
	}

	// Then we'll include other modules 
	fs.readdirSync(root).forEach(function(folder) {
		var moduleJSFolderPath = root + '/' + folder + '/' + jsFolderSuffix;

		if (moduleJSFolderPath !== coreModuleJSFolderPath && fs.existsSync(moduleJSFolderPath)) {
			var stat = fs.statSync(moduleJSFolderPath);

			if (stat.isDirectory()) {
				output = output.concat(_walk(moduleJSFolderPath, /(.*)\.(js)/, null, moduleJSFolderPath, folder + '/js'));
			}
		}
	});

	return output;
};

/**
 * Require the application modules model files
 */
exports.requireServerModels = function() {
	fs.readdirSync(root).forEach(function(folder) {
		var moduleModelsFolderPath = root + '/' + folder + '/server/models';

		if (fs.existsSync(moduleModelsFolderPath)) {
			var stat = fs.statSync(moduleModelsFolderPath);

			if (stat.isDirectory()) {
				_walk(moduleModelsFolderPath, /(.*)\.(js$|coffee$)/).forEach(function(modelPath) {
					require(path.resolve(modelPath));
				});
			}
		}
	});
};

/**
 * Require the application modules route files
 */
exports.requireServerRoutes = function(app) {
	fs.readdirSync(root).forEach(function(folder) {
		var moduleRoutesFolderPath = root + '/' + folder + '/server/routes';
		
		if (fs.existsSync(moduleRoutesFolderPath)) {
			var stat = fs.statSync(moduleRoutesFolderPath);
			
			if (stat.isDirectory()) {
				_walk(moduleRoutesFolderPath, /(.*)\.(js$|coffee$)/).forEach(function(routePath) {
					require(path.resolve(routePath))(app);
				});
			}
		}
	});
};

/**
 * Set static server routes
 */
exports.setStaticServerRoutes = function(app) {
	// First will set the lib folder static middleware
	app.use('/lib', express.static(path.resolve('./bower_components/')));

	// Then the module files
	fs.readdirSync(root).forEach(function(folder) {
		var moduleMiddlewareFolderPath = '/modules/' + folder;
		var moduleClientFolderPath = root + '/' + folder + '/client';

		if (fs.existsSync(moduleClientFolderPath)) {
			var stat = fs.statSync(moduleClientFolderPath);

			if (stat.isDirectory()) {
				app.use(moduleMiddlewareFolderPath, express.static(path.resolve(moduleClientFolderPath)));
			}
		}
	});
};