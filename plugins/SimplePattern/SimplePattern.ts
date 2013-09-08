/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/CaseViewer.ts" />
/// <reference path="../../src/Pattern.ts" />
/// <reference path="../../src/PlugInManager.ts" />

class SimplePatternPlugIn extends AssureIt.PlugInSet {

	constructor(public plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
		var PlugIn: SimplePatternActionPlugIn = new SimplePatternActionPlugIn(plugInManager);
		this.ActionPlugIn = PlugIn;
		this.PatternPlugIn = new SimplePatternInnerPlugIn(plugInManager, PlugIn);
	}
}

class ListPattern extends Pattern {
	ListItem: string[];
	Match(): boolean {
		return this.Type(this.Context, () => {
			return this.Note("List", (value) => {
				return this.ParentType(this.Goal, (Parent) => {
					return true;
				});
			});
		});
	}

	Success(): void {
		console.log("List");
	}
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
	}

	private InitPattern(caseModel: AssureIt.NodeModel): void {
		this.patternList = [];
		this.patternList.push(new ListPattern(caseModel));
	}

	IsEnabled(caseViewer: AssureIt.CaseViewer, caseModel: AssureIt.NodeModel) : boolean {
		this.caseViewer = caseViewer;
		return true;
	}

	InvokePattern(caseModel: AssureIt.NodeModel, pattern: Pattern): boolean {
		var matched: boolean = false;
		if (pattern.Match()) {
			matched = true;
			pattern.Success();
		}
		return matched;
	}

	Delegate(caseModel: AssureIt.NodeModel) : boolean {
		this.InitPattern(caseModel);
		var matched: boolean = false;
		for (var i in this.patternList) {
			if (this.InvokePattern(caseModel, this.patternList[i])) {
				matched = true;
			}
		}
		if (matched) {
			this.ActionPlugIn.caseViewer.Draw();
		}
		return true;
	}
}
