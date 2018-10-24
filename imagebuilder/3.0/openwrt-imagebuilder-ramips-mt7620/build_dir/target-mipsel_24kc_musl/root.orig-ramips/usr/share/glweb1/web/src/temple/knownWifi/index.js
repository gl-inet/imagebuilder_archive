"use strict";

define(["text!temple/knownWifi/index.html", "vue", "css!temple/knownWifi/index.css", "component/gl-btn/index", "component/gl-input/index", "component/gl-tooltip/index"], function (stpl, Vue, css, gl_btn, gl_input, gl_tooltip) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                wifiData: [],
                alertStatus: null,
                alertInfo: "",
                checked: false,
                connectWifiIcon: "fa fa-check",
                noConnectWifiIcon: "fa fa-circle-o-notch opacity0",
                sLodingIconCls: "fa fa-circle-o-notch fa-spin",
                connectingIndex: null,
                isConnecting: false
            };
        },
        components: {
            "gl-btn": gl_btn,
            "gl-input": gl_input,
            "gl-tooltip": gl_tooltip
        },
        computed: {
            stainfo: function stainfo() {
                return this.$store.getters.apiData["stainfo"];
            },
            knownWifis: function knownWifis() {
                return this.$store.getters.apiData['savedwifi'];
            },
            wifilist: function wifilist() {
                return this.knownWifis.wifis;
            }
        },
        // beforeRouteLeave: function beforeRouteLeave(to, from, next) {
        //     if (!this.isConnecting) {
        //         next();
        //     } else {
        //         this.$message({
        //             "type": "warning",
        //             "msg": -1800,
        //             "duration": 2000
        //         });
        //     }
        // },
        mounted: function mounted() {
            this.wifiData = this.wifilist || [];
            this.getWifiList();
        },
        methods: {
            hide: function hide() {
                $(".collapse").collapse("hide");
                this.checked = false;
            },
            clickItem: function clickItem() {
                this.checked = false;
            },
            generateId: function generateId(name, id) {
                return name + "_" + id;
            },
            getWifiList: function getWifiList() {
                var _this = this;
                var that = this;
                this.$store.dispatch("call", { api: "savedwifi" }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "savedwifi",
                            "msg": result.code
                        });
                        that.alertStatus = "error";
                        that.alertMsg = result.code;
                        return;
                    }
                    if (result.success) {
                        that.wifiData = result.wifis;
                        for (var i in that.wifiData) {
                            that.wifiData[i]["newKey"] = that.wifiData[i].key;
                            that.wifiData[i]["checked"] = false;
                            that.wifiData[i]["hasError"] = false;
                            that.wifiData[i]["icon"] = _this.noConnectWifiIcon;
                        }
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "savedwifi",
                            "msg": result.code
                        });
                    }
                });
            },
            forgetWifi: function forgetWifi(index) {
                var that = this;
                this.$store.commit("showModal", {
                    show: true,
                    title: "Caution",
                    message: that.$lang.modal.forgetWifiMsg,
                    cb: function cb() {
                        that.forget(index);
                    }
                });
            },
            forget: function forget(index) {
                var that = this;
                this.hide();
                this.$store.dispatch("call", {
                    api: "removewifi", data: {
                        ssid: that.wifiData[index].ssid,
                        mac: that.wifiData[index].bssid
                    }, timeOut: 20000
                }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "removewifi",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        that.$message({
                            "type": "success",
                            "api": "removewifi",
                            "msg": result.code
                        });
                        that.wifiData.splice(index, 1);
                        setTimeout(function () {
                            that.getWifiList();
                        }, 2000);
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "removewifi",
                            "msg": result.code
                        });
                        return;
                    }
                }).then(function () {
                    that.$store.dispatch("call", { api: "stainfo" });
                });
            },
            joinWifi: function joinWifi(index) {
                var that = this;
                var password = this.wifiData[index].key || "";
                if (this.wifiData[index].encrypt != "none" && this.wifiData[index].issaved == false) {
                    if (password == null || that.VerifyWifiKeyLen(this.wifiData[index].encrypt, password) == false) {
                        this.$set(this.wifiData[index], "hasError", true);
                        $("#known_" + index).find(".clsSetWifiKeyInput").focus();
                        return;
                    }
                }
                that.alertStatus = "info";
                this.isConnecting = true;
                this.connectingIndex = index;
                this.hide();
                // 这里的参数全部是通过savedwifi返回
                this.$store.dispatch("call", {
                    api: "joinwifi", data: {
                        ssid: this.wifiData[index].ssid,
                        key: password,
                        channel: this.wifiData[index].channel,
                        device: this.wifiData[index].device,
                        encrypt: this.wifiData[index].encryption,
                        issaved: true,
                        mac: this.wifiData[index].bssid,
                        save2uci: true,
                        identity: this.wifiData[index].identity,
                        // lanip不需要传，为防止错误暂不删除
                        ipaddr: this.wifiData[index].ipaddr,
                        mode: ""
                    }, timeOut: 60000
                }).then(function (result) {
                    if (result.failed) {
                        that.isConnecting = false;
                        that.$message({
                            "type": "warning",
                            "api": "joinwifi",
                            "msg": result.code
                        });
                    } else {
                        if (result.success) {
                            that.$message({
                                "type": "success",
                                "api": "joinwifi",
                                "msg": result.code
                            });
                            setTimeout(function () {
                                that.isConnecting = false;
                                that.$router.push("internet");
                            }, 2000);
                        } else {
                            that.isConnecting = false;
                            that.alertStatus = "error";
                            that.$message({
                                "type": "warning",
                                "api": "joinwifi",
                                "msg": result.code
                            });
                            if (result.code == -100) {
                                that.$set(that.wifiData[index], "hasError", true);
                                $("#known_" + index).collapse("show");
                                $("#known_" + index).find(".clsSetWifiKeyInput").focus();
                            }
                        }
                    }
                });
            },
            KeyMinLengthMsg: function KeyMinLengthMsg(encrypt) {
                var result = null;
                if (encrypt == "wep") {
                    result = that.$lang.knownWifi.characters;
                } else if (encrypt != "none") {
                    result = that.$lang.knownWifi.lest_8;
                }
                return result;
            }
        },
        beforeRouteEnter: function beforeEnter(to, from, next) {
            next(function (vm) {
                $("#router-visual").slideUp();
                if ($(".clsLink2" + vm.$route.path.split("/")[1]).hasClass("bar")) {
                    $(".bar.active").removeClass("active");
                    $(".clsLink2" + vm.$route.path.split("/")[1]).addClass("active");
                    $("#moreapps").collapse("hide");
                    $("#moresetting").collapse("hide");
                    $("#tool").collapse("hide");
                }
            });
        }
    });
    return vueComponent;
});