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
	constructor(plugInManager: AssureIt.PlugInManager) {
		this.ScreenManager = null;
		super(plugInManager);
	}

	IsEnabled(caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case): boolean {
		return true;
	}

	Delegate(caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case, serverApi: AssureIt.ServerAPI): boolean {
		var self = this;
		this.ScreenManager = caseViewer.Screen;
		$('.node').hover(function() {
				console.log(self.ScreenManager.GetScaleRate());
			if (self.ScreenManager.GetScaleRate() < 1.0) {
				console.log("bye");
				return;
			}
			console.log("hi");
		});
		return true;
	}
}
