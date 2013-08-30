/// <reference path="../d.ts/jquery.d.ts" />
/// <reference path="../d.ts/ASNParser.d.ts" />
/// <reference path="CaseModel.ts" />
var AssureIt;
(function (AssureIt) {
    var JsonNodeModel = (function () {
        function JsonNodeModel() {
        }
        return JsonNodeModel;
    })();
    AssureIt.JsonNodeModel = JsonNodeModel;

    var CaseEncoderDeprecated = (function () {
        function CaseEncoderDeprecated() {
        }
        CaseEncoderDeprecated.prototype.ConvertToOldJson = function (case0) {
            var keys = Object.keys(case0.ElementMap);
            var root = {
                "NodeList": [],
                "TopGoalLabel": case0.ElementTop.Label,
                "NodeCount": keys.length,
                "DCaseName": case0.CaseName
            };

            for (var i = 0; i < keys.length; i++) {
                var node = case0.ElementMap[keys[i]];
                var json = {
                    Label: node.Label,
                    Type: node.Type,
                    Statement: node.Statement,
                    Annotations: node.Annotations,
                    Notes: node.Notes,
                    Children: []
                };
                for (var j = 0; j < node.Children.length; j++) {
                    json.Children.push(node.Children[j].Label);
                }
                root.NodeList.push(json);
            }

            return root;
        };
        return CaseEncoderDeprecated;
    })();
    AssureIt.CaseEncoderDeprecated = CaseEncoderDeprecated;

    var CaseEncoder = (function () {
        function CaseEncoder() {
        }
        CaseEncoder.prototype.ConvertToJson = function (root) {
            this.JsonRoot = new JsonNodeModel();
            this.JsonRoot.Type = root.Type;
            this.JsonRoot.Label = root.Label;
            this.JsonRoot.Statement = root.Statement;
            this.JsonRoot.Annotations = root.Annotations;
            this.JsonRoot.Notes = root.Notes;

            var JsonChildNodes = [];
            for (var i = 0; i < root.Children.length; i++) {
                JsonChildNodes[i] = new JsonNodeModel();
                this.GetChild(root.Children[i], JsonChildNodes[i]);
            }

            this.JsonRoot.Children = JsonChildNodes;

            //console.log(this.JsonRoot);
            return this.JsonRoot;
        };

        CaseEncoder.prototype.ConvertToDCaseXML = function (root) {
            var dcaseXML = '<dcase:Argument xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' + ' xmlns:dcase="http://www.dependalopble-os.net/2010/03/dcase/"' + ' id="_6A0EENScEeKCdP-goLYu9g">\n';
            var dcaseLinkXML = "";

            function NodeTypeToString(type) {
                switch (type) {
                    case AssureIt.NodeType.Goal:
                        return "Goal";
                    case AssureIt.NodeType.Strategy:
                        return "Strategy";
                    case AssureIt.NodeType.Evidence:
                        return "Evidence";
                    case AssureIt.NodeType.Context:
                        return "Context";
                    default:
                        return "";
                }
            }

            var linkIdCounter = 0;

            function createNewLinkId() {
                linkIdCounter++;
                return "LINK_" + linkIdCounter;
            }

            function convert(node) {
                dcaseXML += '\t<rootBasicNode xsi:type="dcase:' + NodeTypeToString(node.Type) + '"' + ' id="' + node.Label + '"' + ' name="' + node.Label + '"' + ' desc="' + node.Statement + '"' + '/>\n';

                if (node.Parent != null) {
                    var linkId = createNewLinkId();
                    dcaseLinkXML += '\t<rootBasicLink xsi:type="dcase:link" id="' + linkId + '"' + ' source="' + node.Parent.Label + '"' + ' target="#' + node.Label + '"' + ' name="' + linkId + '"' + '/>\n';
                }

                for (var i = 0; i < node.Children.length; i++) {
                    convert(node.Children[i]);
                }
            }

            convert(root);

            dcaseXML += dcaseLinkXML;
            dcaseXML += '</dcase:Argument>';

            return dcaseXML;
        };

        CaseEncoder.prototype.ConvertToASN = function (root, isSingleNode) {
            var encoded = (function (model, prefix) {
                var IndentToken = "    ";
                var ret = "";
                switch (model.Type) {
                    case AssureIt.NodeType["Goal"]:
                        prefix += "*";
                        ret += (prefix + model.Label);
                        break;

                    default:
                        if (prefix == "")
                            prefix += "*";
                        ret += (prefix + model.Label);
                }

                //TODO:Label
                var anno_num = model.Annotations.length;
                if (anno_num != 0) {
                    for (var i = 0; i < model.Annotations.length; i++) {
                        ret += (" @" + model.Annotations[i].Name);
                        ret += (" " + model.Annotations[i].Body);
                    }
                }
                ret += "\n";

                if (model.Statement != "")
                    ret += (model.Statement + "\n");

                var note_num = model.Notes.length;
                if (note_num != 0) {
                    for (var i = 0; i < model.Notes.length; i++) {
                        var Note = model.Notes[i];
                        ret += Note.Name + "::" + "\n";
                        var keys = Object.keys(Note.Body);
                        for (var j in keys) {
                            if (keys[j] == "Description")
                                continue;
                            ret += "\t" + keys[j] + ": " + Note.Body[keys[j]] + "\n";
                        }
                        if (Note.Body["Description"] != null) {
                            var desc = Note.Body["Description"];
                            var desclist = desc.split("\n");
                            for (var j in desclist) {
                                ret += IndentToken + desclist[j] + "\n";
                            }
                        }
                    }
                }

                if (isSingleNode) {
                    return ret;
                }

                if (ret.indexOf("\n") != ret.length - 1) {
                    ret += "\n";
                }

                for (var i = 0; i < model.Children.length; i++) {
                    var child_model = model.Children[i];

                    if (child_model.Type == AssureIt.NodeType["Context"]) {
                        ret += arguments.callee(child_model, prefix);
                        break;
                    }
                }
                for (var i = 0; i < model.Children.length; i++) {
                    var child_model = model.Children[i];
                    if (child_model.Type != AssureIt.NodeType["Context"]) {
                        ret += arguments.callee(child_model, prefix);
                    }
                }
                return ret;
            })(root, "");

            //console.log(encoded);
            return encoded;
        };

        CaseEncoder.prototype.GetChild = function (root, JsonNode) {
            JsonNode.Type = root.Type;
            JsonNode.Label = root.Label;
            JsonNode.Statement = root.Statement;
            JsonNode.Annotations = root.Annotations;
            JsonNode.Notes = root.Notes;

            var ChildNodes = new Array();
            for (var i = 0; i < root.Children.length; i++) {
                ChildNodes[i] = new JsonNodeModel();
                this.GetChild(root.Children[i], ChildNodes[i]);
            }

            JsonNode.Children = ChildNodes;

            return JsonNode;
        };
        return CaseEncoder;
    })();
    AssureIt.CaseEncoder = CaseEncoder;
})(AssureIt || (AssureIt = {}));
