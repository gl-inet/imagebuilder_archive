"use strict";

define(["text!temple/timezone/index.html", "css!temple/timezone/index.css", "jstz", "vue", "component/gl-btn/index", "component/gl-select/index"], function (temp, css, jstz, Vue, gl_btn, gl_select) {
    var vueComponent = Vue.extend({
        template: temp,
        data: function data() {
            return {
                continentSelected: "",
                continentOptions: [{
                    value: "Select Your Continent or Ocean",
                    text: "Select Your Continent or Ocean"
                }, {
                    value: "Africa",
                    text: "Africa"
                }, {
                    value: "America",
                    text: "America"
                }, {
                    value: "Asia",
                    text: "Asia"
                }, {
                    value: "Antarctica",
                    text: "Antarctica"
                }, {
                    value: "Atlantic",
                    text: "Atlantic"
                }, {
                    value: "Australia",
                    text: "Australia"
                }, {
                    value: "Indian",
                    text: "Indian"
                }, {
                    value: "Pacific",
                    text: "Pacific"
                }, {
                    value: "Etc",
                    text: "Etc"
                }, {
                    value: "Europe",
                    text: "Europe"
                }],
                citySelected: "",
                cityOptions: [{
                    value: "",
                    text: "Select Your City"
                }],
                systemTime: "",
                applyDisabled: true,
                cities: new Array(),
                userTimeZoneName: jstz.determine().name(),
                btnMove: false,
                text: "1"
            };
        },
        components: {
            "gl-btn": gl_btn,
            "gl-select": gl_select
        },
        created: function created() {
            this.cities[0] = "";
            this.cities[1] = ["Africa/Abidjan", "Africa/Accra", "Africa/Addis_Ababa", "Africa/Algiers", "Africa/Asmara", "Africa/Bamako", "Africa/Bangui", "Africa/Banjul", "Africa/Bissau", "Africa/Blantyre", "Africa/Brazzaville", "Africa/Bujumbura", "Africa/Cairo", "Africa/Casablanca", "Africa/Ceuta", "Africa/Conakry", "Africa/Dakar", "Africa/Dar_es_Salaam", "Africa/Djibouti", "Africa/Douala", "Africa/El_Aaiun", "Africa/Freetown", "Africa/Gaborone", "Africa/Harare", "Africa/Johannesburg", "Africa/Juba", "Africa/Kampala", "Africa/Khartoum", "Africa/Kigali", "Africa/Kinshasa", "Africa/Lagos", "Africa/Libreville", "Africa/Lome", "Africa/Luanda", "Africa/Lubumbashi", "Africa/Lusaka", "Africa/Malabo", "Africa/Maputo", "Africa/Maseru", "Africa/Mbabane", "Africa/Mogadishu", "Africa/Monrovia", "Africa/Nairobi", "Africa/Ndjamena", "Africa/Niamey", "Africa/Nouakchott", "Africa/Ouagadougou", "Africa/Porto-Novo", "Africa/Sao_Tome", "Africa/Tripoli", "Africa/Tunis", "Africa/Windhoek"];
            this.cities[2] = ["America/Adak", "America/Anchorage", "America/Anguilla", "America/Antigua", "America/Araguaina", "America/Argentina/Buenos_Aires", "America/Argentina/Catamarca", "America/Argentina/Cordoba", "America/Argentina/Jujuy", "America/Argentina/La_Rioja", "America/Argentina/Mendoza", "America/Argentina/Rio_Gallegos", "America/Argentina/Salta", "America/Argentina/San_Juan", "America/Argentina/San_Luis", "America/Argentina/Tucuman", "America/Argentina/Ushuaia", "America/Aruba", "America/Asuncion", "America/Atikokan", "America/Bahia", "America/Bahia_Banderas", "America/Barbados", "America/Belem", "America/Belize", "America/Blanc-Sablon", "America/Boa_Vista", "America/Bogota", "America/Boise", "America/Cambridge_Bay", "America/Campo_Grande", "America/Cancun", "America/Caracas", "America/Cayenne", "America/Cayman", "America/Chicago", "America/Chihuahua", "America/Costa_Rica", "America/Creston", "America/Cuiaba", "America/Curacao", "America/Danmarkshavn", "America/Dawson", "America/Dawson_Creek", "America/Denver", "America/Detroit", "America/Dominica", "America/Edmonton", "America/Eirunepe", "America/El_Salvador", "America/Fort_Nelson", "America/Fortaleza", "America/Glace_Bay", "America/Godthab", "America/Goose_Bay", "America/Grand_Turk", "America/Grenada", "America/Guadeloupe", "America/Guatemala", "America/Guayaquil", "America/Guyana", "America/Halifax", "America/Havana", "America/Hermosillo", "America/Indiana/Indianapolis", "America/Indiana/Knox", "America/Indiana/Marengo", "America/Indiana/Petersburg", "America/Indiana/Tell_City", "America/Indiana/Vevay", "America/Indiana/Vincennes", "America/Indiana/Winamac", "America/Inuvik", "America/Iqaluit", "America/Jamaica", "America/Juneau", "America/Kentucky/Louisville", "America/Kentucky/Monticello", "America/Kralendijk", "America/La_Paz", "America/Lima", "America/Los_Angeles", "America/Lower_Princes", "America/Maceio", "America/Managua", "America/Manaus", "America/Marigot", "America/Martinique", "America/Matamoros", "America/Mazatlan", "America/Menominee", "America/Merida", "America/Metlakatla", "America/Mexico_City", "America/Miquelon", "America/Moncton", "America/Monterrey", "America/Montevideo", "America/Montserrat", "America/Nassau", "America/New_York", "America/Nipigon", "America/Nome", "America/Noronha", "America/North_Dakota/Beulah", "America/North_Dakota/Center", "America/North_Dakota/New_Salem", "America/Ojinaga", "America/Panama", "America/Pangnirtung", "America/Paramaribo", "America/Phoenix", "America/Port_of_Spain", "America/Port-au-Prince", "America/Porto_Velho", "America/Puerto_Rico", "America/Punta_Arenas", "America/Rainy_River", "America/Rankin_Inlet", "America/Recife", "America/Regina", "America/Resolute", "America/Rio_Branco", "America/Santarem", "America/Santiago", "America/Santo_Domingo", "America/Sao_Paulo", "America/Scoresbysund", "America/Sitka", "America/St_Barthelemy", "America/St_Johns", "America/St_Kitts", "America/St_Lucia", "America/St_Thomas", "America/St_Vincent", "America/Swift_Current", "America/Tegucigalpa", "America/Thule", "America/Thunder_Bay", "America/Tijuana", "America/Toronto", "America/Tortola", "America/Vancouver", "America/Whitehorse", "America/Winnipeg", "America/Yakutat", "America/Yellowknife"];
            this.cities[3] = ["Asia/Aden", "Asia/Almaty", "Asia/Amman", "Asia/Anadyr", "Asia/Aqtau", "Asia/Aqtobe", "Asia/Ashgabat", "Asia/Atyrau", "Asia/Baghdad", "Asia/Bahrain", "Asia/Baku", "Asia/Bangkok", "Asia/Barnaul", "Asia/Beirut", "Asia/Bishkek", "Asia/Brunei", "Asia/Chita", "Asia/Choibalsan", "Asia/Colombo", "Asia/Damascus", "Asia/Dhaka", "Asia/Dili", "Asia/Dubai", "Asia/Dushanbe", "Asia/Famagusta", "Asia/Gaza", "Asia/Hebron", "Asia/Ho_Chi_Minh", "Asia/Hong_Kong", "Asia/Hovd", "Asia/Irkutsk", "Asia/Jakarta", "Asia/Jayapura", "Asia/Jerusalem", "Asia/Kabul", "Asia/Kamchatka", "Asia/Karachi", "Asia/Kathmandu", "Asia/Khandyga", "Asia/Kolkata", "Asia/Krasnoyarsk", "Asia/Kuala_Lumpur", "Asia/Kuching", "Asia/Kuwait", "Asia/Macau", "Asia/Magadan", "Asia/Makassar", "Asia/Manila", "Asia/Muscat", "Asia/Nicosia", "Asia/Novokuznetsk", "Asia/Novosibirsk", "Asia/Omsk", "Asia/Oral", "Asia/Phnom_Penh", "Asia/Pontianak", "Asia/Pyongyang", "Asia/Qatar", "Asia/Qyzylorda", "Asia/Riyadh", "Asia/Sakhalin", "Asia/Samarkand", "Asia/Seoul", "Asia/Shanghai", "Asia/Singapore", "Asia/Srednekolymsk", "Asia/Taipei", "Asia/Tashkent", "Asia/Tbilisi", "Asia/Tehran", "Asia/Thimphu", "Asia/Tokyo", "Asia/Tomsk", "Asia/Ulaanbaatar", "Asia/Urumqi", "Asia/Ust-Nera", "Asia/Vientiane", "Asia/Vladivostok", "Asia/Yakutsk", "Asia/Yangon", "Asia/Yekaterinburg", "Asia/Yerevan"];
            this.cities[4] = ["Antarctica/Casey", "Antarctica/Davis", "Antarctica/DumontDUrville", "Antarctica/Macquarie", "Antarctica/Mawson", "Antarctica/McMurdo", "Antarctica/Palmer", "Antarctica/Rothera", "Antarctica/Syowa", "Antarctica/Troll", "Antarctica/Vostok"];
            this.cities[5] = ["Atlantic/Azores", "Atlantic/Bermuda", "Atlantic/Canary", "Atlantic/Cape_Verde", "Atlantic/Faroe", "Atlantic/Madeira", "Atlantic/Reykjavik", "Atlantic/South_Georgia", "Atlantic/St_Helena", "Atlantic/Stanley"];
            this.cities[6] = ["Australia/Adelaide", "Australia/Brisbane", "Australia/Broken_Hill", "Australia/Currie", "Australia/Darwin", "Australia/Eucla", "Australia/Hobart", "Australia/Lindeman", "Australia/Lord_Howe", "Australia/Melbourne", "Australia/Perth", "Australia/Sydney"];
            this.cities[7] = ["Indian/Antananarivo", "Indian/Chagos", "Indian/Christmas", "Indian/Cocos", "Indian/Comoro", "Indian/Kerguelen", "Indian/Mahe", "Indian/Maldives", "Indian/Mauritius", "Indian/Mayotte", "Indian/Reunion"];
            this.cities[8] = ["Pacific/Apia", "Pacific/Auckland", "Pacific/Bougainville", "Pacific/Chatham", "Pacific/Chuuk", "Pacific/Easter", "Pacific/Efate", "Pacific/Enderbury", "Pacific/Fakaofo", "Pacific/Fiji", "Pacific/Funafuti", "Pacific/Galapagos", "Pacific/Gambier", "Pacific/Guadalcanal", "Pacific/Guam", "Pacific/Honolulu", "Pacific/Kiritimati", "Pacific/Kosrae", "Pacific/Kwajalein", "Pacific/Majuro", "Pacific/Marquesas", "Pacific/Midway", "Pacific/Nauru", "Pacific/Niue", "Pacific/Norfolk", "Pacific/Noumea", "Pacific/Pago_Pago", "Pacific/Palau", "Pacific/Pitcairn", "Pacific/Pohnpei", "Pacific/Port_Moresby", "Pacific/Rarotonga", "Pacific/Saipan", "Pacific/Tahiti", "Pacific/Tarawa", "Pacific/Tongatapu", "Pacific/Wake", "Pacific/Wallis"];
            this.cities[9] = ["Etc/GMT", "Etc/GMT+1", "Etc/GMT+10", "Etc/GMT+11", "Etc/GMT+12", "Etc/GMT+2", "Etc/GMT+3", "Etc/GMT+4", "Etc/GMT+5", "Etc/GMT+6", "Etc/GMT+7", "Etc/GMT+8", "Etc/GMT+9", "Etc/GMT-1", "Etc/GMT-10", "Etc/GMT-11", "Etc/GMT-12", "Etc/GMT-13", "Etc/GMT-14", "Etc/GMT-2", "Etc/GMT-3", "Etc/GMT-4", "Etc/GMT-5", "Etc/GMT-6", "Etc/GMT-7", "Etc/GMT-8", "Etc/GMT-9"];
            this.cities[10] = ["Europe/Amsterdam", "Europe/Andorra", "Europe/Astrakhan", "Europe/Athens", "Europe/Belgrade", "Europe/Berlin", "Europe/Bratislava", "Europe/Brussels", "Europe/Bucharest", "Europe/Budapest", "Europe/Busingen", "Europe/Chisinau", "Europe/Copenhagen", "Europe/Dublin", "Europe/Gibraltar", "Europe/Guernsey", "Europe/Helsinki", "Europe/Isle_of_Man", "Europe/Istanbul", "Europe/Jersey", "Europe/Kaliningrad", "Europe/Kiev", "Europe/Kirov", "Europe/Lisbon", "Europe/Ljubljana", "Europe/London", "Europe/Luxembourg", "Europe/Madrid", "Europe/Malta", "Europe/Mariehamn", "Europe/Minsk", "Europe/Monaco", "Europe/Moscow", "Europe/Oslo", "Europe/Paris", "Europe/Podgorica", "Europe/Prague", "Europe/Riga", "Europe/Rome", "Europe/Samara", "Europe/San_Marino", "Europe/Sarajevo", "Europe/Saratov", "Europe/Simferopol", "Europe/Skopje", "Europe/Sofia", "Europe/Stockholm", "Europe/Tallinn", "Europe/Tirane", "Europe/Ulyanovsk", "Europe/Uzhgorod", "Europe/Vaduz", "Europe/Vatican", "Europe/Vienna", "Europe/Vilnius", "Europe/Volgograd", "Europe/Warsaw", "Europe/Zagreb", "Europe/Zaporozhye", "Europe/Zurich"];
            this.updateDisplay();
        },
        mounted: function mounted() {
            $("#router-visual").slideUp();
            if ($(".clsLink2" + this.$route.path.split("/")[1]).hasClass("bar")) {
                $(".bar.active").removeClass("active");
                $(".clsLink2" + this.$route.path.split("/")[1]).addClass("active");
                $("#vpn").collapse("hide");
                $("#moresetting").collapse("show");
                $("#applications").collapse("hide");
                $("#system").collapse("hide");
            }
        },
        beforeRouteLeave: function beforeRouteLeave(to, from, next) {
            if (!this.btnMove) {
                next();
                return;
            }
            this.$message({
                "type": "warning",
                "msg": -2200,
                "duration": 1000
            });
        },
        methods: {
            updateDisplay: function updateDisplay() {
                var that = this;
                this.$store.dispatch("call", { api: "gettimezone" }).then(function (result) {
                    if (result.failed) {
                        this.$message({
                            "type": "error",
                            "api": "gettimezone",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        var systemTime = result.systemtime;
                        that.systemTime = systemTime;
                        var sysZoneName = result.zonename;
                        that.autoTimezoneEnabled = result.autotimezone;
                        if (sysZoneName == "") {
                            sysZoneName = "Select Your Continent or Ocean/";
                        }
                        if (that.userTimeZoneName != sysZoneName) {
                            $(".routertime-reminder").removeClass("hide");
                            $(".routertime-reminder").slideDown();
                        } else {
                            $(".routertime-reminder").slideUp();
                        }
                        var continent = sysZoneName.split("/")[0];
                        var city = sysZoneName.split("/")[1];
                        if (sysZoneName.split("/").length == 3) {
                            city += '/' + sysZoneName.split("/")[2];
                        }
                        that.displayTimezone(continent, city);
                    } else {
                        this.$message({
                            "type": "error",
                            "api": "gettimezone",
                            "msg": result.code
                        });
                    }
                });
            },
            setTimeZoneApply: function setTimeZoneApply() {
                var that = this;
                that.btnMove = true;
                this.applyDisabled = true;
                var continent = this.continentSelected;
                var city = this.citySelected.replace("_", " ");
                var timeZoneStr = continent + "/" + city;
                this.$store.dispatch("call", {
                    api: "settimezone", data: {
                        timezone: timeZoneStr,
                        autotimezoneenabled: that.autoTimezoneEnabled
                    }
                }).then(function (result) {
                    if (result.failed) {
                        that.btnMove = false;
                        that.$message({
                            "type": "error",
                            "api": "settimezone",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        that.btnMove = false;
                        that.$message({
                            "type": "success",
                            "api": "settimezone",
                            "msg": result.code
                        });
                        setTimeout(function () {
                            that.updateDisplay();
                        }, 1500);
                    } else {
                        that.btnMove = false;
                        that.$message({
                            "type": "error",
                            "api": "settimezone",
                            "msg": result.code,
                            "duration": 2000
                        });
                    }
                });
            },
            displayTimezone: function displayTimezone(continent, city) {
                // Asia
                this.continentSelected = continent;
                this.updatecities();
                // Shanghai
                this.citySelected = city;
            },
            autoSync: function autoSync() {
                $(".routertime-reminder").slideUp();
                // Asia
                var continent = this.userTimeZoneName.split("/")[0];
                // Shanghai
                var city = this.userTimeZoneName.split("/")[1];
                this.displayTimezone(continent, city);
                this.applyDisabled = false;
                this.setTimeZoneApply();
            },
            citySelectedChange: function citySelectedChange() {
                this.applyDisabled = false;
            },
            continentSelectedChange: function continentSelectedChange() {
                this.applyDisabled = false;
                this.updatecities();
            },
            updatecities: function updatecities() {
                this.cityOptions = [];
                var selectedIndex = 0;
                for (var _i = 0; _i < this.continentOptions.length; _i++) {
                    if (this.continentOptions[_i].value == this.continentSelected) {
                        selectedIndex = _i;
                        break;
                    }
                }
                if (selectedIndex > 0) {
                    for (var i = 0; i < this.cities[selectedIndex].length; i++) {
                        var a = this.cities[selectedIndex][i].split("/");
                        var s = a.length == 3 ? "/" + a[2] : "";
                        this.cityOptions.push({
                            value: a[1] + s,
                            text: a[1] + s
                        });
                    }
                    this.citySelected = this.cityOptions[0].value;
                } else {
                    this.citySelected = "";
                    this.applyDisabled = true;
                }
            }
        }
    });
    return vueComponent;
});