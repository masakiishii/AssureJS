/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/CaseViewer.ts" />
/// <reference path="../../src/PlugInManager.ts" />

function hasMonitorInfo(node: AssureIt.NodeModel): boolean {
	var notes: AssureIt.CaseNote[] = node.Notes;

	for(var i: number = 0; i < notes.length; i++) {
		var body = notes[i].Body;

		if("Location" in body && "Monitor" in body) {
			return true;
		}
	}

	return false;
}

function appendNode(caseViewer: AssureIt.CaseViewer, node: AssureIt.NodeModel, type: AssureIt.NodeType): AssureIt.NodeModel {
	var viewMap: { [index: string]: AssureIt.NodeView } = caseViewer.ViewMap;
	var view: AssureIt.NodeView = viewMap[node.Label];
	var case0: AssureIt.Case = caseViewer.Source;
	var newNode = new AssureIt.NodeModel(case0, view.Source, type, null, null);
	case0.SaveIdCounterMax(case0.ElementTop);
	viewMap[newNode.Label] = new AssureIt.NodeView(caseViewer, newNode);
	viewMap[newNode.Label].ParentShape = viewMap[node.Label];
	return newNode;
}

function isEmptyEvidenceNode(node: AssureIt.NodeModel): boolean {
	if(node.Type == AssureIt.NodeType.Evidence &&
			node.Statement == "" &&
			node.Annotations.length == 0 &&
			node.Notes.length == 0 &&
			node.Children.length == 0) {
		return true;
	}

	return false;
}

function getEmptyEvidenceNode(node: AssureIt.NodeModel): AssureIt.NodeModel {
	for(var i: number = 0; i < node.Children.length; i++) {
		if(isEmptyEvidenceNode(node.Children[i])) return node.Children[i];
	}

	return null;
}

function isContextNode(node: AssureIt.NodeModel): boolean {
	if(node.Type == AssureIt.NodeType.Context) {
		return true;
	}

	return false;
}

function getContextNode(node: AssureIt.NodeModel): AssureIt.NodeModel {
	for(var i: number = 0; i < node.Children.length; i++) {
		if(isContextNode(node.Children[i])) return node.Children[i];
	}

	return null;
}


class MonitorManager {

	RECAPI: AssureIt.RECAPI;
	Timer: number;
	LatestDataMap: { [index: string]: any };
	ConditionMap: { [index: string]: string };
	EvidenceNodeMap: { [index: string]: AssureIt.NodeModel };
	Viewer: AssureIt.CaseViewer;
	HTMLRenderFunction: Function;
	SVGRenderFunction: Function;

	constructor(Viewer: AssureIt.CaseViewer) {
		this.RECAPI = new AssureIt.RECAPI("http://54.250.206.119/rec");
		this.LatestDataMap = {};
		this.ConditionMap = {};
		this.EvidenceNodeMap = {};
		this.Viewer = Viewer;
		this.HTMLRenderFunction = this.Viewer.GetPlugInHTMLRender("note");
		this.SVGRenderFunction = this.Viewer.GetPlugInSVGRender("monitor");
	}

	StartMonitor(interval: number) {
		var self = this;

		this.Timer = setInterval(function() {
			self.CollectLatestData();
			self.EvaluateCondition();
			self.ShowResult();
		}, interval);
	}

	SetMonitor(location: string, condition: string, evidenceNode: AssureIt.NodeModel) {
		var variable: string = extractVariableFromCondition(condition);
		var key: string = variable+"@"+location;
		this.LatestDataMap[key] = null;
		this.ConditionMap[key] = condition;
		this.EvidenceNodeMap[key] = evidenceNode;

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

	}

	CollectLatestData() {
		for(var key in this.LatestDataMap) {
			var variable: string = key.split("@")[0];
			var location: string = key.split("@")[1];
			var latestData = this.RECAPI.getLatestData(location, variable);
			if(latestData == null) {
				// TODO: alert
				console.log("latest data is null");
			}
			this.LatestDataMap[key] = latestData;
		}
	}

	EvaluateCondition() {
		for(var key in this.ConditionMap) {
			var variable: string = key.split("@")[0];
			var script: string = "var "+variable+"="+this.LatestDataMap[key].data+";";
			script += this.ConditionMap[key]+";";
			var result: boolean = eval(script);   // FIXME: don't use eval()
			this.EditResult(key, result);
		}
	}

	IsAlreadyFailed(evidenceNode: AssureIt.NodeModel): boolean {
		var notes: AssureIt.CaseNote[] = evidenceNode.Notes;

		for(var i: number = 0; i < notes.length; i++) {
			var body = notes[i].Body;
			if(body["Status"] == "Fail") return true;
		}

		return false;
	}

