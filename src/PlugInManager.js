var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var AssureIt;
(function (AssureIt) {
    var PlugInSet = (function () {
        function PlugInSet(plugInManager) {
            this.plugInManager = plugInManager;
            this.ActionPlugIn = null;
            this.CheckerPlugIn = null;
            this.HTMLRenderPlugIn = null;
            this.SVGRenderPlugIn = null;
            this.MenuBarContentsPlugIn = null;
            this.LayoutEnginePlugIn = null;
            this.PatternPlugIn = null;
        }
        return PlugInSet;
    })();
    AssureIt.PlugInSet = PlugInSet;

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

    var MenuBarContentsPlugIn = (function (_super) {
        __extends(MenuBarContentsPlugIn, _super);
        function MenuBarContentsPlugIn(plugInManager) {
            _super.call(this, plugInManager);
            this.plugInManager = plugInManager;
        }
        MenuBarContentsPlugIn.prototype.IsEnabled = function (caseViewer, caseModel) {
            return true;
        };

        MenuBarContentsPlugIn.prototype.Delegate = function (caseViewer, caseModel, element, serverApi) {
            return true;
        };
        return MenuBarContentsPlugIn;
    })(AbstractPlugIn);
    AssureIt.MenuBarContentsPlugIn = MenuBarContentsPlugIn;

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

    var LayoutEnginePlugIn = (function (_super) {
        __extends(LayoutEnginePlugIn, _super);
        function LayoutEnginePlugIn(plugInManager) {
            _super.call(this, plugInManager);
            this.plugInManager = plugInManager;
        }
        LayoutEnginePlugIn.prototype.Init = function (ViewMap, Element, x, y, ElementWidth) {
        };

        LayoutEnginePlugIn.prototype.LayoutAllView = function (ElementTop, x, y) {
        };

        LayoutEnginePlugIn.prototype.GetContextIndex = function (Node) {
            for (var i = 0; i < Node.Children.length; i++) {
                if (Node.Children[i].Type == AssureIt.NodeType.Context) {
                    return i;
                }
            }
            return -1;
        };
        return LayoutEnginePlugIn;
    })(AbstractPlugIn);
    AssureIt.LayoutEnginePlugIn = LayoutEnginePlugIn;

    var PatternPlugIn = (function (_super) {
        __extends(PatternPlugIn, _super);
        function PatternPlugIn(plugInManager) {
            _super.call(this, plugInManager);
            this.plugInManager = plugInManager;
        }
        PatternPlugIn.prototype.IsEnabled = function (caseViewer, caseModel) {
            return true;
        };

        PatternPlugIn.prototype.Delegate = function (caseModel) {
            return true;
        };
        return PatternPlugIn;
    })(AbstractPlugIn);
    AssureIt.PatternPlugIn = PatternPlugIn;

    var PlugInManager = (function () {
        function PlugInManager(basepath) {
            this.basepath = basepath;
            this.ActionPlugInMap = {};
            this.CheckerPlugInMap = {};
            this.HTMLRenderPlugInMap = {};
            this.SVGRenderPlugInMap = {};
            this.MenuBarContentsPlugInMap = {};
            this.LayoutEnginePlugInMap = {};
            this.PatternPlugInMap = {};
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
            if (plugIn.MenuBarContentsPlugIn) {
                this.SetMenuBarContentsPlugIn(key, plugIn.MenuBarContentsPlugIn);
            }
            if (plugIn.LayoutEnginePlugIn) {
                this.SetLayoutEnginePlugIn(key, plugIn.LayoutEnginePlugIn);
            }
            if (plugIn.PatternPlugIn) {
                this.SetPatternPlugIn(key, plugIn.PatternPlugIn);
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

        PlugInManager.prototype.SetMenuBarContentsPlugIn = function (key, MenuBarContentsPlugIn) {
            this.MenuBarContentsPlugInMap[key] = MenuBarContentsPlugIn;
        };

        PlugInManager.prototype.SetUseLayoutEngine = function (key) {
            this.UsingLayoutEngine = key;
        };

        PlugInManager.prototype.SetLayoutEnginePlugIn = function (key, LayoutEnginePlugIn) {
            this.LayoutEnginePlugInMap[key] = LayoutEnginePlugIn;
        };

        PlugInManager.prototype.GetLayoutEngine = function () {
            return this.LayoutEnginePlugInMap[this.UsingLayoutEngine];
        };

        PlugInManager.prototype.SetPatternPlugIn = function (key, PatternPlugIn) {
            this.PatternPlugInMap[key] = PatternPlugIn;
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

        PlugInManager.prototype.InvokePlugInMenuBarContents = function (caseViewer, caseModel, DocBase, serverApi) {
            var pluginMap = caseViewer.pluginManager.MenuBarContentsPlugInMap;
            for (var key in pluginMap) {
                var contents = this.MenuBarContentsPlugInMap[key];
                if (contents.IsEnabled(caseViewer, caseModel)) {
                    contents.Delegate(caseViewer, caseModel, DocBase, serverApi);
                }
            }
        };
        return PlugInManager;
    })();
    AssureIt.PlugInManager = PlugInManager;
})(AssureIt || (AssureIt = {}));
