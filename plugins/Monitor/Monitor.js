var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
function extractVariableFromCondition(condition) {
    var text = condition;
    text.replace(/<=/g, " ");
    text.replace(/>=/g, " ");
    text.replace(/</g, " ");
    text.replace(/>/g, " ");

    var words = text.split(" ");
    var variables = [];

    for (var i = 0; i < words.length; i++) {
        if (!$.isNumeric(words[i])) {
            variables.push(words[i]);
        }
    }

    if (variables.length != 1) {
    }

    return variables[0];
}

function hasMonitorInfo(node) {
    if (node.Type != AssureIt.NodeType.Context)
        return false;
    if (node.Parent.Type != AssureIt.NodeType.Goal)
        return false;

    var notes = node.Notes;

    for (var i = 0; i < notes.length; i++) {
        var body = notes[i].Body;

        if ("Location" in body && "Monitor" in body) {
            return true;
        }
    }

    return false;
}

function appendNode(caseViewer, node, type) {
    var viewMap = caseViewer.ViewMap;
    var view = viewMap[node.Label];
    var case0 = caseViewer.Source;
    var newNode = new AssureIt.NodeModel(case0, node, type, null, null);
    case0.SaveIdCounterMax(case0.ElementTop);
    viewMap[newNode.Label] = new AssureIt.NodeView(caseViewer, newNode);
    viewMap[newNode.Label].ParentShape = viewMap[node.Label];
    return newNode;
}

function isEmptyEvidenceNode(node) {
    if (node.Type == AssureIt.NodeType.Evidence && node.Statement == "" && node.Annotations.length == 0 && node.Notes.length == 0 && node.Children.length == 0) {
        return true;
    }

    return false;
}

function getEmptyEvidenceNode(node) {
    for (var i = 0; i < node.Children.length; i++) {
        if (isEmptyEvidenceNode(node.Children[i]))
            return node.Children[i];
    }

    return null;
}

function isContextNode(node) {
    if (node.Type == AssureIt.NodeType.Context) {
        return true;
    }

    return false;
}

function getContextNode(node) {
    for (var i = 0; i < node.Children.length; i++) {
        if (isContextNode(node.Children[i]))
            return node.Children[i];
    }

    return null;
}

var MonitorNode = (function () {
    function MonitorNode(Location, Type, LatestDataMap, Condition, EvidenceNode, Viewer, HTMLRenderFunction, SVGRenderFunction) {
        this.Type = Type;
        this.Location = Location;
        this.LatestDataMap = LatestDataMap;
        this.Condition = Condition;
        this.EvidenceNode = EvidenceNode;
        this.Viewer = Viewer;
        this.HTMLRenderFunction = HTMLRenderFunction;
        this.SVGRenderFunction = SVGRenderFunction;
    }
    MonitorNode.prototype.SetCondition = function (Condition) {
        this.Condition = Condition;
    };

    MonitorNode.prototype.GetLatestData = function () {
        return this.LatestDataMap[this.Type + "@" + this.Location];
    };

    MonitorNode.prototype.EvaluateCondition = function (latestData) {
        var script = "var " + this.Type + "=" + latestData.data + ";";
        script += this.Condition + ";";
        return eval(script);
    };

    MonitorNode.prototype.EditResult = function (result) {
        if (this.IsAlreadyFailed())
            return;

        var evidenceNode = this.EvidenceNode;

        var latestData = this.GetLatestData();
        var evidenceNoteBody = {};

        if (result) {
            evidenceNoteBody["Status"] = "Success";
            evidenceNoteBody[this.Type] = latestData.data;
            evidenceNoteBody["Timestamp"] = latestData.timestamp;
        } else {
            evidenceNoteBody["Status"] = "Fail";
            evidenceNoteBody[this.Type] = latestData.data;
            evidenceNoteBody["Timestamp"] = latestData.timestamp;

            var contextNode = getContextNode(evidenceNode);
            if (contextNode == null) {
                contextNode = appendNode(this.Viewer, evidenceNode, AssureIt.NodeType.Context);
            }

            var contextNoteBody = {};
            contextNoteBody["Manager"] = latestData.authid;
            contextNode.Notes = [{ "Name": "Notes", "Body": contextNoteBody }];
        }

        evidenceNode.Notes = [{ "Name": "Notes", "Body": evidenceNoteBody }];
    };

    MonitorNode.prototype.IsAlreadyFailed = function () {
        var notes = this.EvidenceNode.Notes;

        for (var i = 0; i < notes.length; i++) {
            var body = notes[i].Body;
            if (body["Status"] == "Fail")
                return true;
        }

        return false;
    };

    MonitorNode.prototype.Update = function () {
        var element = this.Viewer.ViewMap[this.EvidenceNode.Label].HTMLDoc.DocBase;
        var view = this.Viewer.ViewMap[this.EvidenceNode.Label];
        this.HTMLRenderFunction(this.Viewer, this.EvidenceNode, element);
        this.SVGRenderFunction(this.Viewer, view);

        var contextNode = getContextNode(this.EvidenceNode);
        if (contextNode != null) {
            var element = this.Viewer.ViewMap[contextNode.Label].HTMLDoc.DocBase;
            var view = this.Viewer.ViewMap[contextNode.Label];
            this.HTMLRenderFunction(this.Viewer, contextNode, element);
            this.SVGRenderFunction(this.Viewer, view);
        }
    };
    return MonitorNode;
})();

