import ts from 'typescript';
import { SplitStep } from '../types';

function findEndpoints(
    node: ts.Node,
    sourceFile: ts.SourceFile,
    config: SplitStep['config']
): SplitStep['codes'] {
    if (!config?.extractEndpoint) {
        return [];
    }
    const counts: { [key: string]: number } = {};
    let endpoints: SplitStep['codes'] = [];
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
    const pathString = node.arguments[0]?.getText(sourceFile);
    let functionName = (name + '_' + pathString)?.replace(
        /[^a-zA-Z0-9]+/g,
        '_'
    );
    const count = counts[functionName];
    counts[functionName] = (counts[functionName] || 0) + 1;
    if (count > 1) {
        functionName += '_' + counts[functionName];
    }

    const content = node.getText(sourceFile);
    const start = node.getStart(sourceFile);
    endpoints = [
        ...endpoints,
        {
            start,
            end: start + content.length,
            text: content,
        },
    ];
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

function findFunctions(
    node: ts.Node,
    sourceFile: ts.SourceFile,
    config: SplitStep['config']
): SplitStep['codes'] {
    if (!config?.extractFunction) {
        return [];
    }
    let functions: SplitStep['codes'] = [];
    ts.forEachChild(node, (n) => {
        if (!ts.isFunctionLike(n) && !isTopLevelArrowFunction(n)) {
            return;
        }

        const content = n.getText(sourceFile);
        const start = n.getStart(sourceFile);
        functions.push({
            start,
            end: start + content.length,
            text: content,
        });
    });

    return functions;
}

export function splitCode(
    sourceText: string,
    config: SplitStep['config']
): SplitStep['codes'] {
    const sourceFile = ts.createSourceFile('app.ts', sourceText, {
        languageVersion: ts.ScriptTarget.ES2022,
    });
    const functions = findFunctions(sourceFile, sourceFile, config);
    const endpoints = findEndpoints(sourceFile, sourceFile, config);
    return [...functions, ...endpoints];
}
