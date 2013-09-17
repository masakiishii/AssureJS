var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ScaleUpPlugIn = (function (_super) {
    __extends(ScaleUpPlugIn, _super);
    function ScaleUpPlugIn(plugInManager) {
        _super.call(this, plugInManager);
        this.ActionPlugIn = new ScaleUpActionPlugIn(plugInManager);
    }
    return ScaleUpPlugIn;
})(AssureIt.PlugInSet);

var ScaleUpActionPlugIn = (function (_super) {
    __extends(ScaleUpActionPlugIn, _super);
    function ScaleUpActionPlugIn(plugInManager) {
        this.ScreenManager = null;
        _super.call(this, plugInManager);
    }
    ScaleUpActionPlugIn.prototype.IsEnabled = function (caseViewer, case0) {
        return true;
    };

    ScaleUpActionPlugIn.prototype.Delegate = function (caseViewer, case0, serverApi) {
        var self = this;
        this.ScreenManager = caseViewer.Screen;
        $('.node').hover(function () {
            console.log(self.ScreenManager.GetScaleRate());
            if (self.ScreenManager.GetScaleRate() < 1.0) {
                console.log("bye");
                return;
            }
            console.log("hi");
        });
        return true;
    };
    return ScaleUpActionPlugIn;
})(AssureIt.ActionPlugIn);
