/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/CaseViewer.ts" />
/// <reference path="../../src/PlugInManager.ts" />

class SimplePatternPlugIn extends AssureIt.PlugInSet {

	constructor(public plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
		var PlugIn: SimplePatternActionPlugIn = new SimplePatternActionPlugIn(plugInManager);
		this.ActionPlugIn = PlugIn;
		this.PatternPlugIn = new SimplePatternInnerPlugIn(plugInManager, PlugIn);
	}

}

class Pattern {
	constructor() {}

	match(caseModel: AssureIt.NodeModel): boolean {
		return true;
	}

	success(): void {
	}
}

class ListPattern extends Pattern {

}

class SimplePatternActionPlugIn extends AssureIt.ActionPlugIn {
	caseViewer: AssureIt.CaseViewer;
	constructor(plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
	}

	IsEnabled(caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case): boolean {
		return true;
	}

	Delegate(caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case, serverApi: AssureIt.ServerAPI): boolean {
		this.caseViewer = caseViewer;
		return true;
	}
}

class SimplePatternInnerPlugIn extends AssureIt.PatternPlugIn {
	caseViewer: AssureIt.CaseViewer;
	caseModel: AssureIt.NodeModel;
	patternList: Pattern[];
	constructor(plugInManager, public ActionPlugIn: SimplePatternActionPlugIn) {
		super(plugInManager);
		this.caseViewer = null;
		this.caseModel = null;
		this.patternList = [];
		this.patternList.push(new Pattern());
	}

	IsEnabled(caseViewer: AssureIt.CaseViewer, caseModel: AssureIt.NodeModel) : boolean {
		this.caseViewer = caseViewer;
		return true;
	}

	InvokePattern(pattern: Pattern): void {
		if (pattern.match(this.caseModel)) {
			pattern.success();
			this.ActionPlugIn.caseViewer.Draw();
		}
	}

	Delegate(caseModel: AssureIt.NodeModel) : boolean {
		for (var i in this.patternList) {
			this.InvokePattern(this.patternList[i]);
		}
		return true;
	}
}
