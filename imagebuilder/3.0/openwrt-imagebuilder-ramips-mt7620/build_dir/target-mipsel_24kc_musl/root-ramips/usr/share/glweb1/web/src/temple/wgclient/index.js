"use strict";

define(["text!temple/wgclient/index.html", "css!temple/wgclient/index.css", "vue", "component/gl-input/index", "component/gl-tooltip/index", "component/gl-select/index", "component/gl-btn/index", "component/gl-label/index", "component/modal/modal", "component/gl-toggle-btn/index"], function (stpl, css, Vue, gl_input, gl_tooltip, gl_select, gl_btn, gl_label, modal, gl_switch) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                showModal: false,
                typename: "default",
                wgclients: [],
                nmInput: "",
                port: "",
                ips: "",
                point: "",
                prtKey: "",
                address: "",
                pubKey: "",
                sectName: "",
                timer: "",
                isRest: false,
                addState: false,
                circleClass: "",
                ctlist: "",
                wayState: 'one',
                nextState: true,
                errorPrt: false,
                errorPub: false,
                user: "",
                psw: "",
                Type: ['azirevpn', 'mullvad'],
                type: '',
                dns: "",
                btnstatus: false,
                interStatus: false,
                vpnexpect: 'init',
                vpnsuccess: 'init',
                rmStatus: false,
                timeout: null,
                checkServer: false,
                dnsReg: /(?:(^|\.)(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){4}$/,
                ipReg: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/,
                portReg: /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/,
                numReg: /^\d+$/,
                checkip: true, // 检索 ip
                checkpubkey: true, // 检索公钥
                checkprikey: true, // 检索私钥
                checkport: true, // 检索 port
                checkdns: true, // 检索 dns
                checkpoint: true, // 检索 point
                checkIPs: true // 检索 IPs
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
                // $(".clsLink2vpn").addClass("active")
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
        computed: {
            nextSts: function nextSts() {
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
            cltstatus: function cltstatus() {
                return this.$store.getters.apiData["wgcstatus"];
            },
            wgclist: function wgclist() {
                return this.$store.getters.apiData["wgclist"];
            },
            showClient: function showClient() {
                return this.wgclist.peers && this.wgclist.length != 0;
            },
            btnControl: function btnControl() {
                var btnName = "Connect";
                switch (this.cltstatus.code) {
                    case -204:
                        this.typename = "default";
                        btnName = "Connect";
                        this.circleClass = "";
                        break;
                    case -203:
                        // this.sectName = this.cltstatus.main_server;
                        this.typename = "danger";
                        btnName = "Abort";
                        this.circleClass = "waiting";
                        break;
                    case 0:
                        // this.sectName = this.cltstatus.main_server;
                        this.typename = "danger";
                        btnName = "Disconnect";
                        this.circleClass = "active";
                        break;
                    default:
                        this.typename = "default";
                        btnName = "Connect";
                        this.circleClass = "";
                }
                return btnName;
            },
            checkVpn: function checkVpn() {
                if (this.vpnexpect != 'init') {
                    if (this.vpnexpect == this.cltstatus.code || this.vpnsuccess == this.cltstatus.code) {
                        this.vpnexpect = 'init';
                        this.vpnsuccess = 'init';
                        return false;
                    } else {
                        return true;
                    }
                } else {
                    return false;
                }
            }
        },
        beforeRouteLeave: function beforeRouteLeave(to, from, next) {
            if (this.btnstatus || this.isRest) {
                this.$message({
                    type: "warning",
                    msg: -2606
                });
                return;
            }
            clearInterval(this.timer);
            // this.$store.dispatch("setvpn");
            // this.$store.dispatch("setinter");
            // this.$store.dispatch("setALLtimer");
            next();
        },
        mounted: function mounted() {
            if (this.cltstatus.code == 0 || this.cltstatus.code == 0) {
                this.sectName = this.cltstatus.main_server;
            }
            var that = this;
            // 获取 client list
            this.getctList();
            // 获取 client status
            this.getStatus();
            this.timerData();
            // that.$store.commit("clearvpnTimer");
            // that.$store.commit("clearTimer");
            // that.$store.commit('clearInterTimer');
        },
        methods: {
            // 切换三种添加client的方式
            changeWay: function changeWay(target) {
                switch (target) {
                    case 'paste':
                        this.wayState = 'one';
                        this.$refs.clientent.className = "";
                        this.$refs.clientUser.className = "";
                        this.$refs.clientpaste.className = "active";
                        break;
                    case 'user':
                        this.wayState = 'two';
                        this.$refs.clientent.className = "";
                        this.$refs.clientpaste.className = "";
                        this.$refs.clientUser.className = "active";
                        break;
                    case 'enter':
                        this.wayState = 'three';
                        this.$refs.clientUser.className = "";
                        this.$refs.clientpaste.className = "";
                        this.$refs.clientent.className = "active";
                }
            },
            // client status
            getStatus: function getStatus() {
                var that = this;
                that.$store.dispatch("call", { api: "wgcstatus" }).then(function (result) {
                    if (result.code == 0 || result.code == -203) {
                        that.sectName = result.main_server;
                    }
                });
            },
            timerData: function timerData() {
                var _this = this;
                clearInterval(this.timer);
                _this.timer = setInterval(function () {
                    _this.getStatus();
                }, 5000);
            },
            getCheck: function getCheck() {
                clearInterval(this.timer);
                if (this.cltstatus.success || this.cltstatus.code == -203) {
                    if (this.cltstatus.main_server == this.sectName) {
                        this.checkServer = false;
                        this.timerData();
                        return;
                    }
                }
                this.checkServer = true;
            },
            toggleClient: function toggleClient(target) {
                var _this = this;
                this.checkServer = false;
                if (target == 'check') {
                    _this.isRest = true;
                    _this.startClient(target);
                } else {
                    if (this.btnControl == "Connect") {
                        _this.isRest = true;
                        _this.$store.dispatch("call", { api: 'internetreachable', async: true }).then(function (result) {
                            _this.isRest = false;
                            if (!result.reachable) {
                                _this.$message({
                                    type: 'warning',
                                    msg: -210
                                });
                            } else {
                                _this.startClient(target);
                            }
                        });
                    } else {
                        _this.stopClient();
                    }
                }
            },
            startClient: function startClient(target) {
                var _this = this;
                _this.vpnexpect = -203;
                _this.vpnsuccess = 0;
                var restart = target ? true : false;
                clearInterval(this.timer);
                clearTimeout(this.timeout);
                _this.$store.dispatch("call", { api: "wgcstart", data: { name: this.sectName, restart: restart }, timeOut: 15000 }).then(function (result) {
                    _this.isRest = false;
                    if (result.failed) {
                        _this.$message({
                            type: "error",
                            api: "wgcstart",
                            msg: result.code
                        });
                        _this.vpnexpect = 'init';
                        _this.vpnsuccess = 'init';
                        _this.getStatus();
                        _this.timerData();
                        return;
                    }
                    if (result.success) {
                        // _this.$message({
                        //     type: "success",
                        //     api: "wgcstart",
                        //     msg: result.code
                        // });
                    } else {
                        _this.$message({
                            'type': "error",
                            'api': "wgcstart",
                            'msg': result.code
                        });
                        _this.vpnexpect = 'init';
                        _this.vpnsuccess = 'init';
                    }
                    _this.getStatus();
                    _this.timerData();
                    _this.timeout = setTimeout(function () {
                        if (_this.vpnexpect != 'init' || _this.vpnsuccess != 'init') {
                            _this.vpnexpect = 'init';
                            _this.vpnsuccess = 'init';
                        }
                    }, 15000);
                });
            },
            stopClient: function stopClient() {
                var _this = this;
                clearInterval(this.timer);
                clearTimeout(this.timeout);
                this.vpnexpect = -204;
                _this.$store.dispatch("call", { api: "wgcstop" }).then(function (result) {
                    if (result.failed) {
                        _this.$message({
                            type: "error",
                            api: "wgcstart",
                            msg: result.code
                        });
                        _this.getStatus();
                        _this.timerData();
                        _this.vpnexpect = 'init';
                        return;
                    }
                    if (result.success) {
                        // _this.$message({
                        //     type: "success",
                        //     api: "wgcstart",
                        //     msg: result.code
                        // });
                    } else {
                        _this.vpnexpect = 'init';
                    }
                    _this.getStatus();
                    _this.timerData();
                    _this.timeout = setTimeout(function () {
                        if (_this.vpnexpect != 'init') {
                            _this.vpnexpect = 'init';
                        }
                    }, 15000);
                });
            },
            // client list
            getctList: function getctList() {
                var _this = this;
                this.$store.dispatch("call", { api: "wgclist" }).then(function (result) {
                    if (result.success) {
                        _this.addState = false;
                        _this.wgclients = result.peers;
                        var len = _this.wgclients.length;
                        for (var i = 0; i < len; i++) {
                            _this.wgclients[i].id = 'item' + i;
                            _this.$set(_this.wgclients[i], "description", _this.wgclients[i].name);
                        }
                    } else {
                        _this.sectName = '';
                        _this.wgclients = [];
                        _this.addState = true;
                    }
                });
            },
            addNext: function addNext() {
                if (this.wgclients) {
                    for (var k in this.wgclients) {
                        if (this.nmInput == this.wgclients[k].name) {
                            this.$message({
                                type: "error",
                                msg: -15
                            });
                            return;
                        }
                    }
                }
                this.nextState = false;
            },
            // add modal chose
            addctList: function addctList() {
                var data = {};
                var _this = this;
                var name = this.nmInput.replace(/\s+/g, "");
                this.errorPrt = false;
                this.errorPub = false;
                if (this.wayState == 'one') {
                    if (!_this.ctlist) {
                        this.$message({
                            type: "warning",
                            msg: -2602
                        });
                        return;
                    }
                    if (this.isJsonString(_this.ctlist)) {
                        data = JSON.parse(_this.ctlist);
                        data.dns = data.dns ? data.dns : '';
                        data.name = name;
                    } else {
                        var list = _this.ctlist.split(/[\s\n]/)
                        data.name = name;
                        data.address = '';
                        data.listen_port = '';
                        data.private_key = '';
                        data.allowed_ips = '';
                        data.end_point = '';
                        data.persistent_keepalive = 25;
                        data.public_key = '';
                        data.dns = '';
                        for (var k in list) {
                            if (list[k] == 'Address') {
                                data.address = list[parseInt(k) + 2]
                            }
                            if (list[k] == 'ListenPort') {
                                data.listen_port = list[parseInt(k) + 2]
                            }
                            if (list[k] == 'PrivateKey') {
                                data.private_key = list[parseInt(k) + 2]
                            }
                            if (list[k] == 'AllowedIPs') {
                                data.allowed_ips = list[parseInt(k) + 2]
                            }
                            if (list[k] == 'Endpoint') {
                                data.end_point = list[parseInt(k) + 2]
                            }
                            if (typeof list[k] != 'function' && list[k].indexOf('Keepalive') != -1) {
                                data.persistent_keepalive = list[parseInt(k) + 2]
                            }
                            if (list[k] == 'PublicKey') {
                                data.public_key = list[parseInt(k) + 2]
                            }
                            if (list[k] == 'DNS') {
                                data.dns = list[parseInt(k) + 2]
                            }
                        }
                        if (!data.address || !data.private_key || !data.allowed_ips || !data.end_point || !data.public_key) {
                            this.$message({
                                type: "warning",
                                msg: -2603
                            });
                            return;
                        }
                    }
                    this.add_client(data, 'wgcadd');
                } else if (this.wayState == 'two') {
                    if (this.type == 'mullvad') {
                        if (!this.user) {
                            this.$message({
                                type: "warning",
                                msg: -2602
                            });
                            return;
                        }
                    } else {
                        if (!this.user || !this.psw) {
                            this.$message({
                                type: "warning",
                                msg: -2602
                            });
                            return;
                        }
                        if (this.getLen(this.psw) > 512) {
                            this.$message({
                                type: "error",
                                msg: -22
                            });
                            return;
                        }
                    }
                    if (this.getLen(this.user) > 512) {
                        this.$message({
                            type: "error",
                            msg: -22
                        });
                        return;
                    }
                    data = {
                        name: name,
                        user: this.user,
                        psw: this.psw,
                        type: this.type
                    };
                    _this.interStatus = true;
                    _this.$store.dispatch("call", { api: 'internetreachable', async: true }).then(function (result) {
                        _this.interStatus = false;
                        if (!result.reachable) {
                            _this.$message({
                                type: 'warning',
                                msg: -210
                            });
                        } else {
                            _this.add_client(data, 'wrthirdadd');
                        }
                    });
                } else if (this.wayState == 'three') {
                    if (!this.address) {
                        this.checkip = false;
                    }
                    if (!this.prtKey) {
                        this.checkprikey = false;
                    }
                    if (!this.port) {
                        this.checkport = false;
                    }
                    if (!this.pubKey) {
                        this.checkpubkey = false;
                    }
                    if (!this.point) {
                        this.checkpoint = false;
                    }
                    if (!this.ips) {
                        this.checkIPs = false;
                    }
                    if (this.dns) {
                        this.checkdns = this.searchdns();
                    }
                    if (!this.checkip || !this.checkprikey || !this.checkport || !this.checkdns || !this.checkpubkey || !this.checkpoint || !this.checkIPs) {
                        return;
                    }
                    data = {
                        name: name,
                        address: this.address,
                        listen_port: this.port,
                        persistent_keepalive: 25,
                        allowed_ips: this.ips,
                        end_point: this.point,
                        private_key: this.prtKey,
                        public_key: this.pubKey,
                        dns: this.dns
                    };
                    this.add_client(data, 'wgcadd');
                }
            },
            add_client: function add_client(data, api) {
                var _this = this;
                _this.btnstatus = true;
                _this.showModal = false;
                if (api == "wrthirdadd") {
                    _this.$message({
                        type: 'info',
                        msg: -2607,
                        duration: 60000
                    });
                }
                _this.$store.dispatch("call", { api: api, data: data, timeOut: 60000 }).then(function (result) {
                    _this.btnstatus = false;
                    if (result.failed) {
                        _this.$message({
                            type: "error",
                            api: "wgcadd",
                            msg: result.code
                        });
                        return;
                    }
                    if (result.success) {
                        _this.$message({
                            type: "success",
                            api: "wgcadd",
                            msg: result.code
                        });
                        // _this.ctlist = "";
                        _this.closeModal();
                        _this.getctList();
                    } else {
                        _this.$message({
                            type: "error",
                            api: "wgcadd",
                            msg: result.code
                        });
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
                        isAll ? _this.rmAll() : _this.rmClient(index);
                    }
                });
            },
            rmAll: function rmAll() {
                var _this = this;
                _this.rmStatus = true;
                _this.$store.dispatch("call", { api: 'wgrmall' }).then(function (result) {
                    _this.rmStatus = false;
                    if (result.success) {
                        _this.$message({
                            type: 'success',
                            msg: result.code
                        });
                        _this.circleClass = '';
                        _this.getctList();
                        // _this.wgclients = [];
                        // _this.$store.dispatch("call", { api: "wgclist" });
                    } else {
                        var type = "error";
                        if (result.code == -302) {
                            type = 'warning';
                            _this.circleClass = '';
                            _this.getctList();
                            // _this.wgclients = [];
                            // _this.$store.dispatch("call", { api: "wgclist" });
                        }
                        _this.$message({
                            type: type,
                            msg: result.code
                        });
                    }
                });
            },
            rmClient: function rmClient(index) {
                var _this = this;
                _this.$store.dispatch("call", {
                    api: "wgcremove", data: {
                        name: this.wgclients[index].name
                    }
                }).then(function (result) {
                    if (result.failed) {
                        _this.$message({
                            type: "error",
                            api: "wgcremove",
                            msg: result.code
                        });
                        return;
                    }
                    if (result.success) {
                        _this.$message({
                            type: "success",
                            api: "wgcremove",
                            msg: result.code
                        });
                        // 已删除该配置 select上面继续显示已删除name
                        var len = _this.wgclients.length;
                        if (_this.wgclients[index].name == _this.sectName) {
                            if (index == 0 && len > 1) {
                                _this.sectName = _this.wgclients[1].name;
                            } else {
                                _this.sectName = _this.wgclients[0].name;
                            }
                        }
                        if (_this.wgclients.length == 1) {
                            _this.sectName = _this.wgclients[0].name;
                        }
                        if (_this.wgclients.length == 0) {
                            _this.sectName = "";
                        }
                    } else {
                        var type = "error";
                        if (result.code == -302) {
                            type = "warning";
                        }
                        _this.$message({
                            type: type,
                            api: "wgcremove",
                            msg: result.code
                        });
                    }
                    $(".vpn-manage-body").collapse("hide");
                    _this.wgclients.splice(index, 1);
                    _this.getctList();
                });
            },
            modifyClient: function modifyClient(index, name) {
                var _this = this;
                var address = this.wgclients[index].address;
                var ips = this.wgclients[index].allowed_ips;
                var point = this.wgclients[index].end_point;
                var listen_port = this.wgclients[index].listen_port;
                var keepalive = this.wgclients[index].persistent_keepalive;
                var pri_key = this.wgclients[index].private_key;
                var pub_key = this.wgclients[index].public_key;
                var dns = this.wgclients[index].dns;
                if (!address || !this.serachIp(address)) {
                    this.$message({
                        type: "error",
                        msg: '-2608'
                    });
                    return;
                }
                if (!pri_key || pri_key.length != 44) {
                    this.$message({
                        type: "error",
                        msg: '-2609'
                    });
                    return;
                }
                if (!pub_key || pub_key.length != 44) {
                    this.$message({
                        type: "error",
                        msg: '-2612'
                    });
                    return;
                }
                if (!listen_port || !this.portReg.test(listen_port)) {
                    this.$message({
                        type: "error",
                        msg: '-2610'
                    });
                    return;
                }
                if (dns) {
                    if (!this.dnsReg.test(dns)) {
                        this.$message({
                            type: "error",
                            msg: '-2611'
                        });
                        return;
                    }
                }
                if (!ips || !this.serachIPs(ips)) {
                    this.$message({
                        type: "error",
                        msg: '-2614'
                    });
                    return;
                }
                if (!point || !this.serachPoint(point)) {
                    this.$message({
                        type: "error",
                        msg: '-2613'
                    });
                    return;
                }
                if (keepalive) {
                    if (!this.numReg.test(keepalive) || parseInt(keepalive) > 65535 || parseInt(keepalive) < 0) {
                        this.$message({
                            type: "error",
                            msg: '-2615'
                        });
                        return;
                    }
                }
                keepalive = keepalive ? keepalive : 25;
                _this.$store.dispatch("call", {
                    api: "wgcset", data: {
                        name: this.wgclients[index].name,
                        address: address,
                        allowed_ips: ips,
                        end_point: point,
                        listen_port: listen_port,
                        persistent_keepalive: keepalive,
                        private_key: pri_key,
                        public_key: pub_key,
                        dns: dns
                    }
                }).then(function (result) {
                    if (result.failed) {
                        _this.$message({
                            type: "error",
                            api: "wgcset",
                            msg: result.code
                        });
                        return;
                    }
                    if (result.success) {
                        _this.$message({
                            type: "success",
                            api: "wgcset",
                            msg: result.code
                        });
                        _this.$set(_this.wgclients[index], "description", _this.wgclients[index].name);
                    } else {
                        _this.$message({
                            type: "error",
                            api: "wgcset",
                            msg: result.code
                        });
                    }
                });
            },
            openModal: function openModal() {
                this.showModal = true;
                this.wayState = 'one';
                this.nextState = true;
                this.checkip = true;
                this.checkprikey = true;
                this.checkport = true;
                this.checkdns = true;
                this.checkpubkey = true;
                this.checkpoint = true;
                this.checkIPs = true;
            },
            closeModal: function closeModal() {
                this.showModal = false;
                this.nmInput = "";
                this.ips = "";
                this.point = "";
                this.port = "";
                this.address = "";
                this.prtKey = "";
                this.pubKey = "";
                this.ctlist = "";
                this.user = "";
                this.psw = "";
                this.dns = "";
                this.checkip = true;
                this.checkprikey = true;
                this.checkport = true;
                this.checkdns = true;
                this.checkpubkey = true;
                this.checkpoint = true;
                this.checkIPs = true;
            },
            isJsonString: function isJsonString(str) {
                try {
                    if (this.checktype(JSON.parse(str)) == "Object") {
                        return true;
                    }
                } catch (e) {
                    // console.log("error: ");
                }
                return false;
            },
            checktype: function checktype(val) {
                return Object.prototype.toString.call(val).split(" ")[1].split("]")[0];
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
            serachip: function serachip(data) {
                if (!this.address || data == "focus") {
                    this.checkip = true;
                } else {
                    var address = this.address;
                    if (address.indexOf('/') != -1) {
                        var list = address.split('/');
                        if (this.ipReg.test(list[0]) && list[1] >= 0 && list[1] <= 32 && list[1] != '') {
                            this.checkip = true;
                        } else {
                            this.checkip = false;
                        }
                    } else {
                        if (this.ipReg.test(address)) {
                            this.checkip = true;
                        } else {
                            this.checkip = false;
                        }
                    }
                }
                var item = this.checkIPs;
                return item;
            },
            serachprikey: function serachprikey(data) {
                if (data == "focus") {
                    this.checkprikey = true;
                } else {
                    this.checkprikey = !this.prtKey ? true : this.prtKey.length != 44 ? false : true;
                }
            },
            searchport: function searchport(data) {
                if (data == "focus") {
                    this.checkport = true;
                } else {
                    this.checkport = !this.port ? true : this.portReg.test(this.port);
                }
            },
            searchdns: function searchdns(data) {
                if (data == "focus") {
                    this.checkdns = true;
                } else {
                    this.checkdns = !this.dns ? true : this.dnsReg.test(this.dns);
                }
                var item = this.checkdns;
                return item;
            },
            serachpubkey: function serachpubkey(data) {
                if (data == "focus") {
                    this.checkpubkey = true;
                } else {
                    this.checkpubkey = !this.pubKey ? true : this.pubKey.length != 44 ? false : true;
                }
            },
            serachpoint: function serachpoint(data) {
                var url = /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/;
                var checkip = false;
                var checkurl = false;
                var checkPort = false;
                if (!this.point || data == 'focus') {
                    this.checkpoint = true;
                } else {
                    if (this.point.indexOf(':')) {
                        var point = this.point.split(':');
                        checkPort = this.portReg.test(point[1]);
                        if ($.type(point[0]) === 'number') {
                            checkip = this.checkip(point[0]);
                        } else {
                            checkurl = url.test(point[0]);
                        }
                        if (checkip && checkPort || checkurl && checkPort) {
                            this.checkpoint = true;
                        } else {
                            this.checkpoint = false;
                        }
                    } else {
                        this.checkpoint = false;
                    }
                }
                var item = this.checkpoint;
                return item;
            },

            serachIPs: function serachIPs(data) {
                if (!this.ips || data == "focus") {
                    this.checkIPs = true;
                } else {
                    var ips = this.ips;
                    if (ips.indexOf('/') != -1) {
                        var list = ips.split('/');
                        if (this.ipReg.test(list[0]) && list[1] >= 0 && list[1] <= 32 && list[1] != '') {
                            this.checkIPs = true;
                        } else {
                            this.checkIPs = false;
                        }
                    } else {
                        if (this.ipReg.test(ips)) {
                            this.checkIPs = true;
                        } else {
                            this.checkIPs = false;
                        }
                    }
                }
                var item = this.checkIPs;
                return item;
            },
            serachPoint: function serachPoint(data) {
                var url = /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/;
                var checkip = false;
                var checkurl = false;
                var checkPort = false;
                var item;
                if (data) {
                    if (data.indexOf(':')) {
                        var point = data.split(':');
                        checkPort = this.portReg.test(point[1]);
                        if ($.type(point[0]) === 'number') {
                            checkip = this.checkip(point[0]);
                        } else {
                            checkurl = url.test(point[0]);
                        }
                        if (checkip && checkPort || checkurl && checkPort) {
                            item = true;
                        } else {
                            item = false;
                        }
                    } else {
                        item = false;
                    }
                }
                return item;
            },
            serachIp: function serachIp(data) {
                var item;
                if (data) {
                    var address = data;
                    if (address.indexOf('/') != -1) {
                        var list = address.split('/');
                        if (this.ipReg.test(list[0]) && list[1] >= 0 && list[1] <= 32 && list[1] != '') {
                            item = true;
                        } else {
                            item = false;
                        }
                    } else {
                        if (this.ipReg.test(address)) {
                            item = true;
                        } else {
                            item = false;
                        }
                    }
                }
                return item;
            }
        }
    });
    return vueComponent;
});