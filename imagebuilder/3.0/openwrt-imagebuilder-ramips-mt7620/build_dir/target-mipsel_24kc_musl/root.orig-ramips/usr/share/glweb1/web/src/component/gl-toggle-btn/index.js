"use strict";

define(["vue", "css!component/gl-toggle-btn/index.css"], function (Vue) {
    var vueComponent = Vue.extend({
        name: "vue-ios7-switch",
        template: "\n        <div class=\"temple\">\n            <label :data-theme=\"theme\" :style=\"{ 'font-size':size }\":class=\"['vue-ios7-switch',cssClass]\">\n                <input type=\"checkbox\" :disabled=\"disabled\" v-model=\"checked\" @click=\"clickItem\" @change=\"changeItem\">\n                <span><i :class=\"{'disabled': disabled}\"><b>{{showon ? message : ''}}</b></i></span>\n            </label>\n        </div>\n        ",
        model: {
            prop: "checked",
            event: "change"
        },
        props: {
            "cssClass": String,
            "checked": {
                type: Boolean,
                default: false
            },
            "showon": {
                type: Boolean,
                default: false
            },
            "disabled": {
                type: Boolean,
                default: false
            },
            "size": String,
            "iseconds": {
                type: Number,
                default: 10
            },
            "timer": {
                type: Boolean,
                default: false
            },
            "showTimer": {
                type: Boolean,
                default: false
            },
            "theme": {
                type: String,
                default: "green"
            },
            "waitingMessage": {
                type: String,
                required: false,
                default: "{{seconds}}"
            }
        },
        data: function data() {
            return {
                seconds: this.iseconds,
                message: this.checked ? 'ON' : "OFF",
                intv: null
            };
        },
        methods: {
            clickItem: function clickItem() {
                var _this = this;
                _this.disabled = true;
                if (this.timer) {
                    this.intv = window.setInterval(function () {
                        if (_this.seconds-- > 0) {
                            if (_this.showTimer) {
                                _this.message = _this.waitingMessage.replace(/{{ *seconds *}}/g, _this.seconds);
                            }
                        } else {
                            window.clearInterval(_this.intv);
                            _this.disabled = false;
                            _this.seconds = _this.iseconds;
                            if (_this.showon) {
                                _this.checked ? _this.message = 'ON' : _this.message = "OFF";
                            } else {
                                _this.message = "";
                            }
                        }
                    }, 1000);
                } else {
                    _this.disabled = false;
                    if (_this.showon) {
                        _this.checked ? _this.message = 'ON' : _this.message = "OFF";
                    } else {
                        _this.message = "";
                    }
                }
                this.$emit("onclick", _this.checked);
            },
            changeItem: function changeItem() {
                this.$emit("change", this.checked);
            }
        }
    });
    return vueComponent;
});