///<reference path='../../d.ts/jquery.d.ts'/>
///<reference path='../../src/CaseModel.ts'/>
///<reference path='../../src/CaseViewer.ts'/>

class ScaleUpPlugIn extends AssureIt.PlugInSet {

	constructor(plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
		this.ActionPlugIn = new ScaleUpActionPlugIn(plugInManager);
	}
}

class ScaleUpActionPlugIn extends AssureIt.ActionPlugIn {
	ScreenManager: AssureIt.ScreenManager;
	ShapeGroup: JQuery;
	DocBase: JQuery;
	private THRESHHOLD: number;
	constructor(plugInManager: AssureIt.PlugInManager) {
		this.ScreenManager = null;
		this.THRESHHOLD = 0.5;
		this.ShapeGroup = null;
		this.DocBase = null;
		super(plugInManager);
	}

	IsEnabled(caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case): boolean {
		return true;
	}

	SetPosition(x: number, y: number) {
		var mat = (<any>(this.ShapeGroup[0])).transform.baseVal.getItem(0).matrix;
		mat.e = 200;
		mat.f = 200;

		this.DocBase.css({ left: "200px", top: "200px"});
	}

	Delegate(caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case, serverApi: AssureIt.ServerAPI): boolean {
		var self = this;
		this.ScreenManager = caseViewer.Screen;
		$('.node').hover(function() {
			if (self.ScreenManager.GetScale() < self.THRESHHOLD) {
				var label: string = $(this).children('h4').text();
				var view: AssureIt.NodeView = caseViewer.ViewMap[label];
				var oldShapeGroup: SVGGElement = view.SVGShape.ShapeGroup;
				var oldDocBase: JQuery = view.HTMLDoc.DocBase;

				self.ShapeGroup = $(<any>oldShapeGroup).clone();
				self.ShapeGroup.attr("transform", "scale(" + (1 / caseViewer.Screen.GetScale()) + ")");
				self.ShapeGroup.appendTo("#layer0");

				self.DocBase = oldDocBase.clone();
				self.DocBase.attr("style", self.DocBase.attr("style") + "-webkit-transform: scale(" + (1 / caseViewer.Screen.GetScale()) + ")");
				self.DocBase.appendTo("#layer1");

				self.SetPosition(1, 1);

				return;
			}
		}, function() {
			if (self.ShapeGroup) {
				self.ShapeGroup.remove();	
				self.ShapeGroup = null;
				self.DocBase.remove();
				self.DocBase = null;
			}
		});
		return true;
	}
}
