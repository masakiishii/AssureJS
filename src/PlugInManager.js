var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var AssureIt;
(function (AssureIt) {
    var PlugIn = (function () {
        function PlugIn() {
        }
        return PlugIn;
    })();
    AssureIt.PlugIn = PlugIn;

    var ActionPlugIn = (function (_super) {
        __extends(ActionPlugIn, _super);
        function ActionPlugIn() {
            _super.apply(this, arguments);
        }
        ActionPlugIn.prototype.IsEnabled = function (caseViewer, case0) {
            return true;
        };

        ActionPlugIn.prototype.Delegate = function (caseViewer, case0, serverApi) {
            return true;
        };

        ActionPlugIn.prototype.ReDraw = function (caseViewer) {
            var backgroundlayer = document.getElementById("background");
            var shapelayer = document.getElementById("layer0");
            var contentlayer = document.getElementById("layer1");
            var controllayer = document.getElementById("layer2");
            var offset = $("#layer1").offset();

            var Screen = new AssureIt.ScreenManager(shapelayer, contentlayer, controllayer, backgroundlayer);
            caseViewer.Draw(Screen);
            caseViewer.Resize();
            caseViewer.Draw(Screen);
            Screen.SetOffset(offset.left, offset.top);
        };
        return ActionPlugIn;
    })(PlugIn);
    AssureIt.ActionPlugIn = ActionPlugIn;

    var CheckerPlugIn = (function (_super) {
        __extends(CheckerPlugIn, _super);
        function CheckerPlugIn() {
            _super.apply(this, arguments);
        }
        CheckerPlugIn.prototype.IsEnabled = function (caseModel, EventType) {
            return true;
        };

        CheckerPlugIn.prototype.Delegate = function (caseModel, y, z) {
            return true;
        };
        return CheckerPlugIn;
    })(PlugIn);
    AssureIt.CheckerPlugIn = CheckerPlugIn;

    var HTMLRenderPlugIn = (function (_super) {
        __extends(HTMLRenderPlugIn, _super);
        function HTMLRenderPlugIn() {
            _super.apply(this, arguments);
        }
        HTMLRenderPlugIn.prototype.IsEnabled = function (caseViewer, caseModel) {
            return true;
        };

        HTMLRenderPlugIn.prototype.Delegate = function (caseViewer, caseModel, element) {
            return true;
        };
        return HTMLRenderPlugIn;
    })(PlugIn);
    AssureIt.HTMLRenderPlugIn = HTMLRenderPlugIn;

    var SVGRenderPlugIn = (function (_super) {
        __extends(SVGRenderPlugIn, _super);
        function SVGRenderPlugIn() {
            _super.apply(this, arguments);
        }
        SVGRenderPlugIn.prototype.IsEnabled = function (caseViewer, elementShape) {
            return true;
        };

        SVGRenderPlugIn.prototype.Delegate = function (caseViewer, elementShape) {
            return true;
        };
        return SVGRenderPlugIn;
    })(PlugIn);
    AssureIt.SVGRenderPlugIn = SVGRenderPlugIn;

    var PlugInManager = (function () {
        function PlugInManager() {
            this.ActionPlugIns = [];
            this.DefaultCheckerPlugIns = [];
            this.CheckerPlugInMap = {};
            this.DefaultHTMLRenderPlugIns = [];
            this.HTMLRenderPlugInMap = {};
            this.SVGRenderPlugInMap = {};
        }
        PlugInManager.prototype.AddActionPlugIn = function (key, actionPlugIn) {
            this.ActionPlugIns.push(actionPlugIn);
        };

        PlugInManager.prototype.RegisterActionEventListeners = function (CaseViewer, case0, serverApi) {
            for (var i = 0; i < this.ActionPlugIns.length; i++) {
                if (this.ActionPlugIns[i].IsEnabled(CaseViewer, case0)) {
                    this.ActionPlugIns[i].Delegate(CaseViewer, case0, serverApi);
                }
            }
        };

        PlugInManager.prototype.AddHTMLRenderPlugIn = function (key, HTMLRenderPlugIn) {
            this.HTMLRenderPlugInMap[key] = HTMLRenderPlugIn;
        };

        PlugInManager.prototype.AddSVGRenderPlugIn = function (key, SVGRenderPlugIn) {
            this.SVGRenderPlugInMap[key] = SVGRenderPlugIn;
        };
        return PlugInManager;
    })();
    AssureIt.PlugInManager = PlugInManager;
})(AssureIt || (AssureIt = {}));
