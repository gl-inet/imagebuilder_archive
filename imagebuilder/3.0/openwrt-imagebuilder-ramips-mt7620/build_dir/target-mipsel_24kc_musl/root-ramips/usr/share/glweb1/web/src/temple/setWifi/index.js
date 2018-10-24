"use strict";

define(["text!temple/setWifi/index.html", "css!temple/setWifi/index.css", "vue", "component/gl-btn/index", "component/gl-input/index", "component/gl-tooltip/index", "component/gl-select/index", "component/gl-label/index", "component/gl-toggle-btn/index"], function (stpl, css, Vue, gl_btn, gl_input, gl_tooltip, gl_select, gl_label, gl_switch) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                timer: "",
                sortWifiData: [],
                scanDone: false,
                // alertStatus: 'info',
                // alertInfo: this.$lang.setWifi.scanning,
                iProgress: -15,
                passwordArray: [],
                checked: false,
                // isConnecting: false,
                connectingIndex: null,
                btnMove: false,
                // iconStatus: "",
                wifilist: false,
                mode: ["WISP", "WDS"],
                checkstate: true,
                curSelect: "",
                modeState: "",
                psw: "",
                wifiName: "",
                lanip: "",
                wifiIndex: "",
                usname: "",
                knowshow: false,
                isRember: true
            };
        },
        components: {
            "gl-btn": gl_btn,
            "gl-input": gl_input,
            "gl-tooltip": gl_tooltip,
            "gl-select": gl_select,
            "gl-label": gl_label,
            "gl-switch": gl_switch
        },
        computed: {
            joinstate: function joinstate() {
                var status = false;
                switch (this.modeState) {
                    case "WDS":
                        if (!this.lanip || !this.psw) {
                            status = true;
                        }
                        break;
                    case "EAP":
                        if (!this.usname || !this.psw) {
                            status = true;
                        }
                        break;
                    default:
                        if (this.curSelect.encrypt != 'none') {
                            if (!this.psw) {
                                status = true;
                            }
                        } else {
                            status = false;
                        }
                }
                return status;
            },
            stainfo: function stainfo() {
                return this.$store.getters.apiData["stainfo"];
            },
            scanwifi: function scanwifi() {
                return this.$store.getters.apiData["scanwifi"];
            },

            progressWidthObj: function progressWidthObj() {
                return {
                    width: this.iProgress + "%"
                };
            }
        },
        beforeRouteLeave: function beforeRouteLeave(to, from, next) {
            if (!this.btnMove) {
                next();
            } else {
                this.$message({
                    "type": "warning",
                    "msg": -1800,
                    "duration": 2000
                });
            }
        },
        mounted: function mounted() {
            var that = this;
            this.getWifiData();
            $("#router-visual").slideUp();
            $("a.clsLink2internet").addClass("active");
            if ($(".clsLink2" + this.$route.path.split("/")[1]).hasClass("bar")) {
                $(".bar.active").removeClass("active");
                $(".clsLink2" + this.$route.path.split("/")[1]).addClass("active");
                $("#moreapps").collapse("hide");
                $("#moresetting").collapse("hide");
                $("#tool").collapse("hide");
            }
            this.$store.dispatch("call", { api: "savedwifi" }).then(function (result) {
                if (result.wifis.length) {
                    that.knowshow = true;
                }
            });
        },

        methods: {
            generateId: function generateId(name, id) {
                return name + "_" + id;
            },
            changeIProgress: function changeIProgress() {
                if (this.scanDone || this.iProgress >= 85) {} else {
                    setTimeout(this.changeIProgress, 500);
                    this.iProgress = this.iProgress + parseInt(15);
                }
            },
            reScan: function reScan() {
                this.scanDone = false;
                this.iProgress = -15;
                // this.alertInfo = this.$lang.setWifi.scanning;
                // this.alertStatus = 'info';
                this.sortWifiData = [];
                this.wifilist = false; // 显示wifi列表
                this.getWifiData();
            },
            getWifiData: function getWifiData() {
                var that = this;
                that.btnMove = true;
                this.changeIProgress();
                this.$store.dispatch("call", { api: "scanwifi", timeOut: 60000 }).then(function (result) {
                    that.scanDone = true;
                    if (result.failed) {
                        // that.alertStatus = 'danger';
                        // that.alertInfo = that.$lang.setWifi.noWifi;
                        that.btnMove = false;
                        that.$message({
                            "type": "error",
                            "api": "scanwifi",
                            "msg": result.code
                        });
                        return;
                    };
                    if (result.success) {
                        // that.iconStatus = "";
                        that.wifiName = "";
                        that.psw = "";
                        that.usname = "";
                        that.lanip = "";
                        that.wifilist = true;
                        that.btnMove = false;
                        if (result.wifis.length > 0) {
                            that.$store.dispatch("getWifi").then(function (data) {
                                that.sortWifiData = data.wifis;
                                // console.log(that.sortWifiData);
                                if (that.sortWifiData[0].type == 'dfs') {
                                    var dfs = that.sortWifiData[0];
                                    that.sortWifiData.splice(0, 1);
                                    that.sortWifiData.splice(1, 0, dfs);
                                }
                                for (var i in that.sortWifiData) {
                                    that.sortWifiData[i]["hasError"] = false;
                                }
                                // that.alertInfo = that.$lang.setWifi.alertInfo;
                            });
                        } else {
                            // that.alertStatus = 'danger';
                            // that.alertInfo = that.$lang.setWifi.noWifi;
                        }
                    } else {
                        that.btnMove = false;
                        // that.alertStatus = 'danger';
                        // that.alertInfo = that.t(that.$lang.setWifi.wfScanning) + result.error + '.' + that.t(that.$lang.setWifi.tryAgain);
                    }
                });
            },

            KeyMinLengthMsg: function KeyMinLengthMsg(encrypt) {
                var result = null;
                if (encrypt == "wep") {
                    result = this.$lang.setWifi.characters;
                } else if (encrypt != "none") {
                    result = this.$lang.setWifi.least_8;
                }
                return result;
            },
            VerifyWifiKeyLen: function VerifyWifiKeyLen(sEncryption, sKey) {
                if (sEncryption == "none") {
                    return true;
                } else if (sEncryption == "wep" && (sKey.length == 5 || sKey.length == 13)) {
                    return true;
                } else if (sKey.length < 8) {
                    return false;
                }
                return true;
            },

            hide: function hide() {
                $(".wifilistCollapse").collapse("hide");
                this.checked = false;
            },
            clickItem: function clickItem(index) {
                this.checked = false;
                if (this.sortWifiData[index].encrypt == "none" || this.sortWifiData[index].issaved) {
                    if (this.sortWifiData[index].mac == this.stainfo.mac) {
                        this.$router.push("internet");
                    }
                }
            },
            cmp_setwifi_ConvertWifiSignal: function cmp_setwifi_ConvertWifiSignal(iSignal) {
                if (iSignal > -50) {
                    return "full";
                } else if (iSignal > -75 && iSignal <= -50) {
                    return "strong";
                } else if (iSignal > -90 && iSignal <= -75) {
                    return "medium";
                }return "weak";
            },
            changeWifi: function changeWifi(data) {
                // 两种模式 psk-mixed 
                var encrypt = data.encrypt;
                if (encrypt.toLowerCase().indexOf("wpa") != -1) {
                    this.modeState = "EAP";
                } else {
                    // wap-mode
                    this.modeState = "WISP";
                }
                this.curSelect = data;
            },
            join: function join() {
                // if (this.curSelect.mac == this.stainfo.mac && this.stainfo.enabled && this.stainfo.ip) {
                //     this.$message({
                //         type: 'warning',
                //         msg: '-1802'
                //     });
                //     return;
                // }
                var index = this.wifiIndex;
                var that = this;
                this.connectingIndex = index;
                if (this.curSelect.encrypt !== 'none') {
                    if (that.psw.length > 63 || this.psw.length < 8) {
                        this.$message({
                            type: 'warning',
                            msg: -1801
                        });
                        return;
                    }
                }
                var password = this.psw || "";
                that.btnMove = true;
                this.hide();
                // 参数由用户传入的由 ssid key save2uci identity ipaddr
                this.$store.dispatch("call", {
                    api: "joinwifi", data: {
                        ssid: this.curSelect.ssid,
                        key: password,
                        channel: this.curSelect.channel,
                        device: this.curSelect.device,
                        encrypt: this.curSelect.encrypt,
                        issaved: this.curSelect.issaved,
                        mac: this.curSelect.mac,
                        // 是否保存到已知wifi
                        save2uci: this.isRember,
                        identity: this.usname,
                        // lanip不需要传，为防止错误暂不删除
                        ipaddr: this.lanip,
                        // wds: this.modeState == "WDS"
                        mode: ""
                    }, timeOut: 60000
                }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "joinwifi",
                            "msg": result.code
                        });
                        that.btnMove = false;
                        return;
                    }
                    if (result.success) {
                        that.$message({
                            "type": "success",
                            "api": "joinwifi",
                            "msg": result.code
                        });
                        that.timer = setTimeout(function () {
                            that.btnMove = false;
                            that.$router.push("internet");
                        }, 2000);
                    } else {
                        that.btnMove = false;
                        that.$message({
                            "type": "error",
                            "api": "joinwifi",
                            "msg": result.code
                        });
                        if (result.code == -100) {
                            that.$set(that.curSelect, "hasError", true);
                        }
                    }
                });
            }
        }
    });
    return vueComponent;
});