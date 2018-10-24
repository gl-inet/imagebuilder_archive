"use strict";

define(["text!temple/bridge/index.html", "css!temple/bridge/index.css", "vue", "component/gl-toggle-btn/index", "component/gl-tooltip/index", "component/gl-btn/index", "component/gl-loading/index", "component/gl-select/index", "component/gl-label/index", "component/gl-input/index", "component/modal/modal"], function (stpl, css, Vue, gl_switch, gl_tooltip, gl_btn, gl_loading, gl_select, gl_label, gl_input, modal) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                mode: "",
                page: "one",
                wifiload: false,
                wifidata: [],
                joinStatus: false,
                curSelect: [],
                modeState: "",
                usname: "",
                psw: "",
                lanip: "",
                startModalWDS: false,
                startModalEXT: false,
                msgModal: true,
                timer: ''
            };
        },
        components: {
            "gl-switch": gl_switch,
            "gl-select": gl_select,
            "gl-tooltip": gl_tooltip,
            "gl-btn": gl_btn,
            "gl-loading": gl_loading,
            "gl-label": gl_label,
            "gl-input": gl_input,
            "gl-modal": modal
        },
        beforeRouteEnter: function beforeRouteEnter(to, from, next) {
            next(function (vm) {
                $("#router-visual").slideUp();
                $(".bar.active").removeClass("active");
                // $(".clsLink2applications").addClass("active");
                setTimeout(function () {
                    if ($(".clsLink2" + vm.$route.path.split("/")[1]).hasClass("bar")) {
                        $(".bar.active").removeClass("active");
                        $(".clsLink2" + vm.$route.path.split("/")[1]).addClass("active");
                        $("#vpn").collapse("hide");
                        $("#moresetting").collapse("show");
                        $("#applications").collapse("hide");
                        $("#system").collapse("hide");
                    }
                }, 50);
            });
        },
        computed: {
            bridgeMode: function bridgeMode() {
                return this.$store.getters.apiData["bridge_get"];
            },
            stainfo: function stainfo() {
                return this.$store.getters.apiData["stainfo"];
            },
            waninfo: function waninfo() {
                return this.$store.getters.apiData['waninfo'];
            },
            router: function router() {
                return this.$store.getters.apiData['router'];
            },
            apmode: function apmode() {
                return this.router.model != 'vixmini' && this.router.model != 'usb150' && this.bridgeMode.bridge != 'wds' && this.bridgeMode.bridge != 'relay';
            },
            wdsmode: function wdsmode() {
                return this.router.model != 'vixmini' && this.bridgeMode.bridge != 'ap' && this.bridgeMode.bridge != 'relay';
            },
            relaymode: function relaymode() {
                return this.bridgeMode.bridge != 'ap' && this.bridgeMode.bridge != 'wds';
            }
        },
        mounted: function mounted() {
            var that = this;
            if (that.bridgeMode && that.bridgeMode.bridge) {
                that.mode = that.bridgeMode.bridge;
            } else {
                that.$store.dispatch("call", {
                    api: "bridge_get"
                }).then(function (result) {
                    if (result.success) {
                        if (result.bridge) {
                            that.mode = result.bridge;
                        }
                    }
                });
            }
        },
        methods: {
            checkMode: function checkMode() {
                var that = this;
                if (this.page == 'two') {
                    this.joinWifi();
                    return;
                }
                // router ap模式
                if (this.mode == "router" || this.mode == "ap") {
                    if (this.mode == 'ap') {
                        // 网络 mac地址检查
                        this.$store.dispatch("call", {
                            api: "waninfo"
                        }).then(function (result) {
                            if (result.cableinwan) {
                                if (result.macclone) {
                                    that.$message({
                                        type: "warning",
                                        msg: -6001
                                    });
                                } else {
                                    that.checkBridge();
                                }
                            } else {
                                that.$message({
                                    type: "warning",
                                    msg: -5002
                                });
                            }
                        });
                    } else {
                        that.checkBridge();
                    }
                } else {
                    //无限桥接模式
                    this.$store.dispatch("call", {
                        api: "waninfo"
                    }).then(function (result) {
                        if (result.cableinwan) {
                            that.$message({
                                type: "warning",
                                msg: -6000
                            });
                        } else {
                            if (result.macclone) {
                                that.$message({
                                    type: "warning",
                                    msg: -6001
                                });
                            } else {
                                that.page = 'two';
                                that.scanwifi();
                            }
                        }
                    });
                }
            },
            // 切换为ap router模式
            checkBridge: function checkBridge() {
                var that = this;
                that.joinStatus = true;
                clearTimeout(that.timer);
                that.$store.dispatch("call", {
                    api: "bridge_set",
                    data: {
                        mode: this.mode
                    },
                    timeOut: 32000
                }).then(function (result) {
                    if (result.success) {
                        if (that.mode == 'router') {
                            that.$message({
                                type: "info",
                                msg: that.t("You are being redirected to the new IP") + '：http://' + result.ip,
                                duration: 15000
                            });
                            that.timer = setTimeout(function () {
                                that.joinStatus = false;
                                window.location.href = "http://" + result.ip;
                            }, 15000);
                        } else {
                            that.timer = setTimeout(function () {
                                that.joinStatus = false;
                                that.startModalWDS = true;
                            }, 15000);
                        }
                    } else {
                        that.$message({
                            type: "error",
                            msg: result.code
                        });
                        that.joinStatus = false;
                    }
                });
            },
            // 扫描wifi
            scanwifi: function scanwifi() {
                var that = this;
                that.wifiload = true;
                that.$store.dispatch("call", {
                    api: "scanwifi",
                    timeOut: 30000
                }).then(function (result) {
                    that.wifiload = false;
                    if (result.timeout) {
                        that.page = 'one';
                    }
                    if (result.success) {
                        // wifi排序
                        that.$store.dispatch("getWifi").then(function (data) {
                            if (data.success) {
                                that.wifidata = data.wifis;
                                if (that.wifidata[0].type == 'dfs') {
                                    var dfs = that.wifidata[0];
                                    that.wifidata.splice(0, 1);
                                    that.wifidata.splice(1, 0, dfs);
                                }
                            }
                        });
                    }
                });
            },
            // 加入wifi
            joinWifi: function joinWifi() {
                var that = this;
                if (!this.psw) {
                    that.$message({
                        type: "error",
                        msg: -1309
                    });
                    return;
                }
                that.joinStatus = true;
                clearTimeout(that.timer);
                that.$store.dispatch("call", {
                    api: "joinwifi",
                    data: {
                        ssid: this.curSelect.ssid,
                        key: this.psw,
                        channel: this.curSelect.channel,
                        device: this.curSelect.device,
                        encrypt: this.curSelect.encrypt,
                        issaved: false,
                        mac: this.curSelect.mac,
                        // 是否存到已知网络
                        save2uci: false,
                        identity: this.usname,
                        // lanip不需要传，为防止错误暂不删除
                        ipaddr: this.lanip,
                        mode: this.mode
                    },
                    timeOut: 60000
                }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            type: 'error',
                            msg: result.code
                        });
                        that.joinStatus = false;
                        return;
                    }
                    if (result.success) {
                        that.timer = setTimeout(function () {
                            if (that.mode == 'wds') {
                                that.startModalWDS = true;
                            } else {
                                that.startModalEXT = true;
                            }
                            that.joinStatus = false;
                            that.page = "one";
                            that.psw = "";
                            that.usname = "";
                        }, 15000);
                    } else {
                        that.joinStatus = false;
                        that.$message({
                            type: 'error',
                            msg: result.code
                        });
                    }
                });
            },
            resetPage: function resetPage() {
                this.startModalWDS = false;
                this.startModalEXT = false;
                window.location.href = "/";
            },
            // 判断wifi模式
            changeWifi: function changeWifi(data) {
                // 两种模式 psk-mixed 
                if (data.encrypt) {
                    if (data.encrypt.toLowerCase().indexOf("wpa") != -1) {
                        this.modeState = "EAP";
                    } else {
                        // wap-mode
                        this.modeState = "WISP";
                    }
                }
                this.curSelect = data;
            },
            back: function back() {
                this.page = "one";
            }
        }
    });
    return vueComponent;
});