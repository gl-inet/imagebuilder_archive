"use strict";

define(["text!temple/settings/index.html", "css!temple/settings/index.css", "vue", "component/gl-toggle-btn/index", "component/gl-tooltip/index", "component/gl-btn/index", "component/gl-label/index", "component/select/index"], function (stpl, css, Vue, gl_switch, gl_tooltip, gl_btn, gl_label, gl_select) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                isShow: false,
                chooseState: ["No function (default)", "WireGuard® Client Toggle (On/Off)", "OpenVPN Client Toggle (On/Off)"],
                param: "",
                btnStatus: true
            };
        },
        components: {
            "gl-switch": gl_switch,
            "gl-tooltip": gl_tooltip,
            "gl-btn": gl_btn,
            "gl-label": gl_label,
            "gl-select": gl_select
        },
        beforeRouteEnter: function beforeRouteEnter(to, from, next) {
            next(function (vm) {
                $("#router-visual").slideUp();
                setTimeout(function () {
                    if ($(".clsLink2" + vm.$route.path.split("/")[1]).hasClass("bar")) {
                        $(".bar.active").removeClass("active");
                        $(".clsLink2" + vm.$route.path.split("/")[1]).addClass("active");
                        $("#vpn").collapse("hide");
                        $("#moresetting").collapse("show");
                        $("#applications").collapse("hide");
                        $("#system").collapse("hide");
                    }
                }, 50);
            });
        },
        computed: {
            ststatus: function ststatus() {
                return this.$store.getters.apiData["switchget"];
            },
            parstatus: function parstatus() {
                var status;
                switch (this.param) {
                    case "No function (default)":
                        status = "noop";
                        break;
                    case "WireGuard® Client Toggle (On/Off)":
                        status = "wg";
                        break;
                    case "OpenVPN Client Toggle (On/Off)":
                        status = "vpn";
                        break;
                }
                return status;
            },
            btnStatus: function btnStatus() {
                if (this.parstatus == "vpn") {
                    return true;
                }
                return false;
            }
        },
        mounted: function mounted() {
            var _this = this;
            _this.$store.dispatch("call", { api: "switchget" }).then(function (result) {
                if (result.success) {
                    switch (result.mode) {
                        case "noop":
                            _this.param = "No function (default)";
                            break;
                        case "wg":
                            _this.param = "WireGuard® Client Toggle (On/Off)";
                            break;
                        case "vpn":
                            _this.param = "OpenVPN Client Toggle (On/Off)";
                            break;
                    }
                }
            });
        },
        methods: {
            checkBtn: function checkBtn() {
                this.btnStatus = false;
            },
            hint: function hint() {
                this.isShow = !this.isShow;
            },
            checkType: function checkType() {
                var _this = this;
                switch (_this.parstatus) {
                    case 'wg':
                        _this.$store.dispatch("call", { api: "wgclist" }).then(function (result) {
                            if (result.code == -5) {
                                _this.$store.commit('showModal', {
                                    message: _this.$lang.modal.no_wireguard,
                                    messageTwo: _this.$lang.modal.addnewconfig,
                                    type: 'warning',
                                    title: _this.t(_this.$lang.modal.caution),
                                    cb: function cb() {
                                        _this.$router.push("wgclient");
                                    }
                                });
                            } else {
                                _this.openSetting();
                            }
                        });
                        break;
                    case 'vpn':
                        _this.$store.dispatch("call", { api: "ovpnGetClients" }).then(function (result) {
                            if (result.success) {
                                if (result.clients.length == 0) {
                                    _this.$store.commit('showModal', {
                                        message: _this.$lang.modal.no_openvpn,
                                        messageTwo: _this.$lang.modal.addnewconfig,
                                        type: 'warning',
                                        title: _this.t(_this.$lang.modal.caution),
                                        cb: function cb() {
                                            _this.$router.push("vpnclient");
                                        }
                                    });
                                } else {
                                    _this.openSetting();
                                }
                            } else {
                                _this.openSetting();
                            }
                        });
                        break;
                    case 'noop':
                        _this.openSetting();
                        break;
                }
            },
            openSetting: function openSetting() {
                var _this = this;
                _this.btnStatus = true;
                _this.$store.dispatch("call", {
                    api: "switchset", data: {
                        mode: _this.parstatus
                    }
                }).then(function (result) {
                    if (result.success) {
                        _this.$message({
                            type: "success",
                            msg: result.code
                        });
                    } else {
                        var type = 'error';
                        if (result.code == -301) {
                            type = 'warning';
                        }
                        _this.$message({
                            type: type,
                            msg: result.code
                        });
                    }
                });
            }
        }
    });
    return vueComponent;
});