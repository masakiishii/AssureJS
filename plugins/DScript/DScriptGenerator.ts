/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/PlugInManager.ts" />

class Edge {
	src: number;
	dst: number;
	constructor(src: number, dst: number) {
		this.src = src;
		this.dst = dst;
	}
}

function visit(g: Edge[][], v: number, order: number[], color: number[]) : boolean {
	color[v] = 1;
	for (var i=0; i < g[v].length; i = i + 1) {
		var e = g[v][i];
		if (color[e.dst] == 2/*visited*/) {
			continue;
		}
		if (color[e.dst] == 1) {
			return false;
		}
		if (!visit(g, e.dst, order, color)) {
			return false;
		}
	}
	order.push(v);
	color[v] = 2;
	return true;
}

function tsort(g: Edge[][]) : number[] {
	var n = g.length;
	var color : number[] = [];
	var order : number[] = [];
	for (var i=0; i < n; i = i + 1) {
		color.push(0);
	}
	for (i=0; i < n; i = i + 1) {
		if (!color[i] && !visit(g, i, order, color)) {
			return null;
		}
	}
	return order.reverse();
}

class DScriptError {
	NodeName : string;
	LineNumber: number;
	Message : string;
	constructor(NodeName: string, LineNumber: number, Message: string) {
		this.NodeName = NodeName;
		this.LineNumber = LineNumber;
		this.Message = Message;
	}
}

class DScriptGenerator {
	indent: string;
	linefeed: string;
	errorMessage: DScriptError[];
	Env : { [key: string]: string;}[];
	constructor() {
		this.indent = "\t";
		this.linefeed = "\n";
		this.errorMessage = [];
		this.Env = [];
	}

	GetGoalList(List: AssureIt.NodeModel[]): AssureIt.NodeModel[] {
		return List.filter(function (Node : AssureIt.NodeModel) {
			return Node.Type == AssureIt.NodeType.Goal;
		});
	}

	GetContextList(List: AssureIt.NodeModel[]): AssureIt.NodeModel[] {
		return List.filter(function (Node : AssureIt.NodeModel) {
			return Node.Type == AssureIt.NodeType.Context;
		});
	}

	GetEvidenceList(List: AssureIt.NodeModel[]): AssureIt.NodeModel[] {
		return List.filter(function (Node : AssureIt.NodeModel) {
			return Node.Type == AssureIt.NodeType.Evidence;
		});
	}

	GetStrategyList(List: AssureIt.NodeModel[]): AssureIt.NodeModel[] {
		return List.filter(function (Node : AssureIt.NodeModel) {
			return Node.Type == AssureIt.NodeType.Strategy;
		});
	}

	PushEnvironment(ContextList: AssureIt.NodeModel[]): void {
		var env : { [key: string]: string;} = {};
		for (var i=0; i < ContextList.length; ++i) {
			var Node = ContextList[i];
			if(Node.Type != AssureIt.NodeType.Context) {
				continue;
			}
			var DeclList : string[] = Node.Statement.split("\n").filter(function(Text : string) {
				var regex = /^[A-Za-z][A-Z-a-z0-9]*=/;
				return regex.test(Text);
			});
			for (var j=0; j < DeclList.length; ++j) {
				var Decl : string[] = DeclList[i].split("=");
				if(Decl.length != 2) {
					console.log(new DScriptError(Node.Label, 0, "DeclSyntaxError"));
				}
				env[Decl[0]] = Decl[1];
			}
		}
		this.Env.push(env);
	}

	PopEnvironment(): void {
		this.Env.pop();
	}

	GetEnvironment(Key : string): string {
		for (var i=this.Env.length - 1; i >= 0; --i) {
			var env : { [key: string] : string } = this.Env[i];
			if(env.hasOwnProperty(Key)) {
				return env[Key];
			}
		}
		return null;
	}

	getMethodName(Node: AssureIt.NodeModel): string {
		return Node.Label;
	}

	Generate(Node: AssureIt.NodeModel, Flow : { [key: string]: AssureIt.NodeModel[];}): string {
		switch(Node.Type) {
			case AssureIt.NodeType.Goal:
				return this.GenerateGoal(Node, Flow);
			case AssureIt.NodeType.Context:
				return this.GenerateContext(Node, Flow);
			case AssureIt.NodeType.Strategy:
				return this.GenerateStrategy(Node, Flow);
			case AssureIt.NodeType.Evidence:
				return this.GenerateEvidence(Node, Flow);
		}
		return "";
	}

	GenerateFunctionHeader(Node: AssureIt.NodeModel) : string {
		return "boolean " + Node.Label + "()";
	}

