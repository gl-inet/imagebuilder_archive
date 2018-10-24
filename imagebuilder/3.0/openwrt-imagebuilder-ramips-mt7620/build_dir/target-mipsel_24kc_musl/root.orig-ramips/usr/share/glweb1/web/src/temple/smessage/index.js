"use strict";

define(["text!temple/smessage/index.html", "css!temple/smessage/index.css", "vue", 'lib/country_code', "component/gl-btn/index", "component/modal/modal", "component/gl-input/index", "component/gl-loading/index", "component/select/index"], function (stpl, css, Vue, Country, gl_btn, gl_modal, gl_input, gl_loading, gl_select) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                moid: "",
                mslist: null,
                timer: "",
                modalShow: false,
                pnum: "",
                loading: false,
                list: [],
                iconIndex: "",
                modalMsg: "",
                country: Country.filter(function (val) {
                    return val['dial_code'] != '' && val['dial_code'] != null;
                }),
                city: '',
                countryCode: ''
                // msgLen: 0
            };
        },
        components: {
            "gl-btn": gl_btn,
            "gl-input": gl_input,
            "gl-modal": gl_modal,
            "gl-loading": gl_loading,
            "gl-select": gl_select
        },
        beforeRouteEnter: function beforeRouteEnter(to, from, next) {
            next(function (vm) {
                $("#router-visual").slideUp();
                $(".bar.active").removeClass("active");
                // $(".clsLink2applications").addClass("active");
                setTimeout(function () {
                    if ($(".clsLink2internet").hasClass("bar")) {
                        $(".bar.active").removeClass("active");
                        $(".clsLink2internet").addClass("active");
                        $("#applications").collapse("hide");
                        $("#moresetting").collapse("hide");
                        $("#system").collapse("hide");
                        $("#vpn").collapse("hide");
                    };
                }, 50);
            });
        },
        beforeRouteLeave: function beforeRouteLeave(to, from, next) {
            clearInterval(this.timer);
            next();
        },
        computed: {
            btnStatus: function btnStatus() {
                if (!this.pnum || !this.modalMsg) {
                    return true;
                }
                return false;
            },
            smslist: function smslist() {
                return this.$store.getters.apiData['smslist'];
            },
            moInfo: function moInfo() {
                return this.$store.getters.apiData['moInfo'];
            },
            msgLen: function msgLen() {
                return this.modalMsg.replace(/[\u4e00-\u9fa5]/g, "aaa").length;
            }
        },
        mounted: function mounted() {
            var that = this;
            that.$store.dispatch("call", { api: 'smscode', data: { action: "get" } }).then(function (result) {
                if (result.success) {
                    that.city = result.country;
                    that.countryCode = result.country_code;
                }
            });
            if (this.moInfo.modems) {
                this.moid = this.moInfo.modems[0].modem_id;
                this.gettlist();
            } else {
                this.$store.dispatch("call", { api: "moInfo" }).then(function (result) {
                    if (result.success) {
                        that.moid = result.modems[0].modem_id;
                        that.gettlist();
                    } else {
                        that.gettlist();
                    }
                });
            }
        },
        methods: {
            gettlist: function gettlist() {
                var that = this;
                that.$store.dispatch("call", {
                    api: "smslist", data: {
                        modem_id: this.moid ? this.moid : 255
                    }, timeOut: 10000
                }).then(function (result) {
                    if (result.timeout) {
                        that.mslist = [];
                    }
                    if (result.success) {
                        that.mslist = result.messages;
                        // 时间排序
                        that.mslist.sort(function (a, b) {
                            var atime = a.time.replace(/[^0-9]/ig, "");
                            var btime = b.time.replace(/[^0-9]/ig, "");
                            return btime - atime;
                        });
                    } else {
                        that.mslist = [];
                    }
                });
            },
            timerData: function timerData() {
                var _this = this;
                this.gettlist();
                clearInterval(this.timer);
                setTimeout(function () {
                    this.timer = setInterval(function () {
                        _this.gettlist();
                    }, 5000);
                }, 5000);
            },
            sendMsg: function sendMsg() {
                // clearInterval(this.timer);
                // 手机号码检索
                // var isphone = /^(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}$/
                // if(!isphone.test(this.pnum)) {
                //     this.$message({
                //         type: "error",
                //         msg: -3002
                //     });
                //     return;
                // }

                this.iconIndex = this.list.length;
                var _this = this;
                var obj = {};
                var num = this.countryCode + this.pnum;
                obj.timer = this.timetrans(new Date().getTime());
                obj.msg = this.modalMsg;
                this.list.push(obj);
                this.loading = true;
                this.$store.dispatch("call", {
                    api: "smssend", data: {
                        modem_id: this.moid ? this.moid : 255,
                        number: num.replace(/\s|\xA0/g, ""),
                        message: this.modalMsg
                    }
                }).then(function (result) {
                    _this.modalMsg = "";
                    _this.loading = false;
                    if (result.failed) {
                        _this.$message({
                            type: "error",
                            msg: result.code
                        });
                        return;
                    }
                    if (result.success) {} else {
                        _this.$message({
                            type: "error",
                            msg: result.code
                        });
                    }
                    // setTimeout(function () {
                    //     _this.gettlist();
                    // }, 2500);
                });
            },
            readsms: function readsms(item) {
                var that = this;
                that.$store.dispatch('call', {
                    api: 'smsstatus', data: {
                        modem_id: this.moid ? this.moid : 255,
                        msg_id: item.name
                    }
                }).then(function (result) {
                    if (result.success) {
                        that.$router.push({ path: 'sendmsg', query: { id: that.moid, item: JSON.stringify(item) } });
                    }
                });
            },
            removeMsg: function removeMsg(item, index, event) {
                event.stopPropagation();
                var _this = this;
                clearInterval(this.timer);
                _this.$store.commit("showModal", {
                    show: true,
                    title: "Caution",
                    message: "Confirm deletion information?",
                    cb: function cb() {
                        _this.$store.dispatch("call", {
                            api: "smsremove", data: {
                                modem_id: _this.moid ? _this.moid : 255,
                                msg_id: item.name
                            }
                        }).then(function (result) {
                            if (result.success) {
                                _this.$message({
                                    type: "success",
                                    msg: result.code
                                });
                            }
                            _this.mslist.splice(index, 1);
                            setTimeout(function () {
                                _this.gettlist();
                            }, 2500);
                        });
                    }
                });
            },
            closeModal: function closeModal() {
                // this.timerData();
                this.modalShow = false;
                this.pnum = "";
                this.modalMsg = "";
                this.list = [];
            },
            showModal: function showModal() {
                clearInterval(this.timer);
                this.modalShow = true;
            },
            timetrans: function timetrans(value) {
                value = parseInt(value);
                var date = new Date(value);
                var Y = date.getFullYear() + '-';
                var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
                var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
                var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
                var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
                var s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
                var time = Y + M + D + ' ' + h + m + s;
                return time;
            },
            // 解析Api返回时间
            getTime: function getTime(value) {
                var time = value.split(' ');
                var data = time[0].replace(/-/g, '/');
                var date = '20' + data;
                // var Y = '20' + value.substring(0, 2) + '/';
                // var M = value.substring(2, 4) + '/';
                // var D = value.substring(4, 6);
                // var h = value.substring(6, 8) + ':';
                // var m = value.substring(8, 10) + ':';
                // var s = value.substring(10, 12);
                // var time = Y + M + D;
                return date;
            },
            getcountryNum: function getcountryNum(data) {
                var that = this;
                this.countryCode = data.dial_code;
                that.$store.dispatch("call", { api: 'smscode', data: { action: "set", country: this.city, country_code: this.countryCode } });
            },
            getcountrycity: function getcountrycity(data) {
                var that = this;
                this.city = data.name;
                that.$store.dispatch("call", { api: 'smscode', data: { action: "set", country: this.city, country_code: this.countryCode } });
            }
        }
    });
    return vueComponent;
});