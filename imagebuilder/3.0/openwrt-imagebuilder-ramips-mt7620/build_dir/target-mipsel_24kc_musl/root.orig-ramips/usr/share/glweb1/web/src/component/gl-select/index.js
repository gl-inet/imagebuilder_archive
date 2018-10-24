"use strict";

define(["vue", "text!component/gl-select/index.html", "css!component/gl-select/index.css", "component/gl-input/index"], function (Vue, stpl, css, gl_input) {
    var vueComponent = Vue.extend({
        name: 'select',
        template: stpl,
        data: function data() {
            return {
                show: false,
                showPlaceholder: this.placeholder ? true : false,
                liHeight: '', //li高度
                defaultText: "",
                defaultIndex: -1,
                lockClass: "",
                signalClass: ""
            };
        },
        components: {
            "gl-input": gl_input
        },
        props: {
            value: String, //通过v-model传进来
            showNum: String, //显示下拉个数，超出显示滚动条
            option: Array, //下拉选顶
            optionUrl: String, //请求数据地址，同时传了option，请求成功后会更新option
            onChange: Function, //下拉选择后回调
            disabled: { //是否禁用
                type: Boolean,
                default: false
            },
            checkLang: { //是否翻译
                type: Boolean,
                default: false
            },
            input: { // 当前选中项是否可以编辑
                type: Boolean,
                default: false
            },
            optionName: {
                type: String,
                default: ""
            },
            iconClass: {
                type: String,
                default: ""
            },
            wifiIcon: {
                type: Boolean,
                default: false
            },
            stainfo: {
                type: String,
                default: ""
            },

            check: {
                type: String,
                default: ''
            },
            long: {
                type: Boolean,
                default: false
            },
            size: {},
            vpn: {
                type: Boolean,
                default: false
            },
            searchip: {
                type: Boolean,
                default: false
            }
        },
        mounted: function mounted() {
            var that = this;
            document.addEventListener('click', that._showHide);
            if (this.option.length != 0) {
                this.defaultIndex = -1;
                that._setFirstText();
            }
            if (this.input) {
                that._setFirstText();
            }
        },
        methods: {
            getValue: function getValue(data) {
                this.$emit('postValue', data);
            },
            blurValue: function blurValue() {
                this.$emit('blurValue', data);
            },
            _setFirstText: function _setFirstText() {
                if (this.searchip) {
                    this.defaultText = this.value;
                    this.$emit("change", this.defaultText);
                    this.$emit('input', this.defaultText);
                    return
                }
                if (this.vpn) {
                    this.getVpn();
                }
                if (!this.option || this.option.length == 0) {
                    if (this.input && this.value) {
                        this.defaultText = this.value;
                    } else {
                        this.defaultText = "";
                    }
                    this.$emit('input', this.defaultText);
                    return;
                }
                if (this.value) {
                    this.defaultText = this.value;
                    this.$emit('change', this.defaultText);
                    return;
                }
                if (this.optionName) {
                    this.defaultText = this.optionArray[0][this.optionName];
                    this.$emit('input', this.defaultText);
                    this.$emit("change", this.optionArray[0]);
                    this.$emit("wifichange", this.optionArray[0]);
                    return;
                }

                this.defaultText = this.optionArray[0];
                this.$emit("change", this.defaultText);
                this.$emit('input', this.defaultText);
            },
            _itemClick: function _itemClick(item, e, index) {
                var that = this;
                if (this.wifiIcon) {
                    if (this.$refs.li[index].className == "disabled") {
                        return;
                    }
                }
                if (item.disabled) {
                    return;
                }
                // 纯数组 和有 属性的对象 改变展示框值的方式不一样
                if (!this.optionName) {
                    this.defaultText = item;
                    this.$emit('input', item);
                    this.$emit('change', item);
                    setTimeout(function () {
                        that.$emit('getval', item);
                    }, 10);
                } else {

                    that.$emit('checkId', item.id); // 业务层 vpnclient 和组件无关
                    this.defaultText = item[this.optionName];
                    this.$emit('input', item[this.optionName]);
                    this.$emit('change', item);
                    this.$emit('wifichange', item);
                    setTimeout(function () {
                        that.$emit('getval', item[that.optionName]);
                    }, 10);
                }
                this.defaultIndex = index;
                //利用 $emit 触发 input 事件
                this.show = false;
                this.onChange ? this.onChange(item) : "";
                this.showPlaceholder = false;
                e.stopPropagation();
            },
            // 显示隐藏
            _showHide: function _showHide(e) {
                if (this.optionArray == 0) {
                    return;
                }
                if (this.$el.contains(e.target)) {
                    // 禁用不操作 否则toggle
                    this.disabled == false ? this.show = !this.show : "";
                    // 获取li的高度
                    this.$nextTick(function () {
                        this.liHeight = this.getHeight(this.$refs.li[0]) ? this.getHeight(this.$refs.li[0]) : this.getHeight(this.$refs.li);
                    });
                } else {
                    this.show = false;
                }
            },
            getHeight: function getHeight(elements) {
                //处理两个特殊的高 window document
                if (elements == window) {
                    return document.documentElement.clientHeight || document.body.clientHeight;
                } else if (elements == document) {
                    return document.documentElement.scrollHeight || document.body.scrollHeight;
                } else if (this.checktype(elements) == "HTMLLIElement") {
                    return elements.offsetHeight;
                } else if (typeof elements == "string") {
                    return document.getElementById(elements).height;
                }
            },
            // 对于判断数据类型的兼容处理
            checktype: function checktype(val) {
                return Object.prototype.toString.call(val).split(" ")[1].split("]")[0];
            },
            getClass: function getClass(iSignal) {
                if (iSignal > -50) {
                    return "full";
                } else if (iSignal > -75 && iSignal <= -50) {
                    return "strong";
                } else if (iSignal > -90 && iSignal <= -75) {
                    return "medium";
                }
                return "weak";
            },
            // vpn client 业务层
            getVpn: function getVpn() {
                if (this.optionArray.length != 0) {
                    if (this.value) {
                        for (var i = 0; i < this.optionArray.length; i++) {
                            var description = this.optionArray[i].description;
                            if (this.value == description) {
                                this.$emit('checkId', this.optionArray[i].id); // 业务层 vpnclient 和组件无关
                                break;
                            }
                        }
                    } else {
                        this.$emit('checkId', this.optionArray[0].id); // 业务层 vpnclient 和组件无关
                    }
                }
            }
        },
        computed: {
            showLiNum: function showLiNum() {
                if (this.showNum && this.optionArray.length > this.showNum) {
                    return {
                        height: this.liHeight * this.showNum + 'px'
                    };
                }
            },
            optionArray: function optionArray() {
                return this.option;
            }
        },
        watch: {
            value: function value(newval) {
                if (this.searchip) {
                    this.defaultText = newval;
                } else {
                    if (newval) {
                        this.defaultText = newval;
                    }
                }
            },
            optionArray: function optionArray(newval) {
                if (newval.length != 0) {
                    this.defaultIndex = -1;
                    this._setFirstText();
                } else {
                    this.defaultText = '';
                }
            }
        }
    });
    return vueComponent;
});