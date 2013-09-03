/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/CaseViewer.ts" />
/// <reference path="../../src/PlugInManager.ts" />

class MonitorPlugIn extends AssureIt.PlugInSet {

	constructor(public plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
		this.HTMLRenderPlugIn = new MonitorHTMLRenderPlugIn(plugInManager);
		this.SVGRenderPlugIn = new MonitorSVGRenderPlugIn(plugInManager);
	}

}

class MonitorHTMLRenderPlugIn extends AssureIt.HTMLRenderPlugIn {

	IsFirstCalled: boolean;
	Timer: number;
	LatestDataMap: { [index: string]: any };
	ConditionMap: { [index: string]: string };
	EvidenceNodeMap: { [index: string]: AssureIt.NodeModel };

	constructor(plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
		this.IsFirstCalled = true;
		this.LatestDataMap = {};
		this.ConditionMap = {};
		this.EvidenceNodeMap = {};
	}

	IsEnabled(caseViewer: AssureIt.CaseViewer, nodeModel: AssureIt.NodeModel) : boolean {
		return true;
	}

	Delegate(caseViewer: AssureIt.CaseViewer, nodeModel: AssureIt.NodeModel, element: JQuery) : boolean {
		var notes : AssureIt.CaseNote[] = nodeModel.Notes;
		var locations: string[] = [];
		var conditions: string[] = [];

		for(var i: number = 0; i < notes.length; i++) {
			var body = notes[i].Body;

			if("Location" in body && "Monitor" in body) {
				locations.push(notes[i].Body.Location);
				conditions.push(notes[i].Body.Monitor);
			}

		}

		function extractVariableFromCondition(condtion: string): string {
			var text: string = condition;
			text.replace(/<=/g, " ");
			text.replace(/>=/g, " ");
			text.replace(/</g, " ");
			text.replace(/>/g, " ");

			var words: string[] = text.split(" ");
			var variables: string[] = [];

			for(var i: number = 0; i < words.length; i++) {
				if(!$.isNumeric(words[i])) {
					variables.push(words[i]);
				}
			}

			if(variables.length != 1) {
				// TODO: alert
			}

			return variables[0];
		}

		function isEmptyNode(node: AssureIt.NodeModel): boolean {
			if(node.Statement == "" &&
					node.Annotations.length == 0 &&
					node.Notes.length == 0 &&
					node.Children.length == 0) {
				return true;
			}

			return false;
		}

		for(var i: number = 0; i < locations.length; i++) {
			var location: string = locations[i];

			for(var j: number = 0; j < conditions.length; j++) {
				var condition: string = conditions[j];
				var variable: string = extractVariableFromCondition(condition);
				var key: string = variable+"@"+location;
				this.LatestDataMap[key] = null;
				this.ConditionMap[key] = condition;

				var brothers: AssureIt.NodeModel[] = nodeModel.Parent.Children;
				for(var i: number = 0; i < brothers.length; i++) {
					if(isEmptyNode(brothers[i])) {
						this.EvidenceNodeMap[key] = brothers[i];
						break;
					}
				}
			}
		}

		var self = this;
		var api = new AssureIt.RECAPI("http://54.250.206.119/rec");

		function collectLatestData() {
			for(var key in self.LatestDataMap) {
				var variable: string = key.split("@")[0];
				var location: string = key.split("@")[1];
				var latestData = api.getLatestData(location, variable);
				if(latestData == null) {
					// TODO: alert
					console.log("latest data is null");
				}
				self.LatestDataMap[key] = latestData;
			}
		}

		function showResult(key: string, result: boolean) {
			var variable: string = key.split("@")[0];
			var thisNode: AssureIt.NodeModel = self.EvidenceNodeMap[key];
			var latestData = self.LatestDataMap[key];

			function getContext(node: AssureIt.NodeModel): AssureIt.NodeModel {
				for(var i: number = 0; i < node.Children.length; i++) {
					var child: AssureIt.NodeModel = node.Children[i];

					if(child.Type == AssureIt.NodeType.Context) {
						return child;
					}
				}

				return null;
			}

			function appendContext(node: AssureIt.NodeModel): AssureIt.NodeModel {
				var viewMap: { [index: string]: AssureIt.NodeView } = caseViewer.ViewMap;
				var thisNodeView: AssureIt.NodeView = viewMap[node.Label];
				var case0: AssureIt.Case = caseViewer.Source;
				var contextNode = new AssureIt.NodeModel(case0, thisNodeView.Source, AssureIt.NodeType.Context, null, null);
				var parentNodeLabel: string = contextNode.Parent.Label;
				case0.SaveIdCounterMax(case0.ElementTop);
				viewMap[contextNode.Label] = new AssureIt.NodeView(caseViewer, contextNode);
				viewMap[contextNode.Label].ParentShape = viewMap[parentNodeLabel];

				var parentOffSet = $("#"+parentNodeLabel).offset();
				caseViewer.Draw();
				var currentParentView = viewMap[parentNodeLabel];
				caseViewer.Screen.SetOffset(parentOffSet.left-currentParentView.AbsX, parentOffSet.top-currentParentView.AbsY);
				return contextNode;
			}

			function removeContext(node: AssureIt.NodeModel) {
				// TODO: remove context
			}

			function inputContext(node: AssureIt.NodeModel) {
				var contextNode: AssureIt.NodeModel = getContext(node);

				if(!contextNode) {
					contextNode = appendContext(node);
				}

				var noteBody = {};
				noteBody["Manager"] = latestData.authid;
				contextNode.Notes = [{ "Name": "Notes", "Body": noteBody }];
				var element: JQuery = caseViewer.ViewMap[contextNode.Label].HTMLDoc.DocBase;
				var HTMLRenderPlugIn: Function = caseViewer.GetPlugInHTMLRender("note");
				HTMLRenderPlugIn(caseViewer, contextNode, element);
			}

			var thisNoteBody = {};

			if(result) { /* success */
				thisNoteBody["Status"] = "Success";
				thisNoteBody[variable] = latestData.data;
				//thisNoteBody["timestamp"] = latestData.data;
				removeContext(thisNode);
			}
			else { /* fail */
				thisNoteBody["Status"] = "Fail";
				thisNoteBody[variable] = latestData.data;
				//thisNoteBody["timestamp"] = latestData.data;
				inputContext(thisNode);
			}

			thisNode.Notes = [{ "Name": "Notes", "Body": thisNoteBody }];

			var HTMLRenderPlugIn: Function = caseViewer.GetPlugInHTMLRender("note");
			var thisNodeElement: JQuery = caseViewer.ViewMap[thisNode.Label].HTMLDoc.DocBase;
			HTMLRenderPlugIn(caseViewer, thisNode, thisNodeElement);

			var SVGRenderPlugIn: Function = caseViewer.GetPlugInSVGRender("monitor");
			var thisNodeView: AssureIt.NodeView = caseViewer.ViewMap[thisNode.Label];
			SVGRenderPlugIn(caseViewer, thisNodeView);

			caseViewer.Draw();
		}

		function evaluateCondition() {
			for(var key in self.ConditionMap) {
				var variable: string = key.split("@")[0];
				var script: string = "var "+variable+"="+self.LatestDataMap[key].data+";";
				script += self.ConditionMap[key]+";";
				var result: boolean = eval(script);   // FIXME: don't use eval()

				showResult(key, result);
			}
		}

		if(this.IsFirstCalled) {
			this.Timer = setInterval(function() {
				collectLatestData();
				evaluateCondition();
			}, 5000);
			this.IsFirstCalled = false;
		}

		return true;
	}
}

