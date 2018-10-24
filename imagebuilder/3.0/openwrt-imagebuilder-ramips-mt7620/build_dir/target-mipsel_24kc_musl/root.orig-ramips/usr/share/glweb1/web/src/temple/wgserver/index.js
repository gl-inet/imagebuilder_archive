"use strict";

define(["text!temple/wgserver/index.html", "qrcode", "jqueryqrcode", "css!temple/wgserver/index.css", "vue", "component/gl-input/index", "component/gl-tooltip/index", "component/gl-select/index", "component/gl-btn/index", "component/gl-label/index", "component/modal/modal", "component/gl-toggle-btn/index"], function (stpl, qrcode, jqueryqrcode, css, Vue, gl_input, gl_tooltip, gl_select, gl_btn, gl_label, modal, gl_switch) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                typename: "default",
                showModal: false,
                wgclients: [],
                severName: "",
                nmInput: "",
                clientIp: "",
                clientkey: "",
                status: "",
                showServer: false,
                timer: null,
                timeout: null,
                circleClass: "",
                ctlist: "",
                copyModal: false,
                addState: false,
                numReg: /^\d+$/,
                cfg: '',
                copyStatus: false,
                btnexpect: 'init'
            };
        },
        components: {
            "gl-input": gl_input,
            "gl-tooltip": gl_tooltip,
            "gl-select": gl_select,
            "gl-btn": gl_btn,
            "gl-label": gl_label,
            "gl-modal": modal,
            "gl-switch": gl_switch
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
            clearTimeout(this.timeout);
            // this.$store.dispatch("setvpn");
            // this.$store.dispatch("setinter");
            next();
        },
        computed: {
            publicKey: function publicKey() {
                return this.$store.getters.apiData["wgsGetKey"];
            },
            wgsget: function wgsget() {
                return this.$store.getters.apiData["wgsifget"];
            },
            wgsCheckKey: function wgsCheckKey() {
                return this.$store.getters.apiData["wgsCheckKey"];
            },
            // showServer: function showServer() {
            //     return this.wgsCheckKey.success;
            // },
            ssStatus: function ssStatus() {
                return this.$store.getters.apiData["wgsstatus"];
            },
            peStatus: function peStatus() {
                return this.$store.getters.apiData["wgspestatus"];
            },
            btnControl: function btnControl() {
                var btnName = "Start";
                switch (this.ssStatus.code) {
                    case 0:
                        this.timerData();
                        btnName = "Stop";
                        this.typename = "danger";
                        this.circleClass = "active";
                        break;
                    case -202:
                        btnName = "Start";
                        this.typename = "default";
                        this.circleClass = "";
                        break;
                    default:
                        btnName = "Start";
                        this.typename = "default";
                        this.circleClass = "";
                }
                return btnName;
            },
            manLen: function manLen() {
                var realLength = 0,
                    charCode = -1;
                var len = this.nmInput.length;
                for (var i = 0; i < len; i++) {
                    charCode = this.nmInput.charCodeAt(i);
                    if (charCode > 0 && charCode <= 128) {
                        realLength += 1;
                    } else {
                        realLength += 3;
                    }
                }
                if (realLength > 30 || realLength <= 0) {
                    return true;
                }
                return false;
            },
            btnstatus: function btnstatus() {
                if (this.btnexpect != 'init') {
                    if (this.btnexpect == this.ssStatus.code) {
                        this.btnexpect = 'init';
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
            var _this = this;
            // 获取 public key
            this.checkKey();
            // 获取 sever status
            this.getStatus();
            this.showServer = this.wgsCheckKey.success;
            // _this.$store.commit("clearvpnTimer");
            // _this.$store.commit("clearTimer");
        },
        methods: {
            Qrcodeshow: function Qrcodeshow() {
                $('.qrcodeMO').show().siblings("div").hide();
                $('.QrcodeShow').addClass('active').siblings('li').removeClass('active');
            },
            infoshow: function infoshow() {
                $('.textarea').show().siblings('div').hide();
                $('.configShow').addClass('active').siblings('li').removeClass('active');
            },
            jsonshow: function jsonshow() {
                $('.JSONShow').addClass('active').siblings('li').removeClass('active');
                $('.jsonConfig').show().siblings('div').hide();
            },

            getStatus: function getStatus() {
                this.$store.dispatch("call", {
                    api: "wgsstatus"
                });
                this.$store.dispatch("call", {
                    api: "wgspestatus"
                });
            },
            timerData: function timerData() {
                var _this = this;
                clearInterval(this.timer);
                this.timer = setInterval(function () {
                    _this.getStatus();
                }, 5000);
            },
            getClients: function getClients() {
                var _this = this;
                this.$store.dispatch("call", {
                    api: "wgsplist"
                }).then(function (result) {
                    if (result.success) {
                        _this.wgclients = result.peers;
                        for (var key in _this.wgclients) {
                            _this.$set(_this.wgclients[key], "description", _this.wgclients[key].name);
                        }
                    }
                });
            },
            toggleClient: function toggleClient() {
                if (this.btnControl == "Start") {
                    this.startSever();
                } else {
                    this.stopSever();
                }
            },
            startSever: function startSever() {
                var _this = this;
                if (!_this.wgsget.local_ip || !_this.wgsget.local_port) {
                    _this.$message({
                        type: "warning",
                        msg: -2704
                    });
                    return;
                }
                if (this.wgsget.local_port) {
                    if (!this.numReg.test(this.wgsget.local_port) || parseInt(this.wgsget.local_port) > 65535 || parseInt(this.wgsget.local_port) < 1) {
                        this.$message({
                            type: "error",
                            msg: -2616
                        });
                        return;
                    }
                }
                _this.btnexpect = 0;
                clearTimeout(_this.timeout);
                _this.$store.dispatch("call", {
                    api: 'wgsifset',
                    data: {
                        local_ip: _this.wgsget.local_ip,
                        local_port: _this.wgsget.local_port
                    }
                }).then(function (result) {
                    if (!result.success) {
                        _this.$message({
                            type: "error",
                            api: "wgsifset",
                            msg: result.code
                        });
                        _this.btnexpect = 'init';
                    } else {
                        // _this.getSever();
                        _this.$store.dispatch("call", {
                            api: "wgsstart"
                        }).then(function (result) {
                            if (result.failed) {
                                _this.$message({
                                    type: "error",
                                    api: "wgsstart",
                                    msg: result.code
                                });
                                _this.btnexpect = 'init';
                                return;
                            }
                            if (result.success) {
                                _this.getStatus();
                                _this.timerData();
                                _this.timeout = setTimeout(function () {
                                    if (_this.btnexpect != 'init') {
                                        _this.btnexpect = 'init';
                                    }
                                }, 10000);
                            } else {
                                _this.btnexpect = 'init';
                                _this.$message({
                                    type: "error",
                                    api: "wgsstart",
                                    msg: result.code
                                });
                            }
                        });
                    }
                });
            },
            stopSever: function stopSever() {
                var _this = this;
                _this.btnexpect = -202;
                clearInterval(_this.timer);
                clearTimeout(_this.timeout);
                _this.$store.dispatch("call", {
                    api: "wgsstop"
                }).then(function (result) {
                    if (result.failed) {
                        _this.$message({
                            type: "error",
                            api: "wgsstop",
                            msg: result.code
                        });
                        _this.btnexpect = 'init';
                        return;
                    }
                    if (result.success) {
                        _this.getStatus();
                        _this.timerData();
                        _this.timeout = setTimeout(function () {
                            if (_this.btnexpect != 'init') {
                                _this.btnexpect = 'init';
                            }
                            clearInterval(_this.timer);
                        }, 10000);
                    } else {
                        _this.$message({
                            type: "error",
                            api: "wgsstop",
                            msg: result.code
                        });
                        _this.btnexpect = 'init';
                    }
                });
            },
            addClients: function addClients() {
                var _this = this;
                if (!this.nmInput) {
                    this.$message({
                        type: "warning",
                        msg: -2702
                    });
                    return;
                }
                _this.addState = true;
                _this.$store.dispatch("call", {
                    api: "wgspadd",
                    data: {
                        name: _this.nmInput.replace(/\s+/g, "")
                    }
                }).then(function (result) {
                    if (result.failed) {
                        _this.$message({
                            type: "error",
                            api: "wgspadd",
                            "msg": result.code
                        });
                        _this.addState = false;
                        return;
                    }
                    if (result.success) {
                        setTimeout(function () {
                            _this.$message({
                                type: "success",
                                api: "wgspadd",
                                "msg": result.code
                            });
                            _this.addState = false;
                        }, 1500);
                        _this.closeModal();
                        _this.getClients();
                    } else {
                        _this.$message({
                            type: "error",
                            api: "wgspadd",
                            "msg": result.code
                        });
                        _this.addState = false;
                    }
                });
            },
            removeClient: function removeClient(index) {
                var _this = this;
                this.$store.commit("showModal", {
                    show: true,
                    title: "Caution",
                    message: this.t(this.$lang.modal.delUser) + ' ' + this.wgclients[index].name + "?",
                    cb: function cb() {
                        _this.rmClient(index);
                    }
                });
            },
            rmClient: function rmClient(index) {
                var _this = this;
                _this.$store.dispatch("call", {
                    api: "wgspremove",
                    data: {
                        name: this.wgclients[index].name
                    }
                }).then(function (result) {
                    if (result.failed) {
                        _this.$message({
                            type: "error",
                            api: "wgspremove",
                            msg: result.code
                        });
                        return;
                    }
                    if (result.success) {
                        _this.$message({
                            type: "success",
                            api: "wgspremove",
                            msg: result.code
                        });
                        _this.wgclients.splice(index, 1);
                        _this.getClients();
                        if (_this.wgclients.length == 1) {
                            _this.severName = _this.wgclients[0].name;
                        }
                    }
                });
            },
            copyPeconfig: function copyPeconfig(index) {
                if (this.copyStatus) {
                    return;
                }
                var _this = this;
                var obj = {};
                var name = _this.wgclients[index].name;
                this.$message({
                    type: "info",
                    msg: -2703
                });
                this.copyStatus = true;
                _this.$store.dispatch("call", {
                    api: "wgsCopy",
                    data: {
                        name: name
                    }
                }).then(function (result) {
                    _this.copyStatus = false;
                    if (result.success) {
                        _this.copyModal = true;
                        obj.address = result.address;
                        obj.allowed_ips = result.allowed_ips;
                        obj.end_point = result.end_point;
                        obj.listen_port = result.listen_port;
                        obj.persistent_keepalive = result.persistent_keepalive;
                        obj.private_key = result.private_key;
                        obj.public_key = result.public_key;
                        _this.$message({
                            type: "success",
                            api: "wgsCopy",
                            msg: result.code
                        });
                        _this.ctlist = _this.formatJson(JSON.stringify(obj));
                        _this.$refs.serTextarea.select();
                        _this.cfg = '[Interface]\n' + 'Address = ' + obj.address + '\n' + 'ListenPort = ' + obj.listen_port + '\n' + 'PrivateKey = ' + obj.private_key + '\n' + '\n' + '[Peer]\n' + 'AllowedIPs = ' + obj.allowed_ips + '\n' + 'Endpoint = ' + obj.end_point + '\n' + 'PersistentKeepalive = ' + obj.persistent_keepalive + '\n' + 'PublicKey = ' + obj.public_key + '\n';
                        $('#qrcode').qrcode(_this.cfg);
                        console.log(_this.cfg);
                    } else {
                        _this.$message({
                            type: "error",
                            msg: result.code
                        });
                    }
                });
            },
            setbtnState: function setbtnState() {
                this.btnName = this.btnName == "简易" ? "高级" : "简易";
            },
            addopenModal: function addopenModal() {
                this.showModal = true;
            },
            getSever: function getSever() {
                this.$store.dispatch("call", { api: 'wgsifget' });
            },
            // checkKey
            checkKey: function checkKey() {
                var _this = this;
                _this.$store.dispatch("call", {
                    api: 'wgsCheckKey'
                }).then(function (result) {
                    if (result.success) {
                        // 获取 server info
                        _this.getSever();
                        // 获取 wireguard client
                        _this.getClients();
                        _this.showServer = true;
                    } else {
                        _this.showServer = false;
                    }
                });
            },
            // created Key
            createKey: function createKey() {
                var _this = this;
                _this.$message({
                    type: "warning"
                });
                _this.$store.dispatch("call", {
                    api: 'wgsCreateKey'
                }).then(function (result) {
                    if (result.failed) {
                        _this.$message({
                            type: "error",
                            api: "wgsCreateKey",
                            msg: result.code
                        });
                        return;
                    }
                    if (result.success) {
                        _this.$message({
                            type: "success",
                            api: "wgsCreateKey",
                            msg: result.code
                        });
                        // 获取 wireguard client
                        _this.getClients();
                        // 获取 server info
                        _this.getSever();
                        _this.$store.dispatch("call", {
                            api: 'wgsCheckKey'
                        });
                        _this.showServer = true;
                    } else {
                        _this.$message({
                            type: "error",
                            api: "wgsCreateKey",
                            msg: result.code
                        });
                        _this.showServer = false;
                    }
                });
            },
            closeModal: function closeModal() {
                this.showModal = false;
                this.nmInput = "";
                this.copyModal = false;
                this.ctlist = "";
                $('.qrcodeMO').show().siblings("div").hide();
                $('.QrcodeShow').addClass('active').siblings('li').removeClass('active');
                $('.textareaQRCode > #qrcode').html('');
            },
            formatJson: function formatJson(text) {
                var json = text;
                var i = 0,
                    len = 0,
                    tab = "    ",
                    targetJson = "",
                    indentLevel = 0,
                    inString = false,
                    currentChar = null;
                for (i = 0, len = json.length; i < len; i += 1) {
                    currentChar = json.charAt(i);
                    switch (currentChar) {
                        case '{':
                        case '[':
                            if (!inString) {
                                targetJson += currentChar + "\n" + this.repeat(tab, indentLevel + 1);
                                indentLevel += 1;
                            } else {
                                targetJson += currentChar;
                            }
                            break;
                        case '}':
                        case ']':
                            if (!inString) {
                                indentLevel -= 1;
                                targetJson += "\n" + this.repeat(tab, indentLevel) + currentChar;
                            } else {
                                targetJson += currentChar;
                            }
                            break;
                        case ',':
                            if (!inString) {
                                targetJson += ",\n" + this.repeat(tab, indentLevel);
                            } else {
                                targetJson += currentChar;
                            }
                            break;
                        case ':':
                            if (!inString) {
                                targetJson += ": ";
                            } else {
                                targetJson += currentChar;
                            }
                            break;
                        case ' ':
                        case "\n":
                        case "\t":
                            if (inString) {
                                targetJson += currentChar;
                            }
                            break;
                        case '"':
                            if (i > 0 && json.charAt(i - 1) !== '\\') {
                                inString = !inString;
                            }
                            targetJson += currentChar;
                            break;
                        default:
                            targetJson += currentChar;
                            break;
                    }
                }
                return targetJson;
            },
            repeat: function repeat(s, count) {
                return new Array(count + 1).join(s);
            }
        }
    });
    return vueComponent;
});