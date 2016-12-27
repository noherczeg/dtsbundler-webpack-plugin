class DtsBundlerPlugin {
    out: string;
    moduleName: string;
    mode: string;
    excludedReferences: any;

    constructor(options: any = {}) {
        this.out = options.out ? options.out : './build/';
        this.excludedReferences = options.excludedReferences ? options.excludedReferences : undefined;
    }

    apply(compiler: any) {
        //when the compiler is ready to emit files
        compiler.plugin('emit', (compilation: any, callback: Function) => {
            //collect all generated declaration files
            //and remove them from the assets that will be emited
            let declarationFiles = {};
            for (let filename in compilation.assets) {
                if (filename.indexOf('.d.ts') !== -1) {
                    declarationFiles[filename] = compilation.assets[filename];
                    delete compilation.assets[filename];
                }
            }

            //combine them into one declaration file
            //cast to any so IDEs won't complain about .length
            let combinedDeclaration = <any> this.generateCombinedDeclaration(declarationFiles);

            //and insert that back into the assets
            compilation.assets[this.out] = {
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
    }

    private generateCombinedDeclaration(declarationFiles: Object): string {
        let declarations = '';
        for (let fileName in declarationFiles) {
            console.log('Processing: ' + fileName);
            let declarationFile: any = declarationFiles[fileName];
            let data = declarationFile.source();

            let lines = data.split("\n");
            let i = lines.length;


            while (i--) {
                let line = lines[i];

                //exclude empty lines
                let excludeLine = line == "";

                //exclude export statements
                excludeLine = excludeLine || line.match(/(export.*from.*)|(export\s=.*)/);

                //exclude import statements
                excludeLine = excludeLine || line.indexOf("import") !== -1;

                //if defined, check for excluded references
                if (!excludeLine && this.excludedReferences && line.indexOf("<reference") !== -1) {
                    excludeLine = this.excludedReferences.some((reference: any) => { return line.indexOf(reference) !== -1; });
                }
                if (excludeLine) {
                    lines.splice(i, 1);
                }

                //add missing export statement before a declare, happens when a multi line export is converted to a single line
                if (!excludeLine && line.indexOf('declare') !== -1 && line.indexOf('export') === -1) {
                    lines[i] = 'export ' + line;
                }
            }
            declarations += lines.join("\n") + "\n";
        }

        let output = this.moduleName ? "declare module " + this.moduleName + "\n{\n" + declarations + "}" : declarations;
        return output;
    }

}

export = DtsBundlerPlugin;
