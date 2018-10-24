"use strict";

define(["text!temple/sendmsg/index.html", "css!temple/sendmsg/index.css", "vue", 'lib/country_code', "component/gl-toggle-btn/index", "component/gl-tooltip/index", "component/gl-btn/index", "component/gl-input/index", "component/select/index"], function (stpl, css, Vue, Country, gl_switch, gl_tooltip, gl_btn, gl_input, gl_select) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                tarmes: {},
                tartime: "",
                msg: "",
                list: [],
                loading: false,
                iconIndex: 0,
                moid: "",
                country: Country,
                countryCity: '',
                countryCode: ''
            };
        },
        components: {
            "gl-switch": gl_switch,
            "gl-tooltip": gl_tooltip,
            "gl-btn": gl_btn,
            "gl-input": gl_input,
            "gl-select": gl_select
        },
        beforeRouteEnter: function beforeRouteEnter(to, from, next) {
            next(function (vm) {
                $("#router-visual").slideUp();
                $(".bar.active").removeClass("active");
                $(".clsLink2smessage").addClass("active");
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
        computed: {
            msgLen: function msgLen() {
                return this.msg.replace(/[\u4e00-\u9fa5]/g, "aaa").length;
            }
        },
        mounted: function mounted() {
            var that = this;
            that.moid = that.$route.query.id;
            that.tarmes = JSON.parse(that.$route.query.item);
            that.tartime = that.getTime(that.tarmes.time);
            that.$store.dispatch("call", { api: 'smscode', data: { action: "get" } }).then(function (result) {
                if (result.success) {
                    that.countryCity = result.country;
                    that.countryCode = result.country_code;
                }
            });
        },
        methods: {
            sendMsg: function sendMsg(index, item) {
                // 判断字符长度
                var itemMsg;
                var _this = this;
                var time = _this.timetrans(new Date().getTime());
                // 判断是否为数字
                var regPos = /^\d+(\.\d+)?$/;
                if (item || regPos.test(index)) {
                    if (_this.list[index].hasSend) {
                        return;
                    }
                    this.iconIndex = index;
                    itemMsg = item;
                    _this.$set(_this.list[index], "timer", time);
                } else {
                    itemMsg = _this.msg;
                    var obj = {};
                    this.iconIndex = this.list.length;
                    obj.timer = time;
                    obj.msg = itemMsg;
                    obj.hasSend = true;
                    _this.list.push(obj);
                }
                _this.loading = true;
                _this.$store.dispatch("call", {
                    api: "smssend", data: {
                        modem_id: this.moid,
                        number: this.tarmes.from.replace(/[^0-9]/ig, ""),
                        message: itemMsg,
                        type: this.tarmes.type
                    }
                }).then(function (result) {
                    if (result.success) {
                        _this.$set(_this.list[_this.iconIndex], "hasSend", true);
                    } else {
                        _this.$set(_this.list[_this.iconIndex], "hasSend", false);
                        _this.$message({
                            type: "error",
                            msg: result.code
                        });
                    }
                    _this.loading = false;
                    _this.msg = "";
                });
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
                // var Y = '20' + value.substring(0, 2) + '-';
                // var M = value.substring(2, 4) + '-';
                // var D = value.substring(4, 6);
                // var h = value.substring(6, 8) + ':';
                // var m = value.substring(8, 10) + ':';
                // var s = value.substring(10, 12);
                // var time = Y + M + D + ' ' + h + m + s;
                // return time;
                var time = value.split(' ');
                var data = time[0] + ' ' + time[1];
                var date = '20' + data;
                return date;
            },
            changeCode: function changeCode(data) {
                var that = this;
                that.countryCode = data.dial_code;
                that.$store.dispatch("call", { api: 'smscode', data: { action: "set", country: this.countryCity, country_code: this.countryCode } });
            },
            changeCity: function changeCity(data) {
                var that = this;
                that.countryCity = data.name;
                that.$store.dispatch("call", { api: 'smscode', data: { action: "set", country: this.countryCity, country_code: this.countryCode } });
            }
        }
    });
    return vueComponent;
});