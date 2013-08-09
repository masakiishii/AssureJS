var AssureIt;
(function (AssureIt) {
    var PlugIn = (function () {
        function PlugIn() {
            this.ActionPlugIn = null;
            this.CheckerPlugIn = null;
            this.HTMLRenderPlugIn = null;
            this.SVGRenderPlugIn = null;
        }
        return PlugIn;
    })();
    AssureIt.PlugIn = PlugIn;

    var ActionPlugIn = (function () {
        function ActionPlugIn() {
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
    })();
    AssureIt.ActionPlugIn = ActionPlugIn;

    var CheckerPlugIn = (function () {
        function CheckerPlugIn() {
        }
        CheckerPlugIn.prototype.IsEnabled = function (caseModel, EventType) {
            return true;
        };

        CheckerPlugIn.prototype.Delegate = function (caseModel, y, z) {
            return true;
        };
        return CheckerPlugIn;
    })();
    AssureIt.CheckerPlugIn = CheckerPlugIn;

    var HTMLRenderPlugIn = (function () {
        function HTMLRenderPlugIn() {
        }
        HTMLRenderPlugIn.prototype.IsEnabled = function (caseViewer, caseModel) {
            return true;
        };

        HTMLRenderPlugIn.prototype.Delegate = function (caseViewer, caseModel, element) {
            return true;
        };
        return HTMLRenderPlugIn;
    })();
    AssureIt.HTMLRenderPlugIn = HTMLRenderPlugIn;

    var SVGRenderPlugIn = (function () {
        function SVGRenderPlugIn() {
        }
        SVGRenderPlugIn.prototype.IsEnabled = function (caseViewer, elementShape) {
            return true;
        };

        SVGRenderPlugIn.prototype.Delegate = function (caseViewer, elementShape) {
            return true;
        };
        return SVGRenderPlugIn;
    })();
    AssureIt.SVGRenderPlugIn = SVGRenderPlugIn;

    var PlugInManager = (function () {
        function PlugInManager() {
            this.ActionPlugInMap = {};
            this.CheckerPlugInMap = {};
            this.HTMLRenderPlugInMap = {};
            this.SVGRenderPlugInMap = {};
        }
        PlugInManager.prototype.SetPlugIn = function (key, plugIn) {
            if (plugIn.ActionPlugIn) {
                this.SetActionPlugIn(key, plugIn.ActionPlugIn);
            }
            if (plugIn.HTMLRenderPlugIn) {
                this.SetHTMLRenderPlugIn(key, plugIn.HTMLRenderPlugIn);
            }
            if (plugIn.SVGRenderPlugIn) {
                this.SetSVGRenderPlugIn(key, plugIn.SVGRenderPlugIn);
            }
        };

        PlugInManager.prototype.SetActionPlugIn = function (key, actionPlugIn) {
            this.ActionPlugInMap[key] = actionPlugIn;
        };

        PlugInManager.prototype.RegisterActionEventListeners = function (CaseViewer, case0, serverApi) {
            for (var key in this.ActionPlugInMap) {
                if (this.ActionPlugInMap[key].IsEnabled(CaseViewer, case0)) {
                    this.ActionPlugInMap[key].Delegate(CaseViewer, case0, serverApi);
                }
            }
        };

        PlugInManager.prototype.SetHTMLRenderPlugIn = function (key, HTMLRenderPlugIn) {
            this.HTMLRenderPlugInMap[key] = HTMLRenderPlugIn;
        };

        PlugInManager.prototype.SetSVGRenderPlugIn = function (key, SVGRenderPlugIn) {
            this.SVGRenderPlugInMap[key] = SVGRenderPlugIn;
        };
        return PlugInManager;
    })();
    AssureIt.PlugInManager = PlugInManager;
})(AssureIt || (AssureIt = {}));
