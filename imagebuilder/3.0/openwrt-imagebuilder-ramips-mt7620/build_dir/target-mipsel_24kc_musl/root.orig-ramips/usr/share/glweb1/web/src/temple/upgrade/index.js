"use strict";

define(["text!temple/upgrade/index.html", "css!temple/upgrade/index.css", "component/gl-btn/index", "component/gl-toggle-btn/index", "component/gl-upload-file/index", "component/gl-select/index", "vue"], function (stpl, css, gl_btn, gl_toggle, gl_upf, gl_select, Vue) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                timer: "",
                sta: "",
                code: "",
                hideKeepSetting: false,
                hideInstallBtn: false,
                KeepSettingBtn: true,
                downloadBtnDisabled: false,
                downloadBtnVal: "Download",
                currentVersionVal: "-",
                // hideNewUpdate: true,
                hideVerifyFirmware: true,
                verifyHeaderMsg: "",
                upgradeVersionVal: "-",
                upgradeMD5Val: "-",
                // newVersionVal: "",
                enableBtnOn: false,
                timeList: ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"],
                autoTime: "04:00",
                resultText: "-",
                errMsg: '',
                btnstatus: false,
                fDownloadInterval: null
            };
        },
        components: {
            "gl-btn": gl_btn,
            "gl-tg-btn": gl_toggle,
            "gl-upf": gl_upf,
            "gl-select": gl_select
        },
        beforeRouteEnter: function beforeRouteEnter(to, from, next) {
            next(function (vm) {
                $("#router-visual").slideUp();
                if ($(".clsLink2" + vm.$route.path.split("/")[1]).hasClass("bar")) {
                    $(".bar.active").removeClass("active");
                    $(".clsLink2" + vm.$route.path.split("/")[1]).addClass("active");
                    $("#applications").collapse("hide");
                    $("#moresetting").collapse("hide");
                    $("#system").collapse("hide");
                    $("#vpn").collapse("hide");
                }
            });
        },

        computed: {
            readautoupgrade: function readautoupgrade() {
                return this.$store.getters.apiData["readautoupgrade"];
            },
            firmwareinfo: function firmwareinfo() {
                return this.$store.getters.apiData["firmwareinfo"];
            },
            checkfirmware: function checkfirmware() {
                return this.$store.getters.apiData["checkfirmware"];
            },
            systemTime: function systemTime() {
                return this.$store.getters.apiData["gettimezone"].systemtime;
            },
            hideNewUpdate: function hideNewUpdate() {
                if (this.checkfirmware.has_new) {
                    return false;
                } else {
                    return true;
                }
            },
            newVersionVal: function newVersionVal() {
                var data = this.checkfirmware.version_new;
                var reg = /\s+/;
                if (data) {
                    return data.split(reg)[0];
                }
            },
            download: function download() {
                return this.$store.getters.apiData['firmdownloadprogress'];
            }
        },
        beforeRouteLeave: function beforeRouteLeave(to, from, next) {
            // ...
            clearInterval(this.fDownloadInterval);
            next();
        },

        mounted: function mounted() {
            var that = this;
            if (this.download.success && this.download.downloading) {
                var percent = parseInt(this.download.percent * 100);
                if (percent >= 100) {
                    percent = 99;
                }
                that.downloadBtnDisabled = true;
                that.downloadBtnVal = percent + "%";
                that.getprocess();
                this.fDownloadInterval = setInterval(function () {
                    that.getprocess();
                }, 500);
            }
            that.$store.dispatch("call", { api: "readautoupgrade" }).then(function (result) {
                if (result.failed) {
                    that.$message({
                        "type": "error",
                        "api": "readautoupgrade",
                        "msg": result.code
                    });
                    return;
                }
                if (result.success) {
                    if (!result.enabled) {
                        that.enableBtnOn = false;
                    } else if (result.enabled) {
                        that.enableBtnOn = true;
                    }
                    if (result.time) {
                        that.autoTime = result.time;
                    }
                } else {
                    that.$message({
                        "type": "error",
                        "api": "readautoupgrade",
                        "msg": result.code
                    });
                }
            });
            that.$store.dispatch("call", { api: "firmwareinfo" }).then(function (result) {
                if (result.failed) {
                    that.$message({
                        "type": "error",
                        "api": "firmwareinfo",
                        "msg": result.code
                    });
                    return;
                }
                if (result.success) {
                    that.currentVersionVal = result.CurrentVersion;
                    // console.log(result.CurrentVersion);
                } else {
                        // console.log("Getting firmwareinfo failed. " + result.error);
                    }
            });
            if (!this.checkfirmware.has_new) {
                that.$store.dispatch("call", { api: "checkfirmware" }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "checkfirmware",
                            "msg": result.code
                        });
                        return;
                    }
                    if (!result.success) {
                        that.$message({
                            "type": "error",
                            "api": "checkfirmware",
                            "msg": result.code
                        });
                    } else if (result.has_new) {
                        // var reg = /\s+/;
                        // var new_array = result.version_new.split(reg);
                        // that.newVersionVal = new_array[0];
                        // that.hideNewUpdate = false;
                    } else {
                            // var _reg = /\s+/;
                            // var _new_array = result.version_new.split(_reg);
                            // that.newVersionVal = _new_array[0];
                            // that.hideNewUpdate = true;
                        }
                });
            }
            // 获取时间
            this.$store.dispatch("call", { api: "gettimezone" });
        },
        methods: {
            auto_update: function auto_update(action) {
                var that = this;
                var autotime = this.autoTime;
                var enable = this.enableBtnOn;
                var scan_interval = 60;
                // console.log(enable);
                this.$store.dispatch("call", {
                    api: "setautoupgrade", data: {
                        time: autotime,
                        scan_interval: scan_interval,
                        enable: enable
                    }
                }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "setautoupgrade",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        that.$message({
                            "type": "success",
                            "api": "setautoupgrade",
                            "msg": result.code
                        });
                    } else {
                        that.$message({
                            "type": "errror",
                            "api": "setautoupgrade",
                            "msg": result.code
                        });
                    }
                });
            },
            onupload: function onupload(ajaxData) {
                var that = this;
                this.hideVerifyFirmware = true;
                this.sta = "uploading";
                this.$store.dispatch("call", { api: "prepareupgrade" }).then(function (result) {
                    if (result.success) {
                        that.$store.dispatch("call", { api: "uploadfirmware", data: ajaxData, timeOut: 120000 }).then(function (result) {
                            if (result.success) {
                                that.verifyFirmware();
                            } else {
                                that.code = result.code;
                                that.sta = "error";
                                that.errMsg = that.$lang.errorcode[result.code];
                            }
                        });
                    } else {
                        this.sta = "error";
                        that.errMsg = that.$lang.errorcode[result.code];
                    }
                });
            },
            // 在线更新固件 => 下载
            downloadBtnClick: function downloadBtnClick() {
                var that = this;
                this.hideVerifyFirmware = true;
                this.btnstatus = true;
                clearInterval(this.fDownloadInterval);
                that.$store.dispatch("call", { api: 'internetreachable', async: true }).then(function (result) {
                    if (!result.reachable) {
                        that.btnstatus = false;
                        that.$message({
                            type: 'warning',
                            msg: -210
                        });
                    } else {
                        that.$store.dispatch("call", { api: "downloadfirmware" }).then(function (result) {
                            if (result.failed) {
                                that.btnstatus = false;
                                that.$message({
                                    "type": "error",
                                    "api": "downloadfirmware",
                                    "msg": result.code
                                });
                                return;
                            }
                            if (result.success) {
                                that.fDownloadInterval = setInterval(function () {
                                    that.getprocess();
                                }, 500);
                            } else {
                                that.$message({
                                    "type": "error",
                                    "api": "downloadfirmware",
                                    "msg": result.code
                                });
                                that.btnstatus = false;
                            }
                        });
                    }
                });
            },
            getprocess: function getprocess() {
                var that = this;
                that.$store.dispatch("call", { api: "firmdownloadprogress", async: true }).then(function (result) {
                    that.btnstatus = false;
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "firmdownloadprogress",
                            "msg": result.code
                        });
                        return;
                    }
                    if (!result.success) {
                        // console.log("Getting firm download progress error!" + result.code);
                    } else if (result.completed) {
                        clearInterval(that.fDownloadInterval);
                        that.downloadBtnVal = "completed";
                        that.downloadBtnDisabled = true;
                        setTimeout(function () {
                            that.downloadBtnVal = "download";
                            that.downloadBtnDisabled = false;
                        }, 3000);
                        // console.log(that.downloadBtnVal);
                        that.verifyFirmware();
                    } else {
                        if (result.percent) {
                            var percent = parseInt(result.percent * 100);
                            if (percent >= 100) {
                                percent = 99;
                            }
                            that.downloadBtnDisabled = true;
                            if (percent + "%" == "NaN%") {
                                percent = 0;
                            }
                            that.downloadBtnVal = percent + "%";
                        }
                    }
                });
            },
            setKeepSetting: function setKeepSetting() {
                this.KeepSettingBtn = !this.KeepSettingBtn;
            },
            installBtnClick: function installBtnClick() {
                if (window.caniuse) {
                    sessionStorage.setItem("keepsetting", this.KeepSettingBtn);
                    sessionStorage.setItem("callfunction", "upgradefirmware");
                }
                window.location.href = "/process.html?action=upgradefirmware&keepsetting=" + this.KeepSettingBtn;
            },
            revertBtnClick: function revertBtnClick() {
                this.$store.commit("showModal", {
                    show: true,
                    title: "Caution",
                    message: this.$lang.modal.revertfirmware,
                    cb: function cb() {
                        if (window.caniuse) {
                            sessionStorage.setItem("callfunction", "revertfirmware");
                        }
                        window.location.href = "/process.html?action=revertfirmware";
                    }
                });
            },
            verifyFirmware: function verifyFirmware() {
                var that = this;
                this.verifyHeaderMsg = "Verifying...";
                this.hideVerifyFirmware = false;
                this.hideKeepSetting = true;
                this.hideInstallBtn = true;
                that.upgradeVersionVal = "-";
                that.upgradeMD5Val = "-";
                that.KeepSettingBtn = true;
                that.resultText = "-";
                this.$store.dispatch("call", { api: "verifyfirmware" }).then(function (result) {
                    that.scrollToBottom();
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "verifyfirmware",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success && result.supported) {
                        that.sta = "success";
                        that.upgradeVersionVal = result.version;
                        that.upgradeMD5Val = result.md5;
                        that.resultText = "Pass";
                        that.hideKeepSetting = false;
                        that.hideInstallBtn = false;
                        that.errMsg = '';
                    } else {
                        that.sta = "error";
                        that.resultText = "Fail";
                        that.upgradeVersionVal = result.version;
                        that.upgradeMD5Val = result.md5;
                        that.hideKeepSetting = true;
                        that.hideInstallBtn = true;
                        that.droppedFiles = null;
                        that.firmwareFileVal = null;
                        that.errMsg = that.$lang.errorcode[result.code];
                    }
                    that.verifyHeaderMsg = "Firmware Verification";
                    that.hideVerifyFirmware = false;
                });
            },
            scrollToBottom: function scrollToBottom() {
                var height = document.body.scrollHeight;
                $("html,body").animate({ scrollTop: height }, 1200);
            }

        }
    });
    return vueComponent;
});