var MonitorManager = (function () {
    function MonitorManager(Viewer) {
        this.RECAPI = new AssureIt.RECAPI("http://54.250.206.119/rec");
        this.LatestDataMap = {};
        this.MonitorNodeMap = {};
        this.Viewer = Viewer;
        this.HTMLRenderFunction = this.Viewer.GetPlugInHTMLRender("note");
        this.SVGRenderFunction = this.Viewer.GetPlugInSVGRender("monitor");
    }
    MonitorManager.prototype.StartMonitor = function (interval) {
        var self = this;

        this.Timer = setInterval(function () {
            self.CollectLatestData();

            for (var key in self.MonitorNodeMap) {
                var monitorNode = self.MonitorNodeMap[key];

                var latestData = monitorNode.GetLatestData();
                if (latestData == null)
                    continue;

                var result = monitorNode.EvaluateCondition(latestData);
                monitorNode.EditResult(result);

                monitorNode.Update();
            }

            self.Viewer.Draw();
        }, interval);
    };

    MonitorManager.prototype.SetMonitor = function (contextNode) {
        var notes = contextNode.Notes;
        var locations = [];
        var conditions = [];

        for (var i = 0; i < notes.length; i++) {
            var body = notes[i].Body;

            if ("Location" in body && "Monitor" in body) {
                locations.push(notes[i].Body.Location);
                conditions.push(notes[i].Body.Monitor);
            }
        }

        var location = locations[0];
        var condition = conditions[0];
        var type = extractVariableFromCondition(condition);
        var latestDataKey = type + "@" + location;

        this.LatestDataMap[type + "@" + location] = null;

        var monitorNode = this.MonitorNodeMap[contextNode.Label];

        if (monitorNode == null) {
            var evidenceNode = getEmptyEvidenceNode(contextNode.Parent);
            if (evidenceNode == null) {
                evidenceNode = appendNode(this.Viewer, contextNode.Parent, AssureIt.NodeType.Evidence);
            }

            this.MonitorNodeMap[contextNode.Label] = new MonitorNode(location, type, this.LatestDataMap, condition, evidenceNode, this.Viewer, this.HTMLRenderFunction, this.SVGRenderFunction);
        } else {
            monitorNode.SetCondition(condition);
        }
    };

    MonitorManager.prototype.CollectLatestData = function () {
        for (var key in this.LatestDataMap) {
            var type = key.split("@")[0];
            var location = key.split("@")[1];
            var latestData = this.RECAPI.getLatestData(location, type);
            if (latestData == null) {
                console.log("latest data is null");
            }
            this.LatestDataMap[key] = latestData;
        }
    };
    return MonitorManager;
})();

var MonitorPlugIn = (function (_super) {
    __extends(MonitorPlugIn, _super);
    function MonitorPlugIn(plugInManager) {
        _super.call(this, plugInManager);
        this.plugInManager = plugInManager;
        this.HTMLRenderPlugIn = new MonitorHTMLRenderPlugIn(plugInManager);
        this.SVGRenderPlugIn = new MonitorSVGRenderPlugIn(plugInManager);
    }
    return MonitorPlugIn;
})(AssureIt.PlugInSet);

var MonitorHTMLRenderPlugIn = (function (_super) {
    __extends(MonitorHTMLRenderPlugIn, _super);
    function MonitorHTMLRenderPlugIn(plugInManager) {
        _super.call(this, plugInManager);
        this.IsFirstCalled = true;
        this.MonitorManager = null;
    }
    MonitorHTMLRenderPlugIn.prototype.IsEnabled = function (caseViewer, nodeModel) {
        return true;
    };

    MonitorHTMLRenderPlugIn.prototype.Delegate = function (caseViewer, nodeModel, element) {
        if (this.IsFirstCalled) {
            this.MonitorManager = new MonitorManager(caseViewer);
            this.MonitorManager.StartMonitor(5000);
            this.IsFirstCalled = false;
        }

        if (!hasMonitorInfo(nodeModel))
            return true;

        this.MonitorManager.SetMonitor(nodeModel);

        return true;
    };
    return MonitorHTMLRenderPlugIn;
})(AssureIt.HTMLRenderPlugIn);

var MonitorSVGRenderPlugIn = (function (_super) {
    __extends(MonitorSVGRenderPlugIn, _super);
    function MonitorSVGRenderPlugIn() {
        _super.apply(this, arguments);
    }
    MonitorSVGRenderPlugIn.prototype.IsEnabled = function (caseViewer, nodeView) {
        return true;
    };

    MonitorSVGRenderPlugIn.prototype.Delegate = function (caseViewer, nodeView) {
        var nodeModel = nodeView.Source;

        if (nodeModel.Type == AssureIt.NodeType.Evidence) {
            var notes = nodeModel.Notes;

            for (var i = 0; i < notes.length; i++) {
                var body = notes[i].Body;

                if (body["Status"] == "Fail") {
                    var fill = "#FF9999";
                    var stroke = "none";

                    nodeView.SVGShape.SetColor(fill, stroke);
                    blushAllAncestor(nodeModel, fill, stroke);
                }
            }
        }

        return true;

        function blushAllAncestor(node, fill, stroke) {
            if (node != null) {
                caseViewer.ViewMap[node.Label].SVGShape.SetColor(fill, stroke);
                blushAllAncestor(node.Parent, fill, stroke);
                blushContext(node, fill, stroke);
            }
        }

        function blushContext(node, fill, stroke) {
            for (var i = 0; i < node.Children.length; i++) {
                if (node.Children[i].Type == AssureIt.NodeType.Context) {
                    var label = node.Children[i].Label;
                    var nodeView = caseViewer.ViewMap[label];
                    nodeView.SVGShape.SetColor(fill, stroke);
                }
            }
        }
    };
    return MonitorSVGRenderPlugIn;
})(AssureIt.SVGRenderPlugIn);
