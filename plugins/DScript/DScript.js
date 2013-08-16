var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var DScriptPlugIn = (function (_super) {
    __extends(DScriptPlugIn, _super);
    function DScriptPlugIn(plugInManager) {
        _super.call(this, plugInManager);
        this.plugInManager = plugInManager;
        this.MenuBarContentsPlugIn = new DScriptMenuPlugIn(plugInManager);
    }
    return DScriptPlugIn;
})(AssureIt.PlugIn);

var DScriptMenuPlugIn = (function (_super) {
    __extends(DScriptMenuPlugIn, _super);
    function DScriptMenuPlugIn() {
        _super.apply(this, arguments);
    }
    DScriptMenuPlugIn.prototype.IsEnabled = function (caseViewer, caseModel) {
        return true;
    };

    DScriptMenuPlugIn.prototype.Delegate = function (caseViewer, caseModel, element) {
        console.log("Hello DScript");

        return true;
    };
    return DScriptMenuPlugIn;
})(AssureIt.MenuBarContentsPlugIn);
