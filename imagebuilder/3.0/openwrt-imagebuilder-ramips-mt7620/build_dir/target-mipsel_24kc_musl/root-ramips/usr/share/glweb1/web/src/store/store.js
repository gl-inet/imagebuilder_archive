'use strict';

define(['vue', 'vueX', 'store/api', 'apn', 'store/mock', 'jquery', 'language', 'promise', 'component/gl-message/index'], function (Vue, Vuex, api, apnlist, mock, jquery, language, Promise, message) {
    var apiItem = {};
    Vue.prototype.$lang = language;
    var mode = 'develop'; // 开发模式
    // 不是浏览器访问修改为产品模式
    if (window.location.href.indexOf('chrome-extension') == -1) {
        mode = 'product';
    }
    var ip = '192.168.8.1'; // 当为开发模式时。将此处修改为路由器的host ip地址。
    // ip = "192.168.3.1"
    var host = 'http://' + ip;
    // 生成一个数据列表  键=API 值=数据
    if (Object.keys) {
        // 返回一个对象所有属性的数组
        Object.keys(api).map(function (item) {
            apiItem[item] = {};
        });
    } else {
        for (var key in api) {
            apiItem[key] = {};
        }
    }
    // 删除数组中的某一项，首页动态排版封装用
    Array.prototype.remove = function (val) {
        var index = this.indexOf(val);
        if (index > -1) {
            this.splice(index, 1);
        }
    };
    var state = {
        apiData: apiItem,
        onlist: [],
        offlist: ['waninfo', 'repeater', 'tethering', 'modem'],
        carinfo: [],
        allsorft: [],
        allinternerTimer: "", //ALLTimer的内部定时器
        inetrTimer: "",
        vpnTimer: "",
        allTimer: "",
        lang: '',
        vpnData: [], //vpn功能列表
        vpnlist: [],
        // token: '', 
        animation: ['zoom', 'fade', 'flip', 'door', 'rotate', 'slideUp', 'slideDown', 'slideLeft', 'slideRight'],
        modal: {
            show: false,
            animation: '',
            cb: null,
            cancel: null,
            esc: true,
            title: '',
            message: '',
            yes: '',
            no: '',
            type: "",
            messageTwo: '',
            messageThree: ''
        },
        intermsg: true
    };
    var getters = {
        interMsg: function interMsg(state) {
            return state.intermsg;
        },
        apiData: function apiData(state) {
            return state.apiData;
        },
        modal: function modal(state) {
            return state.modal;
        },
        lang: function lang(state) {
            return state.lang;
        },
        onlist: function onlist(state) {
            return state.onlist;
        },
        offlist: function offlist(state) {
            return state.offlist;
        },
        vpnData: function vpnData(state) {
            return state.vpnData;
        },
        carinfo: function carinfo(state) {
            return state.carinfo;
        },
        allsorft: function allsorft(state) {
            return state.allsorft;
        }
    };
    var actions = {
        // 全局方法 API调用
        call: function call(_ref, payload) {
            var state = _ref.state,
                commit = _ref.commit,
                datacache = false;
            var promise = new Promise(function (resolve) {
                var currentdate = new Date().getTime();
                if (payload.data) {
                    // 使用缓存
                    if (payload.cache) {
                        datacache = true;
                    }
                } else {
                    if (payload.sync) {
                        datacache = false;
                    } else {
                        datacache = true;
                    }
                }
                var Token = window.localStorage.getItem('Token');
                var token = Token ? Token : '';
                var hostip = payload.ip;
                var SyncTime = parseInt(currentdate - state.apiData[payload.api]['lastSync']);
                if (!SyncTime) {
                    SyncTime = 0;
                }
                // 如果是post请求不采用缓存策略。如果是get请求则使用缓存策略，在同一条时间线上不允许在3s内再次发起请求，对请求时间线进行清理。减少服务器数据的压力。
                if (datacache && state.apiData[payload.api]['lastSync'] && SyncTime < 3000 && payload.api.indexOf("status") != -1) {
                    // console.log("重复请求: ", payload.api, api[payload.api]);
                    resolve(state.apiData[payload.api]);
                } else {
                    // 记录请求的最后时间
                    commit('setSyncTime', { api: payload.api, lastSync: currentdate });
                    var contentType = payload.contentType;
                    var processData = payload.processData;
                    if (Object.prototype.toString.call(payload.data).split(' ')[1].split(']')[0] == 'FormData') {
                        contentType = false;
                        processData = false;
                    }
                    // ip没有传入
                    if (!hostip) {
                        // 产品模式直接通过域名访问api 开发模式通过192.168.8.1
                        hostip = mode == 'develop' ? host + api[payload.api] : api[payload.api];
                    } else {
                        hostip = 'http://' + payload.ip + api[payload.api];
                    }
                    // mock数据 
                    if (payload.mock) {
                        var mockData = {};
                        if (payload.mock == 'error') {
                            mockData.api = payload.api;
                            mockData.failed = true;
                            mockData.unsuccess = true;
                            mockData.errMsg = 'not data';
                            commit('setApiData', mockData);
                            resolve(state.apiData[payload.api]);
                        } else {
                            mockData = mock[payload.api];
                            mockData.api = payload.api;
                            // mockData.lastSync = new Date().getTime();
                            if (mock[payload.api].code == 0) {
                                mockData.success = true;
                            } else {
                                mockData.success = false;
                            }
                            // mockData.unsuccess = false;
                            commit('setApiData', mockData);
                            resolve(state.apiData[payload.api]);
                        }
                    } else {
                        jquery.ajax({
                            url: hostip,
                            data: payload.data,
                            type: payload.data == null ? 'get' : 'post', // data不存在为get请求
                            cache: false, // 不使用缓存 每次都会向服务器请求
                            dataType: payload.dataType == null ? 'json' : payload.dataType,
                            beforeSend: function beforeSend(request) {
                                // 携带token
                                request.setRequestHeader("Authorization", token);
                            },
                            contentType: contentType,
                            processData: processData,
                            timeout: payload.timeOut == null ? 15000 : payload.timeOut,
                            success: function success(result) {
                                result.api = payload.api;
                                // 记录请求返回时间
                                result.lastSync = new Date().getTime();
                                // 更新store中的数据
                                commit('setApiData', result);
                                if (result.code == 0) {
                                    result.success = true;
                                } else {
                                    result.success = false;
                                }
                                if (result.token) {
                                    commit('setToken', result);
                                }
                                if (result.code == -1) {
                                    window.location.href = '/';
                                }
                                resolve(result);
                            },
                            error: function error(XMLHttpRequest, textStatus, errorThrown) {
                                var result = {};
                                if (textStatus == "timeout") {
                                    result.timeout = true;
                                    result.code = -6;
                                    state.apiData[payload.api].code = -6;
                                }
                                // console.log("Api Error： " + payload.api, '超时：' + result.timeout);
                                result.api = payload.api;
                                result.success = false;
                                result.failed = true;
                                resolve(result);
                            }
                        });
                    }
                }
            });
            return promise;
        },
        // 全局方法 在扫描wifi成功之后调用 wifi列表排序
        getWifi: function getWifi(_ref2) {
            var state = _ref2.state,
                commit = _ref2.commit;

            var promise = new Promise(function (resolve) {
                commit('sortWifi');
                resolve(state.apiData['scanwifi']);
            });
            return promise;
        },
        // stroe方法 获取VPN列表 在setTimer中调用
        getAppList: function getAppList(_ref2) {
            var state = _ref2.state,
                commit = _ref2.commit,
                dispatch = _ref2.dispatch;
            dispatch('call', { api: 'getapplist' }).then(function (result) {
                if (result.success) {
                    if (result.applist) {
                        var vpnList = [];
                        for (var i = 0; i < result.applist.length; i++) {
                            switch (result.applist[i]) {
                                case 'OpenVPN-Client':
                                    vpnList.push({ 'router': 'vpnclient', 'name': 'OpenVPN Client', "api": "ovpngetclientstatus" });
                                    break;
                                case 'OpenVPN-Server':
                                    vpnList.push({ 'router': 'vpnserver', 'name': 'OpenVPN Server' });
                                    break;
                                case 'Shadowsocks-Client':
                                    vpnList.push({ 'router': 'ssclient', 'name': 'SS Client', "api": "ssclientstatus" });
                                    break;
                                case 'Shadowsocks-Server':
                                    vpnList.push({ 'router': 'ssserver', 'name': 'SS Server' });
                                    break;
                                case 'WireGuard-Client':
                                    vpnList.push({ 'router': 'wgclient', 'name': 'WireGuard® Client', "api": "wgcstatus" });
                                    break;
                                case 'WireGuard-Server':
                                    vpnList.push({ 'router': 'wgserver', 'name': 'WireGuard® Server' });
                                    break;
                            }
                        }
                        // 获取路由器支持的vpn功能client列表
                        commit("getVpnData", vpnList);
                    }
                }
            });
        },
        // 全局一直调用的定时器  三个api
        setALLtimer: function setALLtimer(_ref2) {
            var state = _ref2.state,
                dispatch = _ref2.dispatch,
                commit = _ref2.commit;
            dispatch('getAppList'); // vpn列表
            dispatch('call', { api: 'stainfo' }).then(function (result) {
                if (result.success) {
                    if (result.ip && result.enabled) {
                        setTimeout(function () {
                            commit('setonlist', { data: 'repeater' });
                        }, 600);
                    } else {
                        commit('setofflist', { data: 'repeater' });
                    }
                } else {
                    commit('setofflist', { data: 'repeater' });
                }
            });

            clearInterval(state.allTimer);
            state.allTimer = setInterval(function () {
                dispatch('getAppList'); // vpn列表
                if (state.apiData['stainfo'].code != -17) dispatch('call', { api: 'stainfo' }).then(function (result) {
                    if (result.success) {
                        if (result.ip && result.enabled) {
                            commit('setonlist', { data: 'repeater' });
                        } else {
                            commit('setofflist', { data: 'repeater' });
                        }
                    } else {
                        commit('setofflist', { data: 'repeater' });
                    }
                });
            }, 5000);
            //  网络状态
            clearInterval(state.allinternerTimer);
            state.allinternerTimer = setInterval(function () {
                dispatch("call", { api: 'internetreachable', timeOut: 100000 });
            }, 10000);
        },
        // 四种上网方式
        setinter: function setinter(_ref2) {
            var state = _ref2.state,
                dispatch = _ref2.dispatch,
                commit = _ref2.commit;
            clearInterval(state.inetrTimer);
            state.inetrTimer = setInterval(function () {
                if (state.apiData['teinfo'].code != -17) dispatch('call', { api: 'teinfo' });
                if (state.apiData['waninfo'].code != -17) dispatch("call", { api: "waninfo" });
                if (state.apiData['moInfo'].code != -17) dispatch("call", { api: "moInfo" }).then(function (result) {
                    if (result.success) {
                        commit("setonlist", { data: "modem" });
                    } else if (result.code == "-17" || result.code == "-3") {
                        commit("removeInter", { data: "modem" });
                    } else {
                        commit("setonlist", { data: "modem" });
                    }
                });
            }, 5000);
        },
        // VPN定时器 根据vpn客户端的数量决定调用几个api 
        setvpn: function setvpn(_ref2) {
            var state = _ref2.state,
                dispatch = _ref2.dispatch;
            dispatch("call", { api: 'ovpngetclientstatus' });
            dispatch("call", { api: 'ssclientstatus' });
            dispatch("call", { api: 'wgcstatus' });
            clearInterval(state.vpnTimer);
            state.vpnTimer = setInterval(function () {
                if (state.apiData['ovpngetclientstatus'].code != -3) dispatch("call", { api: 'ovpngetclientstatus' });
                if (state.apiData['ssclientstatus'].code != -3) dispatch("call", { api: 'ssclientstatus' });
                if (state.apiData['wgcstatus'].code != -3) dispatch("call", { api: 'wgcstatus' });
            }, 5000);
        }
    };

    // 暴露的全局同步方法
    var mutations = {
        setInterMsm: function setInterMsm(state, payload) {
            state.intermsg = payload;
        },
        // 哪种VPN存在就调用哪种状态
        getVpnData: function getVpnData(state, payload) {
            state.vpnData = payload;
        },
        // 将当前API请求的数据同步到state.apiData中
        setApiData: function setApiData(state, payload) {
            state.apiData[payload.api] = payload;
        },
        // 保存token
        setToken: function setToken(state, payload) {
            // state.token = payload.token
            window.localStorage.setItem('Token', payload.token);
        },
        setSyncTime: function setSyncTime(state, payload) {
            state.apiData[payload.api]['lastSync'] = payload.lastSync;
        },
        setAllSorft: function setAllSorft(state, payload) {
            state.allsorft = payload;
        },
        // 设置语言
        setLang: function setLang(state, payload) {
            state.lang = payload.lang;
        },
        // wifi列表排序
        sortWifi: function sortWifi(state) {
            state.apiData['scanwifi']['wifis'].sort(function (a, b) {
                return b.signal - a.signal;
            });
        },
        // 全局一直调用定时器
        clearallTimer: function clearallTimer(state) {
            clearInterval(state.allTimer);
        },
        // 是否联网定时器
        clearInterTimer: function clearInterTimer(state) {
            clearInterval(state.allinternerTimer);
        },
        // 四种网络状态定时器
        clearTimer: function clearTimer(state) {
            clearInterval(state.inetrTimer);
        },
        // vpn状态定时器
        clearvpnTimer: function clearvpnTimer(state) {
            clearInterval(state.vpnTimer);
        },
        // 上线添加 => 条件是 API请求成功
        setonlist: function setonlist(state, payload) {
            if (state.onlist.indexOf(payload.data) < 0) {
                // if (payload.data == 'waninfo' || payload.data == 'repeater') {
                state.onlist.unshift(payload.data);
                // } else {
                //     state.onlist.push(payload.data);
                // }
                state.offlist.remove(payload.data);
                // 移动到顶端
                $("html,body").animate({ scrollTop: 0 }, 500);
            }
        },
        // 下线移除 => 条件是 API请求失败 或者一些code值为负
        setofflist: function setofflist(state, payload) {
            if (state.offlist.indexOf(payload.data) < 0) {
                state.offlist.push(payload.data);
                state.onlist.remove(payload.data);
                if (state.offlist.length == 4) {
                    state.offlist = ['waninfo', 'repeater', 'tethering', 'modem'];
                }
            }
        },
        // 路由器不支持该功能直接移除
        removeInter: function removeInter(state, payload) {
            if (state.offlist.indexOf(payload.data) >= 0) {
                state.offlist.remove(payload.data);
            } else {
                state.onlist.remove(payload.data);
            }
        },
        // 在mdoem.js中调用
        getapns: function getapns(state, payload) {
            var mcc = payload.mcc || '000';
            var mnc = payload.mnc || '000';
            var carrial = apnlist.apns.apn.filter(function (val) {
                return val['-mcc'] == mcc;
            });
            var carinfo = carrial.filter(function (val) {
                return val['-mnc'] == mnc;
            });
            if (!carinfo.length) {
                var mncData = mnc.substr(0, 2);
                carinfo = carrial.filter(function (val) {
                    return val['-mnc'] == mncData;
                });
            }
            // 最多支持四个模块
            if (state.carinfo.length <= 3) {
                state.carinfo.push(carinfo);
            }
        },
        checkapns: function checkapns(state) {
            state.carinfo = [];
        },
        changeVal: function changeVal(state, payload) {
            payload.data[payload.attr] = payload.val;
        },
        showModal: function showModal(state, payload) {
            state.modal.show = payload.show ? payload.show : true;
            state.modal.animation = payload.animation ? payload.animation : state.animation[parseInt(Math.random() * 10)];
            state.modal.title = payload.title ? payload.title : 'Caution';
            state.modal.yes = payload.yes ? payload.yes : 'Yes';
            state.modal.no = payload.no ? payload.no : 'No';
            state.modal.type = payload.type ? payload.type : 'default';
            state.modal.message = payload.message ? payload.message : 'message';
            state.modal.messageTwo = payload.messageTwo ? payload.messageTwo : '';
            state.modal.messageThree = payload.messageThree ? payload.messageThree : '';
            state.modal.esc = state.modal.esc ? state.modal.esc : true;
            state.modal.cb = payload.cb ? payload.cb : null;
            state.modal.cancel = payload.cancel ? payload.cancel : null;
        },
        hideModal: function hideModal(state) {
            state.modal.show = false;
            state.modal.animation = '';
            state.modal.message = '';
            state.modal.title = '';
            state.modal.cb = null;
            state.modal.cancel = null;
        }
    };
    Vue.use(Vuex);
    Vue.config.debug = true; // 1.为所有的警告打印栈追踪  2.把所有的锚节点以注释节点显示在 DOM 中，更易于检查渲染结果的结构。
    var store = new Vuex.Store({
        state: state,
        actions: actions,
        getters: getters,
        mutations: mutations,
        strict: false
    });
    return store;
});