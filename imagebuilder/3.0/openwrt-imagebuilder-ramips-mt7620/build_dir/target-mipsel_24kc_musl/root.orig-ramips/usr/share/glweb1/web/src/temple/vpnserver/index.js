"use strict";

define(["vue", "text!temple/vpnserver/index.html", "component/gl-btn/index", "component/gl-input/index", "component/gl-tooltip/index", "component/gl-select/index", "component/gl-toggle-btn/index"], function (Vue, temp, gl_btn, gl_input, gl_tooltip, gl_select, gl_toggle) {
    var vueComponent = Vue.extend({
        template: temp,
        data: function data() {
            return {
                timer: "",
                fileTimer: "",
                status: true,
                btname: "Modify",
                btnapy: false,
                btnstatus: false,
                enableManual: false,
                portTooltipMsg: null,
                maskTooltipMsg: null,
                subnetTooltipMsg: null,
                generate: false,
                typename: "default",
                encryptArray: ["SHA1"],
                ProtoArray: ["UDP", "TCP"],
                KeepSettingBtn: false,
                circleClass: "",
                btnmfy: false,
                btnstart: false,
                btnserver: 'init',
                modifyStat: true, //点击start隐藏modify
                timeout: null
            };
        },
        computed: {
            modifyBtn: function modifyBtn() {
                if (this.ovpnstatus.status == 'started') {
                    return false;
                }
                return true;
            },
            // 配置文件
            ovpnconfig: function ovpnconfig() {
                return this.$store.getters.apiData["getovpnconfig"];
            },
            getovpnfilestatus: function getovpnfilestatus() {
                return this.$store.getters.apiData['getovpnfilestatus'];
            },
            ovpnstatus: function ovpnstatus() {
                return this.$store.getters.apiData["ovpnstatus"];
            },
            btnName: function btnName() {
                var name = "";
                switch (this.ovpnstatus.status) {
                    case "started":
                        name = "Stop";
                        this.typename = "danger";
                        this.circleClass = "active";
                        break;
                    default:
                        name = "Start";
                        this.circleClass = "";
                        this.typename = "default";
                        break;
                }
                return name;
            },
            checkServer: function checkServer() {
                if (this.btnserver != 'init') {
                    if (this.btnserver == this.ovpnstatus.status) {
                        this.btnserver = 'init';
                        return false;
                    } else {
                        return true;
                    }
                } else {
                    return false;
                }
            }
        },
        components: {
            "gl-btn": gl_btn,
            "gl-input": gl_input,
            "gl-tooltip": gl_tooltip,
            "gl-select": gl_select,
            "gl-tg-btn": gl_toggle
        },
        beforeRouteEnter: function beforeRouteEnter(to, from, next) {
            next(function (vm) {
                $("#router-visual").slideUp();
                $(".bar.active").removeClass("active");
                // $(".clsLink2vpn").addClass("active");
                setTimeout(function () {
                    if ($(".clsLink2" + vm.$route.path.split("/")[1]).hasClass("bar")) {
                        $(".bar.active").removeClass("active");
                        $(".clsLink2" + vm.$route.path.split("/")[1]).addClass("active");
                        $("#vpn").collapse("show");
                        $("#moresetting").collapse("hide");
                        $("#applications").collapse("hide");
                        $("#system").collapse("hide");
                    }
                }, 250);
            });
        },
        beforeRouteLeave: function beforeRouteLeave(to, from, next) {
            if (!this.btnapy) {
                // this.$store.dispatch("setvpn");
                // this.$store.dispatch("setinter");
                // this.$store.dispatch("setALLtimer");
                clearInterval(this.timer);
                next();
            } else {
                this.$message({
                    "type": "warning",
                    "msg": -2400
                });
            }
        },
        mounted: function mounted() {
            this.generate = this.getovpnfilestatus.success;
            var that = this;
            $("#router-visual").slideUp();
            $("#idEnableChange").change(function () {
                that.enableChange();
            });
            $("[data-toggle=\"tooltip\"]").tooltip();
            that.checkfile(false);
            // that.$store.commit("clearvpnTimer");
            // that.$store.commit("clearTimer");
            // that.$store.commit('clearInterTimer');
        },
        methods: {
            // Apply => Modify
            checkBtn: function checkBtn() {
                this.timerData();
                this.btname = "Modify";
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
            checkfile: function checkfile(target) {
                var that = this;
                this.$store.dispatch("call", { api: "getovpnfilestatus" }).then(function (result) {
                    if (result.success) {
                        that.generate = true;
                    } else {
                        that.generate = false;
                    }
                    that.getconfig(target);
                });
            },
            generateing: function generateing() {
                var that = this;
                this.btnapy = true;
                // 创建证书
                that.$store.dispatch("call", { api: "createovpncertificate", data: { force: 1 }, timeOut: 90000 }).then(function (result) {
                    that.btnapy = false;
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "createovpncertificate",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        setTimeout(function () {
                            that.$store.dispatch("call", { api: "getovpnfilestatus" });
                        }, 3000);
                        that.generate = true;
                        that.getconfig(true);
                        // 保险措施 将Access按钮默认改为false
                        that.$store.dispatch("call", { api: "ovpnblock", data: { enable: false } });
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "createovpncertificate",
                            "msg": result.code
                        });
                    }
                });
            },
            startOvpn: function startOvpn() {
                this.modifyStat = false;
                var that = this;
                clearInterval(this.timer);
                clearTimeout(this.timeout);
                if (this.ovpnstatus.status == "stopped") {
                    this.btnserver = 'started';
                    this.$store.dispatch("call", { api: "ovpnstart" }).then(function (result) {
                        if (result.failed) {
                            that.$message({
                                "type": "error",
                                "api": "ovpnstart",
                                "msg": result.code
                            });
                            that.btnserver = 'init';
                            return;
                        }
                        if (result.success) {
                            // that.$message({
                            //     "type": "success",
                            //     "api": "ovpnstart",
                            //     "msg": result.code
                            // });
                        } else {
                            that.$message({
                                "type": "error",
                                "api": "ovpnstart",
                                "msg": result.code
                            });
                            that.btnserver = 'init';
                        }
                        that.timerData();
                        that.modifyStat = true;
                        that.timeout = setTimeout(function () {
                            if (that.btnserver != 'init') {
                                that.btnserver = 'init';
                            }
                        }, 5000);
                    });
                } else {
                    this.btnserver = 'stopped';
                    this.stopOvpn();
                }
            },
            stopOvpn: function stopOvpn() {
                var that = this;
                clearTimeout(this.timeout);
                this.$store.dispatch("call", { api: "ovpnstop" }).then(function (result) {
                    if (result.success) {
                        // that.$message({
                        //     "type": "success",
                        //     "api": "ovpnstop",
                        //     "msg": result.code
                        // });
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "ovpnstop",
                            "msg": result.code
                        });
                        that.btnserver = 'init';
                    }
                    that.timerData();
                    that.modifyStat = true;
                    that.timeout = setTimeout(function () {
                        if (that.btnserver != 'init') {
                            that.btnserver = 'init';
                        }
                    }, 5000);
                });
            },
            getconfig: function getconfig(reset) {
                var that = this;
                this.$store.dispatch("call", { api: "getovpnconfig" }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "getovpnconfig",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        if (reset) {
                            // 发送配置后台生成配置文件
                            that.$store.dispatch("call", {
                                api: "setovpnconfig", data: {
                                    auth: that.ovpnconfig.auth,
                                    proto: that.ovpnconfig.proto.toLowerCase(),
                                    port: that.ovpnconfig.port,
                                    subnet: that.ovpnconfig.subnet,
                                    mask: that.ovpnconfig.mask
                                }
                            }).then(function (result) {
                                if (result.success) {
                                    that.$message({
                                        "type": "success",
                                        "api": "setovpnconfig",
                                        "msg": result.code
                                    });
                                } else {
                                    that.$message({
                                        "type": "error",
                                        "api": "setovpnconfig",
                                        "msg": result.code
                                    });
                                }
                            });
                        }
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "getovpnconfig",
                            "msg": result.code
                        });
                    }
                });
                that.timerData();
            },
            timerData: function timerData() {
                var that = this;
                this.$store.dispatch("call", { api: "ovpnstatus" });
                clearInterval(this.timer);
                this.timer = setInterval(function () {
                    that.$store.dispatch("call", { api: "getovpnconfig" });
                    that.$store.dispatch("call", { api: "ovpnstatus" });
                }, 5000);
            },
            blockclient: function blockclient(item) {
                var that = this;
                if (item.access) {
                    that.block(false);
                } else {
                    this.$store.commit("showModal", {
                        show: true,
                        message: this.$lang.modal.isOpen,
                        title: this.$lang.modal.access,
                        cb: function cb() {
                            that.block(true);
                        },
                        cancel: function cancel() {
                            that.ovpnconfig.access = false;
                        }
                    });
                }
                clearInterval(this.timer);
            },
            block: function block(item) {
                var that = this;
                that.$store.dispatch("call", {
                    api: 'ovpnblock', data: {
                        "enable": item
                    }
                }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "ovpnblock",
                            "msg": result.code
                        });
                        that.timerData();
                        return;
                    }
                    if (result.success) {
                        that.$message({
                            "type": "success",
                            "api": "ovpnblock",
                            "msg": result.code
                        });
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "ovpnblock",
                            "msg": result.code
                        });
                    }
                    that.timerData();
                });
            },
            // Apply vpn
            applyConfig: function applyConfig() {
                var that = this;
                clearInterval(this.timer);
                if (this.btname == "Modify") {
                    this.btnstatus = !this.btnstatus;
                    this.btname = "Apply";
                } else if (this.btname == "Apply") {
                    if (!that.ovpnconfig.subnet || !that.ovpnconfig.port || !that.ovpnconfig.mask) {
                        that.$message({
                            type: "warning",
                            msg: -2401
                        });
                        return;
                    }
                    // 端口校验
                    var port = /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/;
                    var status = port.test(this.ovpnconfig.port);
                    if (!status) {
                        that.$message({
                            type: "error",
                            msg: -216
                        });
                        this.btname = "Modify";
                        that.timerData();
                        return;
                    } // 端口校验
                    this.btnstatus = !this.btnstatus;
                    this.btnmfy = true;
                    that.btnapy = true;
                    that.$store.dispatch("call", {
                        api: "setovpnconfig", data: {
                            auth: that.ovpnconfig.auth,
                            proto: that.ovpnconfig.proto.toLowerCase(),
                            port: that.ovpnconfig.port,
                            subnet: that.ovpnconfig.subnet,
                            mask: that.ovpnconfig.mask
                        }
                    }).then(function (result) {
                        if (result.success) {
                            that.btnapy = false;
                            that.$store.commit("showModal", {
                                show: true,
                                type: "success",
                                yes: "Export",
                                message: that.$lang.modal.isExportConfig,
                                no: "Cancel",
                                cb: function cb() {
                                    that.timerData();
                                    that.exportfile();
                                },
                                cancel: function cancel() {
                                    that.timerData();
                                }
                            });
                        } else {
                            that.timerData();
                            that.btnstatus = !that.btnstatus;
                            that.btnapy = false;
                            that.$message({
                                "type": "error",
                                "api": "setovpnconfig",
                                "msg": result.code
                            });
                        }
                        that.btname = "Modify";
                        that.btnmfy = false;
                    });
                }
            },
            exportfile: function exportConfig() {
                window.location = "/api/router/file/download?path=/etc/openvpn/ovpn/client.ovpn";
            }
        }
    });
    return vueComponent;
});