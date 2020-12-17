
          (function(modules){
              function require(fileName){
                  const fn = modules[fileName];
                  const module = {export:{}};
                  fn(require,module,module.exports)
                  return module.exports
              }
              require('D:\项目\测试项目\forestpack\src\index.js')
          })({'D:\项目\测试项目\forestpack\src\index.js': function(require,module,exports){"use strict";

var _greeting = require("./greeting");

document.write((0, _greeting.greeting)('爸爸'));},})
        