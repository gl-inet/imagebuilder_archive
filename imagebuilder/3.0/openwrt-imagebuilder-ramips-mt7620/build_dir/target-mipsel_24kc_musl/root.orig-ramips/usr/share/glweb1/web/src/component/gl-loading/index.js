"use strict";

define(["vue", "css!component/gl-loading/index.css"], function (Vue) {
    var vueComponent = Vue.extend({
        template: "\n        <div class=\"gl-loading\" :class=\"className\" :style=\"{position:position?'fixed':''}\">\n            <div class=\"overlay\" v-if=\"maskLayer\"></div>\n            <div class=\"gl-loading-content\">\n                <span v-for=\"item in nodeNum\"></span>\n                <slot/>\n            </div>\n        </div>\n        ",
        name: 'Loading',
        data: function data() {
            return {
                position: false
            };
        },

        props: {
            maskLayer: {
                type: Boolean,
                default: false
            },
            nodeNum: {
                type: Number,
                default: 0
            },
            className: String
        },
        components: {},
        mounted: function mounted() {},

        methods: {
            //提供给this.$loading的方法
        },
        computed: {},
        filters: {}
    });
    return vueComponent;
});