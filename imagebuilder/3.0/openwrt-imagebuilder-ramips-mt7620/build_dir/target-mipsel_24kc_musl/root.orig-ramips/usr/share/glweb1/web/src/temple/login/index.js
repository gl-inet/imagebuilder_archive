"use strict";

define(["text!temple/login/index.html", "vue", "css!temple/login/index.css", "component/gl-btn/index", "component/gl-input/index", "component/modal/modal"], function (stpl, Vue, css, gl_btn, gl_input, modal) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                password: "",
                isPwdWrong: false,
                isForgetPwd: false,
                checked: true,
                productName: "",
                msgModal: false
            };
        },
        components: {
            "gl-btn": gl_btn,
            "gl-input": gl_input,
            "gl-modal": modal
        },
        mounted: function mounted() {
            var that = this;
            this.$store.dispatch("call", { api: "routerinfo" });
            this.$store.dispatch("call", { api: "getap4config" }).then(function (result) {
                if (result.success) {
                    that.productName = result.model.toUpperCase();
                }
            });
        },
        computed: {
            router: function router() {
                return this.$store.getters.apiData["routerinfo"];
            },
            getap4Config: function getap4Config() {
                return this.$store.getters.apiData["getap4config"];
            },
            appIcon: function appIcon() {
                if (this.router.model) {
                    var model = this.router.model;
                    console.log(model);
                    if (model.toLowerCase().indexOf('usb') !== -1) {
                        return "adminpw-usb-router";
                    } else if (model == 'ar750') {
                        return "adminpw-ar750-router";
                    } else if (model == 'ar750s') {
                        return "adminpw-ar750s-router";
                    } else if (model.toLowerCase().indexOf('ar300m') !== -1) {
                        return "adminpw-ar300m-router";
                    } else if (model.toLowerCase().indexOf('ar150') !== -1) {
                        return "adminpw-ar300m-router";
                    } else if (model.toLowerCase().indexOf('mt300n-v2') !== -1) {
                        return "adminpw-ar300m-router";
                    } else if (model.toLowerCase().indexOf('mt300n') !== -1) {
                        return "adminpw-ar300m-router";
                    } else if (model.toLowerCase().indexOf('mt300a') !== -1) {
                        return "adminpw-ar300m-router";
                    } else if (model.toLowerCase().indexOf('x750') !== -1) {
                        return "adminpw-x750-router";
                    } else if (model.toLowerCase().indexOf('s1300') !== -1) {
                        return "adminpw-b1300-router";
                    } else if (model.toLowerCase().indexOf('b1300') !== -1) {
                        return "adminpw-b1300-router";
                    } else {
                        return "adminpw-mini-router";
                    }
                }
            }
        },
        methods: {
            generateId: function generateId(name) {
                return name + "mini-router";
            },
            login: function login() {
                var that = this;
                // 密码长度检测
                if (this.password.length < 5) {
                    if (!this.password) {
                        this.$message({
                            type: "warning",
                            msg: -1602
                        });
                    } else {
                        this.$message({
                            type: "warning",
                            msg: -1601
                        });
                    }
                    return;
                }
                // 密码不能为goodlife
                if (this.password == "goodlife") {
                    this.$message({
                        type: "warning",
                        msg: -1600
                    });
                }
                this.$store.dispatch("call", {
                    api: "login", data: {
                        pwd: that.password
                    }
                }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "login",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        that.$message({
                            "type": "success",
                            "api": "login",
                            "msg": result.code
                        });
                        window.location = "/index";
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "login",
                            "msg": result.code
                        });
                        that.isForgetPwd = true;
                        $(".password").focus();
                    }
                });
            },
            closeModal: function closeModal() {
                this.msgModal = false;
            },
            modalClose: function modalClose() {
                this.msgModal = true;
                this.isForgetPwd = true;
                this.isPwdWrong = false;
            }
        }
    });
    return vueComponent;
});