"use strict";

define(["vue"], function (Vue) {
    var vueComponent = Vue.extend({
        template: "\n        <div class=\"modal-head\" :class=\"type\" v-show=\"title\">\n        <span v-show=\"iconShow\" class=\"fa\" :class=\"{'fa-exclamation-circle': type=='error'}\"></span>\n        <span>{{t(title)}}</span>\n        </div>\n        ",
        data: function data() {
            return {};
        },
        props: {
            title: {
                type: String,
                default: ""
            },
            type: {
                type: String,
                default: ""
            }
        },
        computed: {
            iconShow: function iconShow() {
                var iconShow = false;
                if (this.type == "default" || !this.type) {
                    return iconShow;
                } else {
                    iconShow = true;
                    return iconShow;
                }
            }
        }
    });
    return vueComponent;
});