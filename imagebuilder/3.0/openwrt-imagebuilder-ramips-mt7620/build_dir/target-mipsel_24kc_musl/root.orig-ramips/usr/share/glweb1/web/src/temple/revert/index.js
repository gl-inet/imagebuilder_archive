"use strict";

define(["text!temple/revert/index.html", "css!temple/revert/index.css", "vue", "component/gl-toggle-btn/index", "component/gl-tooltip/index", "component/gl-btn/index"], function (stpl, css, Vue, gl_switch, gl_tooltip, gl_btn) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {};
        },
        components: {
            "gl-switch": gl_switch,
            "gl-tooltip": gl_tooltip,
            "gl-btn": gl_btn
        },
        beforeRouteEnter: function beforeRouteEnter(to, from, next) {
            next(function (vm) {
                $("#router-visual").slideUp();
                $(".bar.active").removeClass("active");
                // $(".clsLink2applications").addClass("active");
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
        methods: {
            revertBtnClick: function revertBtnClick() {
                this.$store.commit("showModal", {
                    show: true,
                    title: "Caution",
                    message: this.$lang.modal.isRevert,
                    cb: function cb() {
                        if (window.caniuse) {
                            sessionStorage.setItem("callfunction", "revertfirmware");
                        }
                        window.location.href = "/process.html?action=revertfirmware";
                    }
                });
            }
        }
    });
    return vueComponent;
});