"use strict";

require(["vue", "vueX", "store/store", "lang", "en", "jquery", "temple/process/index", "component/loading/index", "component/gl-message/index", "bootstrap"], function (Vue, Vuex, store, vuexI18n, en, jquery, indext, loading, message) {
    Vue.config.debug = true;
    Vue.config.devtools = true;
    Vue.prototype.$message = message;
    Vue.use(vuexI18n);
    Vue.locales(en);
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