"use strict";

define(["text!temple/firewall/index.html", "css!temple/firewall/index.css", "component/gl-toggle-btn/index", "component/gl-select/index", "component/select/index", "component/gl-btn/index", "component/modal/modal", "component/gl-input/index", "vue", "component/gl-toggle-btn/index", "component/gl-tooltip/index"], function (stpl, css, gl_toggle, gl_select, select, gl_btn, gl_modal, gl_input, Vue, gl_toggle_btn, gl_tooltip) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                list: [],
                open_list: [],
                protolist: ['TCP/UDP', 'TCP', 'UDP'],
                statuslist: ['Enabled', 'Disabled'],
                fwname: '',
                iplist: [],
                outer_port: '',
                inner_port: '',
                inner_ip: '',
                port: '',
                proto: '',
                fwstatus: '',
                modalTitle: '',
                dmz_ip: '',
                page: '',
                modal: false,
                ipReg: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/,
                portReg: /^([1-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/,
                checkName: true, // 校验 name
                checkInerPort: true, //校验inner-port
                checkOuterPort: true, // 校验 outer-port
                checkIPs: true, // 校验 IPs
                checkport: true, //校验PORT
                disabledShow: true,
                dmzStatus: false,
                btnStatus: false,
                openfwname: '',
                checkOpenPort: true,
                checkOpenName: true,
                openListPort: '',
                modeminner_ip: '',
                dmzBtn: true,
                currentIndex: -1,
                currIndex: -1,
                checkBtn: true,
                modifyIp: '',
                modifyStatus: false,
                addStatus: false,
                btnStatus: 0,
                appStatus: false,
                blockStatus: false,
                delStatus: false,
                RouteStatus: false
            };
        },
        computed: {
            fwlist: function fwlist() {
                return this.$store.getters.apiData['fwlist'];
            },
            fwlist_list: function fwlist_list() {
                return this.$store.getters.apiData['fwlist_list'];
            },
            dmzValue: function dmzValue() {
                var item = ''
                if (this.dmzStatus) {
                    item = 'Enabled'
                } else {
                    item = 'Disabled'
                }
                return item
            }
        },
        mounted: function mounted() {
            var that = this;
            that.getData();
            that.$store.dispatch("call", {
                api: "getclients"
            }).then(function (result) {
                var reception = result.wire.concat(result.wlan24g);
                var receive = result.wlan5g.concat(reception)
                if (result.success) {
                    for (var i = 0; i < receive.length; i++) {
                        that.iplist.push(receive[i].ip)
                    }
                } else {
                    this.iplist = []
                }
            });
            this.windowWidth();

        },
        methods: {
            windowWidth() {
                if (window.screen.width <= 1180) {
                    $('.Widthscreen').addClass('table-responsive')
                } else {
                    $('.Widthscreen').removeClass('table-responsive')
                }
                $(window).resize(function () {
                    var Width = $(window).width();
                    if (Width <= 1180) {
                        $('.Widthscreen').addClass('table-responsive')
                    } else {
                        $('.Widthscreen').removeClass('table-responsive')
                    }
                })

            },
            getModemIp: function getModemIp(data) {
                this.modeminner_ip = data
            },
            getInner_ip(data) {
                this.inner_ip = data
            },
            getData: function getData() {
                var that = this;
                that.$store.dispatch("call", {
                    api: 'fwlist'
                }).then(function (result) {
                    if (result.success) {
                        that.list = result.rules;
                    } else {
                        that.list = [];
                    }
                });
                that.$store.dispatch("call", {
                    api: 'fwlist_list'
                }).then(function (result) {
                    if (result.success) {
                        that.open_list = result.rules;
                    } else {
                        that.open_list = [];
                    }
                });
                that.$store.dispatch("call", {
                    api: 'fwget'
                }).then(function (result) {
                    if (result.success) {
                        that.dmzStatus = result.status == "Enabled" ? true : false
                        that.dmz_ip = result.dmzip
                    }
                })
            },
            openport: function openport() {
                var that = this
                if (!this.ipReg.test(that.dmz_ip)) {
                    that.$message({
                        type: 'error',
                        msg: -214
                    })
                    return
                }
                that.btnStatus = true
                that.$store.dispatch("call", {
                    api: "fwapple",
                    data: {
                        status: that.dmzValue,
                        dmzip: that.dmz_ip
                    }
                }).then(function (result) {
                    if (result.success) {
                        setTimeout(function () {
                            that.btnStatus = false
                            that.$message({
                                type: 'success',
                                msg: result.code
                            });
                        }, 2000)
                    } else {
                        that.$message({
                            type: 'error',
                            msg: result.code
                        });
                    }
                });
            },
            addListProto() {
                if (this.blockStatus) return
                var that = this
                that.addStatus = true
                that.blockStatus = true
                that.delStatus = true
                if (that.fwname.length >= 20) {
                    that.fwname = that.fwname.substring(0, 8) + '...'
                }
                console.log(that.fwname.length);
                var api = 'fwadd'
                var data = {
                    name: that.fwname,
                    inner_port: that.inner_port,
                    outer_port: that.outer_port,
                    inner_ip: that.inner_ip,
                    proto: that.proto,
                    status: that.fwstatus
                }
                this.blurIp(that.inner_ip)
                if (!that.inner_ip) {
                    that.checkIPs = false
                }
                if (!that.inner_port) {
                    that.checkInerPort = false
                }
                if (!that.outer_port) {
                    that.checkOuterPort = false
                }
                if (!that.fwname) {
                    that.checkName = false
                }
                if (!that.checkIPs || !that.checkInerPort || !that.checkOuterPort || !that.checkName) {
                    that.addStatus = false
                    that.delStatus = false
                    that.blockStatus = false
                    if (!that.checkIPs) {
                        this.animation($('.inner_ip > .select-drop-down'))
                    }
                    if (!that.checkInerPort) {
                        this.animation($('.inner_port>.gl-input'))
                    }
                    if (!that.checkOuterPort) {
                        this.animation($('.outer_port>.gl-input'))
                    }
                    if (!that.checkName) {
                        this.animation($('.blurfwname>.gl-input'))
                    }
                    return;
                }
                that.$store.dispatch("call", {
                    api: api,
                    data: data
                }).then(function (result) {
                    that.fwname = ""
                    that.inner_port = ""
                    that.outer_port = ""
                    that.inner_ip = ""
                    if (result.success) {
                        that.$message({
                            type: 'success',
                            msg: result.code
                        });
                        that.addStatus = false
                        that.blockStatus = false
                        that.delStatus = false
                        that.getData();
                    } else {
                        that.$message({
                            type: 'error',
                            msg: result.code
                        });
                        that.addStatus = false
                        that.delStatus = false
                        that.blockStatus = false
                    }
                });
            },
            animation(data) {
                data.stop(true).animate({
                    left: "-10px"
                }, 100).animate({
                    left: "10px"
                }, 100).animate({
                    left: "-10px"
                }, 100).animate({
                    left: "10px"
                }, 100).animate({
                    left: "0px"
                }, 100)
            },
            addListRoute() {
                if (this.RouteStatus) return
                var that = this
                that.RouteStatus = true
                var api = 'fwadd_open';
                data = {
                    name: that.openfwname,
                    port: that.openListPort,
                    proto: that.proto,
                    status: that.fwstatus
                };
                if (!that.openListPort) {
                    this.checkOpenPort = false
                }
                if (!that.openfwname) {
                    this.checkOpenName = false
                }
                if (!this.checkOpenName || !this.checkOpenPort) {
                    that.RouteStatus = false
                    if (!this.checkOpenName) {
                        this.animation($('.openfwname>.gl-input'))
                    }
                    if (!this.checkOpenPort) {
                        this.animation($('.openListPort>.gl-input'))
                    }
                    return;
                }
                that.$store.dispatch("call", {
                    api: api,
                    data: data
                }).then(function (result) {
                    that.RouteStatus = false
                    that.openListPort = ""
                    that.openfwname = ""
                    if (result.success) {
                        that.$message({
                            type: 'success',
                            msg: result.code
                        });
                        that.getData();
                    } else {
                        that.$message({
                            type: 'error',
                            msg: result.code
                        });
                    }
                });
            },
            // setFw: function setFw(page) {
            //     var that = this;
            //     var api = '';
            //     var data = '';
            //     if (that.page == 'one') {
            //         console.log(that.modeminner_ip)
            //         api = 'fwadd';
            //         data = {
            //             name: that.fwname,
            //             inner_port: that.inner_port,
            //             outer_port: that.outer_port,
            //             inner_ip: that.modeminner_ip,
            //             proto: that.proto,
            //             status: that.fwstatus
            //         };
            //         this.blurIp(that.modeminner_ip)
            //         if (!that.modeminner_ip) {
            //             this.checkIPs = false
            //         }
            //         if (!that.inner_port) {
            //             this.checkInerPort = false
            //         }
            //         if (!that.outer_port) {
            //             this.checkOuterPort = false
            //         }
            //         if (!that.fwname) {
            //             this.checkName = false
            //         }
            //         if (!this.checkIPs || !this.checkInerPort || !this.checkOuterPort || !this.checkName) {
            //             return;
            //         }
            //     } else if (this.page == 'two') {
            //         api = 'setfw';
            //         data = {
            //             name: that.fwname,
            //             inner_port: that.inner_port,
            //             outer_port: that.outer_port,
            //             inner_ip: that.modeminner_ip,
            //             proto: that.proto,
            //             status: that.fwstatus,
            //         };
            //         this.blurIp(that.modeminner_ip)
            //         if (!that.modeminner_ip) {
            //             this.checkIPs = false
            //         }
            //         if (!that.inner_port) {
            //             this.checkInerPort = false
            //         }
            //         if (!that.outer_port) {
            //             this.checkOuterPort = false
            //         }
            //         if (!that.fwname) {
            //             this.checkName = false
            //         }
            //         if (!this.checkIPs || !this.checkInerPort || !this.checkOuterPort || !this.checkName) {
            //             return;
            //         }
            //     } else if (this.page == 'three') {
            //         api = 'fwadd_open';
            //         data = {
            //             name: that.fwname,
            //             port: that.port,
            //             proto: that.proto,
            //             status: that.fwstatus
            //         };
            //         if (!that.port) {
            //             this.checkport = false
            //         }
            //         if (!that.fwname) {
            //             this.checkName = false
            //         }
            //         if (!this.checkport || !this.checkName) {
            //             return;
            //         }
            //     } else if (this.page == 'four') {
            //         api = 'setfw_open';
            //         data = {
            //             name: that.fwname,
            //             port: that.port,
            //             proto: that.proto,
            //             status: that.fwstatus,
            //         };
            //         if (!that.port) {
            //             this.checkport = false
            //         }
            //         if (!that.fwname) {
            //             this.checkName = false
            //         }
            //         if (!this.checkport || !this.checkName) {
            //             return;
            //         }
            //     }
            //     that.$store.dispatch("call", {
            //         api: api,
            //         data: data
            //     }).then(function (result) {
            //         that.modal = false;
            //         that.hideModal();
            //         if (result.success) {
            //             that.$message({
            //                 type: 'success',
            //                 msg: result.code
            //             });
            //             that.getData();
            //         } else {
            //             that.$message({
            //                 type: 'error',
            //                 msg: result.code
            //             });
            //         }
            //     });
            // },
            removefw: function removefw(name, target) {
                if (this.modifyStatus || this.delStatus || this.RouteStatus) return
                var that = this;
                var api = 'fwremove';
                if (target == 'open') {
                    api = 'fwremove_open';
                }
                that.$store.commit("showModal", {
                    show: true,
                    title: 'Caution',
                    message: this.t(this.$lang.firewall.deletion) + '?',
                    cb: function cb() {
                        that.$store.dispatch("call", {
                            api: api,
                            data: {
                                name: name
                            }
                        }).then(function (result) {
                            if (result.success) {
                                that.$message({
                                    type: 'success',
                                    msg: result.code
                                });
                                that.getData();
                            } else {
                                that.$message({
                                    type: 'error',
                                    msg: result.code
                                });
                            }
                        });
                    }
                });
            },
            modifyfw: function modifyfw(index, item, target) {
                this.modifyStatus = true
                this.btnStatus = index
                this.blockStatus = true
                this.RouteStatus = true
                var that = this
                that.appStatus = true
                var api, data;
                if (target) {
                    api = 'setfw';
                    data = {
                        name: item.name,
                        inner_port: item.inner_port,
                        outer_port: item.outer_port,
                        inner_ip: this.modifyIp,
                        proto: item.proto,
                        status: item.status,
                    };
                    if (!this.portReg.test(item.inner_port)) {
                        this.animation($(".firestPort .add_input").eq(index + 1).find(".fire-animate3"))
                    }
                    if (!this.ipReg.test(this.modifyIp)) {
                        this.animation($(".firestPort .add_input").eq(index + 1).find(".fire-animate1"))
                    }
                    if (!item.outer_port || !this.blurOuter(item.outer_port)) {
                        this.animation($(".firestPort .add_input").eq(index + 1).find(".fire-animate2"))
                    }
                    if (!this.portReg.test(item.inner_port) || !this.ipReg.test(this.modifyIp) || !item.outer_port || !this.blurOuter(item.outer_port)) {
                        that.appStatus = false
                        that.RouteStatus = false
                        return
                    }
                } else {
                    api = 'setfw_open';
                    data = {
                        name: item.name,
                        port: item.port,
                        proto: item.proto,
                        status: item.status,
                    };
                    if (!this.portReg.test(item.port)) {
                        that.appStatus = false
                        that.RouteStatus = false
                        this.animation($(".secondPort .add_input").eq(index + 1).find(".fire-animate4"))
                        return
                    }
                }
                that.currentIndex = -1
                that.currIndex = -1
                this.$store.dispatch("call", {
                    api: api,
                    data: data
                }).then(function (result) {
                    that.modifyStatus = false
                    that.blockStatus = false
                    that.RouteStatus = false
                    if (result.success) {
                        that.$message({
                            type: 'success',
                            msg: result.code
                        })
                        that.appStatus = false
                        that.getData()
                    } else {
                        that.appStatus = false
                    }
                })
            },
            deleteAll(page) {
                if (page == 'four') {
                    var that = this
                    that.$store.commit("showModal", {
                        show: true,
                        title: 'Caution',
                        message: that.$lang.firewall.portrules,
                        cb: function cb() {
                            that.$store.dispatch("call", {
                                api: 'fwdel_all',
                                data: {
                                    type: 'oport'
                                }
                            }).then(result => {
                                if (result.success) {
                                    that.getData()
                                    that.$message({
                                        type: 'success',
                                        msg: result.code
                                    });
                                }
                            });
                        }
                    });
                    return
                }
                if (page == 'two') {
                    var that = this
                    that.$store.commit("showModal", {
                        show: true,
                        title: 'Caution',
                        message: that.$lang.firewall.portrules,
                        cb: function cb() {
                            that.$store.dispatch("call", {
                                api: 'fwdel_all',
                                data: {
                                    type: 'fport'
                                }
                            }).then(result => {
                                if (result.success) {
                                    that.getData()
                                    that.$message({
                                        type: 'success',
                                        msg: result.code
                                    });
                                }
                            });
                        }
                    });
                    return
                }
            },
            showmodal: function showmodal(page) {
                var that = this;
                that.modal = true;
                that.page = page;
                // 标题
                that.modalTitle = page == 'one' ? this.t(this.$lang.firewall.ForwardRule) : this.t(this.$lang.firewall.PortRule);
                that.disabledShow = true
            },
            hideModal: function hideModal() {
                var that = this;
                that.modal = false;
                that.fwname = "";
                that.outer_port = "";
                that.inner_port = "";
                that.port = '';
                that.modeminner_ip = ' '
                that.proto = "All";
                that.fwstatus = "Enabled";
                that.checkName = true; // 校验 name
                that.checkInerPort = true; //校验inner-port
                that.checkOuterPort = true; // 校验 outer-port
                that.checkIPs = true; // 校验 IPscheckName: true, // 校验 name
                that.checkport = true //校验PORT
            },
            blurOuter(data) {
                if (data.indexOf('-') != -1) {
                    var list = []
                    list = data.split('-')
                    if (list.length > 2) {
                        this.checkOuterPort = false
                    } else {
                        if (parseInt(list[0]) <= parseInt(list[1])) {
                            !data ? this.checkOuterPort = false : this.checkOuterPort = this.portReg.test(list[0]) && this.portReg.test(list[1])
                        } else {
                            this.checkOuterPort = false
                        }
                    }
                } else {
                    this.checkOuterPort = !data ? true : this.portReg.test(data);
                }
                var item = this.checkOuterPort
                return item
            },
            blurfwname() {
                this.fwname.length >= 32 ? this.checkName = false : this.checkName = true
            },
            bluropenfwname() {
                this.openfwname.length <= 32 ? this.checkOpenName = true : this.checkOpenName = false
            },
            blurInerPort() {
                !this.inner_port ? this.checkInerPort = true : this.checkInerPort = this.portReg.test(this.inner_port);
            },
            blurIp(data) {
                this.checkIPs = !data ? true : this.ipReg.test(data);
            },
            blurport() {
                !this.port ? this.checkport = true : this.checkport = this.portReg.test(this.port);
            },
            bluropenListPort() {
                !this.openListPort ? this.checkOpenPort = true : this.checkOpenPort = this.portReg.test(this.openListPort);
            },
            checkDmz: function checkDmz(data) {
                this.dmz_ip = data
                this.dmzBtn = false
            },
            checkConfig: function checkConfig(index, target) {
                if (this.modifyStatus || this.blockStatus || this.RouteStatus) return
                if (target) {
                    this.currentIndex = index
                } else {
                    this.currIndex = index
                }
            },
            getmoInner_ip: function getmoInner_ip(data) {
                this.modifyIp = data
            },
            cancelChange() {
                this.currentIndex = -1
                this.getData()
            },
            cancelModify() {
                this.currIndex = -1
                this.getData()
            }
        },
        components: {
            "gl-tg-btn": gl_toggle,
            "gl-select": gl_select,
            "select": select,
            "gl-btn": gl_btn,
            "gl-modal": gl_modal,
            "gl-input": gl_input,
            "gl-toggle-btn": gl_toggle_btn,
            "gl-tooltip": gl_tooltip,
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
        }
    });
    return vueComponent;
});