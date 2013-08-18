/// <reference path="../d.ts/jquery.d.ts" />
/// <reference path="../d.ts/ASNParser.d.ts" />
/// <reference path="CaseModel.ts" />

module AssureIt {

	export class JsonNodeModel {
		Type: NodeType;
		Label: string;
		Statement: string;
		Annotations: CaseAnnotation[];
		Notes: CaseNote[];
		Children: JsonNodeModel[];

		constructor() {
		}

	}

	export class CaseEncoderDeprecated {

		constructor() {
		}

		ConvertToOldJson(case0: Case): any {
			var keys = Object.keys(case0.ElementMap);
			var root = {
				"NodeList":     [],
				"TopGoalLabel": case0.ElementTop.Label,
				"NodeCount":    keys.length,
				"DCaseName":    case0.CaseName
			};

			for (var i:number = 0; i < keys.length; i++) {
				var node = case0.ElementMap[keys[i]];
				var json = {
					Label: node.Label,
					Type: node.Type,
					Statement: node.Statement,
					Annotations: node.Annotations,
					Notes: node.Notes,
					Children: []
				};
				for(var j:number = 0; j < node.Children.length; j++) {
					json.Children.push(node.Children[j].Label);
				}
				root.NodeList.push(json);
			}

			return root;
		}
	}

	export class CaseEncoder {
		JsonRoot: JsonNodeModel;

		constructor() {
		}

		ConvertToJson(root: NodeModel): JsonNodeModel {
			this.JsonRoot = new JsonNodeModel();
			this.JsonRoot.Type = root.Type;
			this.JsonRoot.Label = root.Label;
			this.JsonRoot.Statement = root.Statement;
			this.JsonRoot.Annotations = root.Annotations;
			this.JsonRoot.Notes = root.Notes;

			var JsonChildNodes: JsonNodeModel[] = [];
			for (var i: number = 0; i < root.Children.length; i++) {
				JsonChildNodes[i] = new JsonNodeModel();
				this.GetChild(root.Children[i], JsonChildNodes[i]);
			}

			this.JsonRoot.Children = JsonChildNodes;

			//console.log(this.JsonRoot);
			return this.JsonRoot;
		}

		ConvertToASN(root : NodeModel, isSingleNode: boolean): string {
			var encoded : string = (function(model : NodeModel, prefix : string) : string {
				var IndentToken: string = "    ";
				var ret : string = "";
				switch (model.Type) {
				case NodeType["Goal"]:
					prefix += "*";
					ret += (prefix + "Goal");
					break;
				case NodeType["Context"]:
					if (prefix == "") prefix += "*";
					ret += (prefix + "Context");
					break;
				case NodeType["Strategy"]:
					if (prefix == "") prefix += "*";
					ret += (prefix + "Strategy");
					break;
				case NodeType["Evidence"]:
					if (prefix == "") prefix += "*";
					ret += (prefix + "Evidence");
					break;
				default:
					//console.log(model.Type);
				}
				//TODO:Label
				var anno_num = model.Annotations.length;
				if (anno_num != 0) {
					for (var i = 0; i < model.Annotations.length; i++) {
						ret += (" @" + model.Annotations[i].Name);
					}
				}
				ret += "\n";

				if (model.Statement != "") ret += (model.Statement + "\n");

				var note_num = model.Notes.length;
				if (note_num != 0) {
					for (var i = 0; i < model.Notes.length; i++) {
						var Note = model.Notes[i];
						ret += Note.Name + "::" + "\n";
						var keys = Object.keys(Note.Body);
						for (var j in keys) {
							if (keys[j] == "Description") continue;
							ret += "\t" + keys[j] + ": " + Note.Body[keys[j]] + "\n";
						}
						if (Note.Body["Description"] != null) {
							var desc: string = Note.Body["Description"];
							var desclist: any = desc.split("\n");
							for (var j in desclist) {
								ret += IndentToken + desclist[j] + "\n";
							}
						}
					}
				}

				if (isSingleNode) {
					return ret;
				}

				for (var i = 0; i < model.Children.length; i++) {
					var child_model = model.Children[i];
					//console.log(child_model.Type);
					if (child_model.Type == NodeType["Context"]) {
						ret += arguments.callee(child_model, prefix);
						break;
					}
				}
				for (var i = 0; i < model.Children.length; i++) {
					var child_model = model.Children[i];
					if (child_model.Type != NodeType["Context"]) {
						ret += arguments.callee(child_model, prefix);
					}
				}
				return ret;
			})(root, "");
			//console.log(encoded);
			return encoded;
		}

		GetChild(root: NodeModel, JsonNode: JsonNodeModel): JsonNodeModel {
			JsonNode.Type = root.Type;
			JsonNode.Label = root.Label;
			JsonNode.Statement = root.Statement;
			JsonNode.Annotations = root.Annotations;
			JsonNode.Notes = root.Notes;

			var ChildNodes: JsonNodeModel[] = new Array<JsonNodeModel>();
			for (var i: number = 0; i < root.Children.length; i++) {
				ChildNodes[i] = new JsonNodeModel();
				this.GetChild(root.Children[i], ChildNodes[i]);
			}

			JsonNode.Children = ChildNodes;

			return JsonNode;
		}
	}
}
