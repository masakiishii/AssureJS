var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var AssureIt;
(function (AssureIt) {
    var PlugIn = (function () {
        function PlugIn(plugInManager) {
            this.plugInManager = plugInManager;
            this.ActionPlugIn = null;
            this.CheckerPlugIn = null;
            this.HTMLRenderPlugIn = null;
            this.SVGRenderPlugIn = null;
        }
        return PlugIn;
    })();
    AssureIt.PlugIn = PlugIn;

    var AbstractPlugIn = (function () {
        function AbstractPlugIn(plugInManager) {
            this.plugInManager = plugInManager;
        }
        AbstractPlugIn.prototype.DeleteFromDOM = function () {
        };

        AbstractPlugIn.prototype.DisableEvent = function (caseViewer, case0, serverApi) {
        };
        return AbstractPlugIn;
    })();
    AssureIt.AbstractPlugIn = AbstractPlugIn;

    var ActionPlugIn = (function (_super) {
        __extends(ActionPlugIn, _super);
        function ActionPlugIn(plugInManager) {
            _super.call(this, plugInManager);
            this.plugInManager = plugInManager;
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
    })(AbstractPlugIn);
    AssureIt.ActionPlugIn = ActionPlugIn;

    var CheckerPlugIn = (function (_super) {
        __extends(CheckerPlugIn, _super);
        function CheckerPlugIn(plugInManager) {
            _super.call(this, plugInManager);
            this.plugInManager = plugInManager;
        }
        CheckerPlugIn.prototype.IsEnabled = function (caseModel, EventType) {
            return true;
        };

        CheckerPlugIn.prototype.Delegate = function (caseModel, y, z) {
            return true;
        };
        return CheckerPlugIn;
    })(AbstractPlugIn);
    AssureIt.CheckerPlugIn = CheckerPlugIn;

    var HTMLRenderPlugIn = (function (_super) {
        __extends(HTMLRenderPlugIn, _super);
        function HTMLRenderPlugIn(plugInManager) {
            _super.call(this, plugInManager);
            this.plugInManager = plugInManager;
        }
        HTMLRenderPlugIn.prototype.IsEnabled = function (caseViewer, caseModel) {
            return true;
        };

        HTMLRenderPlugIn.prototype.Delegate = function (caseViewer, caseModel, element) {
            return true;
        };
        return HTMLRenderPlugIn;
    })(AbstractPlugIn);
    AssureIt.HTMLRenderPlugIn = HTMLRenderPlugIn;

    var SVGRenderPlugIn = (function (_super) {
        __extends(SVGRenderPlugIn, _super);
        function SVGRenderPlugIn(plugInManager) {
            _super.call(this, plugInManager);
            this.plugInManager = plugInManager;
        }
        SVGRenderPlugIn.prototype.IsEnabled = function (caseViewer, elementShape) {
            return true;
        };

        SVGRenderPlugIn.prototype.Delegate = function (caseViewer, elementShape) {
            return true;
        };
        return SVGRenderPlugIn;
    })(AbstractPlugIn);
    AssureIt.SVGRenderPlugIn = SVGRenderPlugIn;

    var PlugInManager = (function () {
        function PlugInManager() {
            this.ActionPlugInMap = {};
            this.CheckerPlugInMap = {};
            this.HTMLRenderPlugInMap = {};
            this.SVGRenderPlugInMap = {};
            this.UILayer = [];
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
                } else {
                    this.ActionPlugInMap[key].DisableEvent(CaseViewer, case0, serverApi);
                }
            }
        };

        PlugInManager.prototype.SetHTMLRenderPlugIn = function (key, HTMLRenderPlugIn) {
            this.HTMLRenderPlugInMap[key] = HTMLRenderPlugIn;
        };

        PlugInManager.prototype.SetSVGRenderPlugIn = function (key, SVGRenderPlugIn) {
            this.SVGRenderPlugInMap[key] = SVGRenderPlugIn;
        };

        PlugInManager.prototype.UseUILayer = function (plugin) {
            var beforePlugin = this.UILayer.pop();
            if (beforePlugin != plugin && beforePlugin) {
                beforePlugin.DeleteFromDOM();
            }
            this.UILayer.push(plugin);
        };

        PlugInManager.prototype.UnuseUILayer = function (plugin) {
            var beforePlugin = this.UILayer.pop();
            if (beforePlugin) {
                beforePlugin.DeleteFromDOM();
            }
        };
        return PlugInManager;
    })();
    AssureIt.PlugInManager = PlugInManager;
})(AssureIt || (AssureIt = {}));
