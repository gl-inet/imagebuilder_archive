"use strict";

define(["text!temple/lanip/index.html", "vue", "component/gl-btn/index"], function (stpl, Vue, gl_btn) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                timer: "",
                disableBtn: true,
                inputStatus: null,
                newIP: null,
                oldIP: null,
                alertMsg: this.$lang.lanip.alertMsg,
                btnMove: false
            };
        },
        components: {
            "gl-btn": gl_btn
        },
        beforeRouteEnter: function beforeRouteEnter(to, from, next) {
            next(function (vm) {
                $("#router-visual").slideUp();
                if ($(".clsLink2" + vm.$route.path.split("/")[1]).hasClass("bar")) {
                    $(".bar.active").removeClass("active");
                    $(".clsLink2" + vm.$route.path.split("/")[1]).addClass("active");
                    $("#vpn").collapse("hide");
                    $("#moresetting").collapse("show");
                    $("#applications").collapse("hide");
                    $("#system").collapse("hide");
                }
            });
        },
        beforeRouteLeave: function beforeRouteLeave(to, from, next) {
            if (!this.btnMove) {
                next();
                return;
            }
            this.$message({
                "type": "warning",
                "msg": -1500,
                "duration": 1000
            });
        },
        mounted: function mounted() {
            var that = this;
            that.$store.dispatch("call", { api: "laninfo" }).then(function (result) {
                if (result.success) {
                    that.oldIP = result.ip;
                }
            });
        },
        computed: {
            laninfo: function laninfo() {
                return this.$store.getters.apiData["laninfo"];
            }
        },
        methods: {
            validate: function validate() {
                var ipReg1 = /^10(?:\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/,
                    ipReg2 = /^172\.(1[6-9]|2\d|3[01])(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){2}$/,
                    ipReg3 = /^192\.168(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){2}$/;
                var isValid = ipReg1.test(this.laninfo.ip) || ipReg2.test(this.laninfo.ip) || ipReg3.test(this.laninfo.ip);
                if (isValid) {
                    this.inputStatus = "success";
                } else {
                    this.inputStatus = "error";
                }
            },
            setLanIP: function setLanIP() {
                if (this.inputStatus != "success") {
                    return;
                }
                var that = this;
                if (this.laninfo.ip == this.oldIP) {
                    this.inputStatus = "error";
                    that.$message({
                        type: "warning",
                        msg: this.$lang.lanip.LanIPMsg
                    });
                    return;
                }
                that.btnMove = true;
                this.$store.dispatch("call", {
                    api: "setlanip", data: {
                        newip: that.laninfo.ip
                    }
                }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "setlanip",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        that.$message({
                            "type": "info",
                            "api": "setlanip",
                            "msg": that.t("The ip address of the router was changed successfully to") + ': ' + that.laninfo.ip,
                            // The IP address of router has been changed successfully as
                            "duration": 12000
                        });
                        setTimeout(function () {
                            that.$message({
                                "type": "success",
                                "msg": that.t("You are being redirected to the new IP") + '：http://' + that.laninfo.ip,
                                "duration": 5000
                            });
                            that.btnMove = false;
                            window.location.href = "http://" + that.laninfo.ip;
                        }, 5000);
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "setlanip",
                            "msg": result.code
                        });
                        that.btnMove = false;
                    }
                });
            }
        }
    });
    return vueComponent;
});