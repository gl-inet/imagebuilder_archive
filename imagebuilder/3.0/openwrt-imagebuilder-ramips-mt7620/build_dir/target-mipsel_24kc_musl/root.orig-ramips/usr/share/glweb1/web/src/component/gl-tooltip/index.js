"use strict";

define(["vue", "css!component/gl-tooltip/index.css"], function (Vue) {
    var vueComponent = Vue.extend({
        template: "\n        <div class=\"gl-tooltip-box\" @mouseenter=\"_mouseEnter\" @touchstart=\"_mouseEnter\" @touchend=\"_mouseLeave\" @mouseleave=\"_mouseLeave\" ref=\"toolDiv\" >\n            <slot></slot>\n        </div>\n        ",
        data: function data() {
            return {
                clearTime: '',
                tooltip: ''
            };
        },

        props: {
            content: String, //message content
            className: String,
            direction: { // 出现位置
                type: String,
                default: 'top'
            },
            maxWidth: {
                type: Number, //限制宽度
                default: 500
            },
            delay: {
                type: Number, //鼠标移开后延时移除时间，主要能够让鼠标移动提示文字上，单位毫秒
                default: 30
            },
            always: { //默认不一直显示
                type: Boolean,
                default: false
            },
            toolShow: { //  默认显示tooltip
                type: Boolean,
                default: true
            }
        },
        components: {},
        watch: {
            content: function content() {
                this._mouseEnter();
            }
        },
        methods: {
            _mouseEnter: function _mouseEnter() {
                if (!this.toolShow || !this.content) {
                    return;
                }
                if (!this.always) {
                    //如果存在先移除，避免重复创建
                    if (this.tooltip) {
                        clearTimeout(this.clearTime);
                        document.body.removeChild(this.tooltip);
                        this.tooltip = '';
                    }
                    this._createElement();
                    this.tooltip.addEventListener('mouseenter', this._tooltipMouseEnter, false);
                    this.tooltip.addEventListener('mouseleave', this._tooltipMouseLeave, false);
                }
            },
            _createElement: function _createElement() {
                if (!this.toolShow || !this.content) {
                    return;
                }
                //创建相关节点
                var className = this.className ? " " + this.className : "";
                //body下创建节点
                this.tooltip = document.createElement('div');
                this.tooltip.className = 'gl-tooltip ' + this.direction + className;
                this.tooltip.style.maxWidth = parseInt(this.maxWidth) + 'px';
                // void === undefined
                var content = void 0;
                if (this.content) {
                    content = this.content;
                } else if (this.$slots.content) {
                    //这个内容还真不好取，还要先在template里显示出来才取得到，不知有没其他办法
                    content = this.$slots.content[0].elm.innerHTML;
                } else {
                    return false;
                }
                this.tooltip.innerHTML = this.t(content);

                document.body.appendChild(this.tooltip);
                //取当前标签偏移位置

                var offset = this.getOffset(this.$refs.toolDiv);
                var windowWidth = this.getWidth(window);
                var height = this.tooltip.offsetHeight;
                var style = this.tooltip.style;
                var space = 8; //当前标签与提示语之间的距离
                switch (this.direction) {
                    case 'top-left':
                        style.left = offset.left + 'px';
                        style.top = offset.top - this.tooltip.offsetHeight - space + 'px';
                        break;
                    case 'top':
                        //先让提示左边和当前标签中间对齐（偏移位置+标签宽的一半），再向左移50%
                        style.transform = 'translateX(-50%)';
                        style.left = this._translate(offset.left + offset.width / 2) + 'px';
                        style.top = offset.top - this.tooltip.offsetHeight - space + 'px';
                        break;
                    case 'top-right':
                        style.right = windowWidth - (offset.left + offset.width) + 'px';
                        style.top = offset.top - this.tooltip.offsetHeight - space + 'px';
                        break;
                    case 'left':
                        //top先让提示语顶部跟标签中间对齐，再上移50%
                        style.right = windowWidth - (offset.left - space) + 'px';
                        style.top = this._translate(offset.top + offset.height / 2) + 'px';
                        style.transform = 'translateY(-50%)';
                        break;
                    case 'right':
                        //top和左边一样
                        style.left = offset.left + offset.width + space + 'px';
                        style.top = this._translate(offset.top + offset.height / 2) + 'px';
                        style.transform = 'translateY(-50%)';
                        break;
                    case 'bottom-left':
                        style.left = offset.left + 'px';
                        style.top = offset.top + offset.height + space + 'px';
                        break;
                    case 'bottom':
                        style.left = this._translate(offset.left + offset.width / 2) + 'px';
                        style.transform = 'translateX(-50%)';
                        style.top = offset.top + offset.height + space + 'px';
                        break;
                    case 'bottom-right':
                        style.right = windowWidth - (offset.left + offset.width) + 'px';
                        //style.transform = 'translateX(-100%)';
                        style.top = offset.top + offset.height + space + 'px';
                        break;
                }
            },
            _mouseLeave: function _mouseLeave() {
                if (!this.toolShow) {
                    return;
                }
                if (!this.always) {
                    this._removeChild();
                }
            },
            _tooltipMouseEnter: function _tooltipMouseEnter() {
                //鼠标移到提示文字上面时，清除延时时间
                clearTimeout(this.clearTime);
            },
            _tooltipMouseLeave: function _tooltipMouseLeave() {
                //鼠标从提示文字上移开时
                this._removeChild();
            },
            _removeChild: function _removeChild() {
                var _this = this;
                this.clearTime = setTimeout(function () {
                    if (_this.tooltip) {
                        document.body.removeChild(_this.tooltip);
                        _this.tooltip = '';
                    }
                }, this.delay);
            },
            _translate: function _translate(px) {
                //通过transform平移标签时，如平移的单位为非偶数，会出现字体模糊，这里强制取偶
                if (parseInt(px) % 2 == 0) {
                    //偶数
                    return parseInt(px);
                } else {
                    return parseInt(px) + 1;
                }
            },
            getWidth: function getWidth(elements) {
                //处理两个特殊 window document
                if (elements == window) {
                    return document.documentElement.clientWidth || document.body.clientWidth;
                } else if (elements == document) {
                    return document.documentElement.scrollWidth || document.body.scrollWidth;
                } else if ((typeof elements === "undefined" ? "undefined" : _typeof(elements)) == "object") {
                    return elements.offsetWidth;
                } else if (typeof elements == "string") {
                    return document.getElementById(elements).offsetWidth;
                }
            },
            getOffset: function getOffset(el) {
                //返回元素偏移位置，同时返回宽高
                var componentRect = el.getBoundingClientRect();
                var top = componentRect.top + (window.pageYOffset || document.documentElement.scrollTop) - (document.documentElement.clientTop || 0);
                var left = componentRect.left + (window.pageXOffset || document.documentElement.scrollLeft) - (document.documentElement.clientLeft || 0);
                var width = el.offsetWidth;
                var height = el.offsetHeight;
                return { left: left, top: top, width: width, height: height };
            }
        },
        mounted: function mounted() {
            if (this.always) {
                //一直显示的
                this._createElement();
            }
        }
    });
    return vueComponent;
});