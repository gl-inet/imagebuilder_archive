"use strict";

define(["vue", "css!component/gl-input/index.css"], function (Vue) {
    var vueComponent = Vue.extend({
        template: "      \n        <span class=\"gl-input\" :class=\"disabled ? '' : checkClass\">\n     <slot></slot>   \n   <input :style=\"classType\" :maxlength=\"maxlength\" ref=\"inputValue\" :type=\"inputType\"  :placeholder=\"t(placeholder)\"  :disabled=\"disabled\" @input=\"provideContent($event)\" @blur=\"loseFocus($event)\" @focus=\"getFocus($event)\" :value=\"value\" autocomplete=\"new-password\" :class=\"{'error': checkClass=='error'}\"/>\n            <span v-show=\"inputShow\" @click=\"changeState\">\n                <i :class=\"inputIcon ? 'fa-eye' : 'fa fa-eye-slash'\" class=\"fa\"></i>\n            </span>\n        </span>\n        ",
        data: function data() {
            return {
                inputIcon: false, // change Icon class
                inputType: "text", // change input class
                dnsReg: /(?:(^|\.)(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){4}$/,
                hexDigits: "0123456789ABCDEF",
                checkSta: "",
                checkClass: null,
                checkStatus: false,
                timer: null,
                regexp: /^[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}$/
            };
        },
        model: {
            prop: "value",
            event: "postValue"
        },
        props: {
            check: {
                type: String,
                default: ""
            },
            maxlength: Number,
            error: {
                type: Boolean,
                default: false
            },
            inputShow: {
                type: Boolean,
                default: false
            },
            type: {
                type: String
            },
            placeholder: {
                type: String,
                default: ""
            },
            value: {
                type: String
            },
            disabled: {
                type: Boolean,
                default: false
            },
            web: {
                type: Boolean,
                default: false
            }
        },
        mounted: function mounted() {
            // 和父组件双向绑定时，type值会一直传入更新，所以定义变量接收不受影响
            this.inputType = this.type || "text";
            var compatibilityIE = 'placeholder' in document.createElement('input');
            if (!compatibilityIE) {
                this.$refs.inputValue.value = this.t(this.placeholder);
            }
        },
        computed: {
            classType: function classType() {
                if (this.error) {
                    return {
                        backgroundColor: "#f2dede"
                    };
                }
            }
        },
        watch: {
            value: function value() {
                if (this.check == "ip" && this.check) {
                    if (!this.value) {
                        this.checkSta = true;
                    } else {
                        this.checkSta = this.dnsReg.test(this.value);
                    }
                } else if (this.check == "psw" && this.check) {
                    if (!this.value) {
                        this.checkSta = true;
                    } else {
                        this.checkSta = this.checkPsw(this.value);
                    }
                } else if (this.check == "mac" && this.check) {
                    if (!this.value) {
                        this.checkSta = true;
                    } else {
                        var value = this.value.toUpperCase();
                        this.checkSta = this.regexp.test(value);
                    }
                }
            },
            checkSta: function checkSta(val) {
                if (this.check == "psw" && this.check) {
                    if (val < 0) {
                        this.checkClass = "error";
                        this.checkStatus = false;
                    } else if (val == 1) {
                        this.checkClass = "";
                        this.checkStatus = false;
                    } else if (val == 40) {
                        this.checkClass = "weak";
                        this.checkStatus = true;
                    } else if (val == 60) {
                        this.checkClass = "medium";
                        this.checkStatus = true;
                    } else if (val == 80) {
                        this.checkStatus = true;
                        this.checkClass = "strong";
                    } else if (val == 100) {
                        this.checkStatus = true;
                        this.checkClass = "superstrong";
                    }
                } else if (this.check == "ip") {
                    if (!val) {
                        this.checkClass = "error";
                        this.checkStatus = false;
                    } else {
                        this.checkClass = "";
                        this.checkStatus = true;
                    }
                } else if (this.check == "mac") {
                    if (!val) {
                        this.checkClass = "error";
                        this.checkStatus = false;
                    } else {
                        this.checkClass = "";
                        this.checkStatus = true;
                    }
                }
            }
        },
        methods: {
            provideContent: function provideContent(event) {
                var that = this;
                clearTimeout(this.timer);
                this.$emit('postValue', event.target.value);
                if (this.check) {
                    this.timer = setTimeout(function () {
                        that.$emit("checkStatus", that.checkStatus);
                    }, 50);
                }
            },
            loseFocus: function loseFocus(event) {
                this.$emit('blurValue', event.target.value);
            },
            getFocus: function getFocus(event) {
                this.$emit('focusValue', 'focus');
            },
            // change Icon class
            changeState: function changeState() {
                this.inputIcon = !this.inputIcon;
                this.inputType == "text" ? this.inputType = "password" : this.inputType = "text";
            },
            checkPsw: function checkPsw(newVal) {
                var secureTotal = 0,
                    chars = 0,
                    capitals = 0,
                    lowers = 0,
                    special = 0,
                    securePercentage = 0,
                    upperCase = new RegExp("[A-Z]"),
                    lowerCase = new RegExp("[a-z]"),
                    numbers = new RegExp("[0-9]"),
                    specialchars = new RegExp("([!,%,&,@,#,$,^,*,?,_,~])");
                if (this.web) {
                    if (newVal.length >= 5) {
                        chars = 1;
                    } else {
                        chars = -4;
                    }
                } else {
                    if (newVal.length >= 8) {
                        chars = 1;
                    } else {
                        chars = -4;
                    }
                }
                if (newVal.match(upperCase)) {
                    capitals = 1;
                } else {
                    capitals = 0;
                }
                if (newVal.match(lowerCase)) {
                    lowers = 1;
                } else {
                    lowers = 0;
                }
                if (newVal.match(numbers)) {
                    numbers = 1;
                } else {
                    numbers = 0;
                }
                if (newVal.match(specialchars)) {
                    special = 1;
                } else {
                    special = 0;
                }
                secureTotal = chars + capitals + numbers + special + lowers;
                securePercentage = secureTotal / 5 * 100;
                if (escape(newVal).indexOf("%u") != -1) {
                    securePercentage = -1;
                }
                return securePercentage;
            }
        }
    });
    return vueComponent;
});