"use strict";
var DtsBundlerPlugin = (function () {
    function DtsBundlerPlugin(options) {
        if (options === void 0) { options = {}; }
        this.out = options.out ? options.out : './build/';
        this.excludedReferences = options.excludedReferences ? options.excludedReferences : undefined;
    }
    DtsBundlerPlugin.prototype.apply = function (compiler) {
        var _this = this;
        //when the compiler is ready to emit files
        compiler.plugin('emit', function (compilation, callback) {
            //collect all generated declaration files
            //and remove them from the assets that will be emited
            var declarationFiles = {};
            for (var filename in compilation.assets) {
                if (filename.indexOf('.d.ts') !== -1) {
                    declarationFiles[filename] = compilation.assets[filename];
                    delete compilation.assets[filename];
                }
            }
            //combine them into one declaration file
            //cast to any so IDEs won't complain about .length
            var combinedDeclaration = _this.generateCombinedDeclaration(declarationFiles);
            //and insert that back into the assets
            compilation.assets[_this.out] = {
                source: function () {
                    return combinedDeclaration;
                },
                size: function () {
                    return combinedDeclaration.length;
                }
            };
            //webpack may continue now
            callback();
        });
    };
    DtsBundlerPlugin.prototype.generateCombinedDeclaration = function (declarationFiles) {
        var declarations = '';
        for (var fileName in declarationFiles) {
            console.log('Processing: ' + fileName);
            var declarationFile = declarationFiles[fileName];
            var data = declarationFile.source();
            var lines = data.split("\n");
            var i = lines.length;
            var _loop_1 = function () {
                var line = lines[i];
                //exclude empty lines
                var excludeLine = line == "";
                //exclude export statements
                excludeLine = excludeLine || line.match(/(export.*from.*)|(export\s=.*)/);
                //exclude import statements
                excludeLine = excludeLine || line.indexOf("import") !== -1;
                //if defined, check for excluded references
                if (!excludeLine && this_1.excludedReferences && line.indexOf("<reference") !== -1) {
                    excludeLine = this_1.excludedReferences.some(function (reference) { return line.indexOf(reference) !== -1; });
                }
                if (excludeLine) {
                    lines.splice(i, 1);
                }
                //add missing export statement before a declare, happens when a multi line export is converted to a single line
                if (!excludeLine && line.indexOf('declare') !== -1 && line.indexOf('export') === -1) {
                    lines[i] = 'export ' + line;
                }
            };
            var this_1 = this;
            while (i--) {
                _loop_1();
            }
            declarations += lines.join("\n") + "\n";
        }
        var output = this.moduleName ? "declare module " + this.moduleName + "\n{\n" + declarations + "}" : declarations;
        return output;
    };
    return DtsBundlerPlugin;
}());
module.exports = DtsBundlerPlugin;
