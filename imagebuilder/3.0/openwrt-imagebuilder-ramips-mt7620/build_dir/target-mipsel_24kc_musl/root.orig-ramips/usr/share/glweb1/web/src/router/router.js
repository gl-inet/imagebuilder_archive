
"use strict";

define(["vue", "vueRouter", "require"], function (Vue, vueRouter, require) {
    Vue.use(vueRouter);
    var router = new vueRouter({
        routes: [{ path: "", redirect: "internet" }, {
            path: "/adminpw",
            name: "adminpw",
            component: function component(resolve) {
                require(["/src/temple/adminpw/index.js"], resolve);
            }
        }, {
            path: "/attools",
            name: "attools",
            component: function component(resolve) {
                require(["/src/temple/attools/index.js"], resolve);
            }
        }, {
            path: "/bridge",
            name: "bridge",
            component: function component(resolve) {
                require(["/src/temple/bridge/index.js"], resolve);
            }
        }, {
            path: "/clients",
            name: "clients",
            component: function component(resolve) {
                require(["/src/temple/clients/index.js"], resolve);
            }
        }, {
            path: "/dns",
            name: "dns",
            component: function component(resolve) {
                require(["/src/temple/dns/index.js"], resolve);
            }
        }, {
            path: "/firewall",
            name: "firewall",
            component: function component(resolve) {
                require(["/src/temple/firewall/index.js"], resolve);
            }
        }, {
            path: "/index",
            name: "index",
            component: function component(resolve) {
                require(["/src/temple/index/index.js"], resolve);
            }
        }, {
            path: "/internet",
            name: "internet",
            component: function component(resolve) {
                require(["/src/temple/internet/index.js"], resolve);
            }
        }, {
            path: "/knownWifi",
            name: "knownWifi",
            component: function component(resolve) {
                require(["/src/temple/knownWifi/index.js"], resolve);
            }
        }, {
            path: "/lanip",
            name: "lanip",
            component: function component(resolve) {
                require(["/src/temple/lanip/index.js"], resolve);
            }
        }, {
            path: "/login",
            name: "login",
            component: function component(resolve) {
                require(["/src/temple/login/index.js"], resolve);
            }
        }, {
            path: "/macclone",
            name: "macclone",
            component: function component(resolve) {
                require(["/src/temple/macclone/index.js"], resolve);
            }
        }, {
            path: "/process",
            name: "process",
            component: function component(resolve) {
                require(["/src/temple/process/index.js"], resolve);
            }
        }, {
            path: "/revert",
            name: "revert",
            component: function component(resolve) {
                require(["/src/temple/revert/index.js"], resolve);
            }
        }, {
            path: "/sendmsg",
            name: "sendmsg",
            component: function component(resolve) {
                require(["/src/temple/sendmsg/index.js"], resolve);
            }
        }, {
            path: "/settings",
            name: "settings",
            component: function component(resolve) {
                require(["/src/temple/settings/index.js"], resolve);
            }
        }, {
            path: "/setWifi",
            name: "setWifi",
            component: function component(resolve) {
                require(["/src/temple/setWifi/index.js"], resolve);
            }
        }, {
            path: "/share",
            name: "share",
            component: function component(resolve) {
                require(["/src/temple/share/index.js"], resolve);
            }
        }, {
            path: "/smessage",
            name: "smessage",
            component: function component(resolve) {
                require(["/src/temple/smessage/index.js"], resolve);
            }
        }, {
            path: "/software",
            name: "software",
            component: function component(resolve) {
                require(["/src/temple/software/index.js"], resolve);
            }
        }, {
            path: "/ssclient",
            name: "ssclient",
            component: function component(resolve) {
                require(["/src/temple/ssclient/index.js"], resolve);
            }
        }, {
            path: "/ssserver",
            name: "ssserver",
            component: function component(resolve) {
                require(["/src/temple/ssserver/index.js"], resolve);
            }
        }, {
            path: "/timezone",
            name: "timezone",
            component: function component(resolve) {
                require(["/src/temple/timezone/index.js"], resolve);
            }
        }, {
            path: "/upgrade",
            name: "upgrade",
            component: function component(resolve) {
                require(["/src/temple/upgrade/index.js"], resolve);
            }
        }, {
            path: "/vpnclient",
            name: "vpnclient",
            component: function component(resolve) {
                require(["/src/temple/vpnclient/index.js"], resolve);
            }
        }, {
            path: "/vpnserver",
            name: "vpnserver",
            component: function component(resolve) {
                require(["/src/temple/vpnserver/index.js"], resolve);
            }
        }, {
            path: "/welcome",
            name: "welcome",
            component: function component(resolve) {
                require(["/src/temple/welcome/index.js"], resolve);
            }
        }, {
            path: "/wgclient",
            name: "wgclient",
            component: function component(resolve) {
                require(["/src/temple/wgclient/index.js"], resolve);
            }
        }, {
            path: "/wgserver",
            name: "wgserver",
            component: function component(resolve) {
                require(["/src/temple/wgserver/index.js"], resolve);
            }
        }, {
            path: "/wireless",
            name: "wireless",
            component: function component(resolve) {
                require(["/src/temple/wireless/index.js"], resolve);
            }
        }, {
            path: "/wlan",
            name: "wlan",
            component: function component(resolve) {
                require(["/src/temple/wlan/index.js"], resolve);
            }
        }]
    });
    return router;
});