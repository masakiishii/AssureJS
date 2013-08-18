var AssureIt;
(function (AssureIt) {
    var CaseAnnotation = (function () {
        function CaseAnnotation(Name, Body) {
            this.Name = Name;
            this.Body = Body;
        }
        return CaseAnnotation;
    })();
    AssureIt.CaseAnnotation = CaseAnnotation;

    var CaseNote = (function () {
        function CaseNote(Name, Body) {
            this.Name = Name;
            this.Body = Body;
        }
        return CaseNote;
    })();
    AssureIt.CaseNote = CaseNote;

    (function (NodeType) {
        NodeType[NodeType["Goal"] = 0] = "Goal";
        NodeType[NodeType["Context"] = 1] = "Context";
        NodeType[NodeType["Strategy"] = 2] = "Strategy";
        NodeType[NodeType["Evidence"] = 3] = "Evidence";
    })(AssureIt.NodeType || (AssureIt.NodeType = {}));
    var NodeType = AssureIt.NodeType;

    var NodeModel = (function () {
        function NodeModel(Case, Parent, Type, Label, Statement) {
            this.Case = Case;
            this.Type = Type;
            this.Label = (Label == null) ? Case.NewLabel(Type) : Label;
            this.Statement = (Statement == null) ? "" : Statement;
            this.Parent = Parent;
            if (Parent != null) {
                Parent.AppendChild(this);
            }
            this.Children = [];
            this.Annotations = [];
            this.Notes = [];
            this.IsEditing = false;

            Case.ElementMap[this.Label] = this;
        }
        NodeModel.prototype.AppendChild = function (Node) {
            this.Children.push(Node);
        };
        NodeModel.prototype.RemoveChild = function (Node) {
            for (var i = 0; i < this.Children.length; i++) {
                if (this.Children[i].Label == Node.Label) {
                    this.Children.splice(i, 1);
                }
            }
        };
        NodeModel.prototype.UpdateChild = function (oldNode, newNode) {
            for (var i = 0; i < this.Children.length; i++) {
                if (this.Children[i].Label == oldNode.Label) {
                    this.Children[i] = newNode;
                }
            }
        };

        NodeModel.prototype.GetAnnotation = function (Name) {
            for (var i = 0; i < this.Annotations.length; i++) {
                if (this.Annotations[i].Name == Name) {
                    return this.Annotations[i];
                }
            }
            return null;
        };

        NodeModel.prototype.SetAnnotation = function (Name, Body) {
            for (var i = 0; i < this.Annotations.length; i++) {
                if (this.Annotations[i].Name == Name) {
                    this.Annotations[i].Body = Body;
                    return;
                }
            }
            this.Annotations.push(new CaseAnnotation(Name, Body));
        };

        NodeModel.prototype.SetNote = function (Name, Body) {
            for (var i = 0; i < this.Notes.length; i++) {
                if (this.Notes[i].Name == Name) {
                    this.Notes[i].Body = Body;
                    return;
                }
            }
            this.Notes.push(new CaseNote(Name, Body));
        };

        NodeModel.prototype.GetNote = function (Name) {
            for (var i = 0; i < this.Notes.length; i++) {
                if (this.Notes[i].Name == Name) {
                    return this.Notes[i];
                }
            }
            return null;
        };

        NodeModel.prototype.InvokePlugInModifier = function (EventType, EventBody) {
            var recall = false;
            for (var a in this.Annotations) {
                var f = this.Case.GetPlugInModifier(a.Name);
                if (f != null) {
                    recall = f(Case, this, EventType, EventBody) || recall;
                }
            }
            for (var a in this.Notes) {
                var f = this.Case.GetPlugInModifier(a.Name);
                if (f != null) {
                    recall = f(Case, this, EventType, EventBody) || recall;
                }
            }
            return recall;
        };
        return NodeModel;
    })();
    AssureIt.NodeModel = NodeModel;

    var CaseModifiers = (function () {
        function CaseModifiers() {
            this.PlugInMap = {};
        }
        CaseModifiers.prototype.AddPlugInModifier = function (key, f) {
            this.PlugInMap[key] = f;
        };

        CaseModifiers.prototype.GetPlugInModifier = function (key) {
            return this.PlugInMap[key];
        };
        return CaseModifiers;
    })();
    AssureIt.CaseModifiers = CaseModifiers;

    var CaseModifierConfig = new CaseModifiers();

    var Case = (function () {
        function Case() {
            this.IdCounters = [0, 0, 0, 0, 0];
            this.IsModified = false;
            this.ElementMap = {};
        }
        Case.prototype.DeleteNodesRecursive = function (root) {
            var Children = root.Children;
            delete this.ElementMap[root.Label];
            for (var i = 0; i < Children.length; i++) {
                this.DeleteNodesRecursive(Children[i]);
            }
        };

        Case.prototype.SetElementTop = function (ElementTop) {
            this.ElementTop = ElementTop;
            this.SaveIdCounterMax(ElementTop);
        };
        Case.prototype.SaveIdCounterMax = function (Element) {
            for (var i = 0; i < Element.Children.length; i++) {
                this.SaveIdCounterMax(Element.Children[i]);
            }
            var m = Element.Label.match(/^[GCSE][0-9]+$/);
            if (m == null) {
                return;
            }
            if (m.length == 1) {
                var prefix = m[0][0];
                var count = Number(m[0].substring(1));
                switch (prefix) {
                    case "G":
                        if (this.IdCounters[NodeType["Goal"]] < count)
                            this.IdCounters[NodeType["Goal"]] = count;
                        break;
                    case "C":
                        if (this.IdCounters[NodeType["Context"]] < count)
                            this.IdCounters[NodeType["Context"]] = count;
                        break;
                    case "S":
                        if (this.IdCounters[NodeType["Strategy"]] < count)
                            this.IdCounters[NodeType["Strategy"]] = count;
                        break;
                    case "E":
                        if (this.IdCounters[NodeType["Evidence"]] < count)
                            this.IdCounters[NodeType["Evidence"]] = count;
                        break;
                    default:
                        console.log("invalid label prefix :" + prefix);
                }
            }
        };
        Case.prototype.NewLabel = function (Type) {
            this.IdCounters[Type] += 1;
            return NodeType[Type].charAt(0) + this.IdCounters[Type];
        };
        Case.prototype.GetPlugInModifier = function (key) {
            return CaseModifierConfig.PlugInMap[key];
        };

        Case.prototype.IsLogin = function () {
            var matchResult = document.cookie.match(/userId=(\w+);?/);
            var userId = matchResult ? parseInt(matchResult[1]) : null;
            return userId != null;
        };

        Case.prototype.SetEditable = function (flag) {
            if (flag == null) {
                this.IsEditable = this.IsLogin();
                return;
            }
            this.IsEditable = flag;
            return;
        };
        return Case;
    })();
    AssureIt.Case = Case;
})(AssureIt || (AssureIt = {}));
