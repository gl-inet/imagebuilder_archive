'use strict';

define(['vue'], function (Vue) {
    'use strict';
    var vm = null;
    var VueTranslate = {
        install: function install(Vue) {
            var vueLang;
            var version = Vue.version[0];
            if (!vm) {
                vm = new Vue({
                    data: function data() {
                        return {
                            type: '',
                            current: '',
                            keymap: [],
                            lans: [],
                            locales: {}
                        };
                    },
                    computed: {
                        // Current selected language
                        lang: function lang() {
                            return this.current;
                        },
                        // Current locale values
                        locale: function locale() {
                            if (!this.locales[this.current]) return null;
                            return this.locales[this.current];
                        }
                    },
                    methods: {
                        // Set a language as current
                        setLang: function setLang(val) {
                            if(this.lans.indexOf(val) != -1){
                                if (this.current !== val) {
                                    if (this.current === '') {
                                        this.$emit('language:init', val);
                                    } else {
                                        this.$emit('language:changed', val);
                                    }
                                }
                                this.current = val;
                                this.$emit('language:modified', val);
                            }else{
                                var newval = this.lans[0];
                                if (this.current !== newval) {
                                    if (this.current === '') {
                                        this.$emit('language:init', newval);
                                    } else {
                                        this.$emit('language:changed', newval);
                                    }
                                }
                                this.current = newval;
                                this.$emit('language:modified', newval);
                            }
                        },
                        // Set a locale tu use
                        setLocales: function setLocales(locales) {
                            if (!locales) return;
                            var type = Object.prototype.toString.call(locales).split(" ")[1].split("]")[0];
                            if(type == "Object"){
                                this.type = "Object";
                                var newLocale = Object.create(this.locales);
                                for (var key in locales) {
                                    if (!newLocale[key]) newLocale[key] = {};
                                    Vue.util.extend(newLocale[key], locales[key]);
                                }
                                this.locales = Object.create(newLocale);
                            }else if(type == "Array"){
                                this.type = "Array";
                                var len = locales.length;
                                for(var i = 0;i< len;i++){
                                    key = locales[i];
                                    var keys = Object.keys(key);
                                    this.keymap.push(key[keys[0]]);
                                }
                                this.lans = Object.keys(locales[0]);
                                this.locales = locales;
                            }
                            this.$emit('locales:loaded', locales);
                        },
                        text: function text(t) {
                            if(this.type == "Object"){
                                if (!this.locale || !this.locale[t]) {
                                    return t;
                                }
                                return this.locale[t];
                            }else if(this.type == "Array"){
                                if(!this.keymap){
                                    return t;
                                }
                                var index = this.keymap.indexOf(t);
                                if(index == -1){
                                    return t;
                                }else{
                                    return this.locales[index][this.current];
                                }
                            }
                        }
                    }
                });
                Vue.prototype.$translate = vm;
            }
            // Mixin to read locales and add the translation method and directive
            Vue.mixin((vueLang = {}, vueLang[version === '1' ? 'init' : 'beforeCreate'] = function () {
                this.$translate.setLocales(this.$options.locales);
            }, vueLang.methods = {
                // An alias for the .$translate.text method
                t: function t(_t) {
                    return this.$translate.text(_t);
                },
                setLang: function setLang(_lan){
                    return this.$translate.setLang(_lan);
                }
            }, vueLang.directives = {
                translate: function (el) {
                    if (!el.$translateKey) el.$translateKey = el.innerText;
                    var text = this.$translate.text(el.$translateKey);
                    el.innerText = text;
                }.bind(vm)
            }, vueLang));
            // Global method for loading locales
            Vue.locales = function (locales) {
                vm.$translate.setLocales(locales);
            };
        }
    };
    return VueTranslate;
});