	EditResult(key: string, result: boolean) {
		var variable: string = key.split("@")[0];
		var evidenceNode: AssureIt.NodeModel = this.EvidenceNodeMap[key];

		if(this.IsAlreadyFailed(evidenceNode)) return;

		var latestData = this.LatestDataMap[key];
		var evidenceNoteBody = {};

		if(result) { /* success */
			evidenceNoteBody["Status"] = "Success";
			evidenceNoteBody[variable] = latestData.data;
			evidenceNoteBody["Timestamp"] = latestData.timestamp;
			//removeContext(thisNode);
		}
		else { /* fail */
			evidenceNoteBody["Status"] = "Fail";
			evidenceNoteBody[variable] = latestData.data;
			evidenceNoteBody["Timestamp"] = latestData.timestamp;
			//inputContext(thisNode);

			var contextNode: AssureIt.NodeModel = getContextNode(evidenceNode);
			if(contextNode == null) {
				contextNode = appendNode(this.Viewer, evidenceNode, AssureIt.NodeType.Context);
			}

			var contextNoteBody = {};
			contextNoteBody["Manager"] = latestData.authid;
			contextNode.Notes = [{ "Name": "Notes", "Body": contextNoteBody }];
			var element: JQuery = this.Viewer.ViewMap[contextNode.Label].HTMLDoc.DocBase;
		}

		evidenceNode.Notes = [{ "Name": "Notes", "Body": evidenceNoteBody }];
	}

	UpdateNode(node: AssureIt.NodeModel) {
		var element: JQuery = this.Viewer.ViewMap[node.Label].HTMLDoc.DocBase;
		var view: AssureIt.NodeView = this.Viewer.ViewMap[node.Label];
		this.HTMLRenderFunction(this.Viewer, node, element);
		this.SVGRenderFunction(this.Viewer, view);
	}

	ShowResult() {
		for(var key in this.EvidenceNodeMap) {
			var evidenceNode = this.EvidenceNodeMap[key];
			this.UpdateNode(evidenceNode);

			var contextNode = getContextNode(evidenceNode);
			if(contextNode != null) {
				this.UpdateNode(contextNode);
			}
		}

		this.Viewer.Draw();
	}

}

class MonitorPlugIn extends AssureIt.PlugInSet {

	constructor(public plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
		this.HTMLRenderPlugIn = new MonitorHTMLRenderPlugIn(plugInManager);
		this.SVGRenderPlugIn = new MonitorSVGRenderPlugIn(plugInManager);
	}

}

class MonitorHTMLRenderPlugIn extends AssureIt.HTMLRenderPlugIn {

	IsFirstCalled: boolean;
	MonitorManager: MonitorManager;

	constructor(plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
		this.IsFirstCalled = true;
		this.MonitorManager = null;
	}

	IsEnabled(caseViewer: AssureIt.CaseViewer, nodeModel: AssureIt.NodeModel) : boolean {
		return true;
	}

	Delegate(caseViewer: AssureIt.CaseViewer, nodeModel: AssureIt.NodeModel, element: JQuery) : boolean {
		if(this.IsFirstCalled) {
			this.MonitorManager = new MonitorManager(caseViewer);
			this.MonitorManager.StartMonitor(5000);
			this.IsFirstCalled = false;
		}

		if(nodeModel.Type != AssureIt.NodeType.Context) return true;   // except for 'Context'
		if(!hasMonitorInfo(nodeModel)) return true;

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

		var evidenceNode = getEmptyEvidenceNode(nodeModel.Parent);
		if(evidenceNode == null) {
			evidenceNode = appendNode(caseViewer, nodeModel.Parent, AssureIt.NodeType.Evidence);
		}

		this.MonitorManager.SetMonitor(locations[0], conditions[0], evidenceNode);
										// FIXME: now, set only one monitor at once

		return true;
	}

}

class MonitorSVGRenderPlugIn extends AssureIt.SVGRenderPlugIn {

	IsEnabled(caseViewer: AssureIt.CaseViewer, nodeView: AssureIt.NodeView) : boolean {
		return true;
	}

	Delegate(caseViewer: AssureIt.CaseViewer, nodeView: AssureIt.NodeView) : boolean {
		var nodeModel: AssureIt.NodeModel = nodeView.Source;

		if(nodeModel.Type == AssureIt.NodeType.Evidence) {
			var notes: AssureIt.CaseNote[] = nodeModel.Notes;

			for(var i: number = 0; i < notes.length; i++) {
				var body = notes[i].Body;

				if(body["Status"] == "Fail") {
					var fill: string = "#FF99CC";   // FIXME: allow any color
					var stroke: string = "none";

					nodeView.SVGShape.SetColor(fill, stroke);
					blushAllAncestor(nodeModel, fill, stroke);
				}
			}
		}

		return true;



		function blushAllAncestor(node: AssureIt.NodeModel, fill: string, stroke: string) {
			if(node != null) {
				caseViewer.ViewMap[node.Label].SVGShape.SetColor(fill, stroke);
				blushAllAncestor(node.Parent, fill, stroke);
				blushContext(node, fill, stroke);
			}
		}

		function blushContext(node: AssureIt.NodeModel, fill: string, stroke: string) {
			for(var i: number = 0; i < node.Children.length; i++) {
				if(node.Children[i].Type == AssureIt.NodeType.Context) {
					var label: string = node.Children[i].Label;
					var nodeView: AssureIt.NodeView = caseViewer.ViewMap[label];
					nodeView.SVGShape.SetColor(fill, stroke);
				}
			}
		}

	}

}
