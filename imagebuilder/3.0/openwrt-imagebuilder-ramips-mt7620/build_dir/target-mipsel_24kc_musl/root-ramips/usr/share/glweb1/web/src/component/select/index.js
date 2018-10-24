"use strict";

define(["vue", "text!component/select/index.html", "css!component/select/index.css", "component/gl-input/index"], function (Vue, stpl, css, gl_input) {
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
            optionName: {
                type: String,
                default: ""
            },
            iconClass: {
                type: String,
                default: ""
            },
            // 当前选中项是否可以编辑
            input: {
                type: Boolean,
                default: false
            },
            check: {
                type: String,
                default: ''
            },
            wifiIcon: {
                type: Boolean,
                default: false
            },
            long: {
                type: Boolean,
                default: false
            },
            size: {},
            checkLang: {
                type: Boolean,
                default: false
            }
        },
        mounted: function mounted() {
            var that = this;
            document.addEventListener('click', that._showHide);
            setTimeout(function () {
                that._setFirstText();
            }, 250);
        },
        methods: {
            getValue: function getValue(data) {
                this.$emit('postValue', data);
            },
            blurValue:function blurValue(data){
                this.$emit('blurValue', data);
            },
            _setFirstText: function _setFirstText() {
                var that = this;
                if (!this.option || this.option.length == 0) {
                    this.defaultText = "";
                    return;
                }
                if (this.value) {
                    this.defaultText = this.value;
                    return;
                }
                if (this.optionName) {
                    this.defaultText = this.optionArray[0][this.optionName];
                    this.defaultIndex = 0;
                    return;
                }
                this.defaultText = this.optionArray[0];
                this.defaultIndex = 0;
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
                    this.defaultText = item[this.optionName];
                    this.$emit('input', item[this.optionName]);
                    this.$emit('change', item);
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
                }return "weak";
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
                if (newval) {
                    this.defaultText = newval;
                }
            },
            option: function option(newval) {
                this._setFirstText();
            }
        }
    });
    return vueComponent;
});