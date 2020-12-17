const fs = require('fs')


const parser = require("@babel/parser");   //用于码源生成AST
const traverse = require("@babel/traverse").default; //对于AST节点进行递归遍历
const { transformFromAst } = require("babel-core"); // 将获取的ES6的AST转成ES5

// parser.js中的主要3个方法：
// getAST： 将获取到的模块内容 解析成AST语法树
// getDependencies：遍历AST，将用到的依赖收集起来
// transform：把获得的ES6的AST转化成ES5

module.exports = {
    // 解析我们的代码生成AST抽象语法树
    getAST: (path)=>{
        const source = fs.readFileSync(path,"utf-8");
        return parser.parse(source,{
            sourceType:'module'
        })
    },

    // 对AST节点进行递归遍历
    getDependencies: (ast) => {
        const dependencies = []
        traverse(ast,{
            ImportDeclaration:({node}) => {
                dependencies.push(node.source.value)
            }
        })
        console.log(dependencies)
        return dependencies;
    },

    //获取ES6的AST转化成ES5
    transform:(ast) => {
        const { code } = transformFromAst(ast,null,{
            presets:['env']
        })
        return code;
    }

}