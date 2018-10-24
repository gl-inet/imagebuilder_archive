"use strict";

define(["component/gl-btn/btn", "vue"], function (Button, Vue) {
    var vueComponent = Vue.extend({
        name: "type-button",
        props: {
            type: {
                validator: function validator(typeStr) {
                    if (typeof typeStr === "string") {
                        switch (typeStr) {
                            case "default":
                            case "primary":
                            case "info":
                            case "success":
                            case "warning":
                            case "danger":
                            case "message":
                                return true;
                            default:
                                return false;
                        }
                    } else {
                        return true;
                    }
                }
            }
        },
        render: function render(createElement) {
            return createElement(Button, {
                class: [this.type],
                on: {
                    click: this.click
                }
            }, this.$slots.default);
        },

        methods: {
            click: function click() {

                this.$emit("click");
            }
        },
        components: {}
    });
    return vueComponent;
});