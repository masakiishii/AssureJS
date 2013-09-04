var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
function hasMonitorInfo(node) {
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
    var newNode = new AssureIt.NodeModel(case0, view.Source, type, null, null);
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

var MonitorManager = (function () {
    function MonitorManager(Viewer) {
        this.RECAPI = new AssureIt.RECAPI("http://54.250.206.119/rec");
        this.LatestDataMap = {};
        this.ConditionMap = {};
        this.EvidenceNodeMap = {};
        this.Viewer = Viewer;
        this.HTMLRenderFunction = this.Viewer.GetPlugInHTMLRender("note");
        this.SVGRenderFunction = this.Viewer.GetPlugInSVGRender("monitor");
    }
    MonitorManager.prototype.StartMonitor = function (interval) {
        var self = this;

        this.Timer = setInterval(function () {
            self.CollectLatestData();
            self.EvaluateCondition();
            self.ShowResult();
        }, interval);
    };

    MonitorManager.prototype.SetMonitor = function (location, condition, evidenceNode) {
        var variable = extractVariableFromCondition(condition);
        var key = variable + "@" + location;
        this.LatestDataMap[key] = null;
        this.ConditionMap[key] = condition;
        this.EvidenceNodeMap[key] = evidenceNode;

        function extractVariableFromCondition(condtion) {
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
    };

    MonitorManager.prototype.CollectLatestData = function () {
        for (var key in this.LatestDataMap) {
            var variable = key.split("@")[0];
            var location = key.split("@")[1];
            var latestData = this.RECAPI.getLatestData(location, variable);
            if (latestData == null) {
                console.log("latest data is null");
            }
            this.LatestDataMap[key] = latestData;
        }
    };

    MonitorManager.prototype.EvaluateCondition = function () {
        for (var key in this.ConditionMap) {
            var variable = key.split("@")[0];
            var script = "var " + variable + "=" + this.LatestDataMap[key].data + ";";
            script += this.ConditionMap[key] + ";";
            var result = eval(script);
            this.EditResult(key, result);
        }
    };

    MonitorManager.prototype.IsAlreadyFailed = function (evidenceNode) {
        var notes = evidenceNode.Notes;

        for (var i = 0; i < notes.length; i++) {
            var body = notes[i].Body;
            if (body["Status"] == "Fail")
                return true;
        }

        return false;
    };

    MonitorManager.prototype.EditResult = function (key, result) {
        var variable = key.split("@")[0];
        var evidenceNode = this.EvidenceNodeMap[key];

        if (this.IsAlreadyFailed(evidenceNode))
            return;

        var latestData = this.LatestDataMap[key];
        var evidenceNoteBody = {};

        if (result) {
            evidenceNoteBody["Status"] = "Success";
            evidenceNoteBody[variable] = latestData.data;
            evidenceNoteBody["timestamp"] = latestData.timestamp;
        } else {
            evidenceNoteBody["Status"] = "Fail";
            evidenceNoteBody[variable] = latestData.data;
            evidenceNoteBody["timestamp"] = latestData.timestamp;

            var contextNode = getContextNode(evidenceNode);
            if (contextNode == null) {
                contextNode = appendNode(this.Viewer, evidenceNode, AssureIt.NodeType.Context);
            }

            var contextNoteBody = {};
            contextNoteBody["Manager"] = latestData.authid;
            contextNode.Notes = [{ "Name": "Notes", "Body": contextNoteBody }];
            var element = this.Viewer.ViewMap[contextNode.Label].HTMLDoc.DocBase;
        }

        evidenceNode.Notes = [{ "Name": "Notes", "Body": evidenceNoteBody }];
    };

    MonitorManager.prototype.UpdateNode = function (node) {
        var element = this.Viewer.ViewMap[node.Label].HTMLDoc.DocBase;
        var view = this.Viewer.ViewMap[node.Label];
        this.HTMLRenderFunction(this.Viewer, node, element);
        this.SVGRenderFunction(this.Viewer, view);
    };

    MonitorManager.prototype.ShowResult = function () {
        for (var key in this.EvidenceNodeMap) {
            var evidenceNode = this.EvidenceNodeMap[key];
            this.UpdateNode(evidenceNode);

            var contextNode = getContextNode(evidenceNode);
            if (contextNode != null) {
                this.UpdateNode(contextNode);
            }
        }

        this.Viewer.Draw();
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

        if (nodeModel.Type != AssureIt.NodeType.Context)
            return true;
        if (!hasMonitorInfo(nodeModel))
            return true;

        var notes = nodeModel.Notes;
        var locations = [];
        var conditions = [];

        for (var i = 0; i < notes.length; i++) {
            var body = notes[i].Body;

            if ("Location" in body && "Monitor" in body) {
                locations.push(notes[i].Body.Location);
                conditions.push(notes[i].Body.Monitor);
            }
        }

        var evidenceNode = getEmptyEvidenceNode(nodeModel.Parent);
        if (evidenceNode == null) {
            evidenceNode = appendNode(caseViewer, nodeModel.Parent, AssureIt.NodeType.Evidence);
        }

        this.MonitorManager.SetMonitor(locations[0], conditions[0], evidenceNode);

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
                    var fill = "#FF99CC";
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
