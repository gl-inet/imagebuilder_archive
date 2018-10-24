"use strict";

define(["vue", "css!component/dropdown/index.css", "text!component/dropdown/index.html"], function (Vue, css, stpl) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                selectedOption: '',
                showMenu: false
            };
        },
        props: {
            options: {
                type: [Array, Object]
            },
            selected: {
                type: [Array, Object]
            },
            optionName: {
                type: String,
                default: ''
            },
            disabled: {
                type: Boolean,
                default: false
            }
        },
        mounted: function mounted() {
            this.selectedOption = this.selected;
            document.addEventListener('click', this.hidePanel, false);
        },
        destroyed: function destroyed() {},
        methods: {
            updateOption: function updateOption(option) {
                this.showMenu = false;
                this.$emit('change', option);
            },
            toggleMenu: function toggleMenu() {
                if (this.disabled) return;
                this.showMenu = !this.showMenu;
            },
            hidePanel: function hidePanel(e) {
                if (!this.$el.contains(e.target)) {
                    //点击除弹出层外的空白区域
                    this.showMenu = false;
                }
            }
        }
    });
    return vueComponent;
});