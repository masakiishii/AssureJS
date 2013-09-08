var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var SimplePatternPlugIn = (function (_super) {
    __extends(SimplePatternPlugIn, _super);
    function SimplePatternPlugIn(plugInManager) {
        _super.call(this, plugInManager);
        this.plugInManager = plugInManager;
        this.PatternPlugIn = new SimplePatternInnerPlugIn(plugInManager);
    }
    return SimplePatternPlugIn;
})(AssureIt.PlugInSet);

var SimplePatternInnerPlugIn = (function (_super) {
    __extends(SimplePatternInnerPlugIn, _super);
    function SimplePatternInnerPlugIn() {
        _super.apply(this, arguments);
    }
    SimplePatternInnerPlugIn.prototype.IsEnabled = function (caseViewer, caseModel) {
        return true;
    };

    SimplePatternInnerPlugIn.prototype.Delegate = function (caseModel) {
        return true;
    };
    return SimplePatternInnerPlugIn;
})(AssureIt.PatternPlugIn);
