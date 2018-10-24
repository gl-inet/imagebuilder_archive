"use strict";

define(["vue", "text!temple/internet/modem.html", "component/gl-dropdown/index", "component/gl-btn/index", "component/gl-comfirm-btn/index", "component/gl-input/index", "component/gl-label/index", "component/gl-select/index", "component/gl-loading/index", "component/gl-tooltip/index"], function (Vue, stpl, gl_dropdown, gl_btn, gl_cf_btn, gl_input, gl_label, gl_select, gl_loading, gl_tooltip) {
    var vueComponent = Vue.extend({
        template: stpl,
        components: {
            "gl-dropdown": gl_dropdown,
            "gl-cf-btn": gl_cf_btn,
            "gl-btn": gl_btn,
            "gl-input": gl_input,
            "gl-label": gl_label,
            "gl-select": gl_select,
            "gl-loading": gl_loading,
            "gl-tooltip": gl_tooltip
        },
        data: function data() {
            return {
                timermo: "", //modem定时器
                timeOut: "", //按钮timeout
                moServiceList: ["LTE/UMTS/GPRS", "CDMA/EVDO"],
                // moapn: "",
                modeStatus: false, //modem 高级设置模式
                modevice: "",
                moservice: "",
                mopincode: "",
                mopdanum: "",
                mousername: "",
                mopasswd: "",
                moexpect: "init",
                mosuccess: 'init',
                mosetting: true, //当前模块设置
                modemIndex: 0, //      当前显示模块索引
                connectIndex: 0, //  当前连接索引
                resetIndex: 0, // 当前重置模块索引
                moreset: true, //重置
                btnName: { //当前模块的自动按钮
                    "btn0": "Auto Setup",
                    "btn1": "Auto Setup",
                    "btn2": "Auto Setup"
                },
                moapns: { //当前模块的apn
                    "apn0": '',
                    "apn1": '',
                    "apn2": ''
                    // mosettings: {   
                    //     "moset0": true,
                    //     "moset1": true,
                    //     "moset2": true,
                    // }
                }
            };
        },
        beforeDestroy: function beforeDestroy() {
            clearInterval(this.timermo);
            clearInterval(this.timeOut);
            // console.log("beforeDestroy modem");
        },
        computed: {
            moInfo: function moInfo() {
                return this.$store.getters.apiData["moInfo"];
            },
            modems: function modems() {
                return this.moInfo.modems;
            },
            moGetconfig: function moGetconfig() {
                return this.$store.getters.apiData['moGet'];
            },
            // 模块连接后保存的配置
            configapn: function configapn() {
                if (this.moGetconfig.config && this.moGetconfig.config.apn != '') {
                    return false;
                }
                return true;
            },
            // apn列表
            apns: function apns() {
                return this.$store.getters.carinfo;
            },
            // 按钮过渡效果
            mobtnStatus: function mobtnStatus() {
                if (this.moexpect != "init") {
                    if (this.moexpect == this.modems[this.connectIndex].up || this.mosuccess == this.modems[this.connectIndex].up) {
                        this.moexpect = "init";
                        this.mosuccess = "init";
                        return false;
                    } else {
                        return true;
                    }
                } else {
                    return false;
                }
            }
        },
        mounted: function mounted() {
            this.renderData();
        },
        methods: {
            //渲染数据
            renderData: function renderData() {
                var that = this;
                that.timerMoData(); //modem info
            },
            timerMoData: function timerMoData() {
                var that = this;
                that.getMoData();
                clearInterval(this.timermo);
                that.timermo = setInterval(function () {
                    that.getMoData();
                }, 5000);
            },
            getMoData: function getMoData() {
                var that = this;
                that.$store.dispatch("call", { api: "moInfo" }).then(function (result) {
                    that.moreset = true;
                    if (result.success) {
                        that.$store.commit("setonlist", { data: "modem" });
                        that.mosetting = true;
                        // 清空apn
                        that.$store.commit('checkapns');
                        for (var i = 0; i < result.modems.length; i++) {
                            // 获取apn列表
                            that.$store.commit("getapns", result.modems[i]);
                        }
                    } else if (result.code == "-17" || result.code == "-3") {
                        //不支持
                        clearInterval(that.timermo);
                        that.$store.commit("removeInter", { data: "modem" });
                    } else {
                        that.$store.commit("checkapns");
                        that.$store.commit("setofflist", { data: "modem" });
                    }
                });
                //  : null;
            },
            // 手动 apply
            manualSet: function manualSet(item, index) {
                var that = this;
                if (that.moapns['apn' + index] && this.getLen(that.moapns['apn' + index]) > 32) {
                    that.$message({
                        type: 'error',
                        msg: -1321
                    });
                    return;
                }
                if (this.mopincode && this.getLen(this.mopincode) > 32) {
                    that.$message({
                        type: 'error',
                        msg: -1317
                    });
                    return;
                }
                if (this.mopdanum && this.getLen(this.mopdanum) > 32) {
                    that.$message({
                        type: 'error',
                        msg: -1318
                    });
                    return;
                }
                if (this.mousername && this.getLen(this.mousername) > 32) {
                    that.$message({
                        type: 'error',
                        msg: -1319
                    });
                    return;
                }
                if (this.mopasswd && this.getLen(this.mopasswd) > 32) {
                    that.$message({
                        type: 'error',
                        msg: -1320
                    });
                    return;
                }
                var service;
                if (that.moservice.toLowerCase().indexOf("umts") != -1) {
                    // LTE/UMTS/GPRS
                    service = "umts";
                } else {
                    // CDMA/EVDO
                    service = "evdo";
                }
                that.moexpect = 'on';
                that.mosuccess = 'connecting';
                // that.mosettings['moset' + index] = true
                that.mosetting = true;
                that.connectIndex = index;
                clearTimeout(this.timeOut);
                clearInterval(this.timermo);
                this.$store.dispatch("call", {
                    api: "moSet",
                    data: {
                        bus: item.bus,
                        modem_id: item.modem_id,
                        device: that.modevice,
                        service: service,
                        apn: that.moapns['apn' + index],
                        pincode: that.mopincode,
                        dianum: that.mopdanum,
                        username: that.mousername,
                        password: that.mopasswd
                    },
                    timeOut: 30000
                }).then(function (result) {
                    if (!result.success) {
                        that.$message({
                            type: 'error',
                            msg: result.code
                        });
                        that.moexpect = "init";
                        that.mosuccess = "init";
                    }
                    that.timerMoData();
                    that.$store.dispatch("call", { api: 'moGet' });
                    var time = item.modem_id == 255 ? 30000 : 30000;
                    that.timeOut = setTimeout(function () {
                        if (that.moexpect != 'init' || that.mosuccess != 'init') {
                            that.moexpect = "init";
                            that.mosuccess = "init";
                        }
                    }, time);
                });
            },
            // 断开连接
            moDisconnect: function moDisconnect(item, index) {
                var that = this;
                that.moexpect = 'off';
                clearInterval(that.timermo);
                clearTimeout(that.timeOut);
                that.connectIndex = index;
                this.$store.dispatch("call", {
                    api: "moEnable",
                    data: {
                        bus: item.bus,
                        modem_id: item.modem_id,
                        disable: true
                    }
                }).then(function (result) {
                    if (!result.success) {
                        that.$message({
                            type: 'error',
                            msg: result.code
                        });
                        that.moexpect = "init";
                    }
                    that.timerMoData();
                    that.timeOut = setTimeout(function () {
                        if (that.moexpect != 'init') {
                            that.moexpect = "init";
                        }
                    }, 15000);
                });
            },
            // 自动连接
            autoSet: function autoSet(item, index) {
                var that = this;
                that.moexpect = 'on';
                that.mosuccess = "connecting";
                that.connectIndex = index;
                clearTimeout(that.timeOut);
                clearInterval(that.timermo);
                this.$store.dispatch("call", {
                    api: "moAuto",
                    data: {
                        bus: item.bus,
                        modem_id: item.modem_id,
                        isps: JSON.stringify(that.apns[index])
                    },
                    timeOut: 85000
                }).then(function (result) {
                    if (!result.success) {
                        that.$message({
                            type: 'error',
                            msg: result.code
                        });
                        that.moexpect = 'init';
                    }
                    var time = item.modem_id == 255 ? 30000 : 30000;
                    that.timerMoData();
                    that.timeOut = setTimeout(function () {
                        if (that.moexpect != 'init' || that.mosuccess != 'init') {
                            // that.$message({
                            //     type: "error",
                            //     msg: -1307 // sim卡拨号连接超时。
                            // });
                            that.moexpect = 'init';
                            that.mosuccess = 'init';
                        }
                    }, time);
                });
            },
            // 开启关闭切换
            checkStatus: function checkStatus() {
                if (this.checkBtn == 'Apply') {
                    this.manualSet();
                    return;
                }
                this.moDisconnect();
            },
            // 更多设置
            clickMoSet: function clickMoSet(item, index) {
                var that = this;
                clearInterval(that.timermo);
                clearInterval(that.timeOut);
                that.$store.dispatch("call", {
                    api: "moGet",
                    data: {
                        modem_id: item.modem_id,
                        bus: item.bus
                    }
                }).then(function (result) {
                    if (result.success) {
                        var config = result.config;
                        if (config.device) {
                            that.modevice = config.device;
                        } else {
                            for (var i = 0; i < that.modems[index].ports.length; i++) {
                                if (that.modems[index].ports[i].indexOf("cdc-wdm") != -1) {
                                    that.modevice = that.modems[index].ports[i];
                                }
                            }
                        }
                        if (config.service) {
                            if (config.service.toLowerCase() == "evdo") {
                                that.moservice = that.moServiceList[1];
                            } else {
                                that.moservice = that.moServiceList[0];
                            }
                        }
                        // that.moapn = config.apn;
                        that.mopincode = config.pincode;
                        that.mopdanum = config.dialnum;
                        that.mousername = config.username;
                        that.mopasswd = config.password;
                        that.mosetting = false;
                        // that.mosettings['moset' + index] = false;
                        that.moapns['apn' + index] = config.apn;
                    }
                });
            },
            // 获取inpit输入apn
            getmoapn: function getmoapn(data) {
                this.moapns['apn' + this.modemIndex] = data;
            },
            // 点击返回
            clickBack: function clickBack(index) {
                // this.mosettings['moset' + index] = true;
                this.mosetting = true;
                this.timerMoData();
            },
            // 重置
            clickMoReset: function clickMoReset(item, index) {
                var that = this;
                that.moreset = false;
                that.resetIndex = index;
                clearInterval(that.timeOut);
                that.$store.dispatch("call", {
                    api: "moReset",
                    data: {
                        bus: item.bus,
                        modem_id: item.modem_id
                    },
                    timeOut: 35000
                }).then(function (result) {
                    that.timeOut = setTimeout(function () {
                        that.timerMoData();
                    }, 10000);
                });
            },
            changeModal: function changeModal() {
                this.modeStatus = !this.modeStatus;
            },
            checkModem: function checkModem(data) {
                this.clickBack();
                this.modemIndex = data;
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
            }
        }
    });
    return vueComponent;
});