"use strict";

define(["text!temple/process/index.html", "css!temple/process/index.css", "vue", "component/modal/modal", "component/gl-btn/index"], function (stpl, css, Vue, modal, gl_btn) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                UIStatus: null,
                gl_ip: this.$lang.process.ip,
                gl_sSSID: '-',
                gl_sKey: '-',
                gl_sDefaultSSID: this.$lang.process.dafaultSsid,
                gl_sDefaultKey: this.$lang.process.dafaultKey,
                bFlag: false,
                bFlag2: true,
                fInterval: null,
                showModal: false,
                showStatus: false
            };
        },
        components: {
            "gl-modal": modal,
            "gl-btn": gl_btn
        },
        created: function created() {
            var that = this;
            this.$store.dispatch("call", { api: "getaps" }).then(function (result) {
                var objAp = [];
                if (result.failed) {
                    that.$message({
                        "type": "error",
                        "api": "getaps",
                        "msg": result.code
                    });
                    return;
                }
                if (result.success) {
                    for (var i in result.aps) {
                        if (result.aps[i].mode == "ap") {
                            objAp = result.aps[i];
                            break;
                        }
                    }
                    if (objAp != null) {
                        that.gl_sSSID = objAp.ssid;
                        that.gl_sKey = objAp.key;
                    }
                } else {
                    that.$message({
                        "type": "error",
                        "api": "getaps",
                        "msg": result.code
                    });
                }
            });
            if (window.caniuse) {
                if (sessionStorage.getItem("callfunction")) {
                    var sCallFunction = sessionStorage.getItem("callfunction");
                    if (sCallFunction == "reboot") {
                        this.reBootDevice();
                    } else if (sCallFunction == "revertfirmware") {
                        this.revertFirmware();
                    } else if (sCallFunction == "upgradefirmware") {
                        this.upgradeFirmware();
                    }
                }
            } else {
                var href = location.href;
                var sCallFunction1 = href.split("&")[0].split("=")[1];
                if (sCallFunction1 == "reboot") {
                    this.reBootDevice();
                } else if (sCallFunction1 == "revertfirmware") {
                    this.revertFirmware();
                } else if (sCallFunction1 == "upgradefirmware") {
                    this.upgradeFirmware();
                }
            }
        },
        methods: {
            reBootDevice: function reBootDevice() {
                var that = this;
                if (window.caniuse) {
                    sessionStorage.removeItem("callfunction");
                }
                this.UIStatus = "reboot";
                this.$store.dispatch("call", { api: "reboot", data: { "reboot": true } }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "reboot",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        that.SetProcessSpeed(180000); //设置滚动条
                        that.CheckRouterConnect(that.gl_sSSID, that.gl_sKey);
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "reboot",
                            "msg": result.code
                        });
                    }
                });
            },
            revertFirmware: function revertFirmware() {
                var that = this;
                if (window.caniuse) {
                    sessionStorage.removeItem("callfunction");
                }
                this.UIStatus = 'revert';
                this.$store.dispatch("call", { api: "revertfirmware", data: { "revert": true } }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "revertfirmware",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        that.SetProcessSpeed(180000);
                        that.CheckRouterConnect(that.gl_sSSID, that.gl_sKey, that.gl_ip);
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "revertfirmware",
                            "msg": result.code
                        });
                    }
                });
            },
            upgradeFirmware: function upgradeFirmware() {
                var bKeepSetting = "";
                var sIP = null;
                var that = this;
                if (window.caniuse) {
                    sessionStorage.removeItem("callfunction");
                }
                this.UIStatus = 'upgrade';
                if (window.caniuse) {
                    if (sessionStorage.getItem("keepsetting")) {
                        bKeepSetting = sessionStorage.getItem("keepsetting");
                        if (bKeepSetting == "false") {
                            bKeepSetting = false;
                        } else {
                            bKeepSetting = true;
                        }
                        sessionStorage.removeItem("keepsetting");
                    }
                } else {
                    var href = location.href;
                    bKeepSetting = href.split("&")[1].split("=")[1];
                    if (bKeepSetting == "false") {
                        bKeepSetting = false;
                    } else {
                        bKeepSetting = true;
                    }
                }
                this.$store.dispatch("call", { api: "laninfo" }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "laninfo",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        sIP = result.ip;
                        that.gl_ip = result.ip;
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "laninfo",
                            "msg": result.code
                        });
                    }
                    if (bKeepSetting) {
                        if (bKeepSetting) {
                            that.CheckRouterConnect(that.gl_sSSID, that.gl_sKey, that.gl_ip);
                        } else {
                            that.CheckRouterConnect(that.gl_sDefaultSSID, that.gl_sDefaultKey, that.gl_ip);
                        }
                    } else {
                        that.CheckRouterConnect(that.gl_sDefaultSSID, that.gl_sDefaultKey, that.gl_ip);
                    }
                    that.$store.dispatch("call", { api: "flashfirmware", data: {
                            keepconfig: bKeepSetting
                        } }).then(function (result) {
                        if (result.failed) {
                            that.$message({
                                "type": "error",
                                "api": "flashfirmware",
                                "msg": result.code
                            });
                            return;
                        }
                        if (result.success) {
                            that.SetProcessSpeed(180000);
                        } else {
                            that.$message({
                                "type": "error",
                                "api": "flashfirmware",
                                "msg": result.code
                            });
                        }
                    });
                });
            },
            SetProcessValue: function SetProcessValue(iProcess) {
                $("#idUpgradeProcessing").attr("style", "width:" + iProcess + "%").attr("aria-valuenow", iProcess).text(iProcess + "%");
            },
            goWelcome: function goWelcome() {
                this.showModal = false;
                window.location.href = "/";
            },
            closeModal: function closeModal() {
                this.showStatus = false;
                window.location.href = "http://" + this.gl_ip;
            },
            CheckRouterConnect: function CheckRouterConnect(ssid, key, ip) {
                var that = this;
                var fCheckRouterInterval = null;
                var bFlag = false;
                var bFlag2 = true;
                // $("#router-wifi-ssid-txt").text(ssid);
                // $("#router-wifi-key-txt").text(key);
                // 30s之后开启
                setTimeout(function () {
                    // 3s一次定时器
                    fCheckRouterInterval = setInterval(function () {
                        that.$store.dispatch("call", { api: "isconnected", ip: ip }).then(function (result) {
                            if (result.failed) {
                                bFlag = true;
                                if (bFlag2 && that.GetProgressValue() == 100) {
                                    bFlag2 = false;
                                    that.showModal = true;
                                }
                                return;
                            }
                            if (result.connected) {
                                that.showModal = false;
                                if (ip) {
                                    setTimeout(function () {
                                        clearInterval(fCheckRouterInterval);
                                        window.location.href = "http://" + ip;
                                    }, 2000);
                                } else {
                                    that.SetProcessValue(100);
                                    setTimeout(function () {
                                        clearInterval(fCheckRouterInterval);
                                        window.location.href = "/";
                                    }, 2000);
                                }
                            }
                        });
                    }, 3000);
                }, 30000);
            },
            SetProcessSpeed: function SetProcessSpeed(totalTime) {
                var avgTime = parseInt(totalTime) / 100;
                var iProgress = 0;
                var iStep = 1;
                var that = this;
                if (avgTime < 1000) {
                    avgTime = avgTime * 2;
                    iStep = 2;
                }
                that.fInterval = setInterval(function () {
                    iProgress = $("#idUpgradeProcessing").attr("aria-valuenow");
                    if (iProgress == 100) {
                        clearInterval(that.fInterval);
                    } else if (iProgress > 100) {
                        iProgress = 100;
                    } else {
                        iProgress = parseInt(iProgress) + parseInt(iStep);
                    }
                    that.SetProcessValue(iProgress);
                }, avgTime);
            },
            GetProgressValue: function GetProgressValue() {
                return parseInt($("#idUpgradeProcessing").attr("aria-valuenow"));
            }
        }
    });
    return vueComponent;
});