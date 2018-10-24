"use strict";

define(["css!component/modal/index.css", "vue", "component/modal/head"], function (css, Vue, head) {
    var vueComponent = Vue.extend({
        template: "\n        <transition :name=\"name\" >\n            <div id=\"gl-modal\" v-show=\"modalStatus\" >\n                <div class=\"gl-modal\" :class=\"size\">\n                    <gl-modal-head :title=\"title\" :type=\"type\"></gl-modal-head>\n                    <slot></slot>\n                </div>\n            </div>\n        </transition>\n        ",
        data: function data() {
            return {
                name: ""
            };
        },
        components: {
            "gl-modal-head": head
        },
        props: {
            title: {
                type: String,
                default: ""
            },
            animation: {
                type: Boolean,
                default: false
            },
            modalStatus: {
                type: Boolean,
                default: false
            },
            // size: mofal标题类型
            type: {
                type: String,
                default: "default"
            },
            // size: mofal大小
            size: {
                type: String,
                default: ""
            }
        },
        mounted: function mounted() {
            if (this.animation) {
                this.name = "scal";
            } else {
                this.name = "";
            }
        }
    });
    return vueComponent;
});