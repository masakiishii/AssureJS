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
	Match(model: AssureIt.NodeModel): boolean {
		return this.Type(model, this.Context, () => {
			return this.Note(model, "List", (value: string) => {
				this.ListItem = value.split(",");
				for (var i in this.ListItem) {
					this.ListItem[i] = this.ListItem[i].replace(/[ ]$/g, "");	
				}
				return this.ParentType(model, this.Goal, (parentModel: AssureIt.NodeModel) => {
					return parentModel.Children.length == 1;
				});
			});
		});
	}

	Success(model): void {
		console.log("List");
		console.log(this.ListItem);
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
		this.InitPattern();
	}

	private InitPattern(): void {
		this.patternList = [];
		this.patternList.push(new ListPattern());
	}

	IsEnabled(caseViewer: AssureIt.CaseViewer, caseModel: AssureIt.NodeModel) : boolean {
		this.caseViewer = caseViewer;
		return true;
	}

	InvokePattern(model: AssureIt.NodeModel, pattern: Pattern): boolean {
		var matched: boolean = false;
		if (pattern.Match(model)) {
			matched = true;
			pattern.Success(model);
		}
		return matched;
	}

	Delegate(caseModel: AssureIt.NodeModel) : boolean {
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
