import { readFileSync } from 'fs';
import ts from 'typescript';

interface Config {
    endpointMethodNames: string;
    endpointAppName: string;
}

function findEndpoints(
    node: ts.Node,
    sourceFile: ts.SourceFile,
    config: Config
) {
    let endpoints: string[] = [];
    ts.forEachChild(node, (n) => {
        endpoints = [...endpoints, ...findEndpoints(n, sourceFile, config)];
    });
    if (
        !ts.isCallExpression(node) ||
        !ts.isPropertyAccessExpression(node.expression)
    ) {
        return endpoints;
    }
    const propAccess = node.expression;
    const name = propAccess.name.text;
    const instanceName = propAccess.expression.getText(sourceFile);
    if (!(config?.endpointMethodNames?.split(',') ?? []).includes(name)) {
        return endpoints;
    }
    if (!(config?.endpointAppName?.split(',') ?? []).includes(instanceName)) {
        return endpoints;
    }

    const path = node.arguments[0]?.getText(sourceFile).split("'")[1];
    endpoints = [...endpoints, path];
    return endpoints;
}

function isTopLevelArrowFunction(node: ts.Node): boolean {
    if (ts.isArrowFunction(node)) {
        return true;
    }
    if (!ts.isVariableStatement(node)) {
        return false;
    }
    const declaration = node.declarationList.declarations[0];
    if (!declaration || !ts.isVariableDeclaration(declaration)) {
        return false;
    }
    const initializer = declaration.initializer;
    if (!initializer) {
        return false;
    }
    return ts.isArrowFunction(initializer);
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
    const endpoints = findEndpoints(sourceFile, sourceFile, {
        endpointAppName: 'app,router',
        endpointMethodNames: 'get,post,put,delete',
    });
    console.log(endpoints.join('\n'));
}

main();
