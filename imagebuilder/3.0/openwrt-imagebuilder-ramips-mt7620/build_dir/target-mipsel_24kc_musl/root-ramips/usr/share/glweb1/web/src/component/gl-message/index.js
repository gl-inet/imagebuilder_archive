"use strict";

define(["css!component/gl-message/index.css", "vue"], function (css, Vue) {
    var instance;
    var instances = [];
    var seed = 1;
    var vueComponent = Vue.extend({
        template: "\n        <transition name=\"t-message-fade\">\n            <div class=\"t-message text-center\" :class=\"msgClass\" v-if=\"visible\">\n                <span class=\"t-icon\" :class=\"iconFont\" v-if=\"true\"></span>\n                <span>{{t(msg)}}</span>\n                <span v-show=\"isShow\" class=\"closeMessage\" @click=\"closeMessage\">\xD7</span>\n            </div>\n        </transition>\n        ",
        data: function data() {
            return {
                isShow: false,
                type: "string",
                msgClass: "",
                iconFont: "",
                visible: false,
                msg: "", // 提示内容
                duration: null, // 停留时间
                node: "" // 清除提示判断条件
            };
        },
        methods: {
            closeMessage: function closeMessage() {
                $("body").find(".t-message").remove();
            }
        }
    });

    // 执行隐藏
    var startHide = function startHide(id, duration, cb) {
        if (duration > 0) {
            var timer = setTimeout(function () {
                Message.close(id, typeof cb === "function" && cb);
                clearTimeout(timer);
            }, duration);
        }
    };

    var Message = function Message() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        // 清除上一条提示
        if (instances.node) {
            Message.close(instances.node);
            instances.node = null;
        }
        // 赋值参数
        if (typeof options === "string") {
            options = {
                msg: options
            };
        }
        var id = "t_message_" + seed++;
        instances.node = id;
        instance = new vueComponent({
            data: options
        });
        // 没有任何code或者值传入，不显示错误
        if (instance.$lang.errorcode[instance.msg]) {
            instance.msg = instance.$lang.errorcode[instance.msg];
        }
        if (instance.msg == '' || instance.msg == undefined) {
            return;
        }
        switch (instance.type) {
            case "success":
                instance.iconFont = "fa fa-check";
                instance.msgClass = "msgSuccess";
                instance.duration = instance.duration ? instance.duration : 3000;
                instance.msg = instance.msg ? instance.msg : "Your new settings have been updated successfully.";
                break;
            case "error":
                instance.iconFont = "fa fa-times";
                instance.msgClass = "msgError";
                instance.duration = instance.duration ? instance.duration : 3000;
                instance.msg = instance.msg ? instance.msg : "Your new settings haven't been updated successfully. Please try again!";
                break;
            case "warning":
                instance.iconFont = "fa fa-exclamation-triangle";
                instance.msgClass = "msgWarning";
                instance.duration = instance.duration ? instance.duration : 3000;
                instance.msg = instance.msg ? instance.msg : "Your operation is in progress.";
                break;
            default:
                // fa fa-circle-o-notch glyphicon-spin-animate
                // fa fa-circle-o-notch fa-spin 
                // glyphicon glyphicon-refresh
                instance.iconFont = "fa fa-circle-o-notch glyphicon-spin-animate";
                instance.duration = instance.duration ? instance.duration : 5000;
                instance.msg = instance.msg ? instance.msg : "Your operation is in progress.";
        }

        instance.id = id;
        var component = instance.$mount();
        $("body").append(component.$el);
        component.visible = true;
        instances.push(instance);

        // 处理手动关闭
        component.close = function () {
            Message.close(id, options.onClose);
        };
        startHide(id, instance.duration, options.onClose);
        return component;
    };

    Message.close = function (id, closeCallback) {
        for (var i = 0, len = instances.length; i < len; i++) {
            var _instance = instances[i];
            var component = _instance.$mount();
            if (id === _instance.id) {
                if (typeof closeCallback === "function") {
                    closeCallback(_instance);
                }
                // 销毁组件
                component.$destroy(true);
                // 移除节点
                $("body").find(component.$el).remove();
                // 移除数据
                instances.splice(i, 1);
                break;
            }
        }
    };
    return Message;
});