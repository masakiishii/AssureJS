var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
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
        this.LatestDataMap = {};
        this.ConditionMap = {};
        this.EvidenceNodeMap = {};
    }
    MonitorHTMLRenderPlugIn.prototype.IsEnabled = function (caseViewer, nodeModel) {
        return true;
    };

    MonitorHTMLRenderPlugIn.prototype.Delegate = function (caseViewer, nodeModel, element) {
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

        function isEmptyNode(node) {
            if (node.Statement == "" && node.Annotations.length == 0 && node.Notes.length == 0 && node.Children.length == 0) {
                return true;
            }

            return false;
        }

        for (var i = 0; i < locations.length; i++) {
            var location = locations[i];

            for (var j = 0; j < conditions.length; j++) {
                var condition = conditions[j];
                var variable = extractVariableFromCondition(condition);
                var key = variable + "@" + location;
                this.LatestDataMap[key] = null;
                this.ConditionMap[key] = condition;

                var brothers = nodeModel.Parent.Children;
                for (var i = 0; i < brothers.length; i++) {
                    if (isEmptyNode(brothers[i])) {
                        this.EvidenceNodeMap[key] = brothers[i];
                        break;
                    }
                }
            }
        }

        var self = this;
        var api = new AssureIt.RECAPI("http://54.250.206.119/rec");

        function collectLatestData() {
            for (var key in self.LatestDataMap) {
                var variable = key.split("@")[0];
                var location = key.split("@")[1];
                var latestData = api.getLatestData(location, variable);
                if (latestData == null) {
                    console.log("latest data is null");
                }
                self.LatestDataMap[key] = latestData;
            }
        }

        function showResult(key, result) {
            var variable = key.split("@")[0];
            var node = self.EvidenceNodeMap[key];
            var latestData = self.LatestDataMap[key];

            if (result) {
                node.Notes = [
                    {
                        "Name": "Notes",
                        "Body": {
                            "Status": "Success",
                            variable: latestData.data
                        }
                    }
                ];
            } else {
                node.Notes = [
                    {
                        "Name": "Notes",
                        "Body": {
                            "Status": "Fail",
                            variable: latestData.data
                        }
                    }
                ];
            }

            var HTMLRenderPlugIn = caseViewer.GetPlugInHTMLRender("note");
            var element = caseViewer.ViewMap[node.Label].HTMLDoc.DocBase;
            HTMLRenderPlugIn(caseViewer, node, element);
            var SVGRenderPlugIn = caseViewer.GetPlugInSVGRender("monitor");
            var nodeView = caseViewer.ViewMap[node.Label];
            SVGRenderPlugIn(caseViewer, nodeView);

            caseViewer.Draw();
        }

        function evaluateCondition() {
            for (var key in self.ConditionMap) {
                var variable = key.split("@")[0];
                var script = "var " + variable + "=" + self.LatestDataMap[key].data + ";";
                script += self.ConditionMap[key] + ";";
                var result = eval(script);

                showResult(key, result);
            }
        }

        if (this.IsFirstCalled) {
            this.Timer = setInterval(function () {
                collectLatestData();
                evaluateCondition();
            }, 5000);
            this.IsFirstCalled = false;
        }

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
                    nodeView.SVGShape.SetColor("#FF99CC", "none");
                }
            }
        }

        return true;
    };
    return MonitorSVGRenderPlugIn;
})(AssureIt.SVGRenderPlugIn);
