/// <reference path="CaseModel.ts" />
/// <reference path="CaseDecoder.ts" />
/// <reference path="CaseEncoder.ts" />
/// <reference path="ServerApi.ts" />
/// <reference path="Layout.ts" />
/// <reference path="PlugInManager.ts" />
/// <reference path="../d.ts/jquery.d.ts" />
/// <reference path="../d.ts/pointer.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
document.createSVGElement = function (name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
};

/* VIEW (MVC) */
var AssureIt;
(function (AssureIt) {
    var HTMLDoc = (function () {
        function HTMLDoc() {
            this.Width = 0;
            this.Height = 0;
        }
        HTMLDoc.prototype.Render = function (Viewer, NodeModel) {
            if (this.DocBase != null) {
                //var parent = this.DocBase.parent();
                //if (parent != null) parent.remove(this.DocBase);
                this.DocBase.remove();
            }
            this.DocBase = $('<div class="node">').css("position", "absolute").attr('id', NodeModel.Label);
            this.DocBase.append($('<h4>' + NodeModel.Label + '</h4>'));

            //this.DocBase.append($('<p>' + NodeModel.Statement + '</p>'));
            this.InvokePlugInHTMLRender(Viewer, NodeModel, this.DocBase);
            this.UpdateWidth(Viewer, NodeModel);
            this.Resize(Viewer, NodeModel);
        };

        HTMLDoc.prototype.UpdateWidth = function (Viewer, Source) {
            this.DocBase.width(CaseViewer.ElementWidth);
            switch (Source.Type) {
                case AssureIt.NodeType.Goal:
                    this.DocBase.css("padding", "5px 10px");
                    break;
                case AssureIt.NodeType.Context:
                    this.DocBase.css("padding", "10px 10px");
                    break;
                case AssureIt.NodeType.Strategy:
                    this.DocBase.css("padding", "5px 20px");
                    break;
                case AssureIt.NodeType.Evidence:
                default:
                    this.DocBase.css("padding", "20px 20px");
                    break;
            }
            this.DocBase.width(CaseViewer.ElementWidth * 2 - this.DocBase.outerWidth());
        };

        HTMLDoc.prototype.InvokePlugInHTMLRender = function (caseViewer, caseModel, DocBase) {
            var pluginMap = caseViewer.pluginManager.HTMLRenderPlugInMap;
            for (var key in pluginMap) {
                var render = caseViewer.GetPlugInHTMLRender(key);
                render(caseViewer, caseModel, DocBase);
            }
        };

        HTMLDoc.prototype.Resize = function (Viewer, Source) {
            this.Width = this.DocBase ? this.DocBase.outerWidth() : 0;
            this.Height = this.DocBase ? this.DocBase.outerHeight() : 0;
        };

        HTMLDoc.prototype.SetPosition = function (x, y) {
            this.DocBase.css({ left: x + "px", top: y + "px" });
        };
        return HTMLDoc;
    })();
    AssureIt.HTMLDoc = HTMLDoc;

    var Point = (function () {
        function Point(x, y) {
            this.x = x;
            this.y = y;
        }
        return Point;
    })();
    AssureIt.Point = Point;

    (function (Direction) {
        Direction[Direction["Left"] = 0] = "Left";
        Direction[Direction["Top"] = 1] = "Top";
        Direction[Direction["Right"] = 2] = "Right";
        Direction[Direction["Bottom"] = 3] = "Bottom";
    })(AssureIt.Direction || (AssureIt.Direction = {}));
    var Direction = AssureIt.Direction;

    function ReverseDirection(Dir) {
        return (Dir + 2) & 3;
    }

    var SVGShape = (function () {
        function SVGShape() {
        }
        SVGShape.prototype.Render = function (CaseViewer, NodeModel, HTMLDoc) {
            this.ShapeGroup = document.createSVGElement("g");
            this.ShapeGroup.setAttribute("transform", "translate(0,0)");
            this.ArrowPath = document.createSVGElement("path");
            this.ArrowPath.setAttribute("marker-end", "url(#Triangle-black)");
            this.ArrowPath.setAttribute("fill", "none");
            this.ArrowPath.setAttribute("stroke", "gray");
            this.ArrowPath.setAttribute("d", "M0,0 C0,0 0,0 0,0");
        };

        SVGShape.prototype.GetSVG = function () {
            return this.ShapeGroup;
        };

        SVGShape.prototype.GetSVGPath = function () {
            return this.ArrowPath;
        };

        SVGShape.prototype.Resize = function (CaseViewer, NodeModel, HTMLDoc) {
            this.Width = HTMLDoc.Width;
            this.Height = HTMLDoc.Height;
        };

        SVGShape.prototype.SetPosition = function (x, y) {
            var mat = this.ShapeGroup.transform.baseVal.getItem(0).matrix;
            mat.e = x;
            mat.f = y;
        };

        SVGShape.prototype.SetArrowPosition = function (p1, p2, dir) {
            var start = this.ArrowPath.pathSegList.getItem(0);
            var curve = this.ArrowPath.pathSegList.getItem(1);
            start.x = p1.x;
            start.y = p1.y;
            curve.x = p2.x;
            curve.y = p2.y;
            if (dir == Direction.Bottom || dir == Direction.Top) {
                curve.x1 = (9 * p1.x + p2.x) / 10;
                curve.y1 = (p1.y + p2.y) / 2;
                curve.x2 = (9 * p2.x + p1.x) / 10;
                curve.y2 = (p1.y + p2.y) / 2;
            } else {
                curve.x1 = (p1.x + p2.x) / 2;
                curve.y1 = (9 * p1.y + p2.y) / 10;
                curve.x2 = (p1.x + p2.x) / 2;
                curve.y2 = (9 * p2.y + p1.y) / 10;
            }
        };

        SVGShape.prototype.SetArrowColorWhite = function (white) {
            if (white) {
                this.ArrowPath.setAttribute("marker-end", "url(#Triangle-white)");
            } else {
                this.ArrowPath.setAttribute("marker-end", "url(#Triangle-black)");
            }
        };

        SVGShape.prototype.SetColor = function (fill, stroke) {
        };

        SVGShape.prototype.GetColor = function () {
            return {};
        };

        SVGShape.prototype.GetConnectorPosition = function (Dir) {
            switch (Dir) {
                case Direction.Right:
                    return new Point(this.Width, this.Height / 2);
                case Direction.Left:
                    return new Point(0, this.Height / 2);
                case Direction.Top:
                    return new Point(this.Width / 2, 0);
                case Direction.Bottom:
                    return new Point(this.Width / 2, this.Height);
                default:
                    return new Point(0, 0);
            }
        };
        return SVGShape;
    })();
    AssureIt.SVGShape = SVGShape;

    var GoalShape = (function (_super) {
        __extends(GoalShape, _super);
        function GoalShape() {
            _super.apply(this, arguments);
        }
        GoalShape.prototype.Render = function (CaseViewer, NodeModel, HTMLDoc) {
            _super.prototype.Render.call(this, CaseViewer, NodeModel, HTMLDoc);
            this.BodyRect = document.createSVGElement("rect");
            this.UndevelopedSymbol = document.createSVGElement("use");
            this.UndevelopedSymbol.setAttribute("xlink:href", "#UndevelopdSymbol");

            this.ShapeGroup.appendChild(this.BodyRect);
            this.Resize(CaseViewer, NodeModel, HTMLDoc);
        };

        GoalShape.prototype.Resize = function (CaseViewer, NodeModel, HTMLDoc) {
            _super.prototype.Resize.call(this, CaseViewer, NodeModel, HTMLDoc);
            this.BodyRect.setAttribute("width", this.Width.toString());
            this.BodyRect.setAttribute("height", this.Height.toString());
        };

        GoalShape.prototype.SetColor = function (fill, stroke) {
            this.BodyRect.setAttribute("fill", fill);
            this.BodyRect.setAttribute("stroke", stroke);
        };

        GoalShape.prototype.GetColor = function () {
            return { "fill": this.BodyRect.getAttribute("fill"), "stroke": this.BodyRect.getAttribute("stroke") };
        };

        GoalShape.prototype.SetUndevelolpedSymbolPosition = function (point) {
            this.UndevelopedSymbol.setAttribute("x", point.x.toString());
            this.UndevelopedSymbol.setAttribute("y", point.y.toString());
        };
        return GoalShape;
    })(SVGShape);
    AssureIt.GoalShape = GoalShape;

    var ContextShape = (function (_super) {
        __extends(ContextShape, _super);
        function ContextShape() {
            _super.apply(this, arguments);
        }
        ContextShape.prototype.Render = function (CaseViewer, NodeModel, HTMLDoc) {
            _super.prototype.Render.call(this, CaseViewer, NodeModel, HTMLDoc);
            this.BodyRect = document.createSVGElement("rect");
            this.ArrowPath.setAttribute("marker-end", "url(#Triangle-white)");
            this.BodyRect.setAttribute("rx", "10");
            this.BodyRect.setAttribute("ry", "10");
            this.ShapeGroup.appendChild(this.BodyRect);
            this.Resize(CaseViewer, NodeModel, HTMLDoc);
        };

        ContextShape.prototype.Resize = function (CaseViewer, NodeModel, HTMLDoc) {
            _super.prototype.Resize.call(this, CaseViewer, NodeModel, HTMLDoc);
            this.BodyRect.setAttribute("width", this.Width.toString());
            this.BodyRect.setAttribute("height", this.Height.toString());
        };

        ContextShape.prototype.SetColor = function (fill, stroke) {
            this.BodyRect.setAttribute("fill", fill);
            this.BodyRect.setAttribute("stroke", stroke);
        };

        ContextShape.prototype.GetColor = function () {
            return { "fill": this.BodyRect.getAttribute("fill"), "stroke": this.BodyRect.getAttribute("stroke") };
        };
        return ContextShape;
    })(SVGShape);
    AssureIt.ContextShape = ContextShape;

    var StrategyShape = (function (_super) {
        __extends(StrategyShape, _super);
        function StrategyShape() {
            _super.apply(this, arguments);
            this.delta = 20;
        }
        StrategyShape.prototype.Render = function (CaseViewer, NodeModel, HTMLDoc) {
            _super.prototype.Render.call(this, CaseViewer, NodeModel, HTMLDoc);
            this.BodyPolygon = document.createSVGElement("polygon");
            this.ShapeGroup.appendChild(this.BodyPolygon);
            this.Resize(CaseViewer, NodeModel, HTMLDoc);
        };

        StrategyShape.prototype.Resize = function (CaseViewer, NodeModel, HTMLDoc) {
            _super.prototype.Resize.call(this, CaseViewer, NodeModel, HTMLDoc);
            this.BodyPolygon.setAttribute("points", "" + this.delta + ",0 " + this.Width + ",0 " + (this.Width - this.delta) + "," + this.Height + " 0," + this.Height);
        };

        StrategyShape.prototype.SetColor = function (fill, stroke) {
            this.BodyPolygon.setAttribute("fill", fill);
            this.BodyPolygon.setAttribute("stroke", stroke);
        };

        StrategyShape.prototype.GetColor = function () {
            return { "fill": this.BodyPolygon.getAttribute("fill"), "stroke": this.BodyPolygon.getAttribute("stroke") };
        };

        StrategyShape.prototype.GetConnectorPosition = function (Dir) {
            switch (Dir) {
                case Direction.Right:
                    return new Point(this.Width - this.delta / 2, this.Height / 2);
                case Direction.Left:
                    return new Point(this.delta / 2, this.Height / 2);
                case Direction.Top:
                    return new Point(this.Width / 2, 0);
                case Direction.Bottom:
                    return new Point(this.Width / 2, this.Height);
            }
        };
        return StrategyShape;
    })(SVGShape);
    AssureIt.StrategyShape = StrategyShape;

    var EvidenceShape = (function (_super) {
        __extends(EvidenceShape, _super);
        function EvidenceShape() {
            _super.apply(this, arguments);
        }
        EvidenceShape.prototype.Render = function (CaseViewer, NodeModel, HTMLDoc) {
            _super.prototype.Render.call(this, CaseViewer, NodeModel, HTMLDoc);
            this.BodyEllipse = document.createSVGElement("ellipse");
            this.ShapeGroup.appendChild(this.BodyEllipse);
            this.Resize(CaseViewer, NodeModel, HTMLDoc);
        };

        EvidenceShape.prototype.Resize = function (CaseViewer, NodeModel, HTMLDoc) {
            _super.prototype.Resize.call(this, CaseViewer, NodeModel, HTMLDoc);
            this.BodyEllipse.setAttribute("cx", (this.Width / 2).toString());
            this.BodyEllipse.setAttribute("cy", (this.Height / 2).toString());
            this.BodyEllipse.setAttribute("rx", (this.Width / 2).toString());
            this.BodyEllipse.setAttribute("ry", (this.Height / 2).toString());
        };

        EvidenceShape.prototype.SetColor = function (fill, stroke) {
            this.BodyEllipse.setAttribute("fill", fill);
            this.BodyEllipse.setAttribute("stroke", stroke);
        };

        EvidenceShape.prototype.GetColor = function () {
            return { "fill": this.BodyEllipse.getAttribute("fill"), "stroke": this.BodyEllipse.getAttribute("stroke") };
        };
        return EvidenceShape;
    })(SVGShape);
    AssureIt.EvidenceShape = EvidenceShape;

    var SVGShapeFactory = (function () {
        function SVGShapeFactory() {
        }
        SVGShapeFactory.Create = function (Type) {
            switch (Type) {
                case AssureIt.NodeType.Goal:
                    return new GoalShape();
                case AssureIt.NodeType.Context:
                    return new ContextShape();
                case AssureIt.NodeType.Strategy:
                    return new StrategyShape();
                case AssureIt.NodeType.Evidence:
                    return new EvidenceShape();
            }
        };
        return SVGShapeFactory;
    })();
    AssureIt.SVGShapeFactory = SVGShapeFactory;

    var NodeView = (function () {
        function NodeView(CaseViewer, NodeModel) {
            this.IsArrowWhite = false;
            this.AbsX = 0;
            this.AbsY = 0;
            this.x = 0;
            this.y = 0;
            this.CaseViewer = CaseViewer;
            this.Source = NodeModel;
            this.HTMLDoc = new HTMLDoc();
            this.HTMLDoc.Render(CaseViewer, NodeModel);
            this.SVGShape = SVGShapeFactory.Create(NodeModel.Type);
            this.SVGShape.Render(CaseViewer, NodeModel, this.HTMLDoc);
        }
        NodeView.prototype.Resize = function () {
            this.HTMLDoc.Resize(this.CaseViewer, this.Source);
            this.SVGShape.Resize(this.CaseViewer, this.Source, this.HTMLDoc);
        };

        NodeView.prototype.Update = function () {
            this.Resize();
            this.HTMLDoc.SetPosition(this.AbsX, this.AbsY);
            this.SVGShape.SetPosition(this.AbsX, this.AbsY);
            if (this.ParentShape != null) {
                this.SVGShape.SetArrowColorWhite(this.IsArrowWhite);
            }
        };

        NodeView.prototype.AppendHTMLElement = function (svgroot, divroot, caseViewer) {
            divroot.append(this.HTMLDoc.DocBase);
            svgroot.append(this.SVGShape.ShapeGroup);
            this.InvokePlugInSVGRender(caseViewer);

            if (this.ParentShape != null) {
                svgroot.append(this.SVGShape.ArrowPath);
            }
            if (this.Source.Type == AssureIt.NodeType.Goal && this.Source.Children.length == 0) {
                svgroot.append((this.SVGShape).UndevelopedSymbol);
            }
            this.Update();
        };

        NodeView.prototype.AppendHTMLElementRecursive = function (svgroot, divroot, caseViewer) {
            var Children = this.Source.Children;
            var ViewMap = this.CaseViewer.ViewMap;
            for (var i = 0; i < Children.length; i++) {
                ViewMap[Children[i].Label].AppendHTMLElementRecursive(svgroot, divroot, caseViewer);
            }
            this.AppendHTMLElement(svgroot, divroot, caseViewer);
        };

        NodeView.prototype.DeleteHTMLElement = function (svgroot, divroot) {
            this.HTMLDoc.DocBase.remove();
            $(this.SVGShape.ShapeGroup).remove();
            if (this.ParentShape != null)
                $(this.SVGShape.ArrowPath).remove();
            this.Update();
        };

        NodeView.prototype.DeleteHTMLElementRecursive = function (svgroot, divroot) {
            var Children = this.Source.Children;
            var ViewMap = this.CaseViewer.ViewMap;
            for (var i = 0; i < Children.length; i++) {
                ViewMap[Children[i].Label].DeleteHTMLElementRecursive(svgroot, divroot);
            }
            this.DeleteHTMLElement(svgroot, divroot);
        };

        NodeView.prototype.GetAbsoluteConnectorPosition = function (Dir) {
            var p = this.SVGShape.GetConnectorPosition(Dir);
            p.x += this.AbsX;
            p.y += this.AbsY;
            return p;
        };

        NodeView.prototype.InvokePlugInSVGRender = function (caseViewer) {
            var pluginMap = caseViewer.pluginManager.SVGRenderPlugInMap;
            for (var key in pluginMap) {
                var render = caseViewer.GetPlugInSVGRender(key);
                render(caseViewer, this);
            }
        };

        NodeView.prototype.SetArrowPosition = function (p1, p2, dir) {
            this.SVGShape.SetArrowPosition(p1, p2, dir);
        };
        return NodeView;
    })();
    AssureIt.NodeView = NodeView;

    var CaseViewer = (function () {
        function CaseViewer(Source, pluginManager, serverApi, Screen) {
            this.Source = Source;
            this.pluginManager = pluginManager;
            this.serverApi = serverApi;
            this.Screen = Screen;
            this.InitViewMap(Source);
            this.Resize();
        }
        CaseViewer.prototype.InitViewMap = function (Source) {
            this.ViewMap = {};
            for (var elementkey in Source.ElementMap) {
                var element = Source.ElementMap[elementkey];
                this.ViewMap[element.Label] = new NodeView(this, element);
                if (element.Parent != null) {
                    this.ViewMap[element.Label].ParentShape = this.ViewMap[element.Parent.Label];
                }
            }
            this.ElementTop = Source.ElementTop;
        };

        CaseViewer.prototype.GetPlugInHTMLRender = function (PlugInName) {
            var _this = this;
            return function (viewer, model, e) {
                return _this.pluginManager.HTMLRenderPlugInMap[PlugInName].Delegate(viewer, model, e);
            };
        };

        CaseViewer.prototype.GetPlugInSVGRender = function (PlugInName) {
            var _this = this;
            return function (viewer, shape) {
                return _this.pluginManager.SVGRenderPlugInMap[PlugInName].Delegate(viewer, shape);
            };
        };

        CaseViewer.prototype.Resize = function () {
            for (var shapekey in this.ViewMap) {
                this.ViewMap[shapekey].Resize();
            }
            this.LayoutElement();
        };

        CaseViewer.prototype.Update = function () {
            this.Resize();
            for (var shapekey in this.ViewMap) {
                this.ViewMap[shapekey].Update();
            }
        };

        CaseViewer.prototype.DeleteViewsRecursive = function (root) {
            var Children = root.Source.Children;
            this.ViewMap[root.Source.Label].DeleteHTMLElementRecursive(null, null);
            delete this.ViewMap[root.Source.Label];
            for (var i = 0; i < Children.length; i++) {
                this.DeleteViewsRecursive(this.ViewMap[Children[i].Label]);
            }
        };

        CaseViewer.prototype.LayoutElement = function () {
            var layout = this.pluginManager.GetLayoutEngine();
            layout.Init(this.ViewMap, this.ElementTop, 0, 0, CaseViewer.ElementWidth);
            layout.LayoutAllView(this.ElementTop, 0, 0);
        };

        CaseViewer.prototype.UpdateViewMapRecursive = function (model, view) {
            for (var i in model.Children) {
                var child_model = model.Children[i];
                var child_view = this.ViewMap[child_model.Label];
                if (child_view == null) {
                    child_view = new NodeView(this, child_model);
                    this.ViewMap[child_model.Label] = child_view;
                    child_view.ParentShape = view;
                }
                this.UpdateViewMapRecursive(child_model, child_view);
            }
        };

        CaseViewer.prototype.UpdateViewMap = function () {
            this.UpdateViewMapRecursive(this.ElementTop, this.ViewMap[this.ElementTop.Label]);
        };

        CaseViewer.prototype.Draw = function () {
            var shapelayer = $(this.Screen.ShapeLayer);
            var screenlayer = $(this.Screen.ContentLayer);
            this.UpdateViewMap();
            this.ViewMap[this.ElementTop.Label].AppendHTMLElementRecursive(shapelayer, screenlayer, this);
            this.pluginManager.RegisterActionEventListeners(this, this.Source, this.serverApi);
            this.Update();
        };
        CaseViewer.ElementWidth = 250;
        return CaseViewer;
    })();
    AssureIt.CaseViewer = CaseViewer;

    var ScrollManager = (function () {
        function ScrollManager() {
            this.InitialOffsetX = 0;
            this.InitialOffsetY = 0;
            this.InitialX = 0;
            this.InitialY = 0;
            this.CurrentX = 0;
            this.CurrentY = 0;
            this.MainPointerID = 0;
            this.Pointers = [];
        }
        ScrollManager.prototype.SetInitialOffset = function (InitialOffsetX, InitialOffsetY) {
            this.InitialOffsetX = InitialOffsetX;
            this.InitialOffsetY = InitialOffsetY;
        };

        ScrollManager.prototype.StartDrag = function (InitialX, InitialY) {
            this.InitialX = InitialX;
            this.InitialY = InitialY;
        };

        ScrollManager.prototype.UpdateDrag = function (CurrentX, CurrentY) {
            this.CurrentX = CurrentX;
            this.CurrentY = CurrentY;
        };

        ScrollManager.prototype.CalcOffsetX = function () {
            return this.CurrentX - this.InitialX + this.InitialOffsetX;
        };

        ScrollManager.prototype.CalcOffsetY = function () {
            return this.CurrentY - this.InitialY + this.InitialOffsetY;
        };

        ScrollManager.prototype.GetMainPointer = function () {
            for (var i = 0; i < this.Pointers.length; ++i) {
                if (this.Pointers[i].identifier === this.MainPointerID) {
                    return this.Pointers[i];
                }
            }
            ;
            return null;
        };

        ScrollManager.prototype.IsDragging = function () {
            return this.MainPointerID != null;
        };

        ScrollManager.prototype.OnPointerEvent = function (e, Screen) {
            this.Pointers = e.getPointerList();
            if (this.Pointers.length > 0) {
                if (this.IsDragging()) {
                    var mainPointer = this.GetMainPointer();
                    if (mainPointer) {
                        this.UpdateDrag(mainPointer.pageX, mainPointer.pageY);
                        Screen.SetOffset(this.CalcOffsetX(), this.CalcOffsetY());
                    } else {
                        this.MainPointerID = null;
                    }
                } else {
                    var mainPointer = this.Pointers[0];
                    this.MainPointerID = mainPointer.identifier;
                    this.SetInitialOffset(Screen.GetOffsetX(), Screen.GetOffsetY());
                    this.StartDrag(mainPointer.pageX, mainPointer.pageY);
                }
            } else {
                this.MainPointerID = null;
            }
        };

        ScrollManager.prototype.OnDoubleTap = function (e, Screen) {
            var width = Screen.ContentLayer.clientWidth;
            var height = Screen.ContentLayer.clientHeight;
            var pointer = this.Pointers[0];
            //Screen.SetOffset(width / 2 - pointer.pageX, height / 2 - pointer.pageY);
        };
        return ScrollManager;
    })();
    AssureIt.ScrollManager = ScrollManager;

    var ScreenManager = (function () {
        function ScreenManager(ShapeLayer, ContentLayer, ControlLayer, BackGroundLayer) {
            var _this = this;
            this.ShapeLayer = ShapeLayer;
            this.ContentLayer = ContentLayer;
            this.ControlLayer = ControlLayer;
            this.BackGroundLayer = BackGroundLayer;
            this.ScrollManager = new ScrollManager();
            this.OffsetX = 0;
            this.OffsetY = 0;
            this.LogicalOffsetX = 0;
            this.LogicalOffsetY = 0;
            this.Scale = 1;
            this.ContentLayer.style["transformOrigin"] = "left top";
            this.ContentLayer.style["MozTransformOrigin"] = "left top";
            this.ContentLayer.style["msTransformOrigin"] = "left top";
            this.ContentLayer.style["OTransformOrigin"] = "left top";
            this.ContentLayer.style["webkitTransformOrigin"] = "left top";
            this.ControlLayer.style["transformOrigin"] = "left top";
            this.ControlLayer.style["MozTransformOrigin"] = "left top";
            this.ControlLayer.style["msTransformOrigin"] = "left top";
            this.ControlLayer.style["OTransformOrigin"] = "left top";
            this.ControlLayer.style["webkitTransformOrigin"] = "left top";
            this.UpdateAttr();
            var OnPointer = function (e) {
                _this.ScrollManager.OnPointerEvent(e, _this);
            };
            BackGroundLayer.addEventListener("pointerdown", OnPointer, false);
            BackGroundLayer.addEventListener("pointermove", OnPointer, false);
            BackGroundLayer.addEventListener("pointerup", OnPointer, false);
            BackGroundLayer.addEventListener("gesturedoubletap", function (e) {
                _this.ScrollManager.OnDoubleTap(e, _this);
            }, false);
            ContentLayer.addEventListener("pointerdown", OnPointer, false);
            ContentLayer.addEventListener("pointermove", OnPointer, false);
            ContentLayer.addEventListener("pointerup", OnPointer, false);
            ContentLayer.addEventListener("gesturedoubletap", function (e) {
                _this.ScrollManager.OnDoubleTap(e, _this);
            }, false);
            //BackGroundLayer.addEventListener("gesturescale", OnPointer, false);
        }
        ScreenManager.translateA = function (x, y) {
            return "translate(" + x + " " + y + ") ";
        };

        ScreenManager.scaleA = function (scale) {
            return "scale(" + scale + ") ";
        };

        ScreenManager.translateS = function (x, y) {
            return "translate(" + x + "px, " + y + "px) ";
        };

        ScreenManager.scaleS = function (scale) {
            return "scale(" + scale + ") ";
        };

        ScreenManager.prototype.UpdateAttr = function () {
            var attr = ScreenManager.translateA(this.OffsetX, this.OffsetY) + ScreenManager.scaleA(this.Scale);
            var style = ScreenManager.translateS(this.OffsetX, this.OffsetY) + ScreenManager.scaleS(this.Scale);
            this.ShapeLayer.setAttribute("transform", attr);
            this.ContentLayer.style["transform"] = style;
            this.ContentLayer.style["MozTransform"] = style;
            this.ContentLayer.style["webkitTransform"] = style;
            this.ContentLayer.style["msTransform"] = style;
            this.ContentLayer.style["OTransform"] = style;
            this.ControlLayer.style["transform"] = style;
            this.ControlLayer.style["MozTransform"] = style;
            this.ControlLayer.style["webkitTransform"] = style;
            this.ControlLayer.style["msTransform"] = style;
            this.ControlLayer.style["OTransform"] = style;
        };

        ScreenManager.prototype.SetScale = function (scale) {
            this.Scale = scale;
            var cx = this.GetPageCenterX();
            var cy = this.GetPageCenterY();
            this.OffsetX = (this.LogicalOffsetX - cx) * scale + cx;
            this.OffsetY = (this.LogicalOffsetY - cy) * scale + cy;
            this.UpdateAttr();
        };

        ScreenManager.prototype.SetOffset = function (x, y) {
            this.OffsetX = x;
            this.OffsetY = y;
            this.LogicalOffsetX = this.CalcLogicalOffsetX(x);
            this.LogicalOffsetY = this.CalcLogicalOffsetY(y);
            this.UpdateAttr();
        };

        ScreenManager.prototype.SetLogicalOffset = function (x, y, scale) {
            this.LogicalOffsetX = x;
            this.LogicalOffsetY = y;
            this.SetScale(scale || this.Scale);
        };

        ScreenManager.prototype.GetLogicalOffsetX = function () {
            return this.LogicalOffsetX;
        };

        ScreenManager.prototype.GetLogicalOffsetY = function () {
            return this.LogicalOffsetY;
        };

        ScreenManager.prototype.CalcLogicalOffsetX = function (OffsetX) {
            var cx = this.GetPageCenterX();
            return (OffsetX - cx) / this.Scale + cx;
        };

        ScreenManager.prototype.CalcLogicalOffsetY = function (OffsetY) {
            var cy = this.GetPageCenterY();
            return (OffsetY - cy) / this.Scale + cy;
        };

        ScreenManager.prototype.CalcLogicalOffsetXFromPageX = function (PageX) {
            return this.GetLogicalOffsetX() - (PageX - this.GetPageCenterX()) / this.Scale;
        };

        ScreenManager.prototype.CalcLogicalOffsetYFromPageY = function (PageY) {
            return this.GetLogicalOffsetY() - (PageY - this.GetPageCenterY()) / this.Scale;
        };

        ScreenManager.prototype.GetOffsetX = function () {
            return this.OffsetX;
        };

        ScreenManager.prototype.GetOffsetY = function () {
            return this.OffsetY;
        };

        ScreenManager.prototype.GetWidth = function () {
            return document.body.clientWidth;
        };

        ScreenManager.prototype.GetHeight = function () {
            return document.body.clientHeight;
        };

        ScreenManager.prototype.GetPageCenterX = function () {
            return this.GetWidth() / 2;
        };

        ScreenManager.prototype.GetPageCenterY = function () {
            return this.GetHeight() / 2;
        };

        ScreenManager.prototype.GetCaseWidth = function () {
            return $("#layer0")[0].getBoundingClientRect().width;
        };

        ScreenManager.prototype.GetCaseHeight = function () {
            return $("#layer0")[0].getBoundingClientRect().height;
        };

        ScreenManager.prototype.GetScale = function () {
            return this.Scale;
        };

        ScreenManager.prototype.GetScaleRate = function () {
            var svgwidth = this.GetCaseWidth();
            var svgheight = this.GetCaseHeight();
            var bodywidth = this.GetWidth();
            var bodyheight = this.GetHeight();
            var scaleWidth = bodywidth / svgwidth;
            var scaleHeight = bodyheight / svgheight;
            return Math.min(scaleWidth, scaleHeight);
        };

        ScreenManager.prototype.SetCaseCenter = function (DCaseX, DCaseY, HTMLDoc) {
            var NewOffsetX = this.OffsetX + (this.GetPageCenterX() - (this.OffsetX + DCaseX)) - HTMLDoc.Width / 2;
            var NewOffsetY = this.OffsetY + (this.GetPageCenterY() - (this.OffsetY + DCaseY)) - HTMLDoc.Height / 2;
            this.SetOffset(NewOffsetX, NewOffsetY);
        };
        return ScreenManager;
    })();
    AssureIt.ScreenManager = ScreenManager;
})(AssureIt || (AssureIt = {}));
