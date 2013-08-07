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
                        ret += (prefix + "Goal" + "\n");
                        break;
                    case AssureIt.NodeType["Context"]:
                        if (prefix == "")
                            prefix += "*";
                        ret += (prefix + "Context" + "\n");
                        break;
                    case AssureIt.NodeType["Strategy"]:
                        if (prefix == "")
                            prefix += "*";
                        ret += (prefix + "Strategy" + "\n");
                        break;
                    case AssureIt.NodeType["Evidence"]:
                        if (prefix == "")
                            prefix += "*";
                        ret += (prefix + "Evidence" + "\n");
                        break;
                    default:
                        console.log(model.Type);
                }

                if (model.Statement != "")
                    ret += (model.Statement + "\n");

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
