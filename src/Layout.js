var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var AssureIt;
(function (AssureIt) {
    var LayoutEngine = (function () {
        function LayoutEngine(ViewMap) {
            this.ViewMap = ViewMap;
        }
        LayoutEngine.prototype.Init = function (Element, x, y, ElementWidth) {
        };

        LayoutEngine.prototype.Traverse = function (Element, x, y) {
        };

        LayoutEngine.prototype.SetFootElementPosition = function () {
        };

        LayoutEngine.prototype.SetAllElementPosition = function (Element) {
        };

        LayoutEngine.prototype.GetContextIndex = function (Node) {
            for (var i = 0; i < Node.Children.length; i++) {
                if (Node.Children[i].Type == AssureIt.NodeType.Context) {
                    return i;
                }
            }
            return -1;
        };
        return LayoutEngine;
    })();
    AssureIt.LayoutEngine = LayoutEngine;

    var LayoutLandscape = (function (_super) {
        __extends(LayoutLandscape, _super);
        function LayoutLandscape(ViewMap) {
            _super.call(this, ViewMap);
            this.ViewMap = ViewMap;
            this.LeafNodeNames = new Array();
            this.CONTEXT_MARGIN = 140;
            this.X_MARGIN = 200;
            this.Y_MARGIN = 180;
        }
        LayoutLandscape.prototype.Traverse = function (Element, Depth, x) {
            this.SetXpos(Element, Depth);
            this.SetLeafYpos(Element);
            this.SetOtherYpos(Element);
        };

        LayoutLandscape.prototype.SetXpos = function (Element, Depth) {
            if (Element.Type == AssureIt.NodeType.Context) {
                Depth -= 1;
            }

            this.SetVector(Element);

            this.ViewMap[Element.Label].AbsX = Depth * this.X_MARGIN;

            if (Element.Children.length == 0) {
                if (Element.Type != AssureIt.NodeType.Context) {
                    this.LeafNodeNames.push(Element.Label);
                }
            } else if (Element.Children.length == 1) {
                if (Element.Children[0].Type == AssureIt.NodeType.Context) {
                    this.LeafNodeNames.push(Element.Label);
                }
            }

            for (var i = 0; i < Element.Children.length; i++) {
                this.SetXpos(Element.Children[i], Depth + 1);
            }
            return;
        };

        LayoutLandscape.prototype.SetVector = function (Element) {
            var CaseView = this.ViewMap[Element.Label];
            if (Element.Type == AssureIt.NodeType.Context) {
                CaseView.ParentDirection = AssureIt.Direction.Bottom;
                CaseView.IsArrowReversed = true;
                CaseView.IsArrowStraight = true;
                CaseView.IsArrowWhite = true;
            } else {
                CaseView.ParentDirection = AssureIt.Direction.Left;
            }
            return;
        };

        LayoutLandscape.prototype.SetLeafYpos = function (Element) {
            for (var i = 1; i < this.LeafNodeNames.length; i++) {
                if (this.ViewMap[this.LeafNodeNames[i]].Source.Children.length == 1 && this.ViewMap[this.LeafNodeNames[i]].Source.Type != AssureIt.NodeType.Context) {
                    this.ViewMap[this.LeafNodeNames[i]].AbsY += this.ViewMap[this.LeafNodeNames[i - 1]].AbsY + this.Y_MARGIN * 2;
                } else {
                    this.ViewMap[this.LeafNodeNames[i]].AbsY += this.ViewMap[this.LeafNodeNames[i - 1]].AbsY + this.Y_MARGIN;
                }
            }
        };

        LayoutLandscape.prototype.SetOtherYpos = function (Element) {
            if (Element.Children.length == 0) {
                return;
            }

            if (Element.Children.length == 1 && Element.Children[0].Type == AssureIt.NodeType.Context) {
                this.ViewMap[Element.Children[0].Label].AbsY = (this.ViewMap[Element.Label].AbsY - this.CONTEXT_MARGIN);
                return;
            }

            for (var i = 0; i < Element.Children.length; i++) {
                this.SetOtherYpos(Element.Children[i]);
            }

            var IntermediatePos = 0;

            var ContextIndex = this.GetContextIndex(Element);

            IntermediatePos = this.CalcIntermediatePos(Element, ContextIndex);

            if (ContextIndex == -1) {
                if (Element.Children.length == 1 && Element.Children[0].Type == AssureIt.NodeType.Evidence) {
                    this.ViewMap[Element.Label].AbsY = this.ViewMap[Element.Children[0].Label].AbsY + 15;
                } else {
                    this.ViewMap[Element.Label].AbsY = IntermediatePos;
                }
            } else {
                this.ViewMap[Element.Label].AbsY = IntermediatePos;
                this.ViewMap[Element.Children[ContextIndex].Label].AbsY = this.ViewMap[Element.Label].AbsY - this.CONTEXT_MARGIN;
            }
            return;
        };

        LayoutLandscape.prototype.CalcIntermediatePos = function (Element, ContextIndex) {
            var ChildLen = Element.Children.length;

            if (ContextIndex == ChildLen - 1) {
                return (this.ViewMap[Element.Children[0].Label].AbsY + (this.ViewMap[Element.Children[ChildLen - 2].Label].AbsY - this.ViewMap[Element.Children[0].Label].AbsY) / 2);
            } else if (ContextIndex == 0) {
                return (this.ViewMap[Element.Children[1].Label].AbsY + (this.ViewMap[Element.Children[ChildLen - 1].Label].AbsY - this.ViewMap[Element.Children[1].Label].AbsY) / 2);
            } else {
                return (this.ViewMap[Element.Children[0].Label].AbsY + (this.ViewMap[Element.Children[ChildLen - 1].Label].AbsY - this.ViewMap[Element.Children[0].Label].AbsY) / 2);
            }
        };
        return LayoutLandscape;
    })(LayoutEngine);
    AssureIt.LayoutLandscape = LayoutLandscape;

    var LayoutPortrait = (function (_super) {
        __extends(LayoutPortrait, _super);
        function LayoutPortrait(ViewMap) {
            _super.call(this, ViewMap);
            this.ViewMap = ViewMap;
            this.ElementWidth = 150;
            this.X_MARGIN = 200;
            this.Y_MARGIN = 150;
            this.Y_ADJUSTMENT_MARGIN = 50;
            this.Y_NODE_MARGIN = 205;
            this.Y_NODE_ADJUSTMENT_MARGIN = 70;
            this.X_CONTEXT_MARGIN = 200;
            this.X_FOOT_MARGIN = 100;
            this.X_MULTI_ELEMENT_MARGIN = 20;
            this.footelement = new Array();
            this.contextId = -1;
        }
        LayoutPortrait.prototype.UpdateContextElementPosition = function (ContextElement) {
            var ContextView = this.ViewMap[ContextElement.Label];
            var ParentView = ContextView.ParentShape;
            var h1 = ContextView.HTMLDoc.Height;
            var h2 = ParentView.HTMLDoc.Height;
            ContextView.ParentDirection = AssureIt.Direction.Left;
            ContextView.IsArrowReversed = true;
            ContextView.IsArrowStraight = true;
            ContextView.IsArrowWhite = true;
            ContextView.AbsX = (ParentView.AbsX + this.X_CONTEXT_MARGIN);
            ContextView.AbsY = (ParentView.AbsY - (h1 - h2) / 2);
        };

        LayoutPortrait.prototype.SetAllElementPosition = function (Element) {
            var n = Element.Children.length;
            if (n == 0) {
                return;
            }
            var ParentView = this.ViewMap[Element.Label];

            if (n == 1 && Element.Children[0].Type == AssureIt.NodeType.Context) {
                this.UpdateContextElementPosition(Element.Children[0]);
                return;
            }

            for (var i = 0; i < n; i++) {
                this.SetAllElementPosition(Element.Children[i]);
            }

            var ContextIndex = this.GetContextIndex(Element);
            var xPositionSum = 0;
            for (var i = 0; i < n; i++) {
                if (ContextIndex != i) {
                    xPositionSum += this.ViewMap[Element.Children[i].Label].AbsX;
                }
            }
            if (ContextIndex == -1) {
                ParentView.AbsX = xPositionSum / n;
            } else {
                ParentView.AbsX = xPositionSum / (n - 1);
                this.UpdateContextElementPosition(Element.Children[ContextIndex]);
            }
        };

        LayoutPortrait.prototype.CalculateMinPosition = function (ElementList) {
            if (ElementList[0].Type == AssureIt.NodeType.Context) {
                var xPosition = this.ViewMap[ElementList[1].Label].AbsX;
            } else {
                var xPosition = this.ViewMap[ElementList[0].Label].AbsX;
            }

            var n = ElementList.length;
            for (var i = 0; i < n; i++) {
                if (ElementList[i].Type == AssureIt.NodeType.Context) {
                    continue;
                }
                if (xPosition > this.ViewMap[ElementList[i].Label].AbsX) {
                    xPosition = this.ViewMap[ElementList[i].Label].AbsX;
                }
            }
            return xPosition;
        };

        LayoutPortrait.prototype.CalculateMaxPosition = function (ElementList) {
            if (ElementList[0].Type == AssureIt.NodeType.Context) {
                var xPosition = this.ViewMap[ElementList[1].Label].AbsX;
            } else {
                var xPosition = this.ViewMap[ElementList[0].Label].AbsX;
            }

            var n = ElementList.length;
            for (var i = 0; i < n; i++) {
                var ChildView = this.ViewMap[ElementList[i].Label];
                if (ElementList[i].Type == AssureIt.NodeType.Context) {
                    continue;
                }
                if (xPosition < ChildView.AbsX) {
                    xPosition = ChildView.AbsX;
                }
            }
            return xPosition;
        };

        LayoutPortrait.prototype.SetFootElementPosition = function () {
            var n = this.footelement.length;
            for (var i = 0; i < n; i++) {
                var PreviousNodeView = this.ViewMap[this.footelement[i - 1]];
                var CurrentNodeView = this.ViewMap[this.footelement[i]];
                CurrentNodeView.AbsX = 0;
                if (i != 0) {
                    if ((PreviousNodeView.ParentShape.Source.Label != CurrentNodeView.ParentShape.Source.Label) && (this.GetContextIndex(PreviousNodeView.ParentShape.Source) != -1)) {
                        var PreviousParentChildren = PreviousNodeView.ParentShape.Source.Children;
                        var Min_xPosition = this.CalculateMinPosition(PreviousParentChildren);
                        var Max_xPosition = this.CalculateMaxPosition(PreviousParentChildren);
                        var HalfChildrenWidth = (Max_xPosition - Min_xPosition) / 2;
                        if (HalfChildrenWidth > (this.X_CONTEXT_MARGIN - this.X_MULTI_ELEMENT_MARGIN)) {
                            CurrentNodeView.AbsX += this.X_MULTI_ELEMENT_MARGIN;
                        } else {
                            CurrentNodeView.AbsX += this.X_CONTEXT_MARGIN - HalfChildrenWidth;
                        }
                    }
                    if (this.GetContextIndex(PreviousNodeView.Source) != -1) {
                        CurrentNodeView.AbsX += this.X_MARGIN;
                    }
                    CurrentNodeView.AbsX += (PreviousNodeView.AbsX + this.X_MARGIN);
                }
            }
            return;
        };

        LayoutPortrait.prototype.Init = function (Element, x, y, ElementWidth) {
            this.ViewMap[Element.Label].AbsY += y;
            this.X_MARGIN = ElementWidth + 50;
            this.X_CONTEXT_MARGIN = ElementWidth + 50;
        };

        LayoutPortrait.prototype.Traverse = function (Element, x, y) {
            if ((Element.Children.length == 0 && Element.Type != AssureIt.NodeType.Context) || (Element.Children.length == 1 && Element.Children[0].Type == AssureIt.NodeType.Context)) {
                this.footelement.push(Element.Label);

                return;
            }

            var i = 0;
            i = this.GetContextIndex(Element);
            if (i != -1) {
                var ContextView = this.ViewMap[Element.Children[i].Label];
                var ParentView = ContextView.ParentShape;
                var h1 = ContextView.HTMLDoc.Height;
                var h2 = ParentView.HTMLDoc.Height;
                var h = (h1 - h2) / 2;
                ContextView.ParentDirection = AssureIt.Direction.Left;
                ContextView.AbsX += x;
                ContextView.AbsY += (y - h);
                ContextView.AbsX += this.X_CONTEXT_MARGIN;
                this.EmitChildrenElement(Element, ParentView.AbsX, ParentView.AbsY, i, ((h1 > h2) ? h1 / 2 : h2 / 2));
            } else {
                var h2 = 0;
                if (ParentView != null) {
                    h2 = ParentView.HTMLDoc.Height / 2;
                }
                this.EmitChildrenElement(Element, x, y, i, h2);
            }
        };

        LayoutPortrait.prototype.EmitChildrenElement = function (Node, x, y, ContextId, h) {
            var n = Node.Children.length;
            var MaxYPostition = 0;
            for (var i = 0; i < n; i++) {
                var ElementView = this.ViewMap[Node.Children[i].Label];
                var j = this.GetContextIndex(Node.Children[i]);
                var ContextHeight = 0;
                if (j != -1) {
                    ContextHeight = this.ViewMap[Node.Children[i].Children[j].Label].HTMLDoc.Height;
                }
                if (ContextId == i) {
                    continue;
                } else {
                    var height = (ContextHeight > ElementView.HTMLDoc.Height) ? ContextHeight : ElementView.HTMLDoc.Height;
                    var ParentElementView = this.ViewMap[Node.Label];
                    ElementView.AbsY = y;
                    ElementView.AbsY += ((height > this.Y_MARGIN) ? height : this.Y_MARGIN) + h;
                    ElementView.AbsY += (((ElementView.AbsY - ParentElementView.AbsY) < this.Y_NODE_MARGIN) ? this.Y_NODE_ADJUSTMENT_MARGIN : 0);
                    MaxYPostition = (ElementView.AbsY > MaxYPostition) ? ElementView.AbsY : MaxYPostition;
                    this.Traverse(Node.Children[i], ElementView.AbsX, ElementView.AbsY);
                }
            }
            for (var i = 0; i < n; i++) {
                var ElementView = this.ViewMap[Node.Children[i].Label];
                if (ContextId == i) {
                    continue;
                } else {
                    ElementView.AbsY = MaxYPostition;
                }
            }
            return;
        };
        return LayoutPortrait;
    })(LayoutEngine);
    AssureIt.LayoutPortrait = LayoutPortrait;
})(AssureIt || (AssureIt = {}));
