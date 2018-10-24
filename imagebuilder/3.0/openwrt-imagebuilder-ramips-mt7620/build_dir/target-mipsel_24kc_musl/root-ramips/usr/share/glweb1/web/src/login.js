"use strict";

require(["vue", "vueX", "router/router", "store/store", "lang", "en", "jquery", "temple/login/index", "component/loading/index", "component/gl-message/index", "component/gl-modal/index", "component/gl-dropdown/index", "bootstrap"], function (Vue, Vuex, router, store, vuexI18n, en, jquery, indext, loading, message, vodal, gl_dropdown) {
    Vue.component("vodal", vodal);
    Vue.component("gl-dropdown", gl_dropdown);
    Vue.prototype.$message = message;
    Vue.config.debug = true;
    Vue.config.devtools = true;
    Vue.use(vuexI18n);
    Vue.locales(en);
    Vue.directive('focus', function (el) {
        el.querySelector('input').focus();
    });
    new Vue({
        el: "#app",
        store: store,
        data: function data() {
            return {
                loading: true
            };
        },
        components: {
            loading: loading,
            indext: indext
        },
        // 设置语言
        beforeCreate: function beforeCreate() {
            var that = this;
            that.$store.dispatch("call", { api: "getlanguage" }).then(function (result) {
                if (result.success) {
                    that.$translate.setLang(result.language);
                } else {
                    that.$translate.setLang('EN');
                }
            });
        }
    });
});