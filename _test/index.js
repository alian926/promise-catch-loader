const fs = require('fs');
const path = require('path');
const { runLoaders } = require('loader-runner');

runLoaders(
    {
        resource: path.resolve(__dirname, './demo.js'),
        loaders: [
            {
                loader: path.resolve(__dirname, '../lib/index.js'),
                options: {
                    catchCode: "console.log('catchCode console', err.message)",
                },
            },
        ],
        readResource: fs.readFile.bind(fs),
    },
    (err, result) => {
        err ? console.error(err) : console.log(result.result);
        fs.writeFile(path.resolve(__dirname, './result.js'), result.resourceBuffer, err => {
            err ? console.error(err) : console.log('success');
        });
    }
);
