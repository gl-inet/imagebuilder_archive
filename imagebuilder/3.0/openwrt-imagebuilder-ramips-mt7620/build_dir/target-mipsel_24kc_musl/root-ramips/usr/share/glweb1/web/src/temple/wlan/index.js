"use strict";

define(["text!temple/wlan/index.html", "css!temple/wlan/index.css", "component/gl-btn/index", "component/gl-toggle-btn/index", "component/gl-input/index", "component/gl-tooltip/index", "component/gl-label/index", "component/gl-select/index", "component/gl-slider/index", "vue"], function (stpl, css, gl_progress, gl_toggle, gl_input, gl_tooltip, gl_label, gl_select, gl_slider, Vue) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                timer: "",
                powerTimer: "",
                hostenableTimer: "",
                cTimer: false,
                newSsid: "",
                checked: false,
                btnStatus: false,
                btnAp: false,
                wifiKey: [],
                wifiName: [],
                apsBack: {},
                htmodeDefault: "",
                channelNum: "",
                inputValue: "", // input => password
                maxwidth: "90",
                btnName: {
                    "btn0": "Modify",
                    "btn1": "Modify",
                    "btn2": "Modify",
                    "btn3": "Modify"
                },
                modify: false,
                psw: /^(?:\d+|[a-zA-Z]+|[!@#$%^&*,.?/|]+)$/,
                pswmedium: /^(?![a-zA-z]+$)(?!\d+$)(?![!@#$%^&*,.?/|]+$)[a-zA-Z\d!@#$%^&*,.?/|]+$/,
                pswStrong: /^(?![a-zA-z]+$)(?!\d+$)(?![!@#$%^&*,.?/|]+$)(?![a-zA-z\d]+$)(?![a-zA-z!@#$%^&*,.?/|]+$)(?![\d!@#$%^&*,.?/|]+$)[a-zA-Z\d!@#$%^&*,.?/|]+$/,
                currentindex: 0,
                checkpassword: true,
                getaps: []
            };
        },
        components: {
            "gl-btn": gl_progress,
            "gl-tg-btn": gl_toggle,
            "gl-input": gl_input,
            "gl-tooltip": gl_tooltip,
            "gl-label": gl_label,
            "gl-select": gl_select,
            "gl-slider": gl_slider
        },
        computed: {
            wlanlist: function wlanlist() {
                return this.$store.getters.apiData["getaps"];
            },
            wlanaps: function wlanaps() {
                return this.wlanlist.aps;
            },
            stainfo: function stainfo() {
                return this.$store.getters.apiData["stainfo"];
            }
        },
        mounted: function mounted() {
            var that = this;
            $("#router-visual").slideUp();
            this.timerData();
            if ($(".clsLink2" + this.$route.path.split("/")[1]).hasClass("bar")) {
                $(".bar.active").removeClass("active");
                $(".clsLink2" + this.$route.path.split("/")[1]).addClass("active");
                $("#applications").collapse("hide");
                $("#moresetting").collapse("hide");
                $("#system").collapse("hide");
                $("#vpn").collapse("hide");
            }
            if (this.wlanaps && this.wlanaps.length != 0) {
                this.getaps = this.wlanlist;
                for (var i = 0; i < that.getaps.aps.length; i++) {
                    that.$set(that.getaps.aps[i], 'wifissid', that.getaps.aps[i].ssid);
                }
            }
        },
        beforeRouteLeave: function beforeRouteLeave(to, from, next) {
            if (!this.btnStatus) {
                clearInterval(this.timer);
                next();
            } else {
                this.$message({
                    "type": "warning",
                    "msg": -2800,
                    "duration": 1000
                });
            }
        },
        methods: {
            generateId: function generateId(name, id, index) {
                return name + "_" + index;
            },
            timerData: function timerData() {
                var that = this;
                this.updatedata();
                clearInterval(that.timer);
                that.timer = setInterval(function () {
                    that.updatedata();
                }, 5000);
            },
            updatedata: function updatedata() {
                var that = this;
                that.$store.dispatch("call", { api: "getaps" }).then(function (result) {
                    if (result.success) {
                        that.getaps = result;
                        for (var i = 0; i < that.getaps.aps.length; i++) {
                            that.$set(that.getaps.aps[i], 'wifissid', that.getaps.aps[i].ssid);
                            // that.getaps.aps[i]['wifissid'] = that.getaps.aps[i].ssid;
                        }
                        that.apsBack = $.extend(true, {}, result);
                        that.checkpassword = true;
                    }
                });
            },
            checkOpen: function checkOpen(item, index) {
                var dom = $("#idHotspotPassword_" + index);
                if (dom.next().next().children().hasClass("icon-eye-close")) {
                    dom.attr("type", "text");
                    dom.next().next().children().removeClass("icon-eye-close glyphicon-eye-close").addClass("glyphicon-eye-open icon-eye-open");
                } else {
                    dom.attr("type", "password");
                    dom.next().next().children().removeClass("glyphicon-eye-open icon-eye-open").addClass("glyphicon-eye-close icon-eye-close");
                }
            },
            hotspotEnableAp: function hotspotEnableAp(item, index) {
                var that = this;
                clearInterval(that.timer);
                clearTimeout(this.hostenableTimer);
                this.btnStatus = true;
                that.getaps.aps = that.apsBack.aps;
                that.getaps.aps[index].up = item.up;
                for (var idx in that.btnName) {
                    that.btnName[idx] = "Modify";
                }
                that.hotEnableAp(index);
            },
            hotEnableAp: function hotEnableAp(index) {
                var that = this;
                this.$store.dispatch("call", {
                    api: "enableap", async: true, data: {
                        id: that.getaps.aps[index].id,
                        ssid: that.getaps.aps[index].ssid,
                        enable: that.getaps.aps[index].up,
                        radio: that.getaps.aps[index].device
                    }
                }).then(function (result) {
                    if (result.failed) {
                        that.btnStatus = false;
                        that.$message({
                            "type": "error",
                            "api": "enableap",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        that.$message({
                            "type": "success",
                            "api": "enableap",
                            "msg": result.code
                        });
                        that.hostenableTimer = setTimeout(function () {
                            that.btnStatus = false;
                            // that.updatedata();
                            that.timerData();
                        }, 5000);
                    } else {
                        that.btnStatus = false;
                        that.$message({
                            "type": "error",
                            "api": "enableap",
                            "msg": result.code
                        });
                    }
                });
            },
            powerChange: function powerChange(item) {
                var that = this;
                that.btnStatus = true;
                clearInterval(this.timer);
                clearTimeout(this.powerTimer);
                // console.log(item);
                this.powerTimer = setTimeout(function () {
                    that.$store.dispatch("call", {
                        api: "settxpower", async: true, data: {
                            txpower: item.txpower,
                            device: item.device
                        }
                    }).then(function (result) {
                        if (result.failed) {
                            that.btnStatus = false;
                            that.$message({
                                "type": "error",
                                "api": "settxpower",
                                "msg": result.code
                            });
                            return;
                        }
                        if (result.success) {
                            that.btnStatus = false;
                            that.$message({
                                "type": "success",
                                "api": "settxpower",
                                "msg": result.code
                            });
                        } else {
                            that.btnStatus = false;
                            that.$message({
                                "type": "error",
                                "api": "settxpower",
                                "msg": result.code
                            });
                        }
                    }).then(function () {
                        if (!that.modify) {
                            // that.updatedata();
                            that.timerData();
                        }
                    });
                }, 500);
            },
            changeClick: function changeClick(item, index) {
                var that = this;
                var btnn = "";
                if (this.btnName["btn" + index] == "Modify") {
                    that.modify = true;
                    clearInterval(that.timer);
                    // that.$store.dispatch("call", { api: "getaps" }).then(function (result) {
                    that.btnName['btn' + index] = "Apply";
                    for (var idx in that.btnName) {
                        if (idx != "btn" + index) {
                            that.btnName[idx] = "Modify";
                            that.checkpassword = true;
                        }
                    }
                    // that.apsBack = $.extend(true, {}, result);
                    // });
                } else {
                    that.applyBtnClick(item, index);
                }
            },
            cancel: function cancel(index) {
                this.btnName['btn' + index] = "Modify";
                this.checkpassword = true;
                // this.updatedata();
                this.timerData();
            },
            checkpsw: function checkpsw(data, index) {
                this.currentindex = index;
                if (!data) {
                    this.checkpassword = false;
                } else {
                    // var psw = this.psw.test(data);
                    // var pswStrong = this.pswStrong.test(data);
                    // var pswmedium = this.pswmedium.test(data);
                    // if (this.getLen(data) <= 63 && this.getLen(data) >= 8) {
                    //     if (psw || pswStrong || pswmedium) {
                    //         this.checkpassword = true;
                    //     } else {
                    //         this.checkpassword = false;
                    //     }
                    // } else {
                    //     this.checkpassword = false;
                    // }
                    // 8-63位的非中文字符密码
                    if (this.getLen(data) <= 63 && this.getLen(data) >= 8) {
                        if (escape(data).indexOf("%u") != -1) {
                            this.checkpassword = false;
                        } else {
                            this.checkpassword = true;
                        }
                    } else {
                        this.checkpassword = false;
                    }
                }
            },
            applyBtnClick: function applyBtnClick(item, index) {
                var that = this;
                this.btnStatus = true;
                var devs = this.getaps.aps;
                var aps = this.getaps.aps;
                var len = devs.length;
                for (var i = 0; i < len; i++) {
                    if (item.band == aps[i].band) {
                        this.channelNum = aps[i].channel;
                        this.htmodeDefault = aps[i].htmode;
                    }
                }
                if (item.ssid.length == 0) {
                    this.$message({
                        type: 'warning',
                        msg: -2802
                    });
                    that.btnStatus = false;
                    return;
                }
                if (this.getLen(item.ssid) > 32) {
                    this.$message({
                        type: 'error',
                        msg: -102
                    });
                    that.btnStatus = false;
                    return;
                }
                if (!item.key) {
                    this.checkpassword = false;
                    that.btnStatus = false;
                }
                if (!this.checkpassword && index == this.currentindex) {
                    that.btnStatus = false;
                    return;
                }
                this.btnName['btn' + index] = "Modify";
                clearInterval(that.timer);
                this.$store.dispatch("call", {
                    api: "updateap", data: {
                        id: item.id,
                        ssid: that.apsBack.aps[index].ssid, // 热点名称
                        device: item.device, // 热点对应设备接口
                        // radio: item.device, // 热点对应设备接口
                        key: item.key, // 热点密码
                        // encrypt: item.encryption, // 加密模式
                        encrypt: "psk-mixed", // 加密模式
                        newssid: item.ssid, // 新热点名称
                        channel: this.channelNum, // 热点信道
                        htmode: this.htmodeDefault // 速率
                    }
                }).then(function (result) {
                    that.modify = false;
                    if (result.failed) {
                        that.timer = setTimeout(function () {
                            that.$message({
                                "type": "error",
                                "api": "updateap",
                                "msg": result.code
                            });
                            that.timerData();
                            that.btnStatus = false;
                        }, 3000);
                        return;
                    }
                    if (result.success) {
                        that.timer = setTimeout(function () {
                            that.$message({
                                "type": "success",
                                "api": "updateap",
                                "msg": result.code
                            });
                            that.timerData();
                            that.btnStatus = false;
                        }, 3000);
                    } else {
                        that.timer = setTimeout(function () {
                            that.$message({
                                "type": "error",
                                "api": "updateap",
                                "msg": result.code
                            });
                            that.timerData();
                            that.btnStatus = false;
                        }, 3000);
                    }
                });
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