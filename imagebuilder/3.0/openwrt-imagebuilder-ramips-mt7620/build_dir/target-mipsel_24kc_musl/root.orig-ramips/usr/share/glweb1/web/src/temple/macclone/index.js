"use strict";

define(["text!temple/macclone/index.html", "vue", "component/gl-btn/index", "component/select/index", "macaddress"], function (temp, Vue, gl_btn, gl_select, macaddress) {
    var vueComponent = Vue.extend({
        template: temp,
        data: function data() {
            return {
                MacInfo: {},
                timer: null,
                applyDisabled: true,
                btnMove: false
            };
        },
        components: {
            "gl-btn": gl_btn,
            "gl-select": gl_select
        },
        beforeRouteLeave: function beforeRouteLeave(to, from, next) {
            if (!this.btnMove) {
                next();
                return;
            }
            this.$message({
                "type": "warning",
                "msg": -1700,
                "duration": 1000
            });
        },
        computed: {
            macdata: function macdata() {
                return this.$store.getters.apiData['getmacsinfo'];
            },
            maclist: function maclist() {
                var array = [];
                if (this.macdata.success) {
                    array.push(this.macdata.factorymac.toUpperCase() + "(default)");
                    array.push(this.macdata.remotemac.toUpperCase() + "(clone)");
                    array.push("Random");
                }
                return array;
            }
        },
        mounted: function mounted() {
            var that = this;
            this.getMacData();
        },
        methods: {
            checkbtn: function checkbtn(data) {
                this.MacInfo.mac = data;
                this.applyDisabled = false;
            },
            getModel: function getModel(data) {
                this.applyDisabled = false;
                var that = this;
                if (data == "Random") {
                    that.MacInfo.mac = that.genMAC();
                } else if (data.indexOf("(") != -1) {
                    that.MacInfo.mac = data.split("(")[0];
                }
            },
            getMacData: function getMacData() {
                var that = this;
                this.$store.dispatch("call", { api: "getmacsinfo" }).then(function (result) {
                    that.MacInfo = result;
                });
            },
            macchange: function macchange() {
                this.applyDisabled = false;
            },
            // 生成MAC地址的后6位
            genMAC: function genMAC() {
                var hexDigits = "0123456789ABCDEF";
                var macAddress = "";
                for (var i = 0; i < 3; i++) {
                    // charAt返回指定位置的字符串
                    macAddress += hexDigits.charAt(Math.round(Math.random() * 15));
                    macAddress += hexDigits.charAt(Math.round(Math.random() * 15));
                    if (i != 2) macAddress += ":";
                }
                // 前6位随机选择
                macAddress = macaddress[Math.round(Math.random() * macaddress.length)] + ":" + macAddress;
                return macAddress;
            },
            macCloneApply: function macCloneApply() {
                var that = this;
                that.btnMove = true;
                this.applyDisabled = true;
                var mac = this.MacInfo.mac.toUpperCase();
                // var hexDigits = "0123456789ABCDEF";
                var expre = /^[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}$/;
                var regexp = new RegExp(expre);
                if (!regexp.test(mac)) {
                    this.$message({
                        "type": "error",
                        "api": "clonemac",
                        "msg": -1701
                    });

                    that.btnMove = false;
                    this.applyDisabled = false;
                } else {
                    this.$store.dispatch("call", {
                        api: "clonemac", data: {
                            newmac: this.MacInfo.mac.toUpperCase()
                        }
                    }).then(function (result) {
                        if (result.failed) {
                            that.$message({
                                "type": "error",
                                "api": "clonemac",
                                "msg": result.code
                            });
                            return;
                        }
                        if (result.success) {
                            setTimeout(function () {
                                that.$message({
                                    "type": "success",
                                    "api": "clonemac",
                                    "msg": result.code
                                });
                            }, 5000);
                        } else {
                            that.$message({
                                "type": "error",
                                "api": "clonemac",
                                "msg": result.code
                            });
                        }
                    });
                    this.timer = setTimeout(function () {
                        that.getMacData();
                        that.timer = null;
                        that.btnMove = false;
                    }, 5500);
                }
            }
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
        }
    });
    return vueComponent;
});