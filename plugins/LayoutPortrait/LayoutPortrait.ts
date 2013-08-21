/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/ServerApi.ts" />
/// <reference path="../../src/PlugInManager.ts" />

class LayoutPortraitPlugIn extends AssureIt.PlugInSet {

	constructor(plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
		this.LayoutEnginePlugIn = new LayoutPortraitEnginePlugIn(plugInManager);
	}

}

class LayoutPortraitEnginePlugIn extends AssureIt.LayoutEnginePlugIn {
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

		ViewMap: {[index: string]: AssureIt.NodeView };

		constructor(public plugInManager: AssureIt.PlugInManager) {
			super(plugInManager);
		}


		UpdateContextElementPosition(ContextElement: AssureIt.NodeModel): void {
			var ContextView: AssureIt.NodeView = this.ViewMap[ContextElement.Label];
			var ParentView: AssureIt.NodeView = ContextView.ParentShape;
//			var h1: number = ContextView.HTMLDoc.Height;
//			var h2: number = ParentView.HTMLDoc.Height;
			ContextView.ParentDirection = AssureIt.Direction.Left;
			ContextView.IsArrowReversed = true;
			ContextView.IsArrowStraight = true;
			ContextView.IsArrowWhite = true;
			ContextView.AbsX = (ParentView.AbsX + this.X_CONTEXT_MARGIN);
//			ContextView.AbsY = (ParentView.AbsY - (h1 - h2) / 2);
			ContextView.AbsY = ParentView.AbsY;
		}

