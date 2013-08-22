/// <reference path="CaseModel.ts" />
/// <reference path="CaseViewer.ts" />

module AssureIt {

	export class LayoutEngine {
		X_MARGIN: number;
		Y_MARGIN: number;
		ElementWidth: number;

		constructor(public ViewMap: { [index: string]: NodeView; }) {
		}

		Init(Element: NodeModel, x: number, y: number, ElementWidth: number): void {
		}

		LayoutAllView(Element: NodeModel, x: number, y: number): void {
		}

		SetFootElementPosition(): void {
		}

		SetAllElementPosition(Element: NodeModel): void {
		}

		GetContextIndex(Node: NodeModel): number {
			for (var i: number = 0; i < Node.Children.length; i++) {
				if (Node.Children[i].Type == NodeType.Context) {
					return i;
				}
			}
			return -1;
		}
	}

	export class LayoutLandscape extends LayoutEngine {
		//	var CaseArray : any[];
		//	footelement : string[] = new Array();
		//	contextId : number = -1;
		LeafNodeNames: string[] = new Array();
		CONTEXT_MARGIN: number = 140;

		constructor(public ViewMap: { [index: string]: NodeView; }) {
			super(ViewMap);
			this.X_MARGIN = 200;
			this.Y_MARGIN = 180;
		}

		Traverse(Element: NodeModel, Depth: number, x: number): void {
			this.SetXpos(Element, Depth);
			this.SetLeafYpos(Element);
			this.SetOtherYpos(Element);
		}

		LayoutAllView(Element: NodeModel, x: number, y: number) {
			this.Traverse(Element, x, y);
			this.SetFootElementPosition();
			this.SetAllElementPosition(Element);
		}

		SetXpos(Element: NodeModel, Depth: number): void {
			if (Element.Type == NodeType.Context) {
				Depth -= 1;
			}

			this.SetVector(Element);

			this.ViewMap[Element.Label].AbsX = Depth * this.X_MARGIN;

			if (Element.Children.length == 0) {
				if (Element.Type != NodeType.Context) {//
					this.LeafNodeNames.push(Element.Label);
				}
			} else if (Element.Children.length == 1) {
				if (Element.Children[0].Type == NodeType.Context) {
					this.LeafNodeNames.push(Element.Label);//if not Context
				}
			}

			for (var i: number = 0; i < Element.Children.length; i++) {
				this.SetXpos(Element.Children[i], Depth + 1);
			}
			return;
		}

		SetVector(Element: NodeModel): void {
			var CaseView = this.ViewMap[Element.Label];
			if (Element.Type == NodeType.Context) {
				CaseView.IsArrowWhite = true;
			}
			return;
		}

		SetLeafYpos(Element: NodeModel): void {
			for (var i: number = 1; i < this.LeafNodeNames.length; i++) {
				if (this.ViewMap[this.LeafNodeNames[i]].Source.Children.length == 1 && this.ViewMap[this.LeafNodeNames[i]].Source.Type != NodeType.Context) {
					this.ViewMap[this.LeafNodeNames[i]].AbsY += this.ViewMap[this.LeafNodeNames[i - 1]].AbsY + this.Y_MARGIN * 2;
				} else {
					this.ViewMap[this.LeafNodeNames[i]].AbsY += this.ViewMap[this.LeafNodeNames[i - 1]].AbsY + this.Y_MARGIN;
				}
			}
		}

		SetOtherYpos(Element: NodeModel): void {
			if (Element.Children.length == 0) {
				return;
			}

			if (Element.Children.length == 1 && Element.Children[0].Type == NodeType.Context) {
				this.ViewMap[Element.Children[0].Label].AbsY = (this.ViewMap[Element.Label].AbsY - this.CONTEXT_MARGIN);
				return;
			}

			for (var i: number = 0; i < Element.Children.length; i++) {
				this.SetOtherYpos(Element.Children[i]);
			}

			var IntermediatePos: number = 0;

			var ContextIndex: number = this.GetContextIndex(Element);

			IntermediatePos = this.CalcIntermediatePos(Element, ContextIndex);

			if (ContextIndex == -1) {
				if (Element.Children.length == 1 && Element.Children[0].Type == NodeType.Evidence) {
					this.ViewMap[Element.Label].AbsY = this.ViewMap[Element.Children[0].Label].AbsY + 15;
				}
				else {
					this.ViewMap[Element.Label].AbsY = IntermediatePos;
				}
			} else {
				this.ViewMap[Element.Label].AbsY = IntermediatePos;
				this.ViewMap[Element.Children[ContextIndex].Label].AbsY = this.ViewMap[Element.Label].AbsY - this.CONTEXT_MARGIN;
			}
			return;
		}

