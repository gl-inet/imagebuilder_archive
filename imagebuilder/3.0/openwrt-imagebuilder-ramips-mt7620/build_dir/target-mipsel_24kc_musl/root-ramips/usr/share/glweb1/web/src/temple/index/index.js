"use strict";

define(["text!temple/index/index.html", "component/gl-btn/index", "vue", "component/gl-select/index", "component/modal/modal", "component/gl-loading/index", "component/gl-input/index", "component/gl-label/index", "component/gl-toggle-btn/index", "component/gl-tooltip/index"], function (stpl, gl_btn, Vue, gl_select, gl_modal, gl_loading, gl_input, gl_label, gl_switch, gl_tooltip) {
    var vueComponent = Vue.extend({
        template: stpl,
        name: "app",
        data: function data() {
            return {
                appliedMessages: ["Reboot", "are you sure", "✔"],
                language: ["English", "简体中文", '繁体中文', "Deutsch", "Français", "Español"],
                routermode: "router", // 桥接模式
                webLang: 'EN',
                loading: true
            };
        },
        components: {
            "gl-select": gl_select,
            "gl-loading": gl_loading
        },
        computed: {
            // 首屏展示状态 全局循环调用
            router: function router() {
                return this.$store.getters.apiData["router"];
            },
            // 当前语言
            lan: function lan() {
                return this.$store.getters.lang;
            },
            // 弹框
            modal: function modal() {
                return this.$store.getters.modal;
            },
            // 语言栏显示当前语言
            lang: function lang() {
                var item = "English";
                switch (this.lan) {
                    case "CN":
                        item = "简体中文";
                        break;
                    case "EN":
                        item = "English";
                        break;
                    case "DE":
                        item = "Deutsch";
                        break;
                    case "FR":
                        item = "Français";
                        break;
                    case "SP":
                        item = "Español";
                        break;
                    case "TC":
                        item = "繁体中文";
                        break;
                }
                return item;
            },
            // 路由器wifi信息
            getaps: function getaps() {
                return this.$store.getters.apiData["getaps"];
            },
            // VPN功能列表
            vpnlist: function vpnlist() {
                return this.$store.getters.vpnData;
            },
            // WAN口连接网络信息
            waninfo: function waninfo() {
                return this.$store.getters.apiData["waninfo"];
            },
            // 中继网络信息
            stainfo: function stainfo() {
                return this.$store.getters.apiData["stainfo"];
            },
            // 3G/4G模块信息
            moInfo: function moInfo() {
                return this.$store.getters.apiData["moInfo"];
            },
            // 模块列表
            modems: function modems() {
                return this.moInfo.modems;
            },
            // 模块拨号状态
            mostatus: function mostatus() {
                var modems = this.modems || [];
                if (this.modems && this.modems.length > 0) {
                    for (var i = 0; i < modems.length; i++) {
                        if (modems[i].up == 'on') {
                            return true;
                        }
                    }
                }
                return false;
            },
            // tethering信息
            teinfo: function teinfo() {
                return this.$store.getters.apiData["teinfo"];
            },
            // 通过wifi连接的设备数量
            wifiNum: function wifiNum() {
                return this.router.wifi_cli_count != 0 ? this.router.wifi_cli_count : 0;
            },
            // 通过lan口连接的设备数量
            lanNum: function lanNum() {
                return this.router.lan_cli_count != 0 ? this.router.lan_cli_count : 0;
            },
            // 自动更新
            checkfirmware: function checkfirmware() {
                return this.$store.getters.apiData["checkfirmware"];
            },
            // 中继wifi标识高亮
            wifiIconActive: function wifiIconActive() {
                return this.stainfo.ip && this.stainfo.enabled;
            },
            // 有无网络连接
            staActive: function staActive() {
                return this.$store.getters.apiData["internetreachable"]["reachable"] == null ? true : this.$store.getters.apiData["internetreachable"]["reachable"];
            },
            // VPN功能列表
            getapplist: function getapplist() {
                return this.$store.getters.apiData['getapplist'];
            },
            vpnstatus: function vpnstatus() {
                return this.$store.getters.apiData['ovpngetclientstatus'];
            },
            ssstatus: function ssstatus() {
                return this.$store.getters.apiData['ssclientstatus'];
            },
            wrstatus: function wrstatus() {
                return this.$store.getters.apiData['wgcstatus'];
            },
            // router_ddns: function router_ddns() {
            //     return this.$store.getters.apiData['router_ddns'];
            // },
            // ddns: function ddns() {
            //     return this.router_ddns.ddns;
            // },
            // 路由器型号图片
            appIcon: function appIcon() {
                if (this.router.model) {
                    var model = this.router.model;
                    if (model.toLowerCase().indexOf('usb') != -1) {
                        return "usb-router";
                    } else if (model == 'ar750') {
                        return "ar750-router";
                    } else if (model == 'ar750s') {
                        return "ar750s-router";
                    } else if (model.toLowerCase().indexOf('ar300m') != -1) {
                        return 'ar300m-router';
                    } else if (model.toLowerCase().indexOf('ar150') != -1) {
                        return 'ar300m-router';
                    } else if (model.toLowerCase().indexOf('mt300n-v2') != -1) {
                        return 'ar300m-router';
                    } else if (model.toLowerCase().indexOf('mt300n') != -1) {
                        return 'ar300m-router';
                    } else if (model.toLowerCase().indexOf('mt300a') != -1) {
                        return 'ar300m-router';
                    } else if (model.toLowerCase().indexOf('x750') != -1) {
                        return 'x750-router';
                    } else if (model.toLowerCase().indexOf('s1300') != -1) {
                        return 'b1300-router';
                    } else if (model.toLowerCase().indexOf('b1300') != -1) {
                        return 'b1300-router';
                    } else {
                        return "mini-router";
                    }
                }
            },
            phoneInter: function phoneInter() {
                if (this.router.model == 'usb150') {
                    if (this.wifiIconActive) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    if (this.wifiIconActive || this.waninfo.ip || this.teinfo.ip || this.mostatus) {
                        return true;
                    } else {
                        return false;
                    }
                }
            },
            settings: function settings() {
                return this.router.has_sw && this.routermode == 'router' && this.router.model != 'vixmini' && this.router.model != 'usb150' && this.router.model != 'x750';
            },
            vpnActive: function vpnActive() {
                return this.routermode == 'router' && this.router.model != 'vixmini';
            },
            share: function share() {
                return this.router.model != 'vixmini' && this.router.model != 'usb150';
            },
            vixmini: function vixmini() {
                return this.router.model != 'vixmini';
            },
            modemicon: function modemicon() {
                return this.moInfo.code != -17 && this.moInfo.code != -3 && this.router.model != 'usb150' && this.router.model != 'vixmini';
            },
            teicon: function teicon() {
                return this.teinfo.code != -17 && this.router.model != 'usb150' && this.router.model != 'vixmini';
            },
            wanicon: function wanicon() {
                return this.waninfo.code != -17 && this.router.model != 'usb150';
            },
            intermsg: function intermsg() {
                return this.$store.getters.interMsg;
            },
            noInter: function noInter() {
                return !this.staActive && !this.stainfo.gateway && this.router.ip_addr !== this.stainfo.gateway && !this.waninfo.gateway && this.router.ip_addr !== this.waninfo.gateway && !this.teinfo.gateway && this.intermsg;
            },
            hideVpn: function hideVpn() {
                if (this.lan == 'CN') {
                    return false;
                }
                return true;
            }
        },
        beforeCreate: function beforeCreate() {
            var that = this;
            // that.$store.dispatch('call', { api: 'router_ddns' });
            that.$store.dispatch('call', { api: 'router' }).then(function (result) {
                that.loading = false;
                if (result.success) {
                    that.routermode = result.mode;
                    that.wifimode = result.mode;
                    if (result.mode !== 'router') {
                        that.$router.push('wlan');
                        // 非路由模式禁用
                        that.$store.commit("clearInterTimer"); // 全局一直网络状态定时器
                    }
                }
            });
            // 首屏状态 全局循环调用
            setInterval(function () {
                that.$store.dispatch('call', { api: 'router' });
            }, 5000);
            // this.$store.dispatch("setinter"); // 上网状态定时器
            // this.$store.dispatch("setvpn"); // vpn定时器
            this.$store.dispatch("setALLtimer"); // 全局一直调用定时器 repeater vpnlist reachable
        },
        methods: {
            routerPush: function routerPush(item) {
                if (this.router.mode != 'router') {
                    return;
                }
                this.$router.push(item);
            },
            geclass: function geclass(name) {
                return "clsLink2" + name + " bar";
            },
            onShow: function onShow(animation) {
                this.modal.animation = animation;
                this.modal.show = true;
            },
            showHide: function showHide() {
                $("#ulLogo").toggleClass("ulShow");
                $("sub").toggle();
            },
            // modal取消按钮
            CancelFirm: function CancelFirm() {
                this.modal.cancel ? this.modal.cancel() : null;
                this.$store.commit("hideModal");
            },
            // modal确定按钮
            comfirm: function comfirm() {
                this.modal.cb ? this.modal.cb() : null;
                this.$store.commit("hideModal");
            },
            setlang: function setlang(data) {
                var lang = "";
                var that = this;
                switch (data) {
                    case "简体中文":
                        lang = "CN";
                        break;
                    case "English":
                        lang = "EN";
                        break;
                    case "Deutsch":
                        lang = "DE";
                        break;
                    case "Français":
                        lang = "FR";
                        break;
                    case "Español":
                        lang = "SP";
                        break;
                    case "繁体中文":
                        lang = "TC";
                        break;
                }
                this.webLang = lang;
                // 插件储存
                that.$translate.setLang(lang);
                // 后台储存
                this.$store.dispatch("call", {
                    api: "setlanguage", data: {
                        language: lang
                    }
                }).then(function (result) {
                    if (result.success) {
                        that.$store.commit("setLang", { lang: lang });
                    }
                });
            },
            logout: function logout() {
                var that = this;
                this.$store.dispatch('call', { api: "logout" }).then(function (result) {
                    if (result.success) {
                        window.location.href = "/login";
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "logout",
                            "msg": result.code
                        });
                        return;
                    }
                });
            },
            toggleNav: function toggleNav(e) {
                if ($(e.target).hasClass("bar")) {
                    $("#navbar-ex1-collapse").removeClass("in");
                }
            },
            reboot: function reboot() {
                this.$store.commit("showModal", {
                    show: true,
                    title: "Caution",
                    message: this.$lang.modal.isReboot,
                    cb: function cb() {
                        if (window.caniuse) {
                            sessionStorage.setItem("callfunction", "reboot");
                        }
                        window.location.href = "/process.html?action=reboot";
                    }
                });
            },
            changeCollapse: function changeCollapse(item) {
                var routers = ["system", "moresetting", "vpn"];
                var ie = this.userAgent();
                if (ie) {
                    return;
                }
                var router;
                var len = routers.length;
                for (var i = 0; i < len; i++) {
                    router = routers[i];
                    if (item == router) {
                        $('#' + router).collapse("show");
                    } else {
                        $('#' + router).collapse("hide");
                    }
                }
            },
            userAgent: function userAgent() {
                var Sys = {};
                var ua = navigator.userAgent.toLowerCase();
                var state = null;
                var isOpera; (state = ua.match(/rv:([\d.]+)\) like gecko/)) ? Sys.ie = state[1] : (state = ua.match(/msie ([\d.]+)/)) ? Sys.ie = state[1] : (state = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = state[1] : (state = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = state[1] : (state = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = state[1] : 0;
                if (Sys.ie && parseInt(Sys.ie) <= 9) {
                    return true;
                }
                return false;
            }
        }
    });
    return vueComponent;
});