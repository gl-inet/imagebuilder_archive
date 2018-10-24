'use strict';

var data = new Date().getTime();
var version = '3.0.67';
var mode = 'product';

// 开发模式并且通过ip访问
if (mode == 'product' && window.location.href.indexOf('chrome-extension') == -1) {
  version = 'v=' + convertToHex(version);
  // 插件访问
} else {
  version = 'v=' + convertToHex(data.toLocaleString());
}

try {
  if (window.localStorage) {
    window.caniuse = true;
  }
} catch (err) {
  window.caniuse = false;
}

// 在字符串对象原型上添加 startsWith 方法 检索字符串中是否存在另一个字符串
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function (searchString, position) {
    position = position || 0;
    // indexOf(检索内容， 检索开始位置)
    return this.indexOf(searchString, position) === position;
  };
}
// base编码加密 decode
function exec(content, context, moduleName) {
  // eval2.js文件
  var a = eval2(base64.tranCode.decode(content));
  context.completeLoad(moduleName);
}

var progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'];
function createXhr() {
  // Would love to dump the ActiveX crap in here. Need IE 6 to die first.
  var xhr, i, progId;
  if (typeof XMLHttpRequest !== 'undefined') {
    return new XMLHttpRequest();
  } else if (typeof ActiveXObject !== 'undefined') {
    for (i = 0; i < 3; i += 1) {
      progId = progIds[i];
      try {
        xhr = new ActiveXObject(progId);
      } catch (e) {}

      if (xhr) {
        progIds = [progId]; // so faster next time
        break;
      }
    }
  }
  return xhr;
}
// 设置本地存储的方法
function getcontent(context, moduleName, url, storage) {
  var xhr = createXhr();
  xhr.open('GET', url, true);
  xhr.send();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      var data = base64.tranCode.encode(xhr.responseText);
      if (storage) {
        storage.setItem(url, JSON.stringify({ data: data, timeout: 30 * 24 * 60 * 60 * 1000, time: new Date().getTime() }));
      }
      exec(data, context, moduleName);
    }
  };
}

require.load = function (context, moduleName, url) {
  var storage = null;
  var data = null;
  if (window.caniuse) {
    storage = window.localStorage;
    data = JSON.parse(storage.getItem(url));
  }
  if (data && storage) {
    var nowTime = new Date().getTime() - data.time;
    if (nowTime < data.timeout) {
      exec(data.data, context, moduleName);
    } else {
      getcontent(context, moduleName, url, storage);
    }
  } else {
    getcontent(context, moduleName, url, storage);
  }
};
function convertToHex(str) {
  var hex = '';
  for (var i = 0; i < str.length; i++) {
    // charCodeAt返回指定位置字符的 Unicode 编码
    hex += '' + str.charCodeAt(i).toString(16);
  }
  return hex;
}
if (window.caniuse) {
  // 清除本地缓存
  window.localStorage.getItem('version') !== version ? window.localStorage.clear() : console.log(version);
  window.localStorage.setItem('version', version);
}
require.config({
  urlArgs: version,
  baseUrl: '/src',
  waitSeconds: 200,
  paths: {
    'jquery': 'lib/jquery',
    'vue': 'lib/vue',
    'language': 'lib/lang/language',
    'vueRouter': 'lib/vue-router.min',
    'vueX': 'lib/vuex.min',
    'text': 'lib/text',
    'css': 'lib/css',
    'lang': 'lib/lang',
    'macaddress': 'lib/macaddress',
    'en': 'lib/lang/en',
    'apn': 'lib/apn-config',
    'promise': 'lib/promise.min',
    'polyfill': 'lib/polyfill.min',
    'bootstrap': 'lib/bootstrap.min',
    'jstz': 'lib/jstz.min',
    'jqueryqrcode':'lib/jqueryqrcode',
    'qrcode':'lib/qrcode',
  },
  shim: {
    'jquery': {
      exports: '$'
    },
    'bootstrap': {
      deps: ['jquery'],
      exports: '$.fn.bootStrap'
    },
    'jqueryqrcode': {
      deps: ['jquery']
    },
    'qrcode': {
      deps: ['jquery']
    },
    'vueX': {
      deps: ['polyfill', 'promise']
    }
  },
  packages: [{
    name: 'component',
    location: 'component'
  }],
  config: {
    text: {
      onXhr: function onXhr(xhr, url) {
        var storage = null;
        var data = null;
        if (window.caniuse) {
          storage = window.localStorage;
          data = JSON.parse(storage.getItem(url));
        }
        if (data && storage) {
          var nowTime = new Date().getTime() - data.time;
          if (nowTime < data.timeout) {
            return base64.tranCode.decode(data.data);
          } else {
            return false;
          }
        } else {
          return false;
        }
      },
      onXhrComplete: function onXhrComplete(xhr, url) {
        var storage = '';
        if (window.caniuse) {
          storage = window.localStorage;
        }
        var data = base64.tranCode.encode(xhr.responseText);
        if (storage) {
          storage.setItem(url, JSON.stringify({ data: data, timeout: 30 * 24 * 60 * 60 * 1000, time: new Date().getTime() }));
        }
      }
    }
  }
});
// Determine the browser version. 判断浏览器版本
function userAgent() {
  var Sys = {};
  var ua = navigator.userAgent.toLowerCase();
  var state = null;
  var isOpera;(state = ua.match(/rv:([\d.]+)\) like gecko/)) ? Sys.ie = state[1] : (state = ua.match(/msie ([\d.]+)/)) ? Sys.ie = state[1] : (state = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = state[1] : (state = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = state[1] : (state = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = state[1] : 0;
  if (ua.indexOf('opr') > -1) {
    Sys.Opera = 'Opera';
    if (Sys.Opera) console.log('Opera: ' + Sys.Opera);
  } else {
    if (Sys.chrome) console.log('Chrome: ' + Sys.chrome);
  }
  if (Sys.ie) {
    console.log('IE: ' + Sys.ie);
    if (parseInt(Sys.ie) < 9) window.location.href = '/upgrade.html';
  }
  if (Sys.firefox) console.log('Firefox: ' + Sys.firefox);
  if (Sys.opera) console.log('Opera: ' + Sys.opera);
  if (Sys.safari) console.log('Safari: ' + Sys.safari);
}
userAgent();
