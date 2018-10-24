"use strict";

define(["text!temple/ssserver/index.html", "component/gl-btn/index", "component/gl-input/index", "component/gl-tooltip/index", "component/gl-select/index", "vue"], function (stpl, gl_btn, gl_input, gl_tooltip, gl_select, Vue) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                timer: null,
                encryptArray: ["RC4-MD5", "AES-128-CFB", "AES-192-CFB", "AES-256-CFB", "AES-128-CTR", "AES-192-CTR", "AES-256-CTR", "AES-128-GCM", "AES-192-GCM", "AES-256-GCM", "CAMELLIA-128-CFB", "CAMELLIA-192-CFB", "CAMELLIA-256-CFB", "BF-CFB", "SALSA20", "CHACHA20", "CHACHA20-IETF", "CHACHA20-IETF-POLY1305", "XCHACHA20-IETF-POLY1305"],
                portTooltipMsg: null,
                pwdTooltipMsg: null,
                isServerOn: false,
                isResetBtn: false,
                typename: "default",
                checked: true,
                btnMove: false
            };
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
            clearInterval(this.timer);
            if (!this.btnMove) {
                // this.$store.dispatch("setinter");
                // this.$store.dispatch("setvpn");
                next();
                return;
            }
            this.$message({
                "type": "warning",
                "msg": -2102,
                "duration": 1000
            });
        },
        components: {
            "gl-btn": gl_btn,
            "gl-input": gl_input,
            "gl-tooltip": gl_tooltip,
            "gl-select": gl_select
        },
        computed: {
            sServerInfo: function sServerInfo() {
                return this.$store.getters.apiData["getserverconfig"];
            },
            sServerStatusInfo: function sServerStatusInfo() {
                return this.$store.getters.apiData["getserverstatus"];
            },
            sServerIPInfo: function sServerIPInfo() {
                return this.$store.getters.apiData["getserverip"];
            },
            sortedClient: function sortedClient() {
                var result = [];
                if (this.sServerStatusInfo && this.sServerStatusInfo.sServerStatusInfoRes && this.sServerStatusInfo.sServerStatusInfoRes.clients) {
                    var clients = new Object(this.sServerStatusInfo.sServerStatusInfoRes.clients);
                    for (var i in clients) {
                        result.push(clients[i]);
                    }
                    result.sort(function (a, b) {
                        var totalA = parseFloat(a.recv) + parseFloat(a.sent);
                        var totalB = parseFloat(b.recv) + parseFloat(b.sent);
                        return totalB - totalA;
                    });
                }
                return result;
            },
            btnName: function btnName() {
                var that = this;
                var name = "";
                switch (this.sServerStatusInfo.status) {
                    case "started":
                        name = "Stop";
                        this.typename = "danger";
                        this.timer = setInterval(function () {
                            that.$store.dispatch("call", { api: "getserverip" });
                            that.$store.dispatch("call", { api: "getserverstatus" });
                        }, 5000);
                        break;
                    case "stopped":
                        name = "Start";
                        this.typename = "default";
                        break;
                    default:
                        name = "Cancel";
                        this.typename = "danger";
                        break;
                }
                return name;
            }
        },
        mounted: function mounted() {
            var that = this;
            this.$store.dispatch("call", { api: "getserverconfig" });
            this.$store.dispatch("call", { api: "getserverstatus" });
            this.$store.dispatch("call", { api: "getserverip" });
            // setTimeout(function () {
            //     that.$store.commit("clearvpnTimer");
            // }, 1200);
            // that.$store.commit("clearTimer");
        },
        methods: {
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
            setServer: function setServer() {
                var status = this.sServerStatusInfo.status;
                var that = this;
                that.btnMove = true;
                this.isResetBtn = true;
                if (status == "stopped") {
                    var portVal = this.sServerInfo.port;
                    var pwdVal = this.sServerInfo.password;
                    var encryVal = this.sServerInfo.encryption.toLowerCase();
                    if (portVal.length == 0) {
                        this.portTooltipMsg = this.$lang.ssserver.dontEmpty + "!";
                        this.isResetBtn = false;
                    } else if (isNaN(portVal)) {
                        this.portTooltipMsg = this.$lang.ssserver.isNum;
                        this.isResetBtn = false;
                    } else if (pwdVal.length == 0) {
                        this.pwdTooltipMsg = this.$lang.ssserver.dontEmpty + "!";
                        this.isResetBtn = false;
                    } else {
                        that.$store.dispatch("call", {
                            api: "setserver", data: {
                                port: portVal,
                                password: pwdVal,
                                encryption: encryVal
                            }
                        }).then(function (result) {
                            if (result.failed) {
                                that.$message({
                                    "type": "error",
                                    'api': "setserver",
                                    "msg": result.code
                                });
                                that.isResetBtn = false;
                                return;
                            }
                            if (result.success) {
                                that.$store.dispatch("call", { api: "startserver" }).then(function (result) {
                                    if (result.failed) {
                                        that.$message({
                                            "type": "error",
                                            'api': "startserver",
                                            "msg": result.code
                                        });
                                        that.isResetBtn = false;
                                        return;
                                    }
                                    if (result.success) {
                                        setTimeout(function () {
                                            that.$store.dispatch("call", { api: "getserverip" });
                                            that.$store.dispatch("call", { api: "getserverstatus" }).then(function () {
                                                that.isResetBtn = false;
                                            });
                                            clearInterval(that.timer);
                                            that.timer = setInterval(function () {
                                                that.$store.dispatch("call", { api: "getserverip" });
                                                that.$store.dispatch("call", { api: "getserverstatus" });
                                            }, 5000);
                                        }, 1500);
                                    } else {
                                        that.$message({
                                            "type": "error",
                                            'api': "startserver",
                                            "msg": result.code
                                        });
                                        that.isResetBtn = false;
                                        return;
                                    }
                                });
                            } else {
                                that.isResetBtn = false;
                                // console.log("Error code: " + result.success + ", " + result.code + ".");
                            }
                        });
                    }
                } else {
                    this.stopServer();
                }
                setTimeout(function () {
                    that.btnMove = false;
                }, 2500);
            },
            stopServer: function stopServer() {
                var that = this;
                clearInterval(that.timer);
                this.$store.dispatch("call", { api: "stopserver" }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            'api': "stopserver",
                            "msg": result.code
                        });
                        that.isResetBtn = false;
                        return;
                    }
                    if (result.success) {
                        setTimeout(function () {
                            that.$store.dispatch("call", { api: "getserverstatus" }).then(function () {
                                that.isResetBtn = false;
                            });
                        }, 2500);
                    } else {
                        // console.log("stop server success " + result.success + ", " + result.code);
                        that.$message({
                            "type": "error",
                            'api': "stopserver",
                            "msg": result.code
                        });
                        that.isResetBtn = false;
                    }
                });
            }
        }
    });
    return vueComponent;
});