import { readFileSync } from 'fs';
import ts from 'typescript';

interface Config {
    endpointMethodNames: string;
}

function findEndpoints(
    node: ts.Node,
    sourceFile: ts.SourceFile,
    config: Config,
    endpoints: { [key: string]: string[] } = {}
) {
    ts.forEachChild(node, (n) => {
        findEndpoints(n, sourceFile, config, endpoints);
    });
    if (
        !ts.isCallExpression(node) ||
        !ts.isPropertyAccessExpression(node.expression)
    ) {
        return;
    }
    const propAccess = node.expression;
    const name = propAccess.name.text;
    const instanceName = propAccess.expression.getText(sourceFile);
    if (!(config?.endpointMethodNames?.split(',') ?? []).includes(name)) {
        return;
    }

    const path = node.arguments[0]?.getText(sourceFile).split("'")[1];
    if (path) {
        if (!endpoints[instanceName]) endpoints[instanceName] = [];
        endpoints[instanceName].push(path);
    }
    return;
}

function main() {
    const fileName = process.argv[2];
    if (!fileName) {
        console.log('Input filename');
        process.exit(1);
    }
    const sourceText = readFileSync(fileName, 'utf8');
    const sourceFile = ts.createSourceFile('app.ts', sourceText, {
        languageVersion: ts.ScriptTarget.ES2022,
    });
    const endpoints: { [key: string]: string[] } = {};
    findEndpoints(
        sourceFile,
        sourceFile,
        {
            endpointMethodNames: 'get,post,put,delete',
        },
        endpoints
    );

    for (const [instanceName, paths] of Object.entries(endpoints)) {
        console.log(`==== ${instanceName} ====`);
        for (const path of paths) {
            console.log(path);
        }
    }
}

main();