		SetAllElementPosition(Element: AssureIt.NodeModel): void {
			var n: number = Element.Children.length;
			if (n == 0) {
				return;
			}
			var ParentView: AssureIt.NodeView = this.ViewMap[Element.Label];

			if (n == 1 && Element.Children[0].Type == AssureIt.NodeType.Context) {
				this.UpdateContextElementPosition(Element.Children[0]);
				return;
			}

			for (var i: number = 0; i < n; i++) {
				this.SetAllElementPosition(Element.Children[i]);
			}

			var ContextIndex: number = this.GetContextIndex(Element);
			var xPositionSum: number = 0;
			for (var i: number = 0; i < n; i++) {
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

		CalculateMinPosition(ElementList: AssureIt.NodeModel[]): number {
			if (ElementList[0].Type == AssureIt.NodeType.Context) {
				var xPosition: number = this.ViewMap[ElementList[1].Label].AbsX;
			}
			else {
				var xPosition: number = this.ViewMap[ElementList[0].Label].AbsX;
			}
//			var xPosition: number = this.ViewMap[ElementList[0].Label].AbsX;
			var n: number = ElementList.length;
			for (var i: number = 0; i < n; i++) {
				if (ElementList[i].Type == AssureIt.NodeType.Context) {
					continue;
				}
				if (xPosition > this.ViewMap[ElementList[i].Label].AbsX) {
					xPosition = this.ViewMap[ElementList[i].Label].AbsX;
				}
			}
			return xPosition;
		}

		CalculateMaxPosition(ElementList: AssureIt.NodeModel[]): number {
			if (ElementList[0].Type == AssureIt.NodeType.Context) {
				var xPosition: number = this.ViewMap[ElementList[1].Label].AbsX;
			}
			else {
				var xPosition: number = this.ViewMap[ElementList[0].Label].AbsX;
			}

			var n: number = ElementList.length;
			for (var i: number = 0; i < n; i++) {
				var ChildView: AssureIt.NodeView = this.ViewMap[ElementList[i].Label];
				if (ElementList[i].Type == AssureIt.NodeType.Context) {
					continue;
				}
				if (xPosition < ChildView.AbsX) {
					xPosition = ChildView.AbsX;
				}
			}
			return xPosition;
		}

		GetSameParentLabel(PreviousNodeView: AssureIt.NodeView, CurrentNodeView: AssureIt.NodeView): string {
			var PreviousParentShape: AssureIt.NodeView = PreviousNodeView.ParentShape;
			var CurrentParentShape : AssureIt.NodeView = CurrentNodeView.ParentShape;
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

		HasContextinParentNode(PreviousNodeView: AssureIt.NodeView, SameParentLabel: string): boolean {
			var PreviousParentShape: AssureIt.NodeView = PreviousNodeView.ParentShape;
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
				var PreviousNodeView: AssureIt.NodeView = this.ViewMap[this.footelement[i - 1]];
				var CurrentNodeView: AssureIt.NodeView = this.ViewMap[this.footelement[i]];
				CurrentNodeView.AbsX = 0;
				if (i != 0) {
					var SameParentLabel: string = this.GetSameParentLabel(PreviousNodeView, CurrentNodeView);
					var HasContext: boolean = this.HasContextinParentNode(PreviousNodeView, SameParentLabel);
					if ((PreviousNodeView.ParentShape.Source.Label != CurrentNodeView.ParentShape.Source.Label) && HasContext) {
						var PreviousParentChildren: AssureIt.NodeModel[] = PreviousNodeView.ParentShape.Source.Children;
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

		Init(ViewMap: {[index: string]: AssureIt.NodeView}, Element: AssureIt.NodeModel, x: number, y: number, ElementWidth: number): void {
			this.footelement = [];
			this.contextId = -1;
			this.ElementWidth = ElementWidth;
			this.ViewMap = ViewMap;
			this.ViewMap[Element.Label].AbsY += y;
			this.X_MARGIN = ElementWidth + 50;
			this.X_CONTEXT_MARGIN = ElementWidth + 50;
		}

		LayoutAllView(ElementTop: AssureIt.NodeModel, x: number, y: number) {
			this.Traverse(ElementTop, x, y);
			this.SetFootElementPosition();
			this.SetAllElementPosition(ElementTop);
		}

		Traverse(Element: AssureIt.NodeModel, x: number, y: number) {
			if ((Element.Children.length == 0 && Element.Type != AssureIt.NodeType.Context) || (Element.Children.length == 1 && Element.Children[0].Type == AssureIt.NodeType.Context)) {
				this.footelement.push(Element.Label);
				return;
			}

			var i: number = 0;
			i = this.GetContextIndex(Element);
			if (i != -1) { //emit context element data
				var ContextView: AssureIt.NodeView = this.ViewMap[Element.Children[i].Label];
				var ParentView: AssureIt.NodeView = ContextView.ParentShape;
				var h1: number = ContextView.HTMLDoc.Height;
				var h2: number = ParentView.HTMLDoc.Height;
				var h: number = (h1 - h2) / 2;
				ContextView.ParentDirection = AssureIt.Direction.Left;
				ContextView.AbsX += x;
				ContextView.AbsY += (y - h);
				ContextView.AbsX += this.X_CONTEXT_MARGIN;
//				this.EmitChildrenElement(Element, ParentView.AbsX, ParentView.AbsY, i, ((this.Y_MARGIN > Math.abs(h1 - h2)) ? 0 : Math.abs(h1 - h2)));
				this.EmitChildrenElement(Element, ParentView.AbsX, ParentView.AbsY, i, ((this.Y_MARGIN > Math.abs(h1 - h2)) ? h2 : Math.abs(h1 - h2)));
			} else {  //emit element data except context
				var h2: number = 0;
				var CurrentView: AssureIt.NodeView = this.ViewMap[Element.Label];
//				if(ParentView != null) {
//					h2 = ParentView.HTMLDoc.Height/2;
//				}
				h2 = CurrentView.HTMLDoc.Height;
				this.EmitChildrenElement(Element, x, y, i, h2);
			}
		}

		EmitChildrenElement(Node: AssureIt.NodeModel, x: number, y: number, ContextId: number, h: number): void {
			var n: number = Node.Children.length;
			var MaxYPostition: number  = 0;
			for (var i: number = 0; i < n; i++) {
				var ElementView: AssureIt.NodeView = this.ViewMap[Node.Children[i].Label];
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
					var ParentElementView: AssureIt.NodeView = this.ViewMap[Node.Label];
					ElementView.AbsY = y;
//					ElementView.AbsY += ((height > this.Y_MARGIN) ? height : this.Y_MARGIN) + h;
					ElementView.AbsY += this.Y_MARGIN + h;
//					ElementView.AbsY += (((ElementView.AbsY - ParentElementView.AbsY) < this.Y_NODE_MARGIN) ? this.Y_NODE_ADJUSTMENT_MARGIN : 0);
					MaxYPostition = (ElementView.AbsY > MaxYPostition) ? ElementView.AbsY : MaxYPostition;
					this.Traverse(Node.Children[i], ElementView.AbsX, ElementView.AbsY);
				}
			}
			for (var i: number = 0; i < n; i++) {
				var ElementView: AssureIt.NodeView = this.ViewMap[Node.Children[i].Label];
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
