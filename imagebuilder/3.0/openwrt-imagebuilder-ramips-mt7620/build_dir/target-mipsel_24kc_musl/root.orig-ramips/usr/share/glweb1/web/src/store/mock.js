"use strict";

define(function () {
    return {
        "ovpngetclientstatus": {
            code: 0,
            config: "/etc/openvpn/ovpn0/nj.ovpn",
            errormsg: "dsadsasdas21jfihakgnfsakjh142knfanfannfjqrn21jnjnkdanfanlj",
            enable: true,
            force: false,
            http_cookie: "QSESSIONID=bce9dbf17004b90000",
            installed: true,
            mode: true,
            status: "off"
        },

        "fwadd": {
            code: 0
        },
        "fwremove": {
            code: 0
        },
        "fwlist": {
            list: [{
                name: "y嘤嘤嘤",
                outer_port: "443",
                inner_port: "58200",
                inner_ip: "192.168.88.1",
                proto: 'TCP',
                enabled: "Disabled"
            }],
            code: 0
        },
        "setfw": {
            code: 0
        },

        "fwadd_open": {
            code: 0
        },
        "fwremove_open": {
            code: 0
        },
        "fwlist_list": {
            list: [{
                name: "y嘤",
                outer_port: "442",
                inner_port: "58100",
                inner_ip: "192.168.99.1",
                proto: 'UDP',
                enabled: "Enabled"
            }, {
                name: "y嘤1",
                outer_port: "442",
                inner_port: "58100",
                inner_ip: "192.168.99.1",
                proto: 'UDP',
                enabled: "Enabled"
            }],
            code: 0
        },
        "setfw_open": {
            code: 0
        }
    };
});