"use strict";

define(["vue", "text!component/gl-upload-file/index.html"], function (Vue, stpl) {
    var vueComponent = Vue.extend({
        name: "gl-upload-file",
        template: stpl,
        props: {
            status: {
                type: String,
                required: true,
                default: ''
            },
            value: {
                type: String,
                required: true,
                default: null
            },
            error: {
                type: String,
                required: true,
                default: ""
            },
            isVpn: {
                type: Boolean,
                default: false
            },
            errorMsg: {
                type: String,
                default: ''
            }
        },
        data: function data() {
            return {
                fileName: "",
                upgradeBoxClassObj: {
                    "has-advanced-upload": true
                },
                droppedFiles: null
            };
        },
        watch: {
            status: function status(newval, oldval) {
                var that = this;
                if (newval == "") {
                    this.upgradeBoxClassObj = {
                        "has-advanced-upload": true
                    };
                } else if (newval == "uploading") {
                    this.$set(this.upgradeBoxClassObj, "is-uploading", true);
                    this.$set(this.upgradeBoxClassObj, "is-error", false);
                    this.$set(this.upgradeBoxClassObj, "is-success", false);
                } else if (newval == "error") {
                    that.$set(that.upgradeBoxClassObj, "is-uploading", false);
                    that.$set(that.upgradeBoxClassObj, "is-success", false);
                    that.$set(that.upgradeBoxClassObj, "is-error", true);
                    that.$set(that.upgradeBoxClassObj, "has-advanced-upload", true);
                } else if (newval == "success") {
                    that.$set(that.upgradeBoxClassObj, "is-uploading", false);
                    that.$set(that.upgradeBoxClassObj, "is-success", true);
                    that.$set(that.upgradeBoxClassObj, "is-error", false);
                    this.zoom = true;
                } else if (newval == "dragover") {
                    this.$set(this.upgradeBoxClassObj, "is-dragover", true);
                    this.$set(this.upgradeBoxClassObj, "is-success", false);
                    this.$set(this.upgradeBoxClassObj, "is-error", false);
                } else if (newval == "dragend") {
                    this.$set(this.upgradeBoxClassObj, "is-dragover", false);
                }
            }
        },
        methods: {
            onDragOverEnter: function onDragOverEnter() {
                this.stauts = "dragover";
            },
            onLeaveEndDrop: function onLeaveEndDrop(event) {
                this.stauts = "dragend";
                if (event.type == "drop") {
                    this.droppedFiles = event.dataTransfer.files;
                    this.onSubmit(event);
                }
            },
            onSubmit: function onSubmit(event) {
                event.preventDefault();
                var elmForm = $(".box");
                var that = this;
                var ajaxData = "";
                var flieSize = 0;
                if (this.upgradeBoxClassObj["is-uploading"] != null && this.upgradeBoxClassObj["is-uploading"] == true) {
                    return false;
                }
                if (this.droppedFiles) {
                    ajaxData = new FormData(elmForm[0]);
                    flieSize = this.droppedFiles[0].size || 0;
                    Array.prototype.forEach.call(this.droppedFiles, function (file) {
                        ajaxData.append("file", file);
                        that.fileName = file.name;
                    });
                } else {
                    flieSize = $('#file')[0].files[0].size || 0;
                    ajaxData = new FormData();
                    ajaxData.append('file', $('#file')[0].files[0]);
                }
                this.droppedFiles = null;
                var suffixName = that.fileName.split(".");
                var last = suffixName[suffixName.length - 1];
                // 支持的文件类型
                var tp = "bin,img,zip,tar,ovpn,gz";
                var rs = tp.indexOf(last);
                var errData = {};
                // if (flieSize == 3996) {
                //     errData.errMsg = 'Error File'
                //     this.$emit("upload", errData);
                //     return
                // }
                if (rs >= 0) {
                    this.$emit("upload", ajaxData);
                } else {
                    errData.errMsg = 'Invalid file';
                    this.$emit("upload", errData);
                    // 文件类型不支持
                    // that.status = "error";
                    // that.$message({
                    //     "type": "error",
                    //     "api": "upload",
                    //     "msg": "-3001"
                    // });
                }
            },
            onChange: function onChange(event) {
                var filenameArray = $("#file").val().split("\\");
                this.fileName = filenameArray[filenameArray.length - 1];
                if ($("#file").val() != null && $("#file").val() != "") {
                    this.onSubmit(event);
                    $("#file").val("");
                }
            }
        }
    });
    return vueComponent;
});