		CalcIntermediatePos(Element: NodeModel, ContextIndex: number): number {
			var ChildLen = Element.Children.length;

			if (ContextIndex == ChildLen - 1) {
				return (this.ViewMap[Element.Children[0].Label].AbsY
					+ (this.ViewMap[Element.Children[ChildLen - 2].Label].AbsY
					- this.ViewMap[Element.Children[0].Label].AbsY) / 2);
			}
			else if (ContextIndex == 0) {
				return (this.ViewMap[Element.Children[1].Label].AbsY
					+ (this.ViewMap[Element.Children[ChildLen - 1].Label].AbsY
					- this.ViewMap[Element.Children[1].Label].AbsY) / 2);
			}
			else {
				return (this.ViewMap[Element.Children[0].Label].AbsY
					+ (this.ViewMap[Element.Children[ChildLen - 1].Label].AbsY
					- this.ViewMap[Element.Children[0].Label].AbsY) / 2);
			}
		}
	}

	export class LayoutPortrait extends LayoutEngine {
		ElementWidth: number = 50;
		X_MARGIN: number = 200;
		Y_MARGIN: number = 150;
		Y_ADJUSTMENT_MARGIN: number = 50;
		Y_NODE_MARGIN: number = 205;
		Y_NODE_ADJUSTMENT_MARGIN: number = 70;
		X_CONTEXT_MARGIN: number = 200;
		X_OVER_MARGIN: number = 700;
		X_FOOT_MARGIN: number = 100;
		X_MULTI_ELEMENT_MARGIN: number = 20;
		footelement: string[] = new Array();
		contextId: number = -1;

		constructor(public ViewMap: { [index: string]: NodeView; }) {
			super(ViewMap);
		}

		UpdateContextElementPosition(ContextElement: NodeModel): void {
			var ContextView: NodeView = this.ViewMap[ContextElement.Label];
			var ParentView: NodeView = ContextView.ParentShape;
			ContextView.IsArrowWhite = true;
			ContextView.AbsX = (ParentView.AbsX + this.X_CONTEXT_MARGIN);
			ContextView.AbsY = ParentView.AbsY;
		}

		SetAllElementPosition(Element: NodeModel): void {
			var n: number = Element.Children.length;
			var ParentView: NodeView = this.ViewMap[Element.Label];
			var ContextIndex: number = this.GetContextIndex(Element);
			if (n == 0) {
				if(Element.Type == NodeType.Goal){
					(<GoalShape>ParentView.SVGShape).SetUndevelolpedSymbolPosition(ParentView.GetAbsoluteConnectorPosition(Direction.Bottom));
				}
				return;
			}

			if (n == 1 && ContextIndex == 0) {
				this.UpdateContextElementPosition(Element.Children[0]);
			}else{
				var xPositionSum: number = 0;

				for (var i: number = 0; i < n; i++) {
					this.SetAllElementPosition(Element.Children[i]);
					if (ContextIndex != i) {
						xPositionSum += this.ViewMap[Element.Children[i].Label].AbsX;
					}
				}

				if (ContextIndex == -1) {
					ParentView.AbsX = xPositionSum / n;
				}
				else {//set context (x, y) position
					ParentView.AbsX = xPositionSum / (n - 1);
					this.UpdateContextElementPosition(Element.Children[ContextIndex]);
				}
			}

			for (var i: number = 0; i < n; i++) {
				var ChildView = this.ViewMap[Element.Children[i].Label];
				if (ContextIndex == i) {
					var p1 = ParentView.GetAbsoluteConnectorPosition(Direction.Right);
					var p2 = ChildView.GetAbsoluteConnectorPosition(Direction.Left);
					var y = Math.min(p1.y, p2.y);
					p1.y = y;
					p2.y = y;
					ChildView.SetArrowPosition(p1, p2, Direction.Left);
					ChildView.IsArrowWhite = true;
				}else{
					var p1 = ParentView.GetAbsoluteConnectorPosition(Direction.Bottom);
					var p2 = ChildView.GetAbsoluteConnectorPosition(Direction.Top);
					ChildView.SetArrowPosition(p1, p2, Direction.Bottom);
				}
			}
		}

