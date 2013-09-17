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
        this.THRESHHOLD = 0.5;
        this.ShapeGroup = null;
        this.DocBase = null;
        _super.call(this, plugInManager);
    }
    ScaleUpActionPlugIn.prototype.IsEnabled = function (caseViewer, case0) {
        return true;
    };

    ScaleUpActionPlugIn.prototype.SetPosition = function (x, y) {
        var mat = ((this.ShapeGroup[0])).transform.baseVal.getItem(0).matrix;
        mat.e = 200;
        mat.f = 200;

        this.DocBase.css({ left: "200px", top: "200px" });
    };

    ScaleUpActionPlugIn.prototype.Delegate = function (caseViewer, case0, serverApi) {
        var self = this;
        this.ScreenManager = caseViewer.Screen;
        $('.node').hover(function () {
            if (self.ScreenManager.GetScale() < self.THRESHHOLD) {
                var label = $(this).children('h4').text();
                var view = caseViewer.ViewMap[label];
                var oldShapeGroup = view.SVGShape.ShapeGroup;
                var oldDocBase = view.HTMLDoc.DocBase;

                self.ShapeGroup = $(oldShapeGroup).clone();
                self.ShapeGroup.attr("transform", "scale(" + (1 / caseViewer.Screen.GetScale()) + ")");
                self.ShapeGroup.appendTo("#layer0");

                self.DocBase = oldDocBase.clone();
                self.DocBase.attr("style", self.DocBase.attr("style") + "-webkit-transform: scale(" + (1 / caseViewer.Screen.GetScale()) + ")");
                self.DocBase.appendTo("#layer1");

                self.SetPosition(1, 1);

                return;
            }
        }, function () {
            if (self.ShapeGroup) {
                self.ShapeGroup.remove();
                self.ShapeGroup = null;
                self.DocBase.remove();
                self.DocBase = null;
            }
        });
        return true;
    };
    return ScaleUpActionPlugIn;
})(AssureIt.ActionPlugIn);
