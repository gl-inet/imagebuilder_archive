"use strict";

define(["vue", "text!temple/ssclient/index.html", "css!temple/ssclient/index.css", "component/modal/modal", "component/gl-btn/index", "component/gl-label/index", "component/gl-input/index", "component/gl-select/index", "component/gl-tooltip/index"], function (Vue, tmple, css, modal, gl_btn, gl_label, gl_input, gl_select, gl_tooltip) {
    var vueComponent = Vue.extend({
        template: tmple,
        components: {
            "gl-btn": gl_btn,
            "gl-label": gl_label,
            "gl-input": gl_input,
            "gl-select": gl_select,
            "gl-tooltip": gl_tooltip,
            "gl-modal": modal
        },
        data: function data() {
            return {
                checkipStatus: "",
                encryptionSelect: "",
                ipInput: "",
                dspInput: "",
                portInput: "",
                pswInput: "",
                showModal: false,
                timer: "",
                clientsData: [],
                checked: false,
                currentClientIndex: 0,
                isHasErrorMsg: false,
                logInfoArray: [],
                btnStatus: false,
                typename: "default",
                btnMove: false,
                addState: false,
                id: "",
                ssexpect: 'init',
                ssclientEncryption: ["RC4-MD5", "AES-128-CFB", "AES-192-CFB", "AES-256-CFB", "AES-128-CTR", "AES-192-CTR", "AES-256-CTR", "AES-128-GCM", "AES-192-GCM", "AES-256-GCM", "CAMELLIA-128-CFB", "CAMELLIA-192-CFB", "CAMELLIA-256-CFB", "CHACHA20", "CHACHA20-IETF", "CHACHA20-IETF-POLY1305", "XCHACHA20-IETF-POLY1305"],
                ssEncryption: ["RC4-MD5", "AES-128-CFB", "AES-192-CFB", "AES-256-CFB", "AES-128-CTR", "AES-192-CTR", "AES-256-CTR", "AES-128-GCM", "AES-192-GCM", "AES-256-GCM", "CAMELLIA-128-CFB", "CAMELLIA-192-CFB", "CAMELLIA-256-CFB", "BF-CFB", "SALSA20", "CHACHA20", "CHACHA20-IETF", "CHACHA20-IETF-POLY1305", "XCHACHA20-IETF-POLY1305"]
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
            if (!this.btnMove) {
                clearInterval(this.timer);
                // this.$store.dispatch("setvpn");
                // this.$store.dispatch("setinter");
                // this.$store.dispatch("setALLtimer");
                next();
                return;
            }
            this.$message({
                "type": "warning",
                "msg": -2000,
                "duration": 1000
            });
        },
        watch: {
            checked: function checked() {
                var _this = this;
                setTimeout(function () {
                    _this.checked = false;
                }, 10000);
            }
        },
        mounted: function mounted() {
            var that = this;
            that.getData();
            // that.$store.commit("clearvpnTimer");
            // that.$store.commit("clearTimer");
            // that.$store.commit('clearInterTimer');
        },
        computed: {
            ssclientconfig: function ssclientconfig() {
                return this.$store.getters.apiData["ssclientconfig"];
            },
            ssclient: function ssclient() {
                return this.ssclientconfig.all_config;
            },
            showssclient: function showssclient() {
                return this.ssclientconfig.all_config && this.ssclientconfig.all_config.length != 0;
            },
            ssclientstatus: function ssclientstatus() {
                return this.$store.getters.apiData["ssclientstatus"];
            },
            btnName: function btnName() {
                var name = "";
                switch (this.ssclientstatus.status) {
                    case "connected":
                        name = "Disconnect";
                        this.typename = "danger";
                        break;
                    case "connecting":
                        name = "Abort";
                        this.typename = "danger";
                        break;
                    default:
                        name = "Connect";
                        this.typename = "default";
                        break;
                }
                return name;
            },
            dataRC: function dataRC() {
                if (this.ssclientstatus) {
                    var sent = this.ssclientstatus.sent;
                    var recv = this.ssclientstatus.received;
                    sent = this.getFlow(sent);
                    recv = this.getFlow(recv);
                    return recv + "/" + sent;
                }
            },
            curclient: function curclient() {
                var item = '';
                if (this.ssclientstatus.status != 'disconnected') {
                    var cur_client = this.ssclientstatus.clientid;
                    for (var i = 0; i < this.ssclient.length; i++) {
                        if (cur_client == this.ssclient[i].clientid) {
                            item = this.ssclient[i].name;
                        }
                    }
                }
                return item;
            },
            ssBtn: function ssBtn() {
                if (this.ssexpect != 'init') {
                    if (this.ssexpect == this.ssclientstatus.status) {
                        this.ssexpect = 'init';
                        return false;
                    } else {
                        return true;
                    }
                } else {
                    return false;
                }
            }
        },
        methods: {
            getData: function getData() {
                var that = this;
                this.$store.dispatch("call", { api: "ssclientconfig" }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "ssclientconfig",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        that.clientsData = result.all_config;
                        that.getClientStatus();
                        if (that.clientsData.length > 0) {
                            that.getClientStatus();
                            for (var x in that.clientsData) {
                                //  使用that.$set动态更新 新添加属性
                                that.$set(that.clientsData[x], "collapseItemID", "SSclient" + x);
                                that.$set(that.clientsData[x], "checked", false);
                                that.$set(that.clientsData[x], "defaultDescription", that.clientsData[x].name);
                            }
                        }
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "ssclientconfig",
                            "msg": result.code
                        });
                    }
                });
            },
            getClientStatus: function getClientStatus() {
                var that = this;
                this.$store.dispatch("call", { api: "ssclientstatus" }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "ssclientstatus",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success == 1 && result.status == "connected") {
                        clearInterval(that.timer);
                        that.timer = setInterval(function () {
                            that.getClientStatus();
                        }, 5000);
                        var curClientID = result.clientid;
                        for (var i in that.clientsData) {
                            if (curClientID == that.clientsData[i].clientid) {
                                that.currentClientIndex = i;
                                break;
                            }
                        }
                    } else {
                        clearInterval(that.timer);
                    }
                });
            },
            addClient: function addClient() {
                var that = this;
                if (!this.portInput || !this.pswInput || !this.dspInput || !this.ipInput) {
                    that.$message({
                        "type": "warning",
                        "msg": -2001
                    });
                    return;
                }
                if (!this.checkipStatus) {
                    that.$message({
                        "type": "error",
                        "msg": -2002
                    });
                    return;
                }
                if (this.clientsData) {
                    for (var k in this.clientsData) {
                        if (this.dspInput == this.clientsData[k].name) {
                            that.$message({
                                'type': "error",
                                'msg': -15
                            });
                            return;
                        }
                    }
                }
                that.addState = true;
                that.$store.dispatch("call", {
                    api: "ssaddclient", data: {
                        server: this.ipInput,
                        port: this.portInput,
                        password: this.pswInput,
                        encryption: this.encryptionSelect.toLowerCase(),
                        name: this.dspInput
                    }, timeOut: 10000
                }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            'type': "error",
                            "api": "ssaddcliet",
                            'msg': result.code
                        });
                        return;
                    }
                    if (result.success) {
                        that.$message({
                            'type': "success",
                            "api": "ssaddcliet",
                            'msg': result.code
                        });
                        that.getData();
                    } else {
                        that.$message({
                            'type': "error",
                            "api": "ssaddcliet",
                            'msg': result.code
                        });
                    }
                    that.closeModal();
                    that.addState = false;
                });
            },
            setConnect: function setConnect() {
                this.btnMove = true;
                if (this.btnName == "Connect") {
                    this.connect();
                } else {
                    this.disconnect();
                }
            },
            connect: function connect() {
                var that = this;
                // that.btnStatus = true;
                that.ssexpect = 'connected';
                clearInterval(that.timer);
                that.$store.dispatch("call", {
                    api: "startssclient", data: {
                        clientid: this.id
                    }, timeOut: 80000
                }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            'api': "startssclient",
                            "msg": result.code
                        });
                        // that.btnStatus = false;
                        that.btnMove = false;
                        that.ssexpect = 'init';
                        return;
                    }
                    if (result.success) {
                        that.btnMove = false;
                        that.$store.dispatch("call", { api: "ssclientstatus" });
                        // that.getClientStatus();
                        that.timer = setInterval(function () {
                            that.$store.dispatch("call", { api: "ssclientstatus" });
                            // that.getClientStatus();
                            // that.btnStatus = false;
                        }, 5000);
                    } else {
                        that.$message({
                            "type": "error",
                            'api': "startssclient",
                            "msg": result.code
                        });
                        that.ssexpect = 'init';
                        that.btnMove = false;
                        // that.btnStatus = false;
                    }
                });
            },
            disconnect: function disconnect() {
                var that = this;
                // that.btnStatus = true;
                clearInterval(that.timer);
                that.ssexpect = 'disconnected';
                this.$store.dispatch("call", { api: "ssstopclient" }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            'api': "ssstopclient",
                            "msg": result.code
                        });
                        // that.btnStatus = false;
                        that.ssexpect = 'init';
                        return;
                    }
                    if (result.success) {
                        // that.getClientStatus();
                        that.$store.dispatch("call", { api: "ssclientstatus" });

                        that.timer = setInterval(function () {
                            that.$store.dispatch("call", { api: "ssclientstatus" });
                            // that.getClientStatus();
                            // that.btnStatus = false;
                        }, 5000);
                    } else {
                        that.$message({
                            "type": "error",
                            'api': "ssstopclient",
                            "msg": result.code
                        });
                        that.ssexpect = 'init';
                        // that.btnStatus = false;
                    }
                    that.btnMove = false;
                });
            },
            getClietid: function getClietid(item) {
                if (item.clientid) {
                    this.id = item.clientid;
                } else {
                    for (var i = 0; i < this.ssclient.length; i++) {
                        if (item == this.ssclient[i].name) {
                            this.id = this.ssclient[i].clientid;
                        }
                    }
                }
            },
            inInputStatus: function inInputStatus(data) {
                this.checkipStatus = data;
            },
            openModal: function openModal() {
                this.showModal = true;
            },
            closeModal: function closeModal() {
                this.ipInput = "", this.dspInput = "", this.portInput = "", this.pswInput = "", this.showModal = false;
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

            chooseClient: function chooseClient(clientIndex) {
                this.curClientName = this.clientsData[clientIndex].name;
                this.currentClientIndex = clientIndex;
            },
            modifyClient: function modifyClient(clientIndex) {
                var that = this;
                var ipReg = /(?:(^|\.)(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){4}$/;
                var ipVal = this.clientsData[clientIndex].server.trim();
                var isIpValid = ipReg.test(ipVal);
                var portVal = this.clientsData[clientIndex].port.trim();
                var descriptionVal = this.clientsData[clientIndex].name.trim();
                var pwdVal = this.clientsData[clientIndex].password.trim();
                var encryptionVal = this.clientsData[clientIndex].encryption.toLowerCase();
                var isDesValid = this.isDescriptionValid(clientIndex, descriptionVal);
                if (descriptionVal.length == 0) {
                    this.$set(this.clientsData[clientIndex], "desTooltipMsg", "Can't be empty!");
                } else if (isDesValid == false) {
                    this.$set(this.clientsData[clientIndex], "desTooltipMsg", "Already exists!");
                } else if (ipVal.length == 0) {
                    this.$set(this.clientsData[clientIndex], "IPTooltipMsg", "Can't be empty!");
                } else if (isIpValid == false) {
                    this.$set(this.clientsData[clientIndex], "IPTooltipMsg", "Invalid IP!");
                } else if (portVal.length == 0) {
                    this.$set(this.clientsData[clientIndex], "portTooltipMsg", "Can't be empty!");
                } else if (pwdVal.length == 0) {
                    this.$set(this.clientsData[clientIndex], "pwdTooltipMsg", "Can't be empty!");
                } else {
                    this.$store.dispatch("call", {
                        api: "ssmodifyclient", data: {
                            server: ipVal,
                            port: portVal,
                            password: pwdVal,
                            encryption: encryptionVal,
                            name: descriptionVal,
                            clientid: that.clientsData[clientIndex].clientid
                        }
                    }).then(function (result) {
                        if (result.failed) {
                            that.$message({
                                "type": "error",
                                "api": "ssmodifyclient",
                                "msg": result.code
                            });
                            return;
                        }
                        if (result.success == 1) {
                            that.$set(that.clientsData[clientIndex], "defaultDescription", descriptionVal);
                            that.$message({
                                "type": "success",
                                "api": "ssmodifyclient",
                                "msg": result.code
                            });
                        } else if (result.success != 1) {
                            that.$message({
                                "type": "error",
                                "api": "ssmodifyclient",
                                "msg": result.code
                            });
                        }
                    });
                }
            },
            removeClient: function removeClient(clientIndex) {
                var that = this;
                that.$store.commit("showModal", {
                    title: "Caution",
                    message: this.t(this.$lang.modal.delConfig) + "?",
                    cb: function cb() {
                        that.remove(clientIndex);
                    }
                });
            },
            remove: function remove(clientIndex) {
                var that = this;
                this.$store.dispatch("call", {
                    api: "ssremoveclient", data: {
                        clientid: that.clientsData[clientIndex].clientid
                    }
                }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "ssremoveclient",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success == 1) {
                        that.clientsData.splice(clientIndex, 1);
                        if (that.ssclientstatus && that.ssclientstatus.status != "connected" && that.currentClientIndex == clientIndex) {
                            that.currentClientIndex = 0;
                        } else if (that.ssclientstatus && that.ssclientstatus.status != "connected" && that.currentClientIndex > clientIndex || that.ssclientstatus && that.ssclientstatus.status == "connected" && that.currentClientIndex > clientIndex) {
                            that.currentClientIndex = that.currentClientIndex - 1;
                        }
                    } else if (result.success != 1) {
                        that.$message({
                            "type": "error",
                            "api": "ssremoveclient",
                            "msg": result.code
                        });
                    }
                });
            },
            inputing: function inputing(clientIndex, property) {
                this.$set(this.clientsData[clientIndex], property, null);
            },

            isDescriptionValid: function isDescriptionValid(clientIndex, description) {
                for (var x in this.clientsData) {
                    if (clientIndex == x) {
                        continue;
                    }
                    if (description == this.clientsData[x].name) {
                        return false;
                    }
                }
                return true;
            }
        }
    });
    return vueComponent;
});