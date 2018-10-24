"use strict";

define(["text!temple/apitest/index.html", "store/apitest", "vue"], function (stpl, apitest, Vue) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                keys: Object.keys(apitest),
                title: "hello"
            };
        },
        computed: {},
        beforeRouteEnter: function beforeRouteEnter(to, from, next) {
            next(function (vm) {
                $("#router-visual").slideDown();
                if ($(".clsLink2" + vm.$route.path.split("/")[1]).hasClass("bar")) {
                    $(".bar.active").removeClass("active");
                    $(".clsLink2" + vm.$route.path.split("/")[1]).addClass("active");
                    $("#moresetting").collapse("show");
                    $("#moreapps").collapse("hide");
                }
            });
        },
        mounted: function mounted() {
            // for(var item of this.keys){
            //     var que = []

            // }
            var that = this;
            this.queue(this.keys);
        },
        methods: {
            queue: function queue(arr) {
                var that = this;
                return arr.reduce(async function (previousValue, currentValue) {
                    await previousValue;
                    return that.getData(currentValue);
                }, Promise.resolve()).then(function (data) {
                    // console.log("测试完毕");
                    Promise.resolve();
                });
            },
            getData: function getData(name) {
                var that = this;
                var promise = new Promise(function (resolve) {
                    // console.log(apitest[name]);
                    for (var idx = 0; idx < apitest[name].length; idx++) {
                        var data = apitest[name][idx];
                        that.$store.dispatch("call", { api: name, data: data }).then(function (result) {
                            console.log(result);
                        });
                    }
                    resolve(name);
                });
                return promise;
            },
            handleDrop: function handleDrop() {}
        }
    });
    return vueComponent;
});