		CalculateMinPosition(ElementList: NodeModel[]): number {
			if (ElementList[0].Type == NodeType.Context) {
				var xPosition: number = this.ViewMap[ElementList[1].Label].AbsX;
			}
			else {
				var xPosition: number = this.ViewMap[ElementList[0].Label].AbsX;
			}
//			var xPosition: number = this.ViewMap[ElementList[0].Label].AbsX;
			var n: number = ElementList.length;
			for (var i: number = 0; i < n; i++) {
				if (ElementList[i].Type == NodeType.Context) {
					continue;
				}
				if (xPosition > this.ViewMap[ElementList[i].Label].AbsX) {
					xPosition = this.ViewMap[ElementList[i].Label].AbsX;
				}
			}
			return xPosition;
		}

		CalculateMaxPosition(ElementList: NodeModel[]): number {
			if (ElementList[0].Type == NodeType.Context) {
				var xPosition: number = this.ViewMap[ElementList[1].Label].AbsX;
			}
			else {
				var xPosition: number = this.ViewMap[ElementList[0].Label].AbsX;
			}

			var n: number = ElementList.length;
			for (var i: number = 0; i < n; i++) {
				var ChildView: NodeView = this.ViewMap[ElementList[i].Label];
				if (ElementList[i].Type == NodeType.Context) {
					continue;
				}
				if (xPosition < ChildView.AbsX) {
					xPosition = ChildView.AbsX;
				}
			}
			return xPosition;
		}

		GetSameParentLabel(PreviousNodeView: NodeView, CurrentNodeView: NodeView): string {
			var PreviousParentShape: NodeView = PreviousNodeView.ParentShape;
			var CurrentParentShape : NodeView = CurrentNodeView.ParentShape;
			var PreviousParentArray: string[] = [];
			var CurrentParentArray: string[] = [];

			while(PreviousParentShape != null) {
				PreviousParentArray.push(PreviousParentShape.Source.Label);
				PreviousParentShape = PreviousParentShape.ParentShape;
			}
			while(CurrentParentShape != null) {
				CurrentParentArray.push(CurrentParentShape.Source.Label);
				CurrentParentShape = CurrentParentShape.ParentShape;
			}
			var PreviousParentLength: number = PreviousParentArray.length;
			var CurrentParentLength : number  = CurrentParentArray.length;
			for(var i: number = 0; i < PreviousParentLength; i++) {
				for(var j: number = 0; j < CurrentParentLength; j++) {
					if(PreviousParentArray[i] == CurrentParentArray[j]) {
						return PreviousParentArray[i];
					}
				}
			}
			return null;
		}

		HasContextinParentNode(PreviousNodeView: NodeView, SameParentLabel: string): boolean {
			var PreviousParentShape: NodeView = PreviousNodeView.ParentShape;
			while(PreviousParentShape != null) {
				if(PreviousParentShape.Source.Label == SameParentLabel) {
					break;
				}
				if(this.GetContextIndex(PreviousParentShape.Source) != -1) {
					return true;
				}
				PreviousParentShape = PreviousParentShape.ParentShape;
			}
			return false;
		}

		SetFootElementPosition(): void {
			var n: number = this.footelement.length;
			for (var i: number = 0; i < n; i++) {
				var PreviousNodeView: NodeView = this.ViewMap[this.footelement[i - 1]];
				var CurrentNodeView: NodeView = this.ViewMap[this.footelement[i]];
				CurrentNodeView.AbsX = 0;
				if (i != 0) {
					var SameParentLabel: string = this.GetSameParentLabel(PreviousNodeView, CurrentNodeView);
					var HasContext: boolean = this.HasContextinParentNode(PreviousNodeView, SameParentLabel);
					if ((PreviousNodeView.ParentShape.Source.Label != CurrentNodeView.ParentShape.Source.Label) && HasContext) {
						var PreviousParentChildren: NodeModel[] = PreviousNodeView.ParentShape.Source.Children;
						var Min_xPosition: number = this.CalculateMinPosition(PreviousParentChildren);
						var Max_xPosition: number = this.CalculateMaxPosition(PreviousParentChildren);
						var HalfChildrenWidth: number = (Max_xPosition - Min_xPosition) / 2;
						if (HalfChildrenWidth > (this.X_CONTEXT_MARGIN - this.X_MULTI_ELEMENT_MARGIN)) {
							CurrentNodeView.AbsX += this.X_MULTI_ELEMENT_MARGIN;
						}
						else {
							CurrentNodeView.AbsX +=  this.X_CONTEXT_MARGIN - HalfChildrenWidth;
						}
					}
					if (this.GetContextIndex(PreviousNodeView.Source) != -1 && (CurrentNodeView.AbsX - PreviousNodeView.AbsX) < this.X_MARGIN) {
						CurrentNodeView.AbsX += this.X_MARGIN;
					}

					CurrentNodeView.AbsX += (PreviousNodeView.AbsX + this.X_MARGIN);
					if(CurrentNodeView.AbsX - PreviousNodeView.AbsX > this.X_OVER_MARGIN) {
						CurrentNodeView.AbsX -= this.X_MARGIN;
					}
				}
			}
			return;
		}

