/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/CaseViewer.ts" />
/// <reference path="../../src/PlugInManager.ts" />

class SimplePatternPlugIn extends AssureIt.PlugInSet {

	constructor(public plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
		this.PatternPlugIn = new SimplePatternInnerPlugIn(plugInManager);
	}

}

class SimplePatternInnerPlugIn extends AssureIt.PatternPlugIn {
	IsEnabled(caseViewer: AssureIt.CaseViewer, caseModel: AssureIt.NodeModel) : boolean {
		return true;
	}

	Delegate(caseModel: AssureIt.NodeModel) : boolean {
		//console.log("hi");
		return true;
	}
}
