/// <reference path="../../src/Casemodel.ts" />
/// <reference path="../../src/PlugInManager.ts" />

class DScriptGenerator {
	indent: string;
	linefeed: string;
	constructor() {
		this.indent = "\t";
		this.linefeed = "\n";
	}

	getMethodName(model: AssureIt.NodeModel): string {
		return model.Label;
	}

	Generate(model: AssureIt.NodeModel, Flow : { [key: string]: AssureIt.NodeModel[];}): string {
		switch(model.Type) {
			case AssureIt.NodeType.Goal:
				return this.GenerateGoal(model, Flow);
			case AssureIt.NodeType.Context:
				return this.GenerateContext(model, Flow);
			case AssureIt.NodeType.Strategy:
				return this.GenerateStrategy(model, Flow);
			case AssureIt.NodeType.Evidence:
				return this.GenerateEvidence(model, Flow);
		}
		return this.GenerateDefault(model, Flow);
	}

	GenerateFunctionHeader(model: AssureIt.NodeModel) : string {
		return "boolean " + model.Label + "()";
	}

	GenerateDefault(model: AssureIt.NodeModel, Flow : { [key: string]: AssureIt.NodeModel[];}) : string {
		var program : string = "";
		program += this.GenerateFunctionHeader(model) + " {" + this.linefeed;
		var statement = model.Statement.replace(/\n+$/g,'');
		if(statement.length > 0) {
			var description : string[] = statement.split(this.linefeed);
			program += this.indent + "/*" + this.linefeed;
			for (var i=0; i < description.length; ++i) {
				program += this.indent + this.indent + description[i] + this.linefeed;
			}
			program += this.indent + " */" + this.linefeed;
		}
		var child : AssureIt.NodeModel[] = Flow[model.Label];
		program += this.indent + "return ";
		if(child.length > 0) {
			for (var i=0; i < child.length; ++i) {
				var node : AssureIt.NodeModel = child[i];
				if(i != 0) {
					program += " && ";
				}
				program += node.Label + "()";
			}
		} else {
			program += "true";
		}
		program += ";" + this.linefeed;
		program += "}";
		return program;
	}

	GenerateGoal(model: AssureIt.NodeModel, Flow : { [key: string]: AssureIt.NodeModel[];}): string {
		return this.GenerateDefault(model, Flow);
	}

	GenerateContext(model: AssureIt.NodeModel, Flow : { [key: string]: AssureIt.NodeModel[];}): string {
		return this.GenerateDefault(model, Flow);
	}

	GenerateStrategy(model: AssureIt.NodeModel, Flow : { [key: string]: AssureIt.NodeModel[];}): string {
		return this.GenerateDefault(model, Flow);
	}

	GenerateEvidence(model: AssureIt.NodeModel, Flow : { [key: string]: AssureIt.NodeModel[];}): string {
		return this.GenerateDefault(model, Flow);
	}

	GenerateCode(rootNode : AssureIt.NodeModel, Flow : { [key: string]: AssureIt.NodeModel[];}) : string {
		var queue : AssureIt.NodeModel[] = [];
		var program : string[] = [];
		var flow : string = "";
		queue.push(rootNode);
		while(queue.length != 0) {
			var node : AssureIt.NodeModel = queue.pop();
			var child : AssureIt.NodeModel[] = Flow[node.Label];
			program.push(this.Generate(node, Flow));
			Flow[node.Label] = [];
			flow += "// " + node.Label + " =>";
			for (var i=0; i < child.length; ++i) {
				queue.push(child[i]);
				if(i != 0) {
					flow += ",";
				}
				flow += " " + child[i].Label;
			}
			flow += this.linefeed;
		}
		return flow + this.linefeed + program.reverse().join(this.linefeed);
	}

	CreateControlFlow(rootmodel: AssureIt.NodeModel) : { [key: string]: AssureIt.NodeModel[]; } {
		var queue : AssureIt.NodeModel[] = [];
		var map: { [key: string]: AssureIt.NodeModel[]; } = {};
		queue.push(rootmodel);
		while(queue.length != 0) {
			var model : AssureIt.NodeModel = queue.pop();
			var childList : AssureIt.NodeModel[] = [];
			for (var i=0; i < model.Children.length; ++i) {
				queue.push(model.Children[i]);
				childList.push(model.Children[i]);
			}
			map[model.Label] = childList;
		}
		return map;
	}

	codegen_(model: AssureIt.NodeModel): string {
		var res: string = "";
		var flow : { [key: string]: AssureIt.NodeModel[]; } = this.CreateControlFlow(model);

		res += this.GenerateCode(model, flow) + this.linefeed;
		res += "@Export int main() {" + this.linefeed;
		res += this.indent + "if(" + model.Label + "()) { return 0; }" + this.linefeed;
		res += this.indent + "return 1;" + this.linefeed;
		res += "}" + this.linefeed;
		return res;
	}

	codegen(model: AssureIt.NodeModel): string {
		return this.codegen_(model);
	}
}
