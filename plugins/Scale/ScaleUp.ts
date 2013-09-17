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
		console.log(x, y);
		//x = $('#layer0').position().left;
		//y = $('#layer0').position().top;
		var mat = (<any>(this.ShapeGroup[0])).transform.baseVal.getItem(0).matrix;
		mat.e = x;
		mat.f = y;

		/* TODO fix the position */
		var X_MARGIN = 50;
		x = x + X_MARGIN;
		this.DocBase.css({ left: x + this.DocBase.width() + "px", top: y + this.DocBase.height() + "px"});
	}

	Delegate(caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case, serverApi: AssureIt.ServerAPI): boolean {
		var self = this;
		this.ScreenManager = caseViewer.Screen;
		$('.node').hover(function(e) {
			var scale = self.ScreenManager.GetScale();
			if (scale < self.THRESHHOLD) {
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

				console.log(oldDocBase.css('left'));
				var left = oldDocBase.css('left');
				var top = oldDocBase.css('top');
				self.SetPosition(Number(left.substr(0, left.length-2)) + 100 * (1 / scale), Number(top.substr(0, top.length-2)) - 50 * (1 / scale));
				//self.SetPosition(e.screenX * (1 / scale), e.screenY * (1 / scale));

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
