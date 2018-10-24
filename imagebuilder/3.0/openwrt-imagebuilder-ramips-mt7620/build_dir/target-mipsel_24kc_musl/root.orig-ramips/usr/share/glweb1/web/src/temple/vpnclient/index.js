"use strict";

define(["text!temple/vpnclient/index.html", "component/gl-btn/index", "component/modal/modal", "component/gl-upload-file/index", "component/gl-input/index", "component/gl-tooltip/index", "component/gl-select/index", "vue"], function (tmple, gl_btn, modal, gl_upload, gl_input, gl_tooltip, gl_select, Vue) {
    var vueComponent = Vue.extend({
        template: tmple,
        components: {
            "gl-btn": gl_btn,
            "gl-modal": modal,
            "gl-upload": gl_upload,
            "gl-input": gl_input,
            "gl-tooltip": gl_tooltip,
            "gl-select": gl_select
        },
        data: function data() {
            return {
                timer: "",
                isOnly: false,
                curClientIndex: 0, //the current config client index in clients Array
                curStatusIndex: null, //the index of client which has status
                // isResetConnect: false, //is reset the loading status of connect button
                clients: [], //the data of clients, including others js add on,
                curServerIndex: 0, //which client's config server button is click
                curServerList: null, //the serverlist of the curConfigClientIndex
                curserverName: null,
                btnName: "",
                showModal: false,
                pageState: true,
                sta: "",
                code: "",
                vpnNumHtml: 0,
                dspText: "",
                usText: "",
                pswText: "",
                // stxt: "",
                vpnState: true,
                addState: false,
                showvpnlist: false,
                btnStatus: "default",
                pswInfo: false,
                useInfo: false,
                connectStatus: false,
                id: "",
                vpnstatus: 'init',
                vpnsuccess: "init",
                timeOut: null,
                rmStatus: false,
                checkServer: false,
                errorMsg: '',
                currentVpn: '',
                defaultName: '',
                defaultIndex: 0,
                serverChange: false,
                serverIndex: 0,
                settingStatus: false
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
            // this.$store.dispatch("setinter");
            // this.$store.dispatch("setvpn");
            // this.$store.dispatch("setALLtimer");
            next();
        },
        computed: {
            ovpnGetClients: function ovpnGetClients() {
                return this.$store.getters.apiData["ovpnGetClients"];
            },
            getclientstatus: function getclientstatus() {
                return this.$store.getters.apiData["ovpngetclientstatus"];
            },
            showClientPanel: function showClientPanel() {
                return this.ovpnGetClients.clients && this.ovpnGetClients.clients.length != 0;
            },
            disableConfig: function disableConfig() {
                return this.getclientstatus && this.getclientstatus.enable && this.getclientstatus.status != "off";
            },
            status: function status() {
                var config = this.getclientstatus ? this.getclientstatus.config : null;
                var clientID = config ? config.split("/")[3] : null;
                if (this.getclientstatus && this.getclientstatus.enable && this.getclientstatus.status == "connected") {
                    this.curStatusIndex = this.getClientIndex(clientID);
                    this.curClientIndex = this.curStatusIndex;
                    this.btnName = "Disconnect";
                    this.btnStatus = "danger";
                    return "connected";
                }
                if (this.getclientstatus && this.getclientstatus.enable && this.getclientstatus.status == "connecting") {
                    this.curStatusIndex = this.getClientIndex(clientID);
                    this.curClientIndex = this.curStatusIndex;
                    this.btnName = "Abort";
                    this.btnStatus = "danger";
                    return "connecting";
                }
                if (this.getclientstatus && this.getclientstatus.enable && this.getclientstatus.status == "off") {
                    this.curStatusIndex = this.getClientIndex(clientID);
                    this.btnName = "Connect";
                    this.btnStatus = "default";
                    return "failed";
                }
                this.btnName = "Connect";
                this.btnStatus = "default";
                return "off";
            },
            circleClass: function circleClass() {
                if (this.status == "connected") {
                    return "active";
                }
                if (this.status == "connecting") {
                    return "waiting";
                }
                if (this.status == "failed" && this.getclientstatus.config) {
                    return "failed";
                }
                return null;
            },
            errMsgs: function errMsgs() {
                return this.getclientstatus && this.getclientstatus.errormsg && this.getclientstatus.errormsg.replace(/\s|\xA0/g, "") ? this.getclientstatus.errormsg.split("\n") : [];
            },
            ipAdr: function ipAdr() {
                return this.getclientstatus && this.getclientstatus.data ? this.getclientstatus.data.ipaddr : "";
            },
            dataRC: function dataRC() {
                if (this.getclientstatus && this.getclientstatus.data) {
                    var sent = this.getclientstatus.data.tx_bytes;
                    var recv = this.getclientstatus.data.rx_bytes;
                    sent = this.getFlow(sent);
                    recv = this.getFlow(recv);
                    return recv + " / " + sent;
                }
            },
            vpnadState: function vpnadState() {
                if (!this.dspText || this.getLen(this.dspText) > 32) {
                    return true;
                }
                if (this.pswInfo) {
                    if (this.useInfo) {
                        if (!this.dspText || !this.usText || !this.pswText || this.getLen(this.usText) > 512 || this.getLen(this.pswText) > 512) {
                            return true;
                        }
                    } else {
                        if (!this.dspText || !this.pswText || this.getLen(this.pswText) > 512) {
                            return true;
                        }
                    }
                }
                return false;
            },
            // 动态改变当前连接的client
            currSel: function currSel() {
                var item = "";
                if (this.status != "off") {
                    if (this.getclientstatus && this.getclientstatus.config) {
                        var vpnIndex = this.getclientstatus.config.split("/")[3];
                        if (this.clients && this.clients.length > 0 && this.ovpnGetClients.clients && this.ovpnGetClients.clients.length > 0) {
                            var len = this.ovpnGetClients.clients.length;
                            for (var i = 0; i < len; i++) {
                                if (vpnIndex == this.ovpnGetClients.clients[i].id) {
                                    item = this.clients[i]['description'];
                                    break;
                                }
                            }
                        }
                    }
                }
                this.currentVpn = item || this.currentVpn;
                return item;
            },
            checkVpn: function checkVpn() {
                if (this.vpnstatus != 'init') {
                    if (this.vpnstatus == this.getclientstatus.status || this.vpnsuccess == this.getclientstatus.status) {
                        this.vpnstatus = 'init';
                        return false;
                    } else {
                        return true;
                    }
                } else {
                    return false;
                }
            },
            pswType: function pswType() {
                var item;
                if (!this.useInfo) {
                    item = 'Passphrase';
                } else {
                    item = 'Password';
                }
                return item;
            }
        },
        watch: {
            currSel: function currSel(data) {
                // console.log(data)
            },
        },
        mounted: function mounted() {
            var that = this;
            this.getData();
            if (this.status != "off") {
                this.currentVpn = this.currSel;
            }
            // that.$store.commit("clearvpnTimer");
            // that.$store.commit("clearTimer");
            // that.$store.commit('clearInterTimer');
        },
        methods: {
            setClient: function setClient(target) {
                this.modifyClient(this.defaultIndex)
                var that = this;
                var enable = false;
                this.checkServer = false;
                if (this.btnName == "Connect" || target == 'check') {
                    that.connectStatus = true;
                    that.settingStatus = true
                    enable = true;
                    that.$store.dispatch("call", {
                        api: 'internetreachable',
                        async: true
                    }).then(function (result) {
                        if (!result.reachable) {
                            that.$message({
                                type: 'warning',
                                msg: -210
                            });
                        } else {
                            that.checkClient(enable);
                        }
                        that.connectStatus = false;
                        that.settingStatus = false
                    });
                } else {
                    that.checkClient(enable);
                }
            },
            // open or close ovpnclient
            checkClient: function checkClient(enable) {
                var that = this;
                var code = 0;
                if (enable) {
                    code = -206;
                    this.vpnstatus = 'connecting';
                    this.vpnsuccess = 'connected';
                } else {
                    code = -205;
                    this.vpnstatus = 'off';
                }
                clearInterval(that.timer);
                clearTimeout(that.timeOut);
                this.$store.dispatch("call", {
                    api: "ovpnsetclient",
                    data: {
                        enableovpn: enable,
                        ovpnclientid: this.id,
                        force_client: this.getclientstatus.force
                    },
                    timeOut: 10000
                }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "ovpnsetclient",
                            "msg": result.code
                        });
                        that.vpnstatus = 'init';
                        that.vpnsuccess = 'init';
                        return;
                    }
                    if (result.success) {
                        // that.$message({
                        //     "type": "success",
                        //     "api": "ovpnsetclient",
                        //     "msg": result.code
                        // });
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "ovpnsetclient",
                            "msg": result.code
                        });
                        that.vpnstatus = 'init';
                        that.vpnsuccess = 'init';
                    }
                    that.timeOut = setTimeout(function () {
                        if (that.vpnstatus != 'init' || that.vpnsuccess != 'init') {
                            that.vpnstatus = 'init';
                            that.vpnsuccess = 'init';
                        }
                    }, 10000);
                    that.$store.dispatch("call", {
                        api: "ovpngetclientstatus"
                    });
                    that.timer = setInterval(function () {
                        that.$store.dispatch("call", {
                            api: "ovpngetclientstatus"
                        });
                    }, 5000);
                });
            },
            getservers: function getservers(index) {
                var that = this;
                this.$store.dispatch("call", {
                    api: "ovpngetserverlist",
                    data: {
                        ovpnclientid: this.clients[index].id
                    }
                }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "ovpngetserverlist",
                            "msg": result.code
                        });
                        return;
                    }
                    that.clients[index].serverlist = result.serverlist;
                    if (result.serverlist) {
                        that.clients[index].serverCount = result.serverlist.length;
                    } else {
                        that.clients[index].serverCount = 0;
                    }
                });
            },
            removeClient: function removeClient(index) {
                var _this = this;
                var msg = this.t(this.$lang.modal.delConfig) + "?";
                var isAll = false;
                if (index == 'all') {
                    msg = this.$lang.modal.delProfiles_all;
                    isAll = true;
                }
                this.$store.commit("showModal", {
                    show: true,
                    title: "Caution",
                    message: msg,
                    messageTwo: this.$lang.modal.delallmsg,
                    cb: function cb() {
                        isAll ? _this.rmAll() : _this.remove(index);
                    }
                });
            },
            rmAll: function rmAll() {
                var that = this;
                that.rmStatus = true;
                that.$store.dispatch("call", {
                    api: 'ovpnrmall'
                }).then(function (result) {
                    that.rmStatus = false;
                    if (result.failed) {
                        that.$message({
                            type: "error",
                            msg: result.code
                        });
                        return;
                    }
                    if (result.success) {
                        that.$message({
                            type: "success",
                            msg: result.code
                        });
                        that.currentVpn = '';
                        that.getData();
                    } else {
                        var type = 'error';
                        if (result.code == '-302') {
                            that.currentVpn = '';
                            type = "warning";
                            that.getData();
                        }
                        that.$message({
                            type: type,
                            msg: result.code
                        });
                    }
                });
            },
            remove: function remove(index) {
                var that = this;
                this.$store.dispatch("call", {
                    api: "ovpnremoveclient",
                    data: {
                        clientid: this.clients[index].id
                    }
                }).then(function (result) {
                    $(".vpn-manage-body").collapse("hide");
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "ovpnremoveclient",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        if (that.clients[index]['description'] == that.currentVpn) {
                            that.currentVpn = '';
                        }
                        that.clients.splice(index, 1);
                        that.getData();
                        if (that.curClientIndex > index) {
                            that.curClientIndex = that.curClientIndex - 1;
                            return;
                        }
                        if ((that.status == "off" || that.status == "failed") && that.curClientIndex == index) {
                            that.curClientIndex = 0;
                            return;
                        }
                    } else {
                        var type = 'error';
                        if (result.code == -302) {
                            if (that.clients[index]['description'] == that.currentVpn) {
                                that.currentVpn = '';
                            }
                            that.getData();
                            type = 'warning';
                        }
                        that.$message({
                            type: type,
                            api: "ovpnremoveclient",
                            msg: result.code
                        });
                    }
                });
            },
            modifyClient: function modifyClient(index, target) {
                var that = this;
                var id = this.clients[index].id;
                var server = this.clients[index].newServer;
                var description = this.clients[index].newDescription ? this.clients[index].newDescription.replace(/\s|\xA0/g, "") : null;
                var username = this.clients[index].newUsername ? this.clients[index].newUsername.replace(/\s|\xA0/g, "") : null;
                var password = this.clients[index].newPassword ? this.clients[index].newPassword.replace(/\s|\xA0/g, "") : null;
                var isDescriptionValid = this.isDescriptionValid(index, description);
                if (!description) {
                    this.$message({
                        type: 'warning',
                        msg: -2300
                    });
                    return;
                }
                if (this.getLen(description) > 32 || this.getLen(username) > 512 || this.getLen(password) > 512) {
                    this.$message({
                        type: "error",
                        msg: -22
                    });
                    return;
                }
                if (description != null && description.length == 0) {
                    this.clients[index].desTooltipMsg = this.$lang.vpnclient.dontEmpty + "!";
                } else if (isDescriptionValid == false) {
                    this.clients[index].desTooltipMsg = this.$lang.vpnclient.alreadyExists + "!";
                } else if (username != null && username.length == 0) {
                    this.clients[index].userTooltipMsg = this.$lang.vpnclient.dontEmpty + "!";
                } else if (password != null && password.length == 0) {
                    this.clients[index].pwdTooltipMsg = this.$lang.vpnclient.dontEmpty + "!";
                } else {
                    var data;
                    if (this.clients[index].passphrase) {
                        data = {
                            clientid: id,
                            defaultserver: server,
                            description: description,
                            passphrase: password == null ? "" : password
                        };
                    } else {
                        data = {
                            clientid: id,
                            defaultserver: server,
                            description: description,
                            username: username == null ? "" : username,
                            password: password == null ? "" : password
                        };
                    }
                    this.$store.dispatch("call", {
                        api: "ovpnmodifyclient",
                        data: data
                    }).then(function (result) {
                        if (result.failed) {
                            that.$message({
                                "type": "error",
                                "api": "ovpnmodifyclient",
                                "msg": result.code
                            });
                            return;
                        }
                        if (result.success) {

                            if (that.clients[index]['description'] == that.currentVpn) {
                                that.currentVpn = description;
                            }
                            that.$set(that.clients[index], "description", description);
                            that.$set(that.clients[index], "newDescription", description);
                            that.$set(that.clients[index], "newUsername", username);
                            that.$set(that.clients[index], "newPassword", password);
                            that.$message({
                                "type": "success",
                                "api": "ovpnmodifyclient",
                                "msg": result.code
                            });
                        } else {
                            that.$message({
                                "type": "error",
                                "api": "ovpnmodifyclient",
                                "msg": result.code
                            });
                        }
                    });
                }
            },
            onupload: function onupload(ajaxData) {
                var that = this;
                that.sta = "uploading";
                that.vpnState = true;
                that.vpnNumHtml = 0;
                if (ajaxData.errMsg) {
                    that.sta = "error";
                    that.errorMsg = ajaxData.errMsg;
                    return;
                }
                this.$store.dispatch("call", {
                    api: "ovpnuploadconfigpack",
                    data: ajaxData,
                    timeOut: 240000
                }).then(function (result) {
                    if (result.success) {
                        // that.vpnState = false;
                        that.resetSta();
                        that.verifyFirmware();
                    } else {
                        that.code = result.code;
                        that.sta = "error";
                        that.errorMsg = that.$lang.errorcode[result.code];
                    }
                });
            },
            addVpnClient: function addVpnClient() {
                // 配置名去重校验
                if (this.clients) {
                    for (var k in Object.keys(this.clients)) {
                        if (this.dspText == this.clients[k].newDescription) {
                            this.$message({
                                type: "error",
                                msg: -15
                            });
                            return;
                        }
                    }
                }
                var that = this;
                var name = that.usText.replace(/\s|\xA0/g, "");
                var description = that.dspText.replace(/\s|\xA0/g, "");
                var password = that.pswText.replace(/\s|\xA0/g, "");
                if (this.getLen(description) > 32 || this.getLen(name) > 512 || this.getLen(password) > 512) {
                    this.$message({
                        type: "error",
                        msg: -22
                    });
                    return;
                }
                var data = {
                    description: description,
                    username: name,
                    password: password
                };
                if (!this.useInfo) {
                    data = {
                        description: description,
                        passphrase: password
                    };
                }
                that.addState = true;
                that.showModal = false;
                that.$store.dispatch("call", {
                    api: "ovpngenerateclient",
                    data: data,
                    timeOut: 600000
                }).then(function (result) {
                    that.closeModal("add");
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "ovpngenerateclient",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        that.$message({
                            "type": "success",
                            "api": "ovpngenerateclient",
                            "msg": result.code
                        });
                        that.getData();
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "ovpngenerateclient",
                            "msg": result.code
                        });
                    }
                });
            },
            verifyFirmware: function verifyFirmware() {
                var that = this;
                this.$store.dispatch("call", {
                    api: "ovpncheckconfigpack",
                    timeOut: 30000
                }).then(function (result) {
                    if (result.failed) {
                        that.vpnNumHtml = 0;
                        that.$message({
                            "type": "error",
                            "api": "ovpncheckconfigpack",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        that.errorMsg = '';
                        that.sta = "success";
                        // that.$message({
                        //     "type": "success",
                        //     "api": "ovpncheckconfigpack",
                        //     "msg": result.code

                        // });
                        var iPassedNum = result.passed.length;
                        // var iFailedNum = that.getJsonObjLen(result.unpassed);
                        var iNeedAuthNum = that.getJsonObjLen(result.needauth);
                        var iNeedInfoNum = that.getJsonObjLen(result.needinfo);
                        that.vpnNumHtml = iPassedNum + iNeedAuthNum + iNeedInfoNum;
                        that.vpnState = false;
                        if (iNeedAuthNum == 0 && iNeedInfoNum == 0) {
                            that.pswInfo = false;
                        } else {
                            if (iNeedInfoNum != 0) {
                                that.useInfo = false;
                            }
                            if (iNeedAuthNum != 0) {
                                that.useInfo = true;
                            }
                            that.pswInfo = true;
                        }
                    } else {
                        that.vpnNumHtml = 0;
                    }
                });
            },
            getJsonObjLen: function getJsonObjLen(obj) {
                return Object.keys(obj).length;
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
            getData: function getData() {
                var that = this;
                that.clients = [];
                this.$store.dispatch("call", {
                    api: "ovpnGetClients"
                }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "ovpnGetClients",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        var clients = result.clients;
                        var len = clients.length;
                        if (clients && len > 0) {
                            for (var i = 0; i < len; i++) {
                                clients[i].collapseItemID = "item" + i;
                                clients[i]["serverCount"] = 0;
                                clients[i]["newDescription"] = clients[i].description;
                                clients[i]["newUsername"] = clients[i].username;
                                clients[i]["newPassword"] = clients[i].password ? clients[i].password : clients[i].passphrase;
                                clients[i]["passphrase"] = clients[i].password ? false : true;
                                clients[i]["checked"] = false;
                                clients[i]["newServer"] = clients[i].defaultserver;
                                that.clients.push(clients[i]);
                                that.getservers(i);
                            }
                        }
                        that.$store.dispatch("call", {
                            api: "ovpngetclientstatus"
                        }).then(function (result) {
                            clearInterval(that.timer);
                            that.timer = setInterval(function () {
                                that.$store.dispatch("call", {
                                    api: "ovpngetclientstatus"
                                });
                            }, 5000);
                        });
                    } else {
                        // console.log("getclients success " + result.success + " ," + result.error);
                    }
                });
            },
            // 删除配置中的 server 齿轮
            removeList: function removeList(index) {
                var that = this;
                var curserver = this.clients[this.curServerIndex];
                var serverfilename = this.curServerList[index];
                that.$message({
                    "duration": 3000
                });
                this.$store.dispatch("call", {
                    api: "ovpnremoveclient",
                    data: {
                        clientid: curserver.id,
                        serverfilename: serverfilename
                    }
                }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "ovpnremoveclient",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        that.$message({
                            "type": "success",
                            "api": "ovpnremoveclient",
                            "msg": result.code
                        });
                        that.getData();
                        that.showvpnlist = false;
                        $(".vpn-manage-body").collapse("hide");
                    }
                });
            },
            show(index, target) {
                if (this.settingStatus) return
                this.showvpnlist = true;
                if (target == 'change') {
                    this.curServerList = this.clients[this.defaultIndex].serverlist;
                    this.curserverName = this.defaultName
                } else {
                    this.curServerList = this.clients[index].serverlist;
                    this.curServerIndex = index;
                }
            },
            // 显示当前vpn配置列表
            showServerList: function showServerList(index) {
                this.showvpnlist = true;
                this.curServerList = this.clients[index].serverlist;
                this.curServerIndex = index;
                this.curserverName = this.clients[index].defaultserver;
            },
            // 设置当前vpn配置选择的配置
            setlist: function setlist(index) {
                console.log(this.defaultName);
                console.log(this.curServerList[index])
                if (this.defaultName != this.curServerList[index + 1]) {
                    this.checkServer = true
                    this.defaultName = this.curServerList[index]
                }
                // console.log(this.curServerList[index]);
                this.serverIndex = index
                this.curserverName = this.curServerList[index];
                this.$set(this.clients[this.curServerIndex], "newServer", this.curserverName);
                this.$set(this.clients[this.curServerIndex], "defaultserver", this.curserverName);
                $(".vpnlistcollapse").collapse("hide");
            },
            chooseClient: function chooseClient(clientIndex) {
                this.curClientIndex = clientIndex;
            },
            getCheck: function getCheck() {
                var that = this;
                if (this.status == "connected" || this.status == "connecting") {
                    var vpnIndex = this.getclientstatus.config.split("/")[3];
                    if (this.id == vpnIndex) {
                        this.checkServer = false;
                        clearInterval(that.timer);
                        that.timer = setInterval(function () {
                            that.$store.dispatch("call", {
                                api: "ovpngetclientstatus"
                            });
                        }, 5000);
                    } else {
                        clearInterval(that.timer);
                        this.checkServer = true;
                    }
                }
            },
            getId: function getId(id) {
                setTimeout(() => {
                    for (var key in this.clients) {
                        if (this.clients[key].id == id) {
                            this.defaultName = this.clients[key].defaultserver
                            this.defaultIndex = key
                            break;
                        }
                    }
                }, 500);
                return this.id = id;
            },
            generateId: function generateId(name, id) {
                return name + "_" + id;
            },
            openModal: function openModal(item) {
                if (item == "add") {
                    this.showModal = true;
                } else {
                    this.showvpnlist = true;
                }
            },
            closeModal: function closeModal(item) {
                var that = this;
                if (item == "add") {
                    this.showModal = false;
                    that.sta = "";
                    that.pageState = true;
                    that.vpnState = true;
                    that.addState = false;
                    that.resetSta();
                } else {
                    this.showvpnlist = false;
                }
            },
            resetSta: function resetSta() {
                var that = this;
                that.dspText = "";
                that.pswText = "";
                that.usText = "";
                that.vpnNumHtml = 0;
            },
            getBack: function getBack() {
                this.pageState = true;
            },
            isDescriptionValid: function isDescriptionValid(clientIndex, description) {
                for (var x in this.clients) {
                    if (clientIndex == x) {
                        continue;
                    }
                    if (description == this.clients[x].description) {
                        return false;
                    }
                }
                return true;
            },
            getClientIndex: function getClientIndex(clientID) {
                if (clientID) {
                    for (var x in this.clients) {
                        var id = this.clients[x].id;
                        if (id == clientID) {
                            return x;
                        }
                    }
                }
                return null;
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
            checkCollapse: function checkCollapse(data) {
                // for(var i = 0; i < this.clients.length; i++) {
                //     var id = 'item' + i
                //     $('#' + id).collapse('hide')
                // }
                // $('#' + data).collapse("show")
            }
        }
    });
    return vueComponent;
});