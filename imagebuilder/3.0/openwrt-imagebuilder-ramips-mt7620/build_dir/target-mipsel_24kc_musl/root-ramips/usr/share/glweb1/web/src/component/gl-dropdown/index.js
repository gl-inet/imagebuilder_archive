"use strict";

define(["vue", "css!component/gl-dropdown/index.css"], function (Vue) {
    var vueComponent = Vue.extend({
        template: "\n    <transition name=\"dropdown\">\n    <ul id=\"gl-dropdown\" v-if=\"show\">\n            <li v-for=\"item in options\"  @click=\"onclick(item)\">{{item}}</li>\n        </ul>\n     </transition>\n   ",
        props: {
            options: {
                type: [Object, Array],
                default: []
            },
            isShow: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            show: function show() {
                return this.isShow;
            }
        },
        methods: {
            onclick: function onclick(item) {
                this.$emit("getOption", item);
            }
        }
    });
    return vueComponent;
});