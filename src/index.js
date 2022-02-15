// 将源代码解析成AST
const parser = require('@babel/parser');
// 工具类，用来遍历AST树
const traverse = require('@babel/traverse').default;
const core = require('@babel/core');
const { transformFromAstSync } = core;

// 为parser提供模版引擎
const template = require('@babel/template');
// 主要用于处理节点类型相关的问题（判断、创建)
const types = require('@babel/types');
// 编写webpack loader的官方工具库
const loaderUtils = require('loader-utils');

const defaultCatchCode = `console.error(err)`;

// 自动生成Promise的catch方法
function generatePromiseCatch(path, catchStatement) {
    // node 当前节点 parentPath:父节点
    const { node, parentPath } = path;
    const parentNode = parentPath.node;

    // 如果已经有了catch 就return
    if (
        types.isIdentifier(parentNode.property) &&
        parentNode.property.name === 'catch'
    ) {
        return;
    }

    // 如果是xxx.then(callback).then(callback)情况，只会在最后一个then后面加入catch
    if (
        types.isIdentifier(parentNode.property) &&
        parentNode.property.name === 'then' &&
        types.isIdentifier(node.callee.property) &&
        node.callee.property.name === 'then'
    ) {
        return;
    }

    if (
        types.isIdentifier(node.callee.property) &&
        node.callee.property.name === 'then'
    ) {
        
        // 由原始函数创建 xxx.then(callback).catch(callback)
        const originThen = types.callExpression(node.callee, node.arguments);
        originThen.arguments = node.arguments;
        const thenCatch = types.memberExpression(
            originThen,
            types.identifier('catch')
        );
        // 创建catch函数
        const defaultArrowFunc = types.functionExpression(
            null,
            [types.identifier('err')],
            types.blockStatement([catchStatement])
        );
        const originExpress = types.callExpression(thenCatch, [
            defaultArrowFunc,
        ]);

        path.replaceWith(originExpress);
    }
}

module.exports = function (source) {
    // 获取loader传递的options
    const options = loaderUtils.getOptions(this);

    // 创建catch回调函数的函数体字符串
    const catchStatement = template.statement(
        options.catchCode || defaultCatchCode
    )();

    // 1. 源码解析成AST
    let ast = parser.parse(source, {
        sourceType: 'module',
    });

    // 2. 遍历
    traverse(ast, {
        CallExpression: function CallExpression(path, state) {
            try {
                generatePromiseCatch(path, catchStatement);
            } catch (err) {
                throw err;
            }
        },
    });

    // 3. 将AST转换成CODE
    return transformFromAstSync(ast).code;
};
