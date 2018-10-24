"use strict";

define(["text!temple/clients/index.html", "css!temple/clients/index.css", "component/gl-toggle-btn/index", "component/gl-btn/index", "vue","component/gl-tooltip/index", "component/modal/modal"], function (stpl, css, gl_toggle, gl_btn, Vue,gl_tooltip,gl_modal) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                timer: "",
                btnstatus: false,
                wlan5g: [],
                wlan24g: [],
                wire: [],
                qosMange: false,
                redding_status: -1,
                clientType: '',
                quload:0,
                qdload:0,
                btnIndex: -1,
                showModal:false
            };
        },
        components: {
            "gl-tg-btn": gl_toggle,
            "gl-btn": gl_btn,
            "gl-tooltip": gl_tooltip,
            "gl-modal": gl_modal,
        },
        beforeRouteEnter: function beforeRouteEnter(to, from, next) {
            next(function (vm) {
                $("#router-visual").slideUp();
                if ($(".clsLink2" + vm.$route.path.split("/")[1]).hasClass("bar")) {
                    $(".bar.active").removeClass("active");
                    $(".clsLink2" + vm.$route.path.split("/")[1]).addClass("active");
                    $("#applications").collapse("hide");
                    $("#moresetting").collapse("hide");
                    $("#system").collapse("hide");
                    $("#vpn").collapse("hide");
                }
            });
        },
        beforeRouteLeave: function beforeRouteLeave(to, from, next) {
            clearInterval(this.timer);
            next();
        },
        mounted: function mounted() {
            this.timerData();
            if(this.getclients.success) {
                if(this.getclients.wire && this.getclients.wire.length != 0) {
                    this.wire = this.getclients.wire
                }
                if(this.getclients.wlan5g && this.getclients.wlan5g.length != 0) {
                    this.wlan5g = this.getclients.wlan5g
                }
                if(this.getclients.wlan24g && this.getclients.wlan24g.length != 0) {
                    this.wlan24g = this.getclients.wlan24g
                }
            }
            this.windowWidth()
        },
        computed: {
            getclients: function getclients() {
                return this.$store.getters.apiData["getclients"];
            },
            clientList: function clientList() {
                return this.getclients;
            }
        },
        methods: {
            windowWidth() {
                if (window.screen.width <= 448) {
                    $('.Widthscreen').addClass('table-responsive')
                } else {
                    $('.Widthscreen').removeClass('table-responsive')
                }
                $(window).resize(function () {
                    var Width = $(window).width();
                    if (Width <= 448) {
                        $('.Widthscreen').addClass('table-responsive')
                    } else {
                        $('.Widthscreen').removeClass('table-responsive')
                    }
                })
            },
            timerData: function timerData() {
                var that = this;
                that.getData();
                that.timer = setInterval(function () {
                    that.getData();
                }, 5000);
            },
            getData: function getData() {
                var that = this;
                that.$store.dispatch("call", {
                    api: "getclients",
                }).then(function (result) {
                    if (result.success) {
                    that.wlan24g=result.wlan24g
                    that.wlan5g=result.wlan5g
                    that.wire=result.wire
                    }
                });
            },
            bytesToSize(bytes) {
                if(bytes>=999&&bytes<=1023){
                    bytes=1030
                } 
                if (bytes == 0) return '0 B/s';
                var k = 1024,
                    sizes = ['B/s','KB/s', 'MB/s', 'GB/s', 'TB/s', 'PB/s', 'EB/s', 'ZB/s', 'YB/s'],
                    i = Math.floor(Math.log(bytes) / Math.log(k));
                    var item = (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i]
               return item
            },
            bytesToSizeNum(bytes) {
                if(bytes>=999&&bytes<=1023){
                    bytes=1030
                } 
                if (bytes == 0) return '0 KB/s';
                var k = 1024,
                    sizes = ['KB/s', 'MB/s', 'GB/s', 'TB/s', 'PB/s', 'EB/s', 'ZB/s', 'YB/s'],
                    i = Math.floor(Math.log(bytes) / Math.log(k));
                    var item = (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i]
               return item
            },
            truncation(item){
                if(item.length>8){
                    item=item.substring(0,8)+'...'
                }
                return item
            },
            // parseClient: function parseClient(data) {
            //     var client = data.length > 0 ? data : [];
            //     var len = client.length;
            //     this.wlan5g = [];
            //     this.wire = [];
            //     this.wlan24g = [];
            //     if (len == 0) {
            //         this.wlan5g = null;
            //         this.wlan24g = null;
            //         return;
            //     }
            //     for (var i = 0; i < len; i++) {
            //         if (client[i].type == 'LAN') {
            //             this.wlan24g.push(client[i]);
            //         } else if (client[i].type == 'Unknown') {
            //             this.wire.push(client[i]);
            //         } else {
            //             this.wlan5g.push(client[i]);
            //         }
            //     }
            // },
            // 禁止设备进入web页面
            block: function block(item, index, list) {
                var that = this;
                clearInterval(that.timer);
                // 本机禁用出现弹框
                if (item.remote && item.blocked) {
                    that.$store.commit("showModal", {
                        show: true,
                        type: "warning",
                        title: "Caution",
                        message: this.$lang.modal.disableDevice,
                        cb: function cb() {
                            that.blockclient(item);
                        },
                        cancel: function cancel() {
                            that.timerData();
                            list[index].blocked = false;
                        }
                    });
                } else {
                    that.blockclient(item);
                }
            },
            blockclient: function blockclient(item) {
                var that = this;
                that.$store.dispatch("call", {
                    api: 'clientblock',
                    data: {
                        "mac": item.mac,
                        "disable": item.blocked
                    }
                }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "clientblock",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        that.$message({
                            "type": "success",
                            "api": "clientblock",
                            "msg": result.code
                        });
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "clientblock",
                            "msg": result.code
                        });
                    }
                    that.timerData();
                });
            },
            setQos: function setQos(item, index) {
                var that = this;
                that.btnstatus=true
                that.redding_status = -1
                that.btnIndex = index
                // that.qdload=that.qdload.replace(/^0+/,'')
                // that.quload=that.quload.replace(/^0+/,'')
                clearInterval(this.timer);
                that.$store.dispatch('call', {
                    api: 'setqos',
                    data: {
                        mac: item.mac,
                        upload: that.quload,
                        download: that.qdload,
                    }
                }).then(function (result) {
                    that.timerData()
                    that.btnIndex = -1
                    that.btnstatus=false
                    if (result.success) {
                        that.$message({
                            type: 'success',
                            msg: result.code
                        })

                    } else {
                        that.$message({
                            type: 'error',
                            msg: result.code
                        })
                    }
                })
            },
            cancelQos(item){
                if(this.btnstatus) return
                var that = this;
                that.btnstatus=true
                clearInterval(this.timer);
                that.$store.dispatch('call', {
                    api: 'setqos',
                    data: {
                        mac: item.mac,
                        upload:0,
                        download: 0,
                    }
                }).then(function (result) {
                    that.timerData()
                    that.btnstatus=false
                    if (result.success) {
                        that.$message({
                            type: 'success',
                            msg: result.code
                        })
                    } else {
                        that.$message({
                            type: 'error',
                            msg: result.code
                        })
                    }
                })
            },
            bytesToSizeList(bytes) {
                if(bytes>=999&&bytes<=1023){
                    bytes=1030
                } 
                if (bytes == 0) return '0 B';
                var k = 1024,
                    sizes = ['B','KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
                    i = Math.floor(Math.log(bytes) / Math.log(k));
                    var item =(bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i]
               return item
            },
            inputload: function inputload() {
                clearInterval(this.timer);
            },
            cancelClient(item) {
                this.redding_status = -1
                this.timerData()
            },
            modifyClient(index, target) {
                if(this.btnstatus) return
                clearInterval(this.timer)
                this.qdload=target.qdload
                this.quload=target.quload
                this.clientType = target.type
                if (target) {
                    this.redding_status = index
                } else {
                    this.modify_status = index
                }
            },
        }
    });
    return vueComponent;
});