		Init(Element: NodeModel, x: number, y: number, ElementWidth: number): void {
			this.ViewMap[Element.Label].AbsY += y;
			this.X_MARGIN = ElementWidth + 50;
			this.X_CONTEXT_MARGIN = ElementWidth + 50;
		}

		Traverse(Element: NodeModel, x: number, y: number) {
			if ((Element.Children.length == 0 && Element.Type != NodeType.Context) || (Element.Children.length == 1 && Element.Children[0].Type == NodeType.Context)) {
				this.footelement.push(Element.Label);
				return;
			}

			var i: number = 0;
			i = this.GetContextIndex(Element);
			if (i != -1) { //emit context element data
				var ContextView: NodeView = this.ViewMap[Element.Children[i].Label];
				var ParentView: NodeView = ContextView.ParentShape;
				var h1: number = ContextView.HTMLDoc.Height;
				var h2: number = ParentView.HTMLDoc.Height;
				var h: number = (h1 - h2) / 2;
				//ContextView.ParentDirection = Direction.Left;
				ContextView.AbsX += x;
				ContextView.AbsY += (y - h);
				ContextView.AbsX += this.X_CONTEXT_MARGIN;
//				this.EmitChildrenElement(Element, ParentView.AbsX, ParentView.AbsY, i, ((this.Y_MARGIN > Math.abs(h1 - h2)) ? 0 : Math.abs(h1 - h2)));
				this.EmitChildrenElement(Element, ParentView.AbsX, ParentView.AbsY, i, ((this.Y_MARGIN > Math.abs(h1 - h2)) ? h2 : Math.abs(h1 - h2)));
			} else {  //emit element data except context
				var h2: number = 0;
				var CurrentView: NodeView = this.ViewMap[Element.Label];
//				if(ParentView != null) {
//					h2 = ParentView.HTMLDoc.Height/2;
//				}
				h2 = CurrentView.HTMLDoc.Height;
				this.EmitChildrenElement(Element, x, y, i, h2);
			}
		}

		LayoutAllView(Element: NodeModel, x: number, y: number) {
			this.Traverse(Element, x, y);
			this.SetFootElementPosition();
			this.SetAllElementPosition(Element);
		}

		EmitChildrenElement(Node: NodeModel, x: number, y: number, ContextId: number, h: number): void {
			var n: number = Node.Children.length;
			var MaxYPostition: number  = 0;
			for (var i: number = 0; i < n; i++) {
				var ElementView: NodeView = this.ViewMap[Node.Children[i].Label];
				var j: number = this.GetContextIndex(Node.Children[i]);
				var ContextHeight: number = 0;
				if(j != -1) {
					ContextHeight = this.ViewMap[Node.Children[i].Children[j].Label].HTMLDoc.Height;
				}
				if (ContextId == i) {
					continue;
				}
				else {
					var height: number = (ContextHeight > ElementView.HTMLDoc.Height) ? ContextHeight : ElementView.HTMLDoc.Height;
					var ParentElementView: NodeView = this.ViewMap[Node.Label];
					ElementView.AbsY = y;
//					ElementView.AbsY += ((height > this.Y_MARGIN) ? height : this.Y_MARGIN) + h;
					ElementView.AbsY = y + this.Y_MARGIN + h;
//					ElementView.AbsY += (((ElementView.AbsY - ParentElementView.AbsY) < this.Y_NODE_MARGIN) ? this.Y_NODE_ADJUSTMENT_MARGIN : 0);
					MaxYPostition = (ElementView.AbsY > MaxYPostition) ? ElementView.AbsY : MaxYPostition;
					this.Traverse(Node.Children[i], ElementView.AbsX, ElementView.AbsY);
				}
			}
			for (var i: number = 0; i < n; i++) {
				var ElementView: NodeView = this.ViewMap[Node.Children[i].Label];
				if (ContextId == i) {
					continue;
				}
				else {
					ElementView.AbsY = MaxYPostition;
				}
			}
			return;
		}
	}
}