class MonitorSVGRenderPlugIn extends AssureIt.SVGRenderPlugIn {

	IsEnabled(caseViewer: AssureIt.CaseViewer, nodeView: AssureIt.NodeView) : boolean {
		return true;
	}

	Delegate(caseViewer: AssureIt.CaseViewer, nodeView: AssureIt.NodeView) : boolean {
		var nodeModel: AssureIt.NodeModel = nodeView.Source;

		function blushAllChild(node: AssureIt.NodeModel, fill: string, stroke: string) {
			for(var i: number = 0; i < node.Children.length; i++) {
				var label: string = node.Children[i].Label;
				var nodeView: AssureIt.NodeView = caseViewer.ViewMap[label];
				nodeView.SVGShape.SetColor(fill, stroke);
			}
		}

		if(nodeModel.Type == AssureIt.NodeType.Evidence) {
			var notes: AssureIt.CaseNote[] = nodeModel.Notes;

			for(var i: number = 0; i < notes.length; i++) {
				var body = notes[i].Body;

				if(body["Status"] == "Fail") {
					var fill: string = "#FF99CC";   // FIXME: allow any color
					var stroke: string = "none";

					nodeView.SVGShape.SetColor(fill, stroke);
					blushAllChild(nodeModel, fill, stroke);
				}
			}
		}

		return true;
	}
}
