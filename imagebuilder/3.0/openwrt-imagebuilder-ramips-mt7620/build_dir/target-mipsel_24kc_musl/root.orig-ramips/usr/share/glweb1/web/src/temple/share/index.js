"use strict";

define(["text!temple/share/index.html", "css!temple/share/index.css", "vue", "component/gl-toggle-btn/index", "component/gl-tooltip/index", "component/gl-btn/index"], function (stpl, css, Vue, gl_switch, gl_tooltip, gl_btn) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                isShow: false,
                agreeStatus: false,
                applyStatus: true
            };
        },
        components: {
            "gl-switch": gl_switch,
            "gl-tooltip": gl_tooltip,
            "gl-btn": gl_btn
        },
        beforeRouteEnter: function beforeRouteEnter(to, from, next) {
            next(function (vm) {
                $("#router-visual").slideUp();
                setTimeout(function () {
                    if ($(".clsLink2" + vm.$route.path.split("/")[1]).hasClass("bar")) {
                        $(".bar.active").removeClass("active");
                        $(".clsLink2" + vm.$route.path.split("/")[1]).addClass("active");
                        $("#vpn").collapse("hide");
                        $("#moresetting").collapse("hide");
                        $("#applications").collapse("hide");
                        $("#system").collapse("show");
                    }
                }, 50);
            });
        },
        mounted: function mounted() {
            var that = this;
            this.$store.dispatch("call", { api: "shareget" }).then(function (result) {
                // console.log(result);
            });
        },
        computed: {
            shareget: function shareget() {
                return this.$store.getters.apiData['shareget'];
            }
        },
        methods: {
            checkApply: function checkApply() {
                this.applyStatus = false;
            },
            checkArgee: function checkArgee() {
                var that = this;
                if (this.shareget.samba_writable) {
                    that.$store.commit("showModal", {
                        show: true,
                        title: "Caution",
                        type: "warning",
                        message: this.$lang.modal.usbUseInfo,
                        yes: "Agree",
                        no: "Cancel",
                        cb: function cb() {
                            that.applyStatus = false;
                        },
                        cancel: function cancel() {
                            that.shareget.samba_writable = false;
                        }
                    });
                } else {
                    that.applyStatus = false;
                }
            },
            // changeagStat: function changeagStat() {
            //     var that = this;
            // },
            setShare: function setSahre() {
                var that = this;
                that.applyStatus = true;
                this.$store.dispatch("call", {
                    api: "shareset", data: {
                        wan_share: that.shareget.share_on_wan,
                        writable: that.shareget.samba_writable
                    }
                }).then(function (result) {
                    if (result.success) {
                        that.$message({
                            type: "success",
                            msg: result.code
                        });
                    } else {
                        that.$message({
                            type: "error",
                            msg: result.code
                        });
                    }
                });
            }
        }
    });
    return vueComponent;
});