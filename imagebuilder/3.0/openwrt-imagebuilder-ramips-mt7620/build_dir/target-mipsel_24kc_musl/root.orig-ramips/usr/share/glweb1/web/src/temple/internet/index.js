"use strict";

define(["vue", "text!temple/internet/index.html", "css!temple/internet/index.css", "temple/internet/modem", "temple/internet/repeater", "temple/internet/tethering", "temple/internet/waninfo"], function (Vue, stpl, css, modem, repeater, tethering, waninfo) {
    var vueComponent = Vue.extend({
        template: stpl,
        components: {
            "modem": modem,
            "repeater": repeater,
            "tethering": tethering,
            "waninfo": waninfo
        },
        data: function data() {
            return {
                stateClass: 'col-lg-4'
            };
        },
        computed: {
            onlist: function onlist() {
                if (this.$store.getters.onlist.length) {
                    return this.$store.getters.onlist;
                } else {
                    return ['waninfo'];
                }
            },
            offlist: function offlist() {
                var len = this.$store.getters.offlist.length;
                switch (len) {
                    case 0:
                        this.stateClass = 'hide';
                        break;
                    case 1:
                        this.stateClass = 'col-lg-12 uninternet';
                        break;
                    case 2:
                        this.stateClass = 'col-lg-6';
                        break;
                    case 3:
                        this.stateClass = 'col-lg-4';
                        break;
                }
                if (len == 4) {
                    return ["repeater", "modem", "tethering"];
                } else {
                    return this.$store.getters.offlist;
                }
            }
        },
        beforeRouteLeave: function beforeRouteLeave(to, from, next) {
            // this.$store.dispatch("setinter");
            this.$store.commit("clearvpnTimer");
            this.$store.commit("setInterMsm", true);
            next();
        },
        mounted: function mounted() {
            var that = this;
            $("#router-visual").slideDown();
            if ($(".clsLink2internet").hasClass("bar")) {
                $(".bar.active").removeClass("active");
                $(".clsLink2internet").addClass("active");
                $("#applications").collapse("hide");
                $("#moresetting").collapse("hide");
                $("#system").collapse("hide");
                $("#vpn").collapse("hide");
            };
            // this.$store.commit("clearTimer");
            this.$store.dispatch("setvpn"); // vpn定时器
            this.$store.commit("setInterMsm", false);
        },
        methods: {}
    });
    return vueComponent;
});