	GenerateHeader(Node: AssureIt.NodeModel) : string {
		var program : string = "";
		program += this.GenerateFunctionHeader(Node) + " {" + this.linefeed;
		var statement = Node.Statement.replace(/\n+$/g,'');
		if(statement.length > 0) {
			var description : string[] = statement.split(this.linefeed);
			for (var i=0; i < description.length; ++i) {
				if(description[i].indexOf("Monitor=") == 0) {
					continue;
				}
				if(description[i].indexOf("Action=") == 0) {
					continue;
				}
				program += this.indent + "// " + description[i] + this.linefeed;
			}
		}
		//if(Node.Annotations.length > 0) {
		//	for (var i=0; i < Node.Annotations.length; ++i) {
		//		var Anno = Node.Annotations[i];
		//		program += this.indent + "// " + Anno.Name + ":" + Anno.Body + this.linefeed;
		//	}
		//}
		return program;
	}

	GenerateFooter(Node: AssureIt.NodeModel, program : string) : string {
		return program + "}";
	}

	GenerateDefault(Node: AssureIt.NodeModel, Flow : { [key: string]: AssureIt.NodeModel[];}) : string {
		var program : string = this.GenerateHeader(Node);
		var child : AssureIt.NodeModel[] = Flow[Node.Label];
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
		return this.GenerateFooter(Node, program);
	}

