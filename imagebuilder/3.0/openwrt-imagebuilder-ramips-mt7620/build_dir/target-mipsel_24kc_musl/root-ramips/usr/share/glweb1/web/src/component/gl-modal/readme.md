this.$store.commit("showModal",{
    title: "你确定",
    message: "确定",
    cb: function(){
        console.log("hello");
    }
})  