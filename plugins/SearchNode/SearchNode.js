var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var SearchNodePlugIn = (function (_super) {
    __extends(SearchNodePlugIn, _super);
    function SearchNodePlugIn(plugInManager) {
        _super.call(this, plugInManager);
        var plugin = new SearchNodeActionPlugIn(plugInManager);
        this.ActionPlugIn = plugin;
        this.MenuBarContentsPlugIn = new SearchNodeMenuPlugIn(plugInManager, plugin);
    }
    return SearchNodePlugIn;
})(AssureIt.PlugInSet);

var SearchNodeMenuPlugIn = (function (_super) {
    __extends(SearchNodeMenuPlugIn, _super);
    function SearchNodeMenuPlugIn(plugInManager, editorPlugIn) {
        _super.call(this, plugInManager);
        this.editorPlugIn = editorPlugIn;
    }
    SearchNodeMenuPlugIn.prototype.IsEnabled = function (caseViewer, caseModel) {
        return true;
    };

    SearchNodeMenuPlugIn.prototype.Delegate = function (caseViewer, caseModel, element, serverApi) {
        return true;
    };
    return SearchNodeMenuPlugIn;
})(AssureIt.MenuBarContentsPlugIn);

var SearchNodeActionPlugIn = (function (_super) {
    __extends(SearchNodeActionPlugIn, _super);
    function SearchNodeActionPlugIn(plugInManager) {
        _super.call(this, plugInManager);
    }
    SearchNodeActionPlugIn.prototype.IsEnabled = function (caseViewer, case0) {
        return true;
    };

    SearchNodeActionPlugIn.prototype.Delegate = function (caseViewer, case0, serverApi) {
        var self = this;

        return true;
    };

    SearchNodeActionPlugIn.prototype.DeleteFromDOM = function () {
    };
    return SearchNodeActionPlugIn;
})(AssureIt.ActionPlugIn);
