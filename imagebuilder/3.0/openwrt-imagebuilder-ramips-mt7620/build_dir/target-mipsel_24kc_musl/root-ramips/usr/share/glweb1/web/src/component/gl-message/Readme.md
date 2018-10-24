#message组件

> 使用方法：

    1.需要在入口文件中,引入'comonent/gl-message/index'包
    2.在Vue的原型上添加$message, Vue.prototype.$message = message
    3.在路由页面中调用this.$message方法即可

>例如：

    <div id="btn">点击提示</div>

    $(function() {
        $("#btn").click({
            this.$message({
                type:       "提示类型",
                duration:   "提示语停留时间",
                msg:        "要提示的内容",
                isShow:     "是否显示关系按钮"
            })
        })
    })
        
    
   