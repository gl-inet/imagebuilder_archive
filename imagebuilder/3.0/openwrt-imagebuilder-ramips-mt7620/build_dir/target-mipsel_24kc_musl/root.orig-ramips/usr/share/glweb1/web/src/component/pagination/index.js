'use strict';

define(['vue', 'text!component/pagination/index.html'], function (Vue, stpl) {
  var vueComponent = Vue.extend({
    template: stpl,
    props: {
      pageCount: {
        type: Number,
        required: true
      },
      initialPage: {
        type: Number,
        default: 0
      },
      forcePage: {
        type: Number
      },
      pageRange: {
        type: Number,
        default: 3
      },
      marginPages: {
        type: Number,
        default: 1
      },
      prevText: {
        type: String,
        default: 'Prev'
      },
      nextText: {
        type: String,
        default: 'Next'
      },
      breakViewText: {
        type: String,
        default: '…'
      },
      containerClass: {
        type: String
      },
      pageClass: {
        type: String
      },
      pageLinkClass: {
        type: String
      },
      prevClass: {
        type: String
      },
      prevLinkClass: {
        type: String
      },
      nextClass: {
        type: String
      },
      nextLinkClass: {
        type: String
      },
      breakViewClass: {
        type: String
      },
      breakViewLinkClass: {
        type: String
      },
      activeClass: {
        type: String,
        default: 'active'
      },
      disabledClass: {
        type: String,
        default: 'disabled'
      },
      noLiSurround: {
        type: Boolean,
        default: false
      },
      firstLastButton: {
        type: Boolean,
        default: false
      },
      firstButtonText: {
        type: String,
        default: 'First'
      },
      lastButtonText: {
        type: String,
        default: 'Last'
      },
      hidePrevNext: {
        type: Boolean,
        default: false
      }
    },
    data: function data() {
      return {
        selected: this.initialPage,
        inputpage: this.selected,
        pagelist: {},
        timer: null
      };
    },
    beforeUpdate: function beforeUpdate() {
      if (this.forcePage === undefined) return;
      if (this.forcePage !== this.selected) {
        this.selected = this.forcePage;
      }
    },
    watch: {
      pageCount: function pageCount(newval) {
        this.selectFirstPage();
      }
    },
    computed: {
      pages: function pages() {
        var _this = this;
        var items = {};
        if (this.pageCount <= this.pageRange) {
          for (var index = 0; index < this.pageCount; index++) {
            var page = {
              index: index,
              content: index + 1,
              selected: index === this.selected
            };
            items[index] = page;
          }
        } else {
          var halfPageRange = Math.floor(this.pageRange / 2);
          var setPageItem = function setPageItem(index) {
            var page = {
              index: index,
              content: index + 1,
              selected: index === _this.selected
            };
            items[index] = page;
          };
          var setBreakView = function setBreakView(index) {
            var breakView = {
              disabled: true,
              breakView: true
            };
            items[index] = breakView;
          };
          // 1st - loop thru low end of margin pages
          for (var i = 0; i < this.marginPages; i++) {
            setPageItem(i);
          }
          // 2nd - loop thru selected range
          var selectedRangeLow = 0;
          if (this.selected - halfPageRange > 0) {
            selectedRangeLow = this.selected - halfPageRange;
          }
          var selectedRangeHigh = selectedRangeLow + this.pageRange - 1;
          if (selectedRangeHigh >= this.pageCount) {
            selectedRangeHigh = this.pageCount - 1;
            selectedRangeLow = selectedRangeHigh - this.pageRange + 1;
          }
          for (var _i = selectedRangeLow; _i <= selectedRangeHigh && _i <= this.pageCount - 1; _i++) {
            setPageItem(_i);
          }
          // Check if there is breakView in the left of selected range
          if (selectedRangeLow > this.marginPages) {
            setBreakView(selectedRangeLow - 1);
          }
          // Check if there is breakView in the right of selected range
          if (selectedRangeHigh + 1 < this.pageCount - this.marginPages) {
            setBreakView(selectedRangeHigh + 1);
          }
          // 3rd - loop thru high end of margin pages
          for (var _i2 = this.pageCount - 1; _i2 >= this.pageCount - this.marginPages; _i2--) {
            setPageItem(_i2);
          }
        }
        return items;
      }
    },
    methods: {
      clickHandler: function clickHandler(selected) {
        this.$emit("click", selected);
      },
      handlePageSelected: function handlePageSelected(selected) {
        if (this.selected === selected) return;
        this.selected = selected;
        this.clickHandler(this.selected + 1);
      },
      handleInput: function handleInput() {
        var that = this;
        if (!this.inputpage) {
          return;
        }
        if (this.inputpage >= this.pageCount) {
          this.inputpage = this.pageCount;
        }
        clearTimeout(this.timer);
        this.timer = setTimeout(function () {
          that.inputpage = null;
        }, 10000);
      },
      handlePageInput: function handlePageInput() {
        var that = this;
        if (!this.inputpage) {
          return;
        }
        if (this.inputpage >= this.pageCount) {
          this.inputpage = this.pageCount;
        }
        this.handlePageSelected(parseInt(this.inputpage) - 1);
        clearTimeout(this.timer);
        this.timer = setTimeout(function () {
          that.inputpage = null;
        }, 10000);
      },
      prevPage: function prevPage() {
        if (this.selected <= 0) return;
        this.selected--;
        this.clickHandler(this.selected + 1);
      },
      nextPage: function nextPage() {
        if (this.selected >= this.pageCount - 1) return;
        this.selected++;
        this.clickHandler(this.selected + 1);
      },
      firstPageSelected: function firstPageSelected() {
        return this.selected === 0;
      },
      lastPageSelected: function lastPageSelected() {
        return this.selected === this.pageCount - 1 || this.pageCount === 0;
      },
      selectFirstPage: function selectFirstPage() {
        this.selected = 0;
        this.clickHandler(this.selected);
      },
      selectLastPage: function selectLastPage() {
        this.selected = this.pageCount - 1;
        this.clickHandler(this.selected);
      }
    }
  });
  return vueComponent;
});