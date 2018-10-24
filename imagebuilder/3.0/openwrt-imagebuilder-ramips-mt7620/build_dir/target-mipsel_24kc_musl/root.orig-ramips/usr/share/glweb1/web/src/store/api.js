'use strict';

define(function () {
    return {
        // index
        "check_wan2lan": "/api/wan/lan/switch",
        "router": "/api/router/status",
        'router_ddns': '/api/router/info',
        // WAN
        'waninfo': '/api/wan/info',
        'wantype': '/api/wan/access/get',
        'wanset': '/api/wan/access/set',
        // TetheringF
        'teinfo': '/api/tethering/info',
        'tetget': '/api/tethering/get',
        'teset': '/api/tethering/set',
        "teDelete": "/api/tethering/disconnect",
        // Repeater wifi
        'stainfo': '/api/repeater/info',
        'scanwifi': '/api/repeater/scan',
        'joinwifi': '/api/repeater/join',
        'savedwifi': '/api/repeater/manager/list',
        'removewifi': '/api/repeater/manager/remove',
        'disconnectwifi': '/api/repeater/enable',
        "bridge_set": "/api/router/bridge/set",
        "bridge_get": "/api/router/bridge/get",
        // Internet
        'internetreachable': '/api/internet/reachable',
        'getserverip': '/api/internet/public_ip/get',
        // 3/4G Modem
        'moAuto': '/api/modem/auto',
        'moSet': '/api/modem/set',
        'moCarrier': '/api/modem/carrier',
        'moEnable': '/api/modem/enable',
        'moGet': '/api/modem/get',
        'moInfo': '/api/modem/info',
        'moReset': '/api/modem/reset',
        'moStatus': '/api/modem/status',
        'smslist': '/api/modem/sms/list',
        'smsremove': '/api/modem/sms/delete',
        'smssend': '/api/modem/sms/send',
        'smsstatus': '/api/modem/sms/status',
        'smscode': '/api/modem/sms/code',
        'atsend': '/api/modem/at',
        // AP
        'getaps': '/api/ap/info', // get
        'enableap': '/api/ap/enable', // post
        'updateap': '/api/ap/update', // post
        // Radio
        'settxpower': '/api/radio/txpower/set', // post
        // Client
        'getclients': '/api/client/list', // get
        'clientblock': '/api/client/block',
        "setqos": '/api/glqos/set',
        // Router
        'getlanguage': '/api/router/language/get', // get
        'setlanguage': '/api/router/language/set', // post
        'logout': '/api/router/logout', // get
        'login': '/api/router/login', // get
        'laninfo': '/api/router/laninfo',
        'setlanip': '/api/router/setlanip',
        'getmacsinfo': '/api/router/mac/get',
        'resetfactorymac': '/api/router/mac/resetfactory',
        'clonemac': '/api/router/mac/clone',
        'changeadminpwd': '/api/router/changeadminpwd',
        'gettimezone': '/api/router/timezone/get',
        'settimezone': '/api/router/timezone/set',
        'isconnected': '/api/router/hello', //无需登录即可调用
        'reboot': '/api/router/reboot',
        'routerinfo': '/api/router/model',
        'initpwd': '/api/router/initpwd',
        'ovpnfiledownload': '/api/router/file/download',
        'getapplist': '/api/router/getapplist',
        // Not login
        'getap4config': '/api/router/nologin/apinfo', //无需登录即可调用

        // Firmware
        'readautoupgrade': '/api/firmware/autoupgrade/get', // get
        'firmwareinfo': '/api/firmware/info', // get
        'checkfirmware': '/api/firmware/onlinecheck', // get
        'setautoupgrade': '/api/firmware/autoupgrade/set', // post
        'prepareupgrade': '/api/firmware/prepareupgrade',
        'uploadfirmware': '/api/firmware/upload',
        'verifyfirmware': '/api/firmware/verify',
        'downloadfirmware': '/api/firmware/download',
        'firmdownloadprogress': '/api/firmware/downloadprogress',
        'revertfirmware': '/api/firmware/reset',
        'flashfirmware': '/api/firmware/upgrade',

        // DNS
        'getdnsinfo': '/api/dns/get',
        'setdnsinfo': '/api/dns/set',

        // Ovpnclient
        'ovpngetclientstatus': '/api/ovpn/client/status',
        'ovpnGetClients': '/api/ovpn/client/list',
        'ovpnsetclient': '/api/ovpn/client/set',
        'ovpngetserverlist': '/api/ovpn/client/serverlist',
        'ovpnremoveclient': '/api/ovpn/client/remove',
        'ovpnrmall': '/api/ovpn/client/clear',
        'ovpnuploadconfigpack': '/api/ovpn/client/upload',
        'ovpncheckconfigpack': '/api/ovpn/client/uploadcheck',
        'ovpngenerateclient': '/api/ovpn/client/addnew',
        'ovpnmodifyclient': '/api/ovpn/client/modify',

        // Ovpnserver
        'getovpnconfig': '/api/ovpn/server/get',
        'setovpnconfig': '/api/ovpn/server/set',
        'createovpncertificate': '/api/ovpn/server/generate_cert',
        'getovpnfilestatus': '/api/ovpn/server/cert/status',
        'ovpnstatus': '/api/ovpn/server/status',
        'ovpnstart': '/api/ovpn/server/start',
        'ovpnstop': '/api/ovpn/server/stop',
        'ovpnblock': '/api/ovpn/server/access',
        "ovpnfile": '/api/router/file/download',
        // shadowsocks Client
        'ssclientstatus': '/api/shadowsocks/client/status',
        'ssclientconfig': '/api/shadowsocks/client/get',
        'ssmodifyclient': '/api/shadowsocks/client/modify',
        'ssremoveclient': '/api/shadowsocks/client/remove',
        'ssstopclient': '/api/shadowsocks/client/stop',
        'startssclient': '/api/shadowsocks/client/start',
        'ssaddclient': '/api/shadowsocks/client/add',

        // shadowsocks Server
        'getserverconfig': '/api/shadowsocks/server/get',
        'getserverstatus': '/api/shadowsocks/server/status',
        'startserver': '/api/shadowsocks/server/start',
        'setserver': '/api/shadowsocks/server/set',
        'stopserver': '/api/shadowsocks/server/stop',

        // software
        'software': '/api/software/list',
        'installedsoftware': '/api/software/installed',
        'updatesofeware': '/api/software/update',
        'installsofeware': '/api/software/install',
        'removesoftware': '/api/software/remove',
        'findsoftwarebykey': '/api/software/keyword',
        'findsoftwarebyletter': '/api/software/letter',

        // wireguard server
        'wgsCheckKey': '/api/wireguard/server/checkkey',
        'wgsCreateKey': '/api/wireguard/server/createkey',
        'wgsGetKey': '/api/wireguard/server/getkey',
        'wgsifget': '/api/wireguard/server/get',
        'wgsifset': '/api/wireguard/server/set',
        'wgspadd': '/api/wireguard/server/peer/add',
        'wgsplist': '/api/wireguard/server/peer/list',
        'wgspset': '/api/wireguard/server/peer/modify',
        'wgallow': '/api/wireguard/server/peer/allow',
        'wgspremove': '/api/wireguard/server/peer/delete',
        'wgspestatus': '/api/wireguard/server/peer/status',
        'wgsstatus': '/api/wireguard/server/status',
        'wgsstart': '/api/wireguard/server/start',
        'wgsstop': '/api/wireguard/server/stop',
        'wgsCopy': '/api/wireguard/server/peer/generate',

        // wireguard client
        'wgccheckKey': '/api/wireguard/client/checkkey',
        'wgccreateKey': '/api/wireguard/client/createkey',
        'wgcgetKey': '/api/wireguard/client/getkey',
        'wgcset': '/api/wireguard/client/set',
        'wgcadd': '/api/wireguard/client/add',
        'wrthirdadd': '/api/wireguard/client/thirdadd',
        'wgcremove': '/api/wireguard/client/delete',
        "wgrmall": '/api/wireguard/client/alldelete',
        'wgcstatus': '/api/wireguard/client/status',
        'wgcstart': '/api/wireguard/client/start',
        'wgcstop': '/api/wireguard/client/stop',
        'wgclist': '/api/wireguard/client/list',

        // samba share
        'shareget': '/api/files/samba/get',
        'shareset': '/api/files/samba/set',

        // button settings
        'switchset': '/api/router/switch/set',
        'switchget': '/api/router/switch/get',

        // Firewall port
        "fwadd": "/api/firewall/port_forwarding/add",
        "fwremove": "/api/firewall/port_forwarding/del",
        "fwlist": "/api/firewall/port_forwarding/list",
        "setfw": "/api/firewall/port_forwarding/set",
        // Firewall port_opening
        "fwadd_open": "/api/firewall/port_opening/add",
        "fwremove_open": "/api/firewall/port_opening/del",
        "fwlist_list": "/api/firewall/port_opening/list",
        "setfw_open": "/api/firewall/port_opening/set",
        "fwdel_all": "/api/firewall/port_all/del",
        "fwapple": "/api/firewall/dmz/set",
        "fwget": "/api/firewall/dmz/get",

    };
});