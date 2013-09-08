/// <reference path="./CaseModel.ts" />
/// <reference path="./CaseViewer.ts" />

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

	Note(key: string, callback: (string) => boolean) {
		var Notes = this.caseModel.Notes;
		if (!Notes) return;
		for (var keystring in Notes) {
			var value = Notes[keystring];
			if (keystring == key) {
				return callback(Notes[key]);
			}
		}
		return false;
	}

	Type(Type: AssureIt.NodeType, callback: () => boolean) {
		if (this.caseModel.Type == Type) {
			return callback();
		}
		return false;
	}

	ParentType(Type: AssureIt.NodeType, callback: (caseModel: AssureIt.NodeModel) => boolean) {
		var Parent = this.caseModel.Parent;
		if (Parent && Parent.Type == Type) {
			return callback(Parent);
		}
		return false;
	}
}

