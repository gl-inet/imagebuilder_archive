'use strict';

require(['vue', 'vueX', 'router/router', 'store/store', 'lang', 'en', 'jquery', 'temple/index/index', 'component/loading/index', 'component/gl-message/index', 'component/gl-modal/index', 'component/gl-dropdown/index', 'component/gl-loading/index', 'bootstrap'], function (Vue, Vuex, router, store, vuexI18n, en, jquery, indext, loading, message, vodal, gl_dropdown, gl_loading) {
    window.Vue = Vue;
    Vue.component('vodal', vodal);
    Vue.component('gl-dropdown', gl_dropdown);
    Vue.prototype.$message = message;
    Vue.config.debug = true;
    Vue.config.devtools = true;
    Vue.use(vuexI18n);
    Vue.locales(en);
    Vue.directive('focus', {
        inserted: function inserted(el, _ref) {
            var value = _ref.value;
            if (value) {
                el.focus();
            }
        }
    });
    new Vue({
        el: '#app',
        router: router,
        store: store,
        data: function data() {
            return {
                // loading: true
            };
        },
        components: {
            "gl-loading": gl_loading,
            loading: loading,
            indext: indext
        },
        mounted: function mounted() {
            var that = this;
            that.$store.dispatch('call', { api: 'getlanguage' }).then(function (result) {
                if (result.success) {
                    that.$store.commit("setLang", { lang: result.language });
                    that.$translate.setLang(result.language);
                } else {
                    that.$store.commit("setLang", { lang: 'EN' });
                    that.$translate.setLang('EN');
                }
            });
            // 获取路由器wifi是什么
            this.$store.dispatch('call', { api: 'getaps' }).then(function (result) {
                // that.loading = false;
            });
            setTimeout(function () {
                // 是否有自动更新
                that.$store.dispatch("call", { api: "checkfirmware" });
            }, 2000);
        }
    });
});