var AssureIt;
(function (AssureIt) {
    var JsonNodeModel = (function () {
        function JsonNodeModel() {
        }
        return JsonNodeModel;
    })();
    AssureIt.JsonNodeModel = JsonNodeModel;

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

            var JsonChildNodes = new Array();
            for (var i = 0; i < root.Children.length; i++) {
                JsonChildNodes[i] = new JsonNodeModel();
                this.GetChild(root.Children[i], JsonChildNodes[i]);
            }

            this.JsonRoot.Children = JsonChildNodes;

            console.log(this.JsonRoot);
            return this.JsonRoot;
        };

        CaseEncoder.prototype.ConvertToASN = function (root) {
            var encoded = (function (model, prefix) {
                var ret = "";
                switch (model.Type) {
                    case AssureIt.NodeType["Goal"]:
                        prefix += "*";
                        ret += (prefix + "Goal");
                        break;
                    case AssureIt.NodeType["Context"]:
                        if (prefix == "")
                            prefix += "*";
                        ret += (prefix + "Context");
                        break;
                    case AssureIt.NodeType["Strategy"]:
                        if (prefix == "")
                            prefix += "*";
                        ret += (prefix + "Strategy");
                        break;
                    case AssureIt.NodeType["Evidence"]:
                        if (prefix == "")
                            prefix += "*";
                        ret += (prefix + "Evidence");
                        break;
                    default:
                        console.log(model.Type);
                }

                var anno_num = model.Annotations.length;
                if (anno_num != 0) {
                    for (var i = 0; i < model.Annotations.length; i++) {
                        ret += (" @" + model.Annotations[i].Name);
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
                        console.log("keys");
                        console.log(keys);
                        for (var j in keys) {
                            ret += "\t" + keys[j] + ": " + Note.Body[keys[j]] + "\n";
                        }
                    }
                }

                for (var i = 0; i < model.Children.length; i++) {
                    var child_model = model.Children[i];
                    console.log(child_model.Type);
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
            console.log(encoded);
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
