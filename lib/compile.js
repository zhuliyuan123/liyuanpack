const path = require('path')
const fs = require('fs')
const { getAST, getDependencies, transform } = require("./parser");


module.exports = class Compiler {
    // 接受通过lib/index.js new Compiler(options).run()传入的参数,对应`forestpack.config.js`的配置
    constructor(options){
        //接收forestpack.config.js配置参数，并初始化entry、output
        const { entry,output } = options;
        this.entry = entry;
        this.output = output;
        this.module = [];
    }

    // 开启编译
    run(){
        //开启编译run方法。处理构建模块、收集依赖、输出文件等。
        const entryModule = this.buildModule(this.entry, true);
        this.module.push(entryModule);
        this.module.map((_module) => {
            _module.dependencies.map((dependency)=>{
                this.module.push(this.buildModule(dependency))
            })
        })

        console.log(this.module)

        this.emitFiles();

    }

    // 构建模块相关
    buildModule(filename,isEntry){
        //buildModule方法。主要用于构建模块（被run方法调用）
        let ast;
        if(isEntry){
            ast = getAST(filename)
        }else{
            const absolutePath = path.join(process.cwd(), "./src", filename);
            ast = getAST(absolutePath);
        }
        console.log(ast)
        return{
            filename,  // 文件名称
            dependencies:getDependencies(ast),  // 依赖列表
            transformCode:transform(ast)  // 转化后的代码
        }
    }
    //输出文件
    emitFiles(){
        //emitFiles方法。输出文件（同样被run方法调用）
        const outputPath = path.join(this.output.path,this.output.filename);
        let module = '';
        this.module.map((_module) => {
            module += `'${_module.filename}': function(require,module,exports){${_module.transformCode}},`;
        })

        const bundle = `
          (function(modules){
              function require(fileName){
                  const fn = modules[fileName];
                  const module = {export:{}};
                  fn(require,module,module.exports)
                  return module.exports
              }
              require('${this.entry}')
          })({${module}})
        `;

        //1. webpack 将所有模块（可以理解成文件）包裹于一个函数中，并传入默认参数，将所有模块放入一个数组中
        //这个数组为modules,并通过数组下标来作为 moduleId
        //2.将modules传入一个自执行函数中，自动执行函数中包含一个installModules已经加载过的模块和
        //一个模块加载函数，最后加载入口模块并返回
        //3._webpack_require_ 模块加载，先判断installedModules是否加载，加载过了就直接返回exports数据，
        //没有加载过该模块就通过modules[moduleId].call(module.exports, module, module.exports, __webpack_require__) 
        //执行模块并且将 module.exports 给返回


        //1.经过webpack打包出来是一个匿名闭包函数
        //2.modeles是一个数组，每一项是一个模块初始化函数
        //3.__webpack_require__用来加载模块，返回module.exports
        //4.通过WEBPACK_REQUIRE_METHOD(0)启动程序
        fs.writeFileSync(outputPath, bundle, 'utf-8')
    }

}