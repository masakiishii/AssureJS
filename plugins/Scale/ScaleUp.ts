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
	Layer0box: JQuery;
	Layer0: JQuery;
	Layer1: JQuery;
	oldLayer1: JQuery;
	ShapeGroup: JQuery;
	DocBase: JQuery;
	timeoutId: number;
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

		this.DocBase.css({ left: x + "px", top: y + "px"});
	}

	Delegate(caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case, serverApi: AssureIt.ServerAPI): boolean {
		var self = this;
		this.ScreenManager = caseViewer.Screen;
		//$('.node').unbind('mouseenter').unbind('mouseleave');
		$('.node').hover(function(e) {
			var scale = self.ScreenManager.GetScale();
			if (scale < self.THRESHHOLD) {
				var label: string = $(this).children('h4').text();
				var view: AssureIt.NodeView = caseViewer.ViewMap[label];
				var oldShapeGroup: SVGGElement = view.SVGShape.ShapeGroup;
				var oldDocBase: JQuery = view.HTMLDoc.DocBase;

				self.oldLayer1 = $('#layer1');
				self.Layer0box = $('#layer0box').clone();
				self.Layer0 = self.Layer0box.children('g');
				self.Layer0.empty();
				self.Layer1 = $('#layer1').clone();
				self.Layer1.empty();

				self.ShapeGroup = $(<any>oldShapeGroup).clone();
				self.ShapeGroup.attr("transform", "scale(" + (1 / caseViewer.Screen.GetScale()) + ")");
				self.ShapeGroup.appendTo(self.Layer0);
				self.ShapeGroup.children('rect,polygon').attr('stroke', 'orange');

				self.DocBase = oldDocBase.clone();
				self.DocBase.attr("style", self.DocBase.attr("style") + "-webkit-transform-origin: 0% 0%;-webkit-transform: scale(" + (1 / caseViewer.Screen.GetScale()) + ")");
				self.DocBase.appendTo(self.Layer1);

				var left = oldDocBase.css('left');
				var top = oldDocBase.css('top');
				self.SetPosition(Number(left.substr(0, left.length-2)) + 100 * (1 / scale), Number(top.substr(0, top.length-2)) - 100 * (1 / scale));
				self.Layer0box.appendTo('#viewer');
				self.Layer1.appendTo('#viewer');
				$(this).appendTo(self.Layer1);
				$(this).clone(true).appendTo(self.oldLayer1);

				return;
			}
		}, function() {
			self.removeElement();
		});
		return true;
	}
	removeElement() {
		if (this.ShapeGroup) {
			this.Layer0box.remove();
			this.Layer1.remove();
			this.Layer0box = null;
			this.Layer0 = null;
			this.Layer1 = null;
			this.ShapeGroup = null;
			this.DocBase = null;
		}
	}
}
