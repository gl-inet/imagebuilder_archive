"use strict";

define(["vue", "text!temple/internet/tethering.html", "component/gl-dropdown/index", "component/gl-btn/index", "component/gl-comfirm-btn/index", "component/gl-input/index", "component/gl-label/index", "component/gl-select/index", "component/gl-loading/index"], function (Vue, stpl, gl_dropdown, gl_btn, gl_cf_btn, gl_input, gl_label, gl_select, gl_loading) {
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
                touttime: "",
                timert: "", // 断开连接状态控制
                btnStatus: true, // 连接状态
                isconnecting: false,
                tdevices: [],
                selecttd: ""
                // changeAp: true,
                // timermo: "",
                // devices: [],
                // selectd: "",
                // isShow: false,
                // knowshow: false,
            };
        },
        beforeDestroy: function beforeDestroy() {
            clearInterval(this.timert);
            // console.log("beforeDestroy tethering");
        },
        computed: {
            router: function router() {
                return this.$store.getters.apiData['router'];
            },
            teinfo: function teinfo() {
                return this.$store.getters.apiData["teinfo"];
            },
            teconnect: function teconnect() {
                return this.teinfo.success && this.teinfo.devices && this.teinfo.code != -6;
            },
            // 连接热点后 ip冲突
            ipconflict: function ipconflict() {
                return this.teinfo.gateway && this.router.ip_addr == this.teinfo.gateway;
            },
            tebtnName: function tebtnName() {
                var item = 'Connect';
                if (this.teinfo.ip) {
                    item = 'Disconnect';
                } else {
                    item = 'Connect';
                }
                return item;
            },
            circleClass: function circleClass() {
                var circle = "";
                if (this.teinfo.code == 0) {
                    if (this.teinfo.ip) {
                        circle = "active";
                    }
                } else {
                    circle = "";
                }
                return circle;
            }
        },
        mounted: function mounted() {
            var that = this;
            clearInterval(this.timer);
            this.renderData();
        },
        methods: {
            //渲染数据
            renderData: function renderData() {
                var that = this;
                clearInterval(this.timer);
                that.getteData(true); //tethering
                that.timerTeData(); //timeOut tethering
            },
            getteData: function getteData(render) {
                var that = this;
                // var nocache = true;
                if (render) {
                    var timernow = new Date().getTime();
                    if (that.teinfo.success && timernow - this.teinfo.lastSync <= 10000) {
                        var result = that.teinfo;
                        that.$store.commit("setonlist", { data: "tethering" });
                        // that.$store.commit("scrollToTop");
                        if (result.devices) {
                            if (result.ip) {
                                that.isconnecting = false;
                            }
                            that.tdevices = result.devices;
                            if (result.device) {
                                var idxte = result.devices.indexOf(result.device);
                                if (idxte != -1) {
                                    that.selecttd = result.device;
                                } else {
                                    that.selecttd = result.devices[0];
                                }
                            } else {
                                that.selecttd = result.devices[0];
                            }
                        }
                        return 0;
                    }
                }
                that.$store.dispatch("call", { api: "teinfo", aysnc: true }).then(function (result) {
                    if (result.success) {
                        that.$store.commit("setonlist", { data: "tethering" });
                        if (result.devices) {
                            if (result.ip) {
                                that.isconnecting = false;
                            }
                            that.tdevices = result.devices;
                            if (result.device) {
                                var idxte = result.devices.indexOf(result.device);
                                if (idxte != -1) {
                                    that.selecttd = result.device;
                                } else {
                                    that.selecttd = result.devices[0];
                                }
                            } else {
                                that.selecttd = result.devices[0];
                            }
                        } else {
                            that.devices = ['no device'];
                            that.selecttd = 'no device';
                        }
                    } else if (result.code == "-17") {
                        that.$store.commit("removeInter", { data: "tethering" });
                        clearInterval(that.timert);
                        return;
                    } else {
                        that.$store.commit("setofflist", { data: "tethering" });
                    }
                });
            },
            //正在设置tethering，但是没有应用设置，60s之后自动恢复，视用户不使用该配置。
            setethering: function setethering() {
                var that = this;
                // clearInterval(this.timert);
                // clearTimeout(this.touttime);
                // this.touttime = setTimeout(function () {
                //提示用户自动放弃修改。
                //     that.$message({
                //         "type": "warning",
                //         "api": "teset",
                //         "msg": -1302
                //     });
                //     that.timerTeData();
                // }, 60000);
            },
            clickTeChange: function clickTeChange() {
                if (this.tebtnName == 'Disconnect') {
                    this.teDisconnect();
                } else if (this.tebtnName == "Connect") {
                    this.setTeProto();
                }
            },
            // tethering断开
            teDisconnect: function teDisconnect() {
                var that = this;
                that.isconnecting = true;
                that.$store.dispatch("call", {
                    api: "teDelete", data: {
                        device: this.selecttd
                    }
                }).then(function (result) {
                    if (result.success) {
                        that.timerTeData("disconnecting", result.code);
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "teDelete",
                            "msg": result.code
                        });
                    }
                });
            },
            //tethering连接
            setTeProto: function setTeProto() {
                var that = this;
                clearInterval(this.timert);
                that.isconnecting = true;
                that.$store.dispatch("call", { api: "teset", data: { "device": this.selecttd }, timeOut: 60000 }).then(function (result) {
                    if (result.success) {
                        clearTimeout(that.touttime);
                        that.touttime = setTimeout(function () {
                            that.timerTeData("connecting", result.code);
                            //30s后如果还没连接上提醒用户需要检查手机端是否打开共享
                            setTimeout(function () {
                                if (that.isconnecting) {
                                    that.timerTeData();
                                    // console.log("timout");
                                    that.isconnecting = false;
                                    that.$message({
                                        "type": "warning",
                                        "api": "teset",
                                        "msg": -1305
                                    });
                                }
                            }, 30000);
                        }, 2000);
                    }
                });
            },
            timerTeData: function timerTeData(isconnecting, code) {
                var that = this;
                clearInterval(this.timert);
                this.timert = setInterval(function () {
                    that.getteData();
                    if (isconnecting && that.isconnecting) {
                        // console.log(isconnecting);
                        //当链接成功后提示连接成功
                        if (isconnecting == "connecting" && that.teinfo.ip) {
                            isconnecting = false;
                            that.isconnecting = false;
                        } else if (isconnecting == "disconnecting" && !that.teinfo.ip) {
                            that.$message({
                                "type": "success",
                                "msg": code
                            });
                            isconnecting = false;
                            that.isconnecting = false;
                        }
                    }
                }, 5000);
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
            }
        }
    });
    return vueComponent;
});