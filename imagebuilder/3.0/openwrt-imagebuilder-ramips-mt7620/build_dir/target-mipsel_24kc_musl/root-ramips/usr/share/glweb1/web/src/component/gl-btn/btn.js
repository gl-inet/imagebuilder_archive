"use strict";

define(["vue", "css!component/gl-btn/index.css"], function (Vue) {
    var vueComponent = Vue.extend({
        name: "base-button",
        props: [],
        render: function render(createElement) {
            return createElement("button", {
                class: ["button", "ripple"],
                on: {
                    click: this.click
                }
            }, this.$slots.default);
        },
        data: function data() {
            return {
                "name": "base"
            };
        },

        methods: {
            click: function click() {
                this.$emit("click");
            }
        }
    });
    return vueComponent;
});