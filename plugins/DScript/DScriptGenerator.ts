/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/PlugInManager.ts" />

class DScriptGenerator {
	indentToken: string;
	constructor(public model: AssureIt.NodeModel) {
		this.indentToken = "\t";
	}

	getMethodName(model: AssureIt.NodeModel): string {
		return model.Label;
	}

	goal(model: AssureIt.NodeModel): string {
		var res = "";
		res = "int " + this.getMethodName(model) + "(Context c) {\n";
		res += this.indentToken + "return 1;\n";
		res += "}\n\n";
		return res;
	}

	context(model: AssureIt.NodeModel): string {
		var res = "";
		/* TODO write something */
		return res;
	}

	strategy(model: AssureIt.NodeModel): string {
		var res = "";
		/* TODO write something */
		return res;
	}

	evidence(model: AssureIt.NodeModel): string {
		var res = "";
		/* TODO write something */
		return res;
	}

	codegen_(model: AssureIt.NodeModel): string {
		var res: string = "";
		switch(model.Type) {
		case AssureIt.NodeType.Goal     :   
			res += this.goal(model);
			break;
		case AssureIt.NodeType.Context  :
			res += this.context(model);
			break;
		case AssureIt.NodeType.Strategy :
			res += this.strategy(model);
			break;
		case AssureIt.NodeType.Evidence :
			res += this.evidence(model);
			break;
		default:
			  console.log("There's something wrong with NodeModel.");
		}
		for (var i in model.Children) {
			res += this.codegen_(model.Children[i]);
		}
		return res;
	}
	
	codegen(): string {
		console.log("codegen");
		return this.codegen_(this.model);
	}
}
