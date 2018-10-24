"use strict";

define(["vue", "css!component/gl-label/index.css"], function (Vue) {
    var vueComponent = Vue.extend({
        template: "\n        <div class=\"temple\">\n            <label for=\"\" class=\"gl-label\">{{t(labelValue)}}</label>\n            <i class=\"glyphicon\" :class=\"labelIcon\" v-show=\"labelShow\"></i>\n        </div>\n        ",
        props: {
            labelValue: String, // 内容
            labelIcon: String, // icon类型
            labelShow: { // icon是否显示
                type: Boolean,
                default: true
            }
        }
    });
    return vueComponent;
});