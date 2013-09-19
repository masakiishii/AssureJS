var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var AssureIt;
(function (AssureIt) {
    function OutputError(o) {
        console.log("error: " + o);
    }

    var Parser = (function () {
        function Parser(Case) {
            this.Case = Case;
        }
        Parser.prototype.Parse = function (source, orig) {
            return null;
        };
        return Parser;
    })();
    AssureIt.Parser = Parser;

    var JsonParser = (function (_super) {
        __extends(JsonParser, _super);
        function JsonParser() {
            _super.apply(this, arguments);
            this.NodeModelMap = {};
        }
        JsonParser.prototype.InitNodeModelMap = function (NodeList) {
            for (var i = 0; i < NodeList.length; i++) {
                this.NodeModelMap[NodeList[i]["Label"]] = NodeList[i];
            }
        };

        JsonParser.prototype.ParseChild = function (childLabel, Parent) {
            var NodeModelData = this.NodeModelMap[childLabel];
            var Type = NodeModelData["NodeType"];
            var Statement = NodeModelData["Statement"];
            var Children = NodeModelData["Children"];
            var NoteData = NodeModelData["Notes"];
            var AnnotationData = NodeModelData["Annotations"];

            var ChildNodeModel = new AssureIt.NodeModel(this.Case, Parent, Type, childLabel, Statement);

            if (NoteData != null) {
                ChildNodeModel.Notes = NoteData;
            }

            if (AnnotationData != null) {
                for (var i = 0; i < AnnotationData.length; i++) {
                    var annotation = new AssureIt.CaseAnnotation(AnnotationData[i].Name, AnnotationData[i].Body);
                    ChildNodeModel.Annotations.push(annotation);
                }
            }

            for (var i = 0; i < Children.length; i++) {
                this.ParseChild(Children[i], ChildNodeModel);
            }

            if (Parent == null) {
                return ChildNodeModel;
            } else {
                return Parent;
            }
        };

        JsonParser.prototype.Parse = function (JsonData) {
            var DCaseName = JsonData["DCaseName"];
            var NodeCount = JsonData["NodeCount"];
            var TopGoalLabel = JsonData["TopGoalLabel"];
            var NodeList = JsonData["NodeList"];

            this.InitNodeModelMap(NodeList);
            var root = this.ParseChild(TopGoalLabel, null);

            return root;
        };
        return JsonParser;
    })(Parser);
    AssureIt.JsonParser = JsonParser;

    var DCaseLink = (function () {
        function DCaseLink(source, target) {
            this.source = source;
            this.target = target;
        }
        return DCaseLink;
    })();
    AssureIt.DCaseLink = DCaseLink;

    var DCaseXMLParser = (function (_super) {
        __extends(DCaseXMLParser, _super);
        function DCaseXMLParser() {
            _super.apply(this, arguments);
            this.nodes = {};
            this.links = {};
            this.Text2NodeTypeMap = { "Goal": AssureIt.NodeType.Goal, "Strategy": AssureIt.NodeType.Strategy, "Context": AssureIt.NodeType.Context, "Evidence": AssureIt.NodeType.Evidence };
        }
        DCaseXMLParser.prototype.MakeTree = function (Id) {
            var ThisNode = this.nodes[Id];

            for (var LinkId in this.links) {
                var link = this.links[LinkId];

                if (link.source == Id || link.target == Id) {
                    var ChildNodeId;

                    if (link.source == Id) {
                        ChildNodeId = link.target;
                    } else {
                        ChildNodeId = link.source;
                    }
                    delete this.links[LinkId];

                    var ChildNode = this.nodes[ChildNodeId];

                    ThisNode.AppendChild(ChildNode);
                    this.MakeTree(ChildNodeId);
                }
            }

            return ThisNode;
        };

        DCaseXMLParser.prototype.Parse = function (XMLData) {
            var self = this;
            var IsRootNode = true;

            $(XMLData).find("rootBasicNode").each(function (index, elem) {
                var XsiType = $(this).attr("xsi\:type");

                if (XsiType.split(":").length != 2) {
                    OutputError("attr 'xsi:type' is incorrect format");
                }

                var NodeType = XsiType.split(":")[1];
                var Id = $(this).attr("id");
                var Statement = $(this).attr("desc");
                var Label = $(this).attr("name");

                if (IsRootNode) {
                    self.RootNodeId = Id;
                    IsRootNode = false;
                }

                var node = new AssureIt.NodeModel(self.Case, null, self.Text2NodeTypeMap[NodeType], Label, Statement);
                self.nodes[Id] = node;

                return null;
            });

            $(XMLData).find("rootBasicLink").each(function (index, elem) {
                var Id = $(this).attr("id");
                var source = $(this).attr("source").substring(1);
                var target = $(this).attr("target").substring(1);
                var link = new DCaseLink(source, target);

                self.links[Id] = link;

                return null;
            });

            var root = this.MakeTree(this.RootNodeId);

            return root;
        };
        return DCaseXMLParser;
    })(Parser);
    AssureIt.DCaseXMLParser = DCaseXMLParser;

    var ASNParser = (function (_super) {
        __extends(ASNParser, _super);
        function ASNParser(Case) {
            _super.call(this, Case);
            this.Text2NodeTypeMap = { "Goal": AssureIt.NodeType.Goal, "Strategy": AssureIt.NodeType.Strategy, "Context": AssureIt.NodeType.Context, "Evidence": AssureIt.NodeType.Evidence };
            this.error = null;
        }
        ASNParser.prototype.Object2NodeModel = function (obj) {
            var Case = this.Case;
            var Parent = obj["Parent"];
            var Type = this.Text2NodeTypeMap[obj["Type"]];
            var Label = obj["Label"];
            var Statement = obj["Statement"];
            var Notes = (obj["Notes"]) ? obj["Notes"] : {};
            var Model = new AssureIt.NodeModel(Case, Parent, Type, Label, Statement);
            Model.Notes = Notes;

            var Children = obj["Children"];
            if (Children.length != 0) {
                for (var i = 0; i < Children.length; i++) {
                    if (Children[i] == "")
                        break;
                    var Child = this.Object2NodeModel(Children[i]);
                    Child.Parent = Model;
                    Model.Children.push(Child);
                }
            } else {
                Model.Children = [];
            }
            if (obj["Annotations"].length != 0) {
                for (var i = 0; i < obj["Annotations"].length; i++) {
                    Model.SetAnnotation(obj["Annotations"][i].Name, obj["Annotations"][i].Body);
                }
            } else {
            }
            return Model;
        };
        ASNParser.prototype.Parse = function (ASNData, orig) {
            try  {
                var obj = Peg.parse(ASNData)[1];
                var root = this.Object2NodeModel(obj);
                if (orig != null) {
                    root.Parent = orig.Parent;
                }
                return root;
            } catch (e) {
                this.error = e;
                return null;
            }
        };

        ASNParser.prototype.GetError = function () {
            return this.error;
        };
        return ASNParser;
    })(Parser);
    AssureIt.ASNParser = ASNParser;

    var CaseDecoder = (function () {
        function CaseDecoder() {
            this.ASNParser = null;
        }
        CaseDecoder.prototype.ParseJson = function (Case, JsonData) {
            var parser = new JsonParser(Case);
            var root = parser.Parse(JsonData, null);
            return root;
        };

        CaseDecoder.prototype.ParseDCaseXML = function (Case, XMLData) {
            var parser = new DCaseXMLParser(Case);
            var root = parser.Parse(XMLData, null);
            return root;
        };

        CaseDecoder.prototype.ParseASN = function (Case, ASNData, orig) {
            this.ASNParser = new ASNParser(Case);
            console.log(ASNData);
            var root = this.ASNParser.Parse(ASNData, orig);
            console.log(root);
            return root;
        };
        CaseDecoder.prototype.GetASNError = function () {
            if (this.ASNParser == null || this.ASNParser.GetError() == null) {
                return null;
            }
            return this.ASNParser.GetError();
        };
        return CaseDecoder;
    })();
    AssureIt.CaseDecoder = CaseDecoder;
})(AssureIt || (AssureIt = {}));
