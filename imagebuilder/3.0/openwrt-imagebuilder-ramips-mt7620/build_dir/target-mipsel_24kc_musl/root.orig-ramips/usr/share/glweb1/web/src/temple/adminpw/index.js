"use strict";

define(["text!temple/adminpw/index.html", "vue", "component/gl-btn/index", "component/gl-input/index", "component/gl-tooltip/index"], function (temp, Vue, gl_btn, gl_input, gl_tooltip) {
    var vueComponent = Vue.extend({
        template: temp,
        data: function data() {
            return {
                OldAdminPwdVal: "",
                NewAdminPwdVal: "",
                NewAdminPwdConfirmVal: "",
                oldPwdSta: null,
                newPwdSta: null,
                comPwdSta: null,
                newtool: "At least 8 characters",
                comtool: "At least 8 characters",
                // applyDisabled: false,
                btnMove: false,
                errOld: false,
                errConfirm: false,
                errNew: false,
                isChange: false,
                psw: /^(?:\d+|[a-zA-Z]+|[!@#$%^&*]+)$/,
                pswStrong: /((?=.*[a-z])(?=.*\d)|(?=[a-z])(?=.*[#@!~%^&*])|(?=.*\d)(?=.*[#@!~%^&*]))[a-z\d#@!~%^&*]{8,16}/i
            };
        },
        components: {
            "gl-btn": gl_btn,
            "gl-input": gl_input,
            "gl-tooltip": gl_tooltip
        },
        mounted: function mounted() {
            $("#router-visual").slideUp();
            if ($(".clsLink2" + this.$route.path.split("/")[1]).hasClass("bar")) {
                $(".bar.active").removeClass("active");
                $(".clsLink2" + this.$route.path.split("/")[1]).addClass("active");
                $("#vpn").collapse("hide");
                $("#moresetting").collapse("show");
                $("#applications").collapse("hide");
                $("#system").collapse("hide");
            }
        },
        beforeRouteLeave: function beforeRouteLeave(to, from, next) {
            if (!this.btnMove) {
                next();
                return;
            }
            this.$message({
                "type": "warning",
                "msg": "-1000"
            });
        },
        computed: {
            applyDisabled: function applyDisabled() {
                if (this.OldAdminPwdVal && this.NewAdminPwdVal && this.NewAdminPwdConfirmVal) {
                    if (this.newPwdSta && this.comPwdSta && this.oldPwdSta) {
                        return false;
                    }
                }
                return true;
            }
        },
        methods: {
            checknew: function checknew(data) {
                this.newPwdSta = data;
                this.checksta();
            },
            checkcom: function checkcom(data) {
                this.comPwdSta = data;
                this.checksta();
            },
            checkpwd: function checkpwd(data) {
                this.oldPwdSta = data;
                this.checksta();
            },
            checksta: function checksta() {
                this.errOld = false;
                this.errConfirm = false;
                this.errNew = false;
            },
            applyChangePasswd: function applyChangePasswd() {
                var that = this;
                that.btnMove = true;
                // 密码设置为goodlife
                if (this.NewAdminPwdVal == "goodlife") {
                    this.$message({
                        type: 'warning',
                        msg: "-1001",
                        duration: 3000
                    });
                    this.errNew = true;
                    that.btnMove = false;
                    return;
                }
                // 新密码与确认密码不一致
                if (this.NewAdminPwdVal !== this.NewAdminPwdConfirmVal) {
                    this.$message({
                        type: 'warning',
                        msg: "-1002",
                        duration: 3000
                    });
                    that.errConfirm = true;
                    that.btnMove = false;
                    return;
                }
                this.$store.dispatch("call", {
                    api: "changeadminpwd", data: {
                        oldpwd: this.OldAdminPwdVal,
                        newpwd: this.NewAdminPwdVal
                    }
                }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "changeadminpwd",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        that.$message({
                            "type": "success",
                            "api": "changeadminpwd",
                            "msg": result.code
                        });
                        that.OldAdminPwdVal = "";
                        that.NewAdminPwdVal = "";
                        that.NewAdminPwdConfirmVal = "";
                        $("#NewAdminPwd").focus();
                    } else {
                        if (result.code == -5) {
                            // that.oldPwdStatus = "error"; 
                            $("#OldAdminPwd").focus();
                        }
                        if (result.code == -9) {
                            that.errOld = true;
                        }
                        that.$message({
                            "type": "error",
                            "api": "changeadminpwd",
                            "msg": result.code
                        });
                    }
                    setTimeout(function () {
                        that.btnMove = false;
                    }, 1500);
                });
            }
        }
    });
    return vueComponent;
});