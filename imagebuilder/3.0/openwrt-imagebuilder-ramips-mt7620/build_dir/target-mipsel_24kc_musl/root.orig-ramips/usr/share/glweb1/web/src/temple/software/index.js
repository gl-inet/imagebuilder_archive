"use strict";

define(["text!temple/software/index.html", "css!temple/software/index.css", "vue", "component/gl-input/index", "component/gl-btn/index", "component/gl-tooltip/index", "component/gl-loading/index", 'component/pagination/index', 'component/modal/modal', "component/gl-select/index", "component/dropdown/index"], function (stpl, css, Vue, gl_input, gl_btn, gl_tooltip, gl_loading, gl_pagination, gl_modal, gl_select, gl_dropdown) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                softwarekey: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
                softwareText: "",
                sortwarelist: [], //软件列表
                checkedlist: [],
                sortlist: [],
                serchDis: false,
                lastLetter: "A",
                // timer: null, // 定时器
                num: 0,
                page: 8,
                pageNum: 0,
                currentTarget: "",
                updateStatus: false,
                softName: '',
                softvVersion: "",
                sorfcurVersion: "",
                softDescreption: '',
                showModal: false,
                msgModal: false,
                operate: "",
                errMsg: '',
                putMsg: '',
                msg: "",
                status: "",
                packages: [{ "name": 'All', "count": '0' }, { 'name': "installed", "count": '0' }],
                loading: false
            };
        },
        components: {
            "gl-input": gl_input,
            "gl-btn": gl_btn,
            "gl-tooltip": gl_tooltip,
            "gl-loading": gl_loading,
            "gl-modal": gl_modal,
            "gl-select": gl_select,
            "gl-pagination": gl_pagination,
            "gl-dropdown": gl_dropdown
        },
        beforeRouteEnter: function beforeRouteEnter(to, from, next) {
            next(function (vm) {
                $("#router-visual").slideUp();
                $(".bar.active").removeClass("active");
                // $(".clsLink2applications").addClass("active");
                setTimeout(function () {
                    if ($(".clsLink2" + vm.$route.path.split("/")[1]).hasClass("bar")) {
                        $(".bar.active").removeClass("active");
                        $(".clsLink2" + vm.$route.path.split("/")[1]).addClass("active");
                        $("#vpn").collapse("hide");
                        $("#moresetting").collapse("hide");
                        $("#applications").collapse("hide");
                        $("#system").collapse("show");
                    }
                }, 50);
            });
        },
        beforeRouteLeave: function beforeRouteLeave(to, from, next) {
            if (!this.updateStatus || this.serchDis) {
                this.$message({
                    type: 'warning',
                    msg: -1900
                });
                return;
            }
            next();
        },
        computed: {
            software: function software() {
                return this.$store.getters.apiData["software"];
            },
            installedsoftware: function installedsoftware() {
                return this.$store.getters.apiData["installedsoftware"];
            },
            storeSoftware: function storeSoftware() {
                return this.$store.getters.allsorft;
            },
            // mobile show more btn
            showBtn: function showBtn() {
                var btnStatus = true;
                var len = this.sortwarelist.length || 0;
                if (len < this.page || len == 0) {
                    btnStatus = false;
                }
                return btnStatus;
            }
        },
        mounted: function mounted() {
            var that = this;
            // 所有软件包已获取
            if (that.software.packages) {
                that.loading = true;
                that.checkSorft(that.storeSoftware, that.software.count);
                that.$set(that.packages[0], 'count', that.software.count); //更新下拉列表所有软件包的数量
            } else {
                // 未获取
                that.$store.dispatch("call", { api: "installedsoftware", timeOut: 30000, async: true }).then(function (result) {
                    that.loading = true;
                    if (result.success) {
                        that.$set(that.packages[1], 'count', result.count); //更新下拉列表已安装的数量
                        that.getAllSorftWare();
                    } else {
                        that.updateStatus=true
                        that.$message({
                            type: "error",
                            msg: result.code
                        });
                    }
                });
            }
        },
        methods: {
            getSoft: function getSoft(item) {
                if (item.name == "All") {
                    this.getAllSorftWare();
                } else {
                    this.getInstalledSortWare();
                }
            },
            // 获取已安装
            getInstalledSortWare: function getInstalledSortWare() {
                var that = this;
                that.updateStatus = false;
                this.$store.dispatch("call", { api: "installedsoftware", timeOut: 30000, async: true }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "installedsoftware",
                            "msg": result.code
                        });
                        that.updateStatus = true;
                        return;
                    }
                    if (result.success) {
                        that.currentTarget = "installed";
                        that.checkSorft(result.packages, result.count);
                        that.$set(that.packages[1], 'count', result.count);
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "installedsoftware",
                            "msg": result.code
                        });
                        that.updateStatus = true;
                    }
                });
            },
            // 获取所有软件包
            getAllSorftWare: function getAllSorftWare() {
                var that = this;
                that.updateStatus = false; //  软件列表加载状态
                that.serchDis = true; //  搜索框禁用
                this.softwareText = ""; //  搜索框清空
                this.$store.dispatch("call", { api: "software", timeOut: 30000 }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "software",
                            "msg": result.code
                        });
                        that.serchDis = false;
                        that.updateStatus = true;
                        return;
                    }
                    if (result.success) {
                        that.proAllSorft(result); // 所有软件包的数量处理-1
                        that.$set(that.packages[0], 'count', result.count); //更新下拉列表-所有软件包数量
                    } else {
                        if (result.code == -12) {
                            setTimeout(function () {
                                that.getAllSorftWare();
                            }, 5000);
                        } else {
                            that.$message({
                                "type": "error",
                                "api": "software",
                                "msg": result.code
                            });
                            that.serchDis = false;
                            that.updateStatus = true;
                        }
                    }
                });
            },
            // 所有软件包的数量处理-1  分离出版本号、详细信息和软件名称
            proAllSorft: function proAllSorft(result) {
                var storeSoftware = [];
                var that = this;
                that.serchDis = false;
                that.currentTarget = "all";
                var data = result.packages; // 所有软件包
                for (var i = 0; i < result.count; i++) {
                    var sorft = {};
                    // 464xlat - 11 - 464xlat CLAT support
                    // var datap = data[i].name.split(" - ");
                    var datap = data[i].split(" - ");
                    sorft.name = datap[0]; // 软件包名称
                    sorft.version = datap[1]; // 软件包版本
                    if (datap.length >= 3) {
                        // 删除数组第一项，删除两次
                        datap.shift();
                        datap.shift();
                        sorft.descreption = datap.join(" "); // 软件包说明
                    }
                    storeSoftware.push(sorft); //处理完的所有软件包
                }
                that.$store.commit("setAllSorft", storeSoftware); //使用vuex存储所有软件包
                that.checkSorft(storeSoftware, result.count); // 所有软件包的数量处理-2
            },
            // 所有软件包的数量处理-2  
            checkSorft: function checkSorft(target, count) {
                var that = this;
                this.checkedlist = [];
                if (this.currentTarget !== "letter") {
                    this.removeClass();
                }
                if (this.currentTarget !== "indstalled") {
                    this.$store.dispatch("call", { api: "installedsoftware", timeOut: 30000, async: true }).then(function (result) {
                        that.sortsorft(target, count);
                        that.$set(that.packages[1], 'count', result.count);
                    });
                } else {
                    this.sortsorft(target, count);
                }
            },
            // 所有软件包的数量处理-3
            sortsorft: function sortsorft(target, count) {
                var that = this;
                if (!count) {
                    count = 0;
                }
                if (target.length == 0 && count == 0) {
                    this.sortwarelist = [];
                    this.updateStatus = true;
                    return;
                }
                // 传入的软件包
                var tlen = target.length;
                for (var i = 0; i < tlen; i++) {
                    var installr = that.fuzzyEq(that.installedsoftware.packages, 'name', target[i].name);
                    var allr = [];
                    if (that.currentTarget == "installed") {
                        allr = that.fuzzyEq(that.storeSoftware, 'name', target[i].name);
                    }
                    if (installr.length) {
                        target[i]['installed'] = true;
                        // 当前安装版本
                        target[i]['curversion'] = installr[0]['version'];
                        if (allr.length) {
                            target[i]['descreption'] = allr[0]['descreption'];
                            // 远程更新 最新版本
                            target[i]['version'] = allr[0]['version'];
                        }
                    } else {
                        target[i]['installed'] = false;
                        if (allr.length) {
                            target[i]['descreption'] = allr[0]['descreption'];
                            target[i]['version'] = allr[0]['version'];
                        }
                    }
                }
                this.checkedlist = target;
                this.pageNum = Math.ceil(target.length / this.page);
                this.sortwarelist = [];
                this.rendersorft();
            },
            // 循环软件包 返回所有软件包中同样存在的软件包
            fuzzyEq: function fuzzyEq(list, prop, keyWord) {
                var arr = [];
                list = list || [];
                for (var i = 0; i < list.length; i++) {
                    if (list[i][prop] == keyWord || list[i] == keyWord) {
                        arr.push(list[i]);
                        break;
                    }
                }
                return arr;
            },
            // 分页按钮
            renderpage: function renderpage(pageNum, page) {
                if (!pageNum) {
                    pageNum = 1;
                }
                if (!page) {
                    page = this.page;
                } else {
                    this.pageNum = Math.ceil(data.length / page);
                }
                var num = 0;
                if (pageNum) {
                    num = (pageNum - 1) * page;
                }
                this.rendersorft(num, page, true);
            },
            // 视图更新
            rendersorft: function rendersorft(num, page, pagenate) {
                var that = this;
                var data = this.checkedlist;
                var len = this.checkedlist.length;
                var lack = null;
                if (!num) {
                    num = 0;
                    this.num = 0;
                }
                if (!page) {
                    page = this.page;
                }
                lack = len - num;
                if (!lack) {
                    that.$message({
                        "type": "error",
                        "api": "installedsoftware",
                        "msg": -1905
                    });
                }
                if (pagenate) {
                    this.sortwarelist = [];
                }
                if (lack < page) {
                    for (var i = num; i < len; i++) {
                        this.sortwarelist.push(data[i]);
                    }
                    this.num += lack;
                } else {
                    for (var i = num; i < num + page; i++) {
                        this.sortwarelist.push(data[i]);
                    }
                    this.num += page;
                }
                this.updateStatus = true;
            },
            fuzzyEqRk: function fuzzyEqRk(list, prop, keyWord) {
                var key = -1;
                for (var i = 0; i < list.length; i++) {
                    if (list[i][prop] == keyWord) {
                        return i;
                    }
                }
                return key;
            },
            funzzyLetter: function funzzyLetter(list, prop, keyWord) {
                var arr = [];
                for (var i = 0; i < list.length; i++) {
                    if (list[i][prop].toLowerCase().startsWith(keyWord)) {
                        arr.push(list[i]);
                    }
                }
                return arr;
            },
            // 关键字查找
            findsoftwarebykey: function findsoftwarebykey(text) {
                var that = this;
                var result = [];
                if (text) {
                    // 返回符合条件的软件包列表
                    result = that.fuzzyQuery(that.storeSoftware, 'name', text);
                } else {
                    text = this.softwareText;
                    result = that.storeSoftware;
                }
                that.currentTarget = "key";
                that.checkSorft(result, result.length);
            },
            // 关键字查找
            fuzzyQuery: function fuzzyQuery(list, prop, keyWord) {
                var arr = [];
                for (var i = 0; i < list.length; i++) {
                    if (list[i][prop].indexOf(keyWord) >= 0) {
                        arr.push(list[i]);
                    }
                }
                return arr;
            },
            // 首字母 letter
            findsoftwarebyletter: function findsoftwarebyletter(item, event) {
                var that = this;
                this.softwareText = "";
                if (event) {
                    this.removeClass();
                    event.target.className = "activeSpan";
                }
                this.updateStatus = false;
                this.lastLetter = item.toLowerCase();
                var result = this.funzzyLetter(this.storeSoftware, 'name', this.lastLetter);
                that.currentTarget = "letter";
                that.checkSorft(result, result.length);
            },
            // delete all span class
            removeClass: function removeClass() {
                var len = this.$refs.softwarekey.length;
                for (var i = 0; i < len; i++) {
                    this.$refs.softwarekey[i].className = "";
                }
            },
            findEreturn: function findEreturn() {
                if (this.updateStatus == 'letter') {
                    this.findsoftwarebyletter(this.lastLetter);
                }
            },
            // 安装
            installsofeware: function installsofeware(item, index) {
                // clearTimeout(this.timer);
                var that = this;
                that.updateStatus = false;
                that.softName = item;
                that.$store.dispatch("call", { api: "installsofeware", data: { name: item }, timeOut: 60000 }).then(function (result) {
                    that.operate = "installed";
                    that.msgModal = true;
                    that.msg = item;
                    that.putMsg = result.stdout;
                    if (result.failed) {
                        that.status = "failed";
                        that.errMsg = result.stderr;
                        that.updateStatus = true;
                        // that.modalClose();
                        return;
                    }
                    if (result.success) {
                        that.status = "successfully";
                        // that.modalClose();
                        setTimeout(function () {
                            that.$store.dispatch("call", { api: "installedsoftware", timeOut: 30000, async: true }).then(function () {
                                that.findsoftwarebykey(item);
                                that.$set(that.packages[1], 'count', result.count);
                            });
                        }, 2000);
                    } else {
                        that.errMsg = result.stderr;
                        that.status = "failed";
                        // that.modalClose();
                        that.updateStatus = true;
                    }
                });
            },
            // 卸载
            removeSoftware: function removeSoftware(item, index) {
                var that = this;
                that.updateStatus = false;
                that.softName = item;
                that.$store.dispatch("call", { api: "removesoftware", data: { name: item }, timeOut: 30000 }).then(function (result) {
                    that.operate = "uninstalled";
                    that.msgModal = true;
                    that.msg = item;
                    that.putMsg = result.stdout;
                    if (result.failed) {
                        that.errMsg = result.stderr;
                        that.status = "failed";
                        // that.modalClose();
                        that.updateStatus = true;
                        return;
                    }
                    if (result.success) {
                        that.status = "successfully";
                        // that.modalClose();
                        that.getAllSorftWare();
                    } else {
                        that.errMsg = result.stderr;
                        that.status = "failed";
                        // that.modalClose();
                        that.updateStatus = true;
                    }
                });
            },
            // 更新数据
            updateSortWare: function updateSortWare() {
                var that = this;
                that.updateStatus = false;
                this.$store.dispatch("call", { api: "updatesofeware", timeOut: 60000 }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "updatesoftware",
                            "msg": result.code
                        });
                        that.updateStatus = true;
                        return;
                    }
                    if (result.success) {
                        that.getAllSorftWare();
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "updatesofeware",
                            "msg": result.code
                        });
                        that.updateStatus = true;
                    }
                });
            },
            // 安装卸载提示框关闭
            modalClose: function modalClose() {
                var that = this;
                setTimeout(function () {
                    that.msgModal = false;
                }, 2500);
            },
            // 查看详情
            lookdetail: function lookdetail(index) {
                this.showModal = true;
                this.softName = this.t(this.$lang.software.softName) + ': ' + this.sortwarelist[index].name;
                this.softvVersion = this.sortwarelist[index].version;
                this.softDescreption = this.sortwarelist[index].descreption;
                this.sorfcurVersion = this.sortwarelist[index].curversion;
            },
            // 清空详情框
            closeModal: function closeModal() {
                this.showModal = false;
                this.msgModal = false;
                this.errMsg = '';
                this.putMsg = '';
                this.softName = '';
                this.softvVersion = '';
                this.softDescreption = '';
                this.sorfcurVersion = '';
            }
        }
    });

    return vueComponent;
});