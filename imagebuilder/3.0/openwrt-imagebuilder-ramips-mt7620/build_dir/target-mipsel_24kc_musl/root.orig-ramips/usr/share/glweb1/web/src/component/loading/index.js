"use strict";

define(["vue", "css!component/loading/index.css"], function (Vue) {
    var vueComponent = Vue.extend({
        template: "\n        <div class=\"loading\">\n            <div class=\"v-spinner\" v-show=\"loading\">\n                <div class=\"v-scale v-scale1\" v-bind:style=\"[spinnerStyle,spinnerDelay1]\"></div>\n                <div class=\"v-scale v-scale2\" v-bind:style=\"[spinnerStyle,spinnerDelay2]\"></div>\n                <div class=\"v-scale v-scale3\" v-bind:style=\"[spinnerStyle,spinnerDelay3]\"></div>\n                <div class=\"v-scale v-scale4\" v-bind:style=\"[spinnerStyle,spinnerDelay4]\"></div>\n                <div class=\"v-scale v-scale5\" v-bind:style=\"[spinnerStyle,spinnerDelay5]\"></div>\n            </div>\n        </div>\n        ",
        props: {
            loading: {
                type: Boolean,
                default: true
            },
            color: {
                type: String,
                default: "#5dc596"
            },
            height: {
                type: String,
                default: "35px"
            },
            width: {
                type: String,
                default: "4px"
            },
            margin: {
                type: String,
                default: "2px"
            },
            radius: {
                type: String,
                default: "2px"
            }
        },
        data: function data() {
            return {
                spinnerStyle: {
                    backgroundColor: this.color,
                    height: this.height,
                    width: this.width,
                    margin: this.margin,
                    borderRadius: this.radius,
                    display: "inline-block",
                    animationName: "v-scaleStretchDelay",
                    animationDuration: "1s",
                    animationIterationCount: "infinite",
                    animationTimingFunction: "cubic-bezier(.2,.68,.18,1.08)",
                    animationFillMode: "both"
                },
                spinnerDelay1: {
                    animationDelay: "0.1s"
                },
                spinnerDelay2: {
                    animationDelay: "0.2s"
                },
                spinnerDelay3: {
                    animationDelay: "0.3s"
                },
                spinnerDelay4: {
                    animationDelay: "0.4s"
                },
                spinnerDelay5: {
                    animationDelay: "0.5s"
                }
            };
        }
    });
    return vueComponent;
});