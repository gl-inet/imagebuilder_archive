"use strict";

define(["vue", "css!component/gl-modal/index.css", "component/gl-btn/index"], function (Vue, css, gl_btn) {
    var vueComponent = Vue.extend({
        template: "\n            <div class=\"temple\">\n                <transition name=\"vodal-fade\">\n                <div v-show=\"show\" tabindex=\"-1\" :style=\"style\" :class=\"['vodal', className]\" @keyup.esc=\"onEsc\">\n                    <div class=\"vodal-mask\" v-if=\"mask\" @click=\"onClickMask\" :style=\"customMaskStyles\" />\n                    <transition :name=\"animationName\">\n                    <div class=\"vodal-dialog\" v-show=\"show\" >\n                        <slot></slot>\n                        <div class=\"vodal-dialogHead\">\n                        <span class=\"vodal-close\" v-if=\"closeButton\" @click=\"$emit('close')\" />\n                        <div class=\"modalHead\" :class=\"type\">\n                          <span class=\"fa\" :class=\"icon\"></span>  {{t(title ? title : titles)}}\n                        </div>\n                        </div>\n            \n                        <div class=\"vodal-dialogBody\">\n                                             <p class=\"modalBody\">{{t(msg)}}</p>\n        <p class=\"modalBody\">{{t(msgTwo)}}</p>\n         <p class=\"modalBody\">{{t(msgThree)}}</p>\n           </div>\n                \n                        <div class=\"vodal-dialogBtn\">\n                        <gl-btn class=\"vodal-cancel-btn\" @click=\"$emit('close')\" type=\"modify\">{{t(no)}}</gl-btn>\n                        <gl-btn class=\"vodal-confirm-btn\" @click=\"$emit('comfirm')\" type=\"purple\">{{t(yes)}}</gl-btn>\n                        </div>\n                    </div>\n                    </transition>\n                </div>\n                </transition>\n            </div>\n        ",
        name: "vodal",
        props: {
            yes: {
                type: String,
                default: "YES"
            },
            no: {
                type: String,
                default: "NO"
            },
            title: {
                type: String,
                default: ""
            },
            msg: {
                type: String,
                default: "message"
            },
            msgTwo: {
                type: String,
                default: ""
            },
            msgThree: {
                type: String,
                default: ""
            },
            show: {
                type: Boolean,
                required: true
            },
            duration: {
                type: Number,
                default: 500
            },
            animation: {
                type: String,
                default: "rotate"
            },
            mask: {
                type: Boolean,
                default: true
            },
            closeButton: {
                type: Boolean,
                default: true
            },
            closeOnEsc: {
                type: Boolean,
                default: false
            },
            closeOnClickMask: {
                type: Boolean,
                default: true
            },
            className: {
                type: String,
                default: ""
            },
            customStyles: {
                type: Object,
                default: function _default() {
                    return {};
                }
            },
            customMaskStyles: {
                type: Object,
                default: function _default() {
                    return {};
                }
            },
            type: {
                type: String,
                default: 'default'
            }
        },
        data: function data() {
            return {
                titles: "Hey",
                icon: 'fa-info-circle'
            };
        },
        watch: {
            show: function show(isShow) {
                var _this = this;
                isShow && this.$nextTick(function () {
                    _this.$el.focus();
                });
            },
            type: function type(val) {
                switch (val) {
                    case "success":
                        this.titles = "Well Done!";
                        this.icon = "fa-check-circle";
                        break;
                    case "error":
                        this.icon = "fa-times-circle";
                        this.titles = "Ooops!";
                        break;
                    case "warning":
                        this.titles = "Uh oh!";
                        this.icon = "fa-exclamation-circle";
                        break;
                    default:
                        this.titles = "Hey";
                        this.icon = "fa-info-circle";
                        break;
                }
            }
        },
        computed: {
            style: function style() {
                return {
                    animationDuration: this.duration + "ms"
                };
            },
            animationName: function animationName() {
                return 'vodal-' + this.animation;
            },
            dialogStyle: function dialogStyle() {
                return {
                    animationDuration: this.duration + "ms"
                };
            }
        },

        components: {
            "gl-btn": gl_btn
        },
        methods: {
            closeModal: function closeModal() {
                if (this.show) {
                    this.$emit("close");
                }
            },
            onEsc: function onEsc() {
                if (this.show && this.closeOnEsc) {
                    this.$emit("close");
                }
            },
            onClickMask: function onClickMask() {
                if (this.closeOnClickMask) {
                    this.$emit("close");
                }
            }
        }
    });
    return vueComponent;
});