/// <reference path="./CaseModel.ts" />
/// <reference path="./CaseViewer.ts" />

class Pattern {
	Goal: AssureIt.NodeType;
	Context: AssureIt.NodeType;
	Strategy: AssureIt.NodeType;
	Evidence: AssureIt.NodeType;

	constructor() {
		this.Goal = AssureIt.NodeType.Goal;
		this.Context = AssureIt.NodeType.Context;
		this.Strategy = AssureIt.NodeType.Strategy;
		this.Evidence = AssureIt.NodeType.Evidence;
	}

	Match(model: AssureIt.NodeModel): boolean {
		return false;
	}

	Success(model: AssureIt.NodeModel): void {
	}

	Note(model: AssureIt.NodeModel, key: string, callback: (string) => boolean) {
		var Notes = model.Notes;
		if (!Notes) return;
		for (var keystring in Notes) {
			var value = Notes[keystring];
			if (keystring == key) {
				return callback(Notes[key]);
			}
		}
		return false;
	}

	Type(model: AssureIt.NodeModel, Type: AssureIt.NodeType, callback: () => boolean) {
		if (model.Type == Type) {
			return callback();
		}
		return false;
	}

	ParentType(model: AssureIt.NodeModel, Type: AssureIt.NodeType,
			callback: (caseModel: AssureIt.NodeModel) => boolean) {
		var Parent = model.Parent;
		if (Parent && Parent.Type == Type) {
			return callback(Parent);
		}
		return false;
	}
}

