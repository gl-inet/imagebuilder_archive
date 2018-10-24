'use strict';

require(['vue', 'vueX', 'store/store', 'lang', 'en', 'jquery', 'temple/welcome/index', 'component/loading/index', 'component/gl-message/index', 'component/gl-loading/index', 'bootstrap'], function (Vue, Vuex, store, vuexI18n, en, jquery, indext, loading, message, gl_loading) {
    Vue.config.debug = true;
    Vue.config.devtools = true;
    Vue.prototype.$message = message;
    Vue.use(vuexI18n);
    Vue.locales(en);
    new Vue({
        el: '#app',
        store: store,
        data: function data() {
            return {
                loading: true,
                timer: null
            };
        },
        components: {
            loading: loading,
            "gl-loading": gl_loading,
            indext: indext
        },
        mounted: function mounted() {
            var that = this;
            that.$store.dispatch("call", { api: "isconnected" }).then(function (result) {
                if (result.init) {
                    that.loading = false;
                    that.getData();
                } else {
                    that.timer = setInterval(function () {
                        that.$store.dispatch("call", { api: "isconnected" }).then(function (result) {
                            if (result.init) {
                                that.loading = false;
                                that.getData();
                            }
                        });
                    }, 3000);
                }
            });
        },
        methods: {
            getData: function getData() {
                var that = this;
                clearInterval(that.timer);
                this.$store.dispatch('call', { api: 'getap4config' }).then(function (result) {
                    if (!result.success) {
                        that.getData();
                    } else {
                        that.$store.dispatch('call', { api: 'getlanguage' }).then(function (result) {
                            if (result.success) {
                                that.$translate.setLang(result.language);
                            } else {
                                that.$translate.setLang('EN');
                            }
                        });
                    }
                });
            }
        }
    });
});