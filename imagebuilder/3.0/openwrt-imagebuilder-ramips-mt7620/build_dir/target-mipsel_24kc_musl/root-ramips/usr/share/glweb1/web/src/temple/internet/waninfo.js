"use strict";

define(["vue", "text!temple/internet/waninfo.html", "component/gl-dropdown/index", "component/gl-btn/index", "component/gl-comfirm-btn/index", "component/gl-input/index", "component/gl-label/index", "component/gl-select/index", "component/gl-loading/index"], function (Vue, stpl, gl_dropdown, gl_btn, gl_cf_btn, gl_input, gl_label, gl_select, gl_loading) {
    var vueComponent = Vue.extend({
        template: stpl,
        components: {
            "gl-dropdown": gl_dropdown,
            "gl-cf-btn": gl_cf_btn,
            "gl-btn": gl_btn,
            "gl-input": gl_input,
            "gl-label": gl_label,
            "gl-select": gl_select,
            "gl-loading": gl_loading
        },
        data: function data() {
            return {
                timer: "",
                dataList: ["DHCP", "Static", "PPPoE"],
                prolist: ['dhcp', 'static', 'pppoe'],
                userName: "",
                password: "",
                serverip: "",
                gateway: "",
                mask: "",
                dns1: "",
                dns2: "",
                btnName: "Modify",
                wanconnecting: false,
                changeAp: true,
                btnStatus: false,
                wanType: "dhcp",
                show_wan: false,
                isShow: false,
                maskReg: /^(254|252|248|240|224|192|128|0)\.0\.0\.0$|^(255\.(254|252|248|240|224|192|128|0)\.0\.0)$|^(255\.255\.(254|252|248|240|224|192|128|0)\.0)$|^(255\.255\.255\.(254|252|248|240|224|192|128|0))$/,
                ipReg: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/,
                dnsReg: /(?:(^|\.)(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){4}$/,
                checkip: true,
                checkmask: true,
                checkgateway: true,
                checkdns1: true,
                checkdns2: true
            };
        },
        computed: {
            wantype: function wantype() {
                return this.$store.getters.apiData["wantype"];
            },
            waninfo: function waninfo() {
                return this.$store.getters.apiData["waninfo"];
            },
            router: function router() {
                return this.$store.getters.apiData['router'];
            },
            wan2lan: function wan2lan() {
                var data = "";
                if (this.router.port) {
                    switch (this.router.port) {
                        case "wan":
                            data = "Use as LAN";
                            break;
                        case "lan":
                            data = "Use as WAN";
                            break;
                    }
                }
                return data;
            }
        },
        beforeDestroy: function beforeDestroy() {
            clearInterval(this.timer);
            // console.log("beforeDestroy waninfo");
        },
        mounted: function mounted() {
            if(this.router.model=='mifi'){
                $('.newsmsNumMiFi').hide()
            }
            if (!this.waninfo.ip) {
                if (this.wantype.proto) {
                    if (this.wantype.proto == 'static') {
                        this.wanType = this.dataList[this.prolist.indexOf('dhcp')];
                    } else {
                        this.wanType = this.dataList[this.prolist.indexOf(this.wantype.proto)];
                    }
                    this.show_wan = true;
                    this.changeAp = false;
                    this.btnName = 'Apply';
                }
            }
            clearInterval(this.timer);
            this.renderData("render");
        },
        methods: {
            // 第一次获取 wan info
            renderData: function renderData(target) {
                var that = this;
                var nocache = true; // 有无连接
                var timernow = new Date().getTime();
                if (target == "render") {
                    if (this.waninfo.ip && timernow - this.waninfo.lastSync <= 10000) {
                        nocache = false;
                        that.$store.commit("setonlist", { data: "waninfo" });
                        // 是否显示wan功能块
                        that.show_wan = true;
                        that.wanType = that.dataList[that.prolist.indexOf(that.waninfo.proto)];
                        that.wanconnecting = false;
                        // 添加过渡状态的控制变量
                        that.btnStatus = false;
                    }
                }
                clearInterval(this.timer);
                nocache ? that.$store.dispatch("call", { api: "waninfo" }).then(function (result) {
                    if (result.code == "-17") {
                        that.$store.commit("removeInter", { data: "waninfo" });
                        return;
                    }
                    if (result.success) {
                        if (result.ip) {
                            that.btnStatus = false;
                            that.wanType = that.dataList[that.prolist.indexOf(result.proto)];
                            that.changeAp = true;
                            that.$store.commit("setonlist", { data: "waninfo" });
                            that.show_wan = true;
                            that.wanconnecting = false;
                        } else {
                            if (that.router.port != 'lan') {
                                that.getWanType();
                            }
                        }
                    } else {
                        that.$store.commit("setofflist", { data: "waninfo" });
                        // if (target == 'wtClass') {
                        // that.$message({
                        //     type: "error",
                        //     msg: -1310
                        // });
                        // }
                    }
                }) : null;
                // 第一次获取 waninfo 之后，开启定时器第二次获取 waninfo
                that.timerData(5000);
            },
            // 第二次获取 wan info定时器
            timerData: function timerData(itime) {
                var that = this;
                clearInterval(this.timer);
                if (!itime) {
                    itime = 5000;
                }
                that.timer = setInterval(function () {
                    that.$store.dispatch("call", { api: "waninfo" }).then(function (result) {
                        if (result.code == "-17") {
                            that.$store.commit("removeInter", { data: "waninfo" });
                            clearInterval(that.timer);
                            return;
                        }
                        if (result.success) {
                            if (result.ip) {
                                that.wanType = that.dataList[that.prolist.indexOf(result.proto)];
                                that.$store.commit("setonlist", { data: "waninfo" });
                                that.wanconnecting = false;
                                that.show_wan = true;
                                that.btnStatus = false;
                                that.changeAp = true;
                                that.btnName = "Modify";
                            } else {
                                if (that.router.port != 'lan') {
                                    that.getWanType();
                                }
                                return;
                            }
                        } else {
                            that.show_wan = false;
                            that.$store.commit("setofflist", { data: "waninfo" });
                        }
                    });
                }, itime);
            },
            getWanType: function getWanType() {
                var that = this;
                this.$store.dispatch("call", { api: 'wantype', timeOut: 10000 }).then(function (result) {
                    if (result.success) {
                        clearInterval(that.timer);
                        var waninfo = $.extend(true, {}, that.waninfo);
                        if (result.proto) {
                            that.show_wan = true;
                            if (result.proto == "dhcp") {
                                that.wanType = that.dataList[that.prolist.indexOf(result.proto)];
                            } else if (result.proto == "pppoe") {
                                that.wanType = that.dataList[that.prolist.indexOf(result.proto)];
                                that.password = waninfo.password;
                                that.userName = waninfo.username;
                            } else {
                                that.wanType = that.dataList[that.prolist.indexOf('dhcp')];
                                that.serverip = result.ip;
                                that.mask = result.mask;
                                that.gateway = result.gateway;
                                var dns = result.dns ? result.dns : [];
                                that.dns1 = dns[0] ? dns[0] : '';
                                that.dns2 = dns[1] ? dns[1] : '';
                            }
                        }
                        that.$store.commit("setonlist", { data: "waninfo" });
                        that.btnName = "Apply";
                        that.changeAp = false;
                        that.isShow = true;
                        that.btnStatus = false;
                        that.timerWan();
                    } else {
                        that.$store.commit("setofflist", { data: "waninfo" });
                    }
                });
            },
            // 第三次获取 wan info定时器
            timerWan: function timerWan() {
                var that = this;
                clearInterval(that.timer);
                that.timer = setInterval(function () {
                    that.$store.dispatch("call", { api: "waninfo" }).then(function (result) {
                        if (result.success) {
                            if (result.ip) {
                                that.wanType = that.dataList[that.prolist.indexOf(result.proto)];
                                that.wanconnecting = false;
                                that.btnName = "Modify";
                                that.changeAp = true;
                                that.$store.commit("setonlist", { data: "waninfo" });
                                clearInterval(that.timer);
                                that.timerData();
                            } else {
                                if (!result.proto) {
                                    that.$store.commit("setofflist", { data: "waninfo" });
                                    clearInterval(that.timer);
                                    that.timerData();
                                }
                            }
                        } else {
                            that.$store.commit("setofflist", { data: "waninfo" });
                        }
                    });
                }, 5000);
            },
            clickChange: function clickChange() {
                var that = this;
                var data = {};
                // 按钮为Modify
                if (this.btnName == "Modify") {
                    this.btnName = "Apply";
                    this.changeAp = false;
                    if (that.wanType == "Static") {
                        var waninfo = $.extend(true, {}, this.waninfo);
                    }
                    clearInterval(that.timer);
                } else {
                    // 按钮为Apply
                    if (that.wanType == "PPPoE") {
                        // 检查输入
                        if (!that.userName || !that.password) {
                            that.$message({
                                type: 'warning',
                                msg: -1309
                            });
                            return;
                        }
                        if (that.getLen(that.userName) > 128 || that.getLen(that.password) > 128) {
                            that.$message({
                                type: 'error',
                                msg: -22
                            });
                            return;
                        }
                        data = {
                            proto: "pppoe",
                            username: that.userName,
                            password: that.password
                        };
                        that.wtClass(data);
                        that.btnName = "Modify";
                        // that.changeAp = true;
                    } else if (that.wanType == "DHCP") {
                        if (this.waninfo.ip && this.waninfo.proto == "dhcp") {
                            this.$message({
                                type: "warning",
                                msg: '已成功连接，不必重新连接'
                            });
                            that.btnName = "Modify";
                            that.changeAp = true;
                            return;
                        }
                        that.serverip = '';
                        that.mask = '';
                        that.gateway = '';
                        that.dns1 = '';
                        that.dns2 = '';
                        that.userName = "";
                        that.password = "";
                        that.btnName = "Modify";
                        data = { proto: "dhcp" };
                        that.wtClass(data);
                    } else if (that.wanType == "Static") {
                        // 检查输入
                        if (!that.serverip) {
                            that.checkip = false;
                        }
                        if (!that.mask) {
                            that.checkmask = false;
                        }
                        if (!that.gateway) {
                            that.checkgateway = false;
                        }
                        if (!that.dns1) {
                            that.checkdns1 = false;
                        }
                        if (that.dns2) {
                            that.checkdns2 = that.blurdns2();
                        }
                        if (!this.checkip || !this.checkmask || !this.checkgateway || !this.checkdns1 || !this.checkdns2) {
                            return;
                        }
                        that.btnName = "Modify";
                        data = {
                            proto: "static",
                            ipaddr: that.serverip,
                            gateway: that.gateway,
                            netmask: that.mask,
                            dns1: that.dns1,
                            dns2: that.dns2
                        };
                        that.wtClass(data);
                    }
                }
            },
            cancel: function cancel() {
                var that = this;
                // 当前不为静态上网，取消设置重置输入
                if (that.waninfo.proto == 'static') {
                    this.serverip = that.waninfo.ip;
                    this.mask = that.waninfo.mask;
                    this.gateway = that.waninfo.gateway;
                    this.dns1 = that.waninfo.dns.length != 0 ? that.waninfo.dns[0] : '';
                    this.dns2 = that.waninfo.dns.length == 2 ? that.waninfo.dns[1] : '';
                } else {
                    that.serverip = '';
                    that.mask = '';
                    that.gateway = '';
                    that.dns1 = '';
                    that.dns2 = '';
                }
                that.checkip = true;
                that.checkmask = true;
                that.checkgateway = true;
                that.checkdns1 = true;
                that.checkdns2 = true;
                if (that.waninfo.proto) {
                    that.wanType = that.dataList[that.prolist.indexOf(that.waninfo.proto)];
                }
                that.btnName = "Modify";
                that.changeAp = true;
                that.renderData();
                that.isShow = false;
            },
            wtClass: function wtClass(data) {
                var that = this;
                that.btnStatus = true;
                var target = "wtClass";
                that.$store.dispatch("call", { api: "wanset", data: data, timeOut: 60000 }).then(function (result) {
                    if (result.failed) {
                        that.wanconnecting = false;
                        that.renderData(target);
                        return;
                    }
                    if (result.success) {
                        // if (data.proto == "dhcp") {
                        setTimeout(function () {
                            that.$message({
                                type: "success",
                                msg: result.code
                            });
                            that.renderData(target);
                        }, 4000);
                        // } else {
                        //     that.renderData(target);
                        // }
                    } else {
                        that.renderData(target);
                        that.$message({
                            type: "error",
                            msg: result.code
                        });
                    }
                    that.wanconnecting = true;
                    // setTimeout(function () {
                    //     if (!that.waninfo.ip && that.wanconnecting) {
                    //         that.wanconnecting = false;
                    //         that.renderData();
                    //         that.$message({
                    //             "type": "warning",
                    //             "api": "wanset",
                    //             "msg": -1301
                    //         });
                    //     }
                    // }, 30000);
                });
            },
            check_wan2lan: function check_wan2lan(item) {
                var that = this;
                var data = "lan2wan";
                var message = "Please confirm: do you want to change WAN port back to WAN?";
                var messageTwo = '';
                if (item == 'wan') {
                    data = "wan2lan";
                    message = "1." + that.t("Please remove the Internet cable from the WAN port.");
                    messageTwo = "2." + that.t("Please confirm: do you want to use the WAN port as LAN?");
                }
                that.$store.commit("showModal", {
                    type: "default",
                    title: "Caution",
                    message: message,
                    messageTwo: messageTwo,
                    cb: function cb() {
                        that.check(data);
                    }
                });
            },
            check: function check(data) {
                var that = this;
                that.$store.dispatch("call", {
                    api: "check_wan2lan", data: {
                        mode: data
                    }
                }).then(function (result) {
                    if (result.success) {
                        that.$message({
                            type: "success",
                            msg: result.code
                        });
                        that.$store.dispatch("call", { api: 'router' });
                        that.renderData();
                    } else {
                        that.$message({
                            type: "error",
                            msg: result.code
                        });
                    }
                });
            },
            selectItem: function selectItem(item) {
                this.isShow = true;
                if (item == 'PPPoE') {
                    var waninfo = $.extend(true, {}, this.waninfo);
                    this.userName = waninfo.username;
                    this.password = waninfo.password;
                } else if (item == 'Static') {
                    if (this.waninfo.proto == 'static') {
                        var waninfo = $.extend(true, {}, this.waninfo);
                        this.serverip = waninfo.ip;
                        this.mask = waninfo.mask;
                        this.gateway = waninfo.gateway;
                        var dns = waninfo.dns ? waninfo.dns : [];
                        this.dns1 = dns[0] ? dns[0] : '';
                        this.dns2 = dns[1] ? dns[1] : '';
                    }
                }
            },
            getFlow: function getFlow(flowVlueBytes) {
                var flow = "";
                if (flowVlueBytes / 1024 < 1024) {
                    flow = (Math.round(flowVlueBytes / 1024) > 0 ? Math.round(flowVlueBytes / 1024) : 0) + "KB";
                } else if (flowVlueBytes / 1024 >= 1024 && flowVlueBytes / 1024 / 1024 < 1024) {
                    flow = (Math.round(flowVlueBytes / 1024 / 1024) > 0 ? Math.round(flowVlueBytes / 1024 / 1024) : 0) + "MB";
                } else if (flowVlueBytes / 1024 / 1024 >= 1024) {
                    var gb_Flow = flowVlueBytes / 1024 / 1024 / 1024;
                    flow = gb_Flow.toFixed(1) + "GB";
                } else {
                    flow = "0KB";
                }
                return flow;
            },
            getLen: function getLen(data) {
                var realLength = 0;
                var charCode = -1;
                if (data) {
                    var len = data.length;
                    for (var i = 0; i < len; i++) {
                        charCode = data.charCodeAt(i);
                        if (charCode > 0 && charCode <= 128) {
                            realLength += 1;
                        } else {
                            realLength += 3;
                        }
                    }
                }
                return realLength;
            },
            blurip: function blurip(data) {
                if (data == 'focus') {
                    this.checkip = true;
                } else {
                    !this.serverip ? this.checkip = true : this.checkip = this.ipReg.test(this.serverip);
                }
            },
            blurmask: function blurmask(data) {
                if (data == 'focus') {
                    this.checkmask = true;
                } else {
                    !this.mask ? this.checkmask = true : this.checkmask = this.maskReg.test(this.mask);
                }
            },
            blurgateway: function blurgateway(data) {
                if (data == 'focus') {
                    this.checkgateway = true;
                } else {
                    !this.gateway ? this.checkgateway = true : this.checkgateway = this.ipReg.test(this.gateway);
                }
            },
            blurdns1: function blurdns1(data) {
                if (data == 'focus') {
                    this.checkdns1 = true;
                } else {
                    !this.dns1 ? this.checkdns1 = true : this.checkdns1 = this.dnsReg.test(this.dns1);
                }
            },
            blurdns2: function blurdns2(data) {
                if (data == 'focus') {
                    this.checkdns2 = true;
                } else {
                    !this.dns2 ? this.checkdns2 = true : this.checkdns2 = this.dnsReg.test(this.dns2);
                }
                var item = this.checkdns2;
                return item;
            }
        }
    });
    return vueComponent;
});