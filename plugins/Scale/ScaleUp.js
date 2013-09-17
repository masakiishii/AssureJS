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
        console.log(x, y);

        var mat = ((this.ShapeGroup[0])).transform.baseVal.getItem(0).matrix;
        mat.e = x;
        mat.f = y;

        var X_MARGIN = 50;
        x = x + X_MARGIN;
        this.DocBase.css({ left: x + this.DocBase.width() + "px", top: y + this.DocBase.height() + "px" });
    };

    ScaleUpActionPlugIn.prototype.Delegate = function (caseViewer, case0, serverApi) {
        var self = this;
        this.ScreenManager = caseViewer.Screen;
        $('.node').hover(function (e) {
            var scale = self.ScreenManager.GetScale();
            if (scale < self.THRESHHOLD) {
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

                console.log(oldDocBase.css('left'));
                var left = oldDocBase.css('left');
                var top = oldDocBase.css('top');
                self.SetPosition(Number(left.substr(0, left.length - 2)) + 100 * (1 / scale), Number(top.substr(0, top.length - 2)) - 50 * (1 / scale));

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
