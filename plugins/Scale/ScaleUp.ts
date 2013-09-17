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

	constructor(plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
	}

	IsEnabled(caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case): boolean {
		return case0.IsEditable();
	}

	Delegate(caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case, serverApi: AssureIt.ServerAPI): boolean {
		return true;
	}
}
