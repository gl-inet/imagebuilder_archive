"use strict";

define(function () {
    return {
        //WAN
        "wan": {
            "waninfo": [],
            "wantype": [],
            "wanset": [{ "proto": "dhcp" }, { "proto": "pppoe", "username": "test1", "password": "123456" }, { "proto": "static", "ipaddr": "192.168.0.11", "gateway": "192.168.0.1", "netmask": "255.255.255.255", "dns": "202.96.134.111,202.96.128.11" }]
        },
        //Repeater
        "repeater": {
            "stainfo": [],
            "scanwifi": [],
            "joinwifi": [{ "ssid": "GL-office", "key": "goodlife168", "mac": "E4:95:6E:44:C2:2D", "encrypt": "psk-mixed", "issaved": false, "channel": "149", "device": "radio0", "save2uci": true }, { "ssid": "GL-AR750S-f04", "key": "goodlife", "mac": "E4:95:6E:4F:6F:04", "encrypt": "wpa2", "issaved": false, "channel": "11", "device": "radio1", "save2uci": true, "identity": "test" }],
            "savedwifi": [],
            "removewifi": [{ "ssid": "GL-AR150-cb6", "mac": "E6:95:6E:40:6C:B6" }],
            "disconnectwifi": [{ "ssid": "GL-AR150-cb6", "enable": "false" }]
        },
        //Internet
        "internet": {
            "internetreachable": [],
            "getserverip": []
        },
        //AP
        "ap": {
            "getaps": [], //get
            "enableap": [{ "ssid": "GL-MIFI-0ff", "enable": "false", "radio": "radio0" }, { "ssid": "GL-MIFI-0ff", "enable": "true", "radio": "radio0" }], //post
            "updateap": [{ "ssid": "GL-MIFI-0ff", "radio": "radio0", "key": "goodlife", "encrypt": "psk-mixed", "newssid": "GL-MIFI-0fff", "channel": "7", "htmode": "150M" }] //post
        },
        //Client
        "client": {
            "getclients": [], //get
            "clientblock": [{ "mac": "38:89:2C:16:CD:A8", "disable": "true" }, { "mac": "38:89:2C:16:CD:A8", "disable": "false" }]
        },
        //Router
        "router": {
            "getlanguage": [], //get
            "login": "/api/router/login", //get
            "setlanguage": [{ "language": "CN" }], //post
            "laninfo": [],
            "getmacsinfo": [],
            "resetfactorymac": [],
            "clonemac": [{ "newmac": "D4:3D:7E:FC:CF:EB" }],
            "gettimezone": [],
            "settimezone": [{ "timezone": "Asia\/Almaty", "autotimezoneenabled": "true" }],
            "isconnected": [],
            "routerinfo": [],
            "initpwd": "/api/router/initpwd",
            "ovpnfiledownload": "/api/router/file/download",
            "getapplist": [],
            "getap4config": []
        },
        //Radio
        "radio": {
            "getdevices": [], //get
            "settxpower": [{ "txpower": "5", "device": "radio0" }] //post
        },
        //Firmware
        "Firmware": {
            "readautoupgrade": [], //get
            "firmwareinfo": [], //get
            "checkfirmware": [], //get
            "setautoupgrade": [{ "enable": true, "time": "12:00" }], //post
            "verifyfirmware": [],
            "flashfirmware": []
        },
        //DNS
        "dns": {
            "getdnsinfo": [],
            "setdnsinfo": [{ "dns1": "8.8.8.8", "dns2": "8.8.4.4", "force_dns": false, "auto_dns": false, "cloudflare_dns": false }, { "dns1": "", "dns2": "", "force_dns": "false", "auto_dns": "true", "cloudflare_dns": "true" }, { "dns1": "", "dns2": "", "force_dns": "false", "auto_dns": "true", "cloudflare_dns": "false" }, { "dns1": "8.8.8.8", "dns2": "8.8.4.4", "force_dns": "false", "auto_dns": "false", "cloudflare_dns": "false" }]
        },
        //Ovpnclient
        "ovpnclient": {
            "ovpngetclientstatus": "/api/ovpn/client/status",
            "ovpnGetClients": "/api/ovpn/client/list",
            "ovpnsetclient": [{ "enableovpn": "true", "ovpnclientid": "ovpn0", "force_client": "false" }],
            "ovpngetserverlist": [{ "ovpnclientid": "ovpn0", "REMOTE_ADDR": "192.168.8.201" }],
            "ovpnremoveclient": [{ "clientid": "ovpn0" }],
            "ovpncheckconfigpack": "/api/ovpn/client/uploadcheck",
            "ovpnuploadconfigpack": "/api/ovpn/client/upload",
            "ovpngenerateclient": [{ "description": "111", "username": "user6131441", "password": "O2AjebAJ" }],
            "ovpnmodifyclient": [{ "description": "555", "username": "", "password": "" }]
        },
        //Ovpnserver
        "ovpnserver": {
            "getovpnconfig": "/api/ovpn/server/get",
            "setovpnconfig": "/api/ovpn/server/set",
            "createovpncertificate": "/api/ovpn/server/generate_cert",
            "getovpnfilestatus": "/api/ovpn/server/cert/status",
            "ovpnstatus": "/api/ovpn/server/status",
            "ovpnstart": "/api/ovpn/server/start",
            "ovpnstop": "/api/ovpn/server/stop",
            "ovpnblock": "/api/ovpn/server/access"
        },
        //shadowsocks Client
        "ssclient": {
            "ssclientstatus": "/api/shadowsocks/client/status",
            "ssclientconfig": "/api/shadowsocks/client/get",
            "ssmodifyclient": "/api/shadowsocks/client/modify",
            "ssremoveclient": "/api/shadowsocks/client/remove",
            "ssstopclient": "/api/shadowsocks/client/stop",
            "startssclient": "/api/shadowsocks/client/start",
            "ssaddclient": "/api/shadowsocks/client/add"
        },
        //shadowsocks Server
        "ssserver": {
            "getserverconfig": "/api/shadowsocks/server/get",
            "getserverstatus": "/api/shadowsocks/server/status",
            "startserver": "/api/shadowsocks/server/start",
            "setserver": "/api/shadowsocks/server/set",
            "stopserver": "/api/shadowsocks/server/stop"
        },
        // software
        "sorftware": {
            "software": [],
            "installedsoftware": [],
            "updatesofeware": [],
            "installsofeware": [{ "name": "chat" }],
            "removesoftware": [{ "name": "chat" }]
        }
    };
});