	GenerateGoal(Node: AssureIt.NodeModel, Flow : { [key: string]: AssureIt.NodeModel[];}): string {
		var program : string = this.GenerateHeader(Node);
		var child : AssureIt.NodeModel[] = Flow[Node.Label];

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
			program += "false";
		}
		program += ";" + this.linefeed;
		return this.GenerateFooter(Node, program);

	}

	GenerateContext(Node: AssureIt.NodeModel, Flow : { [key: string]: AssureIt.NodeModel[];}): string {
		var program : string = this.GenerateHeader(Node);
		var child : AssureIt.NodeModel[] = Flow[Node.Label];

		var Statements = Node.Statement.split("\n");
		var after : AssureIt.CaseAnnotation = Node.GetAnnotation("after");
		if(after != null) {
			if(after.Body == null || after.Body.length == 0) {
				console.log(new DScriptError(Node.Label, 0, "@after needs parameter"));
			} else {
				program += this.indent + "defined(" + after.Body + ");" + this.linefeed;
			}
		}
		program += this.indent + "return true;" + this.linefeed;
		return this.GenerateFooter(Node, program);
	}

	GenerateStrategy(Node: AssureIt.NodeModel, Flow : { [key: string]: AssureIt.NodeModel[];}): string {
		var program : string = this.GenerateHeader(Node);
		var child : AssureIt.NodeModel[] = Flow[Node.Label];

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
			program += "false";
		}
		program += ";" + this.linefeed;
		return this.GenerateFooter(Node, program);

	}

	GenerateEvidence(Node: AssureIt.NodeModel, Flow : { [key: string]: AssureIt.NodeModel[];}): string {
		var program : string = this.GenerateHeader(Node);
		var child : AssureIt.NodeModel[] = Flow[Node.Label];

		var Statements = Node.Statement.split("\n");
		var Monitors : string[] = Statements.filter(function(Text : string) {
			return Text.indexOf("Monitor=") == 0;
		});
		if(Monitors.length > 0) {
			var env = this.GetEnvironment("Location");
			if(env == null || env.length == 0) {
				console.log(new DScriptError(Node.Label, 0, "Location is not defined"));
			} else {
				var locations : string[] = env.split(",");
				program += this.indent + "boolean ret = false;" + this.linefeed;
				for (var j=0; j < locations.length; ++j) {
					for (var i=0; i < Monitors.length; ++i) {
						var List = Monitors[i].split("Monitor=");
						if(List.length != 2 || List[1].length == 0) {
							console.log(new DScriptError(Node.Label, 0, "Monitor has no rule"));
							continue;
						}
						var Code = List[1];
						Code = Code.replace(/([A-Za-z]+)/, locations[j] + ".$1");
						program += this.indent + "ret = (" + Code + ");" + this.linefeed;
					}
				}
			}
		}

		var Actions : string[] = Statements.filter(function(Text : string) {
			return Text.indexOf("Action=") == 0;
		});
		for (var i=0; i < Actions.length; ++i) {
			var List = Actions[i].split("Action=");
			if(List.length != 2 || List[1].length == 0) {
				console.log(new DScriptError(Node.Label, 0, "Action has no rule"));
				continue;
			}
			var Code = List[1];
			program += this.indent + "if(!" + Code + ") {" + this.linefeed;
			program += this.indent + this.indent + "return false;" + this.linefeed;
			program += this.indent + "}" + this.linefeed;
		}

		var ContextList : AssureIt.NodeModel[] = this.GetContextList(child);
		if(child.length != ContextList.length) {
			console.log(new DScriptError(Node.Label, 0, "EvidenceSyntaxError"));
		}

		if(child.length == 0) {
			program += this.indent + "return true";
		} else {
			program += this.indent + "return false/*FIXME support Rebuttal*/";
		}
		program += ";" + this.linefeed;
		return this.GenerateFooter(Node, program);
	}

	GenerateCode(Node : AssureIt.NodeModel, Flow : { [key: string]: AssureIt.NodeModel[];}) : string {
		var queue : AssureIt.NodeModel[] = [];
		var program : string[] = [];
		var flow : string = "";
		program.push(this.Generate(Node, Flow));
		var child : AssureIt.NodeModel[] = Flow[Node.Label];
		Flow[Node.Label] = [];
		var ContextList : AssureIt.NodeModel[] = this.GetContextList(child);
		this.PushEnvironment(ContextList);
		for (var i=0; i < child.length; ++i) {
			program.push(this.GenerateCode(child[i], Flow));
		}
		this.PopEnvironment();
		return flow + program.reverse().join(this.linefeed);
	}

	CreateControlFlow(rootNode: AssureIt.NodeModel) : { [key: string]: AssureIt.NodeModel[]; } {
		var queue : AssureIt.NodeModel[] = [];
		var map: { [key: string]: AssureIt.NodeModel[]; } = {};
		var NodeList : AssureIt.NodeModel[] = [];
		var NodeIdxMap : {[ key: string]: number; } = {};
		queue.push(rootNode);
		NodeList.push(rootNode);
		while(queue.length != 0) {
			var Node : AssureIt.NodeModel = queue.pop();
			var childList : AssureIt.NodeModel[] = [];

			function Each(e : AssureIt.NodeModel) {
				queue.push(e);
				childList.push(e);
				NodeIdxMap[e.Label] = NodeList.length;
				NodeList.push(e);
			}

			this.GetContextList(Node.Children).map(Each);
			this.GetStrategyList(Node.Children).map(Each);
			this.GetGoalList(Node.Children).map(Each);
			this.GetEvidenceList(Node.Children).map(Each);
			map[Node.Label] = childList;
		}

		var graph : Edge[][] = [];
		for (var i=0; i < NodeList.length; ++i) {
			var Edges : Edge[] = [];
			graph.push(Edges);
		}
		for (var i=0; i < NodeList.length; ++i) {
			var Node : AssureIt.NodeModel = NodeList[i];
			var Edges : Edge[] = graph[i];
			for (var j=0; j < map[Node.Label].length; ++j) {
				var Child = map[Node.Label][j];
				Edges.push(new Edge(i, NodeIdxMap[Child.Label]));
			}
			var after : AssureIt.CaseAnnotation = Node.GetAnnotation("after");
			if(after != null) {
				if(after.Body == null || after.Body.length == 0) {
					console.log(new DScriptError(Node.Label, 0, "@after needs parameter"));
				} else {
					// (E3.Monitor == true) => ["(E3", "E3"]
					var res : string[] = after.Body.match(/^\(+([A-Za-z0-9]+)/);
					if(res.length == 2) {
						var src = NodeIdxMap[res[1]];
						var e = graph[src];
						e.push(new Edge(src, i));
					}
				}
			}
		}

		var order : number[] = tsort(graph);
		if(order != null) {
			var child : string[] = [];
			for (var i=0; i < order.length; ++i) {
				child.push(NodeList[order[i]].Label);
			}
			console.log(child);
		}
		return map;
	}

	codegen_(Node: AssureIt.NodeModel): string {
		var res: string = "";
		if(Node == null) {
			return res;
		}
		var flow : { [key: string]: AssureIt.NodeModel[]; } = this.CreateControlFlow(Node);

		res += this.GenerateCode(Node, flow) + this.linefeed;
		res += "@Export int main() {" + this.linefeed;
		res += this.indent + "if(" + Node.Label + "()) { return 0; }" + this.linefeed;
		res += this.indent + "return 1;" + this.linefeed;
		res += "}" + this.linefeed;
		return res;
	}

	codegen(Node: AssureIt.NodeModel): string {
		return this.codegen_(Node);
	}
}

