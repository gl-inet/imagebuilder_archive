"use strict";

define(["text!temple/attools/index.html", "css!temple/attools/index.css", "vue", "component/gl-btn/index", "component/gl-input/index", "component/gl-select/index"], function (stpl, css, Vue, gl_btn, gl_input, gl_select) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                atmsg: "",
                listItem: "",
                list: [],
                atItem: "",
                atlist: [{ 'msg': 'Manual command', 'item': '' }, { 'msg': 'Request IMEI', 'item': 'AT+GSN' }, { 'msg': 'Request QCCID', 'item': 'AT+QCCID' }, { 'msg': 'Request IMSI', 'item': 'AT+CIMI' }, { 'msg': 'Check Signal Quality', 'item': 'AT+CSQ' }, { 'msg': 'Reset modem', 'item': 'AT&F0' }, { 'msg': 'Operator Names', 'item': 'AT+COPS?' }],
                isSend: false,
                modemIndex: this.$route.query.index
            };
        },
        components: {
            "gl-btn": gl_btn,
            "gl-input": gl_input,
            "gl-select": gl_select
        },
        beforeRouteEnter: function beforeRouteEnter(to, from, next) {
            next(function (vm) {
                if ($(".clsLink2internet").hasClass("bar")) {
                    $(".bar.active").removeClass("active");
                    $(".clsLink2internet").addClass("active");
                    $("#applications").collapse("hide");
                    $("#moresetting").collapse("hide");
                    $("#system").collapse("hide");
                    $("#vpn").collapse("hide");
                };
            });
        },
        computed: {
            moInfo: function moInfo() {
                return this.$store.getters.apiData['moInfo'];
            },
            modems: function modems() {
                return this.moInfo.modems;
            }
        },
        mounted: function mounted() {
            var that = this;
            if (this.modems && this.modems.length > 0) {
                that.getList(this.modems);
            } else {
                this.$store.dispatch("call", { api: "moInfo" }).then(function (result) {
                    if (result.success) {
                        that.$store.commit("setonlist", { data: "modem" });
                        if (result.modems) {
                            that.getList(result.modems);
                        }
                    } else if (result.code == "-17" || result.code == "-3") {
                        that.$store.commit("removeInter", { data: "modem" });
                    } else {
                        that.$store.commit("setonlist", { data: "modem" });
                    }
                });
            }
        },
        methods: {
            getList: function getList(data) {
                var that = this;
                var list = data;
                for (var i = 0; i < list.length; i++) {
                    for (var k = 0; k < list[i].ports.length; k++) {
                        if (list[i].ports[k].indexOf('cdc-wdm') != -1) {
                            list[i].ports.splice(k, 1);
                        }
                    }
                }
                that.list = list;
            },
            checkModem: function checkModem(index) {
                this.modemIndex = index;
            },
            getMsg: function getMsg(data) {
                this.atmsg = data.item;
            },
            sendtools: function sendtools(item) {
                if (!this.atmsg) {
                    this.$message({
                        type: "error",
                        msg: -4000
                    });
                    return;
                }
                var that = this;
                that.isSend = true;
                this.$store.dispatch("call", {
                    api: "atsend", data: {
                        'at-command': this.atmsg,
                        'at-port': item.control_port
                        // "at-fd": this.moInfo.modems[0]['at-fd']
                    }
                }).then(function (result) {
                    that.isSend = false;
                    if (result.success) {
                        that.$message({
                            type: "success",
                            msg: result.code
                        });
                        that.atItem = result.message;
                        that.atmsg = "";
                    } else {
                        that.atItem = "";
                        that.$message({
                            type: "error",
                            msg: result.code
                        });
                    }
                });
            }
        }
    });
    return vueComponent;
});