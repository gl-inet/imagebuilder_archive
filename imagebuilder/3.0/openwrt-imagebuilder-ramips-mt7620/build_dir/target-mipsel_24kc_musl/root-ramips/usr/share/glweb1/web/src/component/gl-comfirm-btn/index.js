"use strict";

define(["vue", "component/gl-btn/index", "css!component/gl-comfirm-btn/index.css"], function (Vue, gl_btn) {
    var vueComponent = Vue.extend({
        name: "vue-confirmation-button",
        template: "\n        <div class=\"temple\">\n            <gl-btn :type=\"css\" :disabled='stepsComplete' v-on:click='incrementStep()'> {{ t(currentMessage) }}</gl-btn>\n        </div>\n        ",
        props: {
            messages: Array,
            css: {
                type: String,
                default: "default"
            }
        },
        components: {
            "gl-btn": gl_btn
        },
        data: function data() {
            return {
                defaultSteps: ["Click to confirm", "Are you sure?", "✔"],
                currentStep: 0
            };
        },

        computed: {
            messageList: function messageList() {
                return this.messages ? this.messages : this.defaultSteps;
            },
            currentMessage: function currentMessage() {
                return this.messageList[this.currentStep];
            },
            lastMessageIndex: function lastMessageIndex() {
                return this.messageList.length - 1;
            },
            stepsComplete: function stepsComplete() {
                var status = this.currentStep === this.lastMessageIndex;
                var that = this;
                if (status) {
                    setTimeout(function () {
                        that.reset();
                    }, 500);
                }
                return status;
            }
        },
        methods: {
            incrementStep: function incrementStep() {
                var that = this;
                this.currentStep++;
                // console.log(this.currentStep, this.messageList.length);
                if (this.currentStep + 2 == this.messageList.length) {
                    setTimeout(function () {
                        that.reset();
                    }, 3000);
                }
                if (this.stepsComplete) {
                    this.$emit("confirmation-success");
                } else {
                    this.$emit("confirmation-incremented", this.currentStep);
                }
            },
            reset: function reset() {
                this.currentStep = 0;
                this.$emit("confirmation-reset");
            }
        }
    });
    return vueComponent;
});