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
	Goal: AssureIt.NodeType;
	Context: AssureIt.NodeType;
	Strategy: AssureIt.NodeType;
	Evidence: AssureIt.NodeType;

	constructor(public caseModel: AssureIt.NodeModel) {
		this.Goal = AssureIt.NodeType.Goal;
		this.Context = AssureIt.NodeType.Context;
		this.Strategy = AssureIt.NodeType.Strategy;
		this.Evidence = AssureIt.NodeType.Evidence;
	}

	Match(): boolean {
		return false;
	}

	Success(): void {
	}

	Note(key: string, callback: () => void) {
		var Notes = this.caseModel.Notes;
		if (!Notes) return;
		for (var keystring in Notes) {
			var value = Notes[keystring];
			if (keystring == key) {
				callback();
			}
		}
	}

	Type(Type: AssureIt.NodeType, callback: () => void) {
		if (this.caseModel.Type == Type) {
			callback();
		}
	}

	ParentType(Type: AssureIt.NodeType, callback: () => void) {
		var Parent = this.caseModel.Parent;
		if (Parent && Parent.Type == Type) {
			callback();
		}
	}
}

class ListPattern extends Pattern {
	Match(): boolean {
		this.Type(this.Context, () => {
			this.Note("List", () => {
				this.ParentType(this.Goal, () => {
					return true;
				});
			});
		});
	}

	Success(): void {
		this.Parent.AddNode
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
