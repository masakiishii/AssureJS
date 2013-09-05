/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/CaseViewer.ts" />
/// <reference path="../../src/PlugInManager.ts" />

function extractVariableFromCondition(condition: string): string {
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

function hasMonitorInfo(node: AssureIt.NodeModel): boolean {
	if(node.Type != AssureIt.NodeType.Context) return false;   // node isn't 'Context'
	if(node.Parent.Type != AssureIt.NodeType.Goal) return false;   // parent isn't 'Goal'

	var notes = node.Notes;

	if("Location" in notes && "Monitor" in notes) {
		return true;
	}

	return false;
}

function appendNode(caseViewer: AssureIt.CaseViewer, node: AssureIt.NodeModel, type: AssureIt.NodeType): AssureIt.NodeModel {
	var viewMap: { [index: string]: AssureIt.NodeView } = caseViewer.ViewMap;
	var view: AssureIt.NodeView = viewMap[node.Label];
	var case0: AssureIt.Case = caseViewer.Source;
	var newNode = new AssureIt.NodeModel(case0, node, type, null, null);
	case0.SaveIdCounterMax(case0.ElementTop);
	viewMap[newNode.Label] = new AssureIt.NodeView(caseViewer, newNode);
	viewMap[newNode.Label].ParentShape = viewMap[node.Label];
	return newNode;
}

function isEmptyEvidenceNode(node: AssureIt.NodeModel): boolean {
	if(node.Type == AssureIt.NodeType.Evidence &&
			node.Statement == "" &&
			node.Annotations.length == 0 &&
			node.Notes == {} &&
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


class MonitorNode {

	Location: string;
	Type: string;
	LatestDataMap: { [index: string]: any };
	Condition: string;
	EvidenceNode: AssureIt.NodeModel;
	Viewer: AssureIt.CaseViewer;
	HTMLRenderFunction: Function;
	SVGRenderFunction: Function;

	constructor(Location: string, Type: string, LatestDataMap: { [index: string]: any }, Condition: string, EvidenceNode: AssureIt.NodeModel, Viewer: AssureIt.CaseViewer, HTMLRenderFunction: Function, SVGRenderFunction: Function) {
		this.Type = Type;
		this.Location = Location;
		this.LatestDataMap = LatestDataMap;
		this.Condition = Condition;
		this.EvidenceNode = EvidenceNode;
		this.Viewer = Viewer;
		this.HTMLRenderFunction = HTMLRenderFunction;
		this.SVGRenderFunction = SVGRenderFunction;
	}

	SetCondition(Condition: string) {
		this.Condition = Condition;
	}

	GetLatestData(): any {
		return this.LatestDataMap[this.Type+"@"+this.Location];
	}

	EvaluateCondition(latestData: any): boolean {
		var script: string = "var "+this.Type+"="+latestData.data+";";
		script += this.Condition+";";
		return eval(script);   // FIXME: don't use eval()
	}

	EditResult(result: boolean) {
		if(this.IsAlreadyFailed()) return;

		var evidenceNode: AssureIt.NodeModel = this.EvidenceNode;

		var latestData = this.GetLatestData();
		var evidenceNotes = evidenceNode.Notes;

		if(result) { /* success */
			evidenceNotes["Status"] = "Success";
			evidenceNotes[this.Type] = latestData.data;
			evidenceNotes["Timestamp"] = latestData.timestamp;
		}
		else { /* fail */
			evidenceNotes["Status"] = "Fail";
			evidenceNotes[this.Type] = latestData.data;
			evidenceNotes["Timestamp"] = latestData.timestamp;

			var contextNode: AssureIt.NodeModel = getContextNode(evidenceNode);
			if(contextNode == null) {
				contextNode = appendNode(this.Viewer, evidenceNode, AssureIt.NodeType.Context);
			}

			var contextNotes = contextNode.Notes;
			contextNotes["Manager"] = latestData.authid;
		}
	}

	IsAlreadyFailed(): boolean {
		if(this.EvidenceNode.Notes["Status"] == "Fail") return true;
		return false;
	}

	Update() {
		var element: JQuery = this.Viewer.ViewMap[this.EvidenceNode.Label].HTMLDoc.DocBase;
		var view: AssureIt.NodeView = this.Viewer.ViewMap[this.EvidenceNode.Label];
		this.HTMLRenderFunction(this.Viewer, this.EvidenceNode, element);
		this.SVGRenderFunction(this.Viewer, view);

		var contextNode = getContextNode(this.EvidenceNode);
		if(contextNode != null) {
			var element: JQuery = this.Viewer.ViewMap[contextNode.Label].HTMLDoc.DocBase;
			var view: AssureIt.NodeView = this.Viewer.ViewMap[contextNode.Label];
			this.HTMLRenderFunction(this.Viewer, contextNode, element);
			this.SVGRenderFunction(this.Viewer, view);
		}
	}

}


class MonitorManager {

	RECAPI: AssureIt.RECAPI;
	Timer: number;
	LatestDataMap: { [index: string]: any };
	MonitorNodeMap: { [index: string]: MonitorNode };
	Viewer: AssureIt.CaseViewer;
	HTMLRenderFunction: Function;
	SVGRenderFunction: Function;

	constructor(Viewer: AssureIt.CaseViewer) {
		this.RECAPI = new AssureIt.RECAPI("http://54.250.206.119/rec");
		this.LatestDataMap = {};
		this.MonitorNodeMap = {};
		this.Viewer = Viewer;
		this.HTMLRenderFunction = this.Viewer.GetPlugInHTMLRender("note");
		this.SVGRenderFunction = this.Viewer.GetPlugInSVGRender("monitor");
	}

	StartMonitor(interval: number) {
		var self = this;

		this.Timer = setInterval(function() {
			self.CollectLatestData();

			for(var key in self.MonitorNodeMap) {
				var monitorNode = self.MonitorNodeMap[key];

				var latestData = monitorNode.GetLatestData();
				if(latestData == null) continue;

				var result: boolean =  monitorNode.EvaluateCondition(latestData);
				monitorNode.EditResult(result);

				monitorNode.Update();
			}

			self.Viewer.Draw();

		}, interval);
	}

	SetMonitor(contextNode: AssureIt.NodeModel) {
		var notes = contextNode.Notes;
		var locations: string[] = [];
		var conditions: string[] = [];

		var location = notes["Location"];   // FIXME: now, we can set only one monitor at once
		var condition = notes["Monitor"];   // FIXME: now, we can set only one monitor at once
		var type: string = extractVariableFromCondition(condition);
		var latestDataKey: string = type+"@"+location;

		this.LatestDataMap[type+"@"+location] = null;

		var monitorNode = this.MonitorNodeMap[contextNode.Label];

		if(monitorNode == null) {
			var evidenceNode = getEmptyEvidenceNode(contextNode.Parent);
			if(evidenceNode == null) {
				evidenceNode = appendNode(this.Viewer, contextNode.Parent, AssureIt.NodeType.Evidence);
			}

			this.MonitorNodeMap[contextNode.Label] = new MonitorNode(location, type, this.LatestDataMap, condition, evidenceNode, this.Viewer, this.HTMLRenderFunction, this.SVGRenderFunction);
		}
		else {
			monitorNode.SetCondition(condition);
		}
	}

	CollectLatestData() {
		for(var key in this.LatestDataMap) {
			var type: string = key.split("@")[0];
			var location: string = key.split("@")[1];
			var latestData = this.RECAPI.getLatestData(location, type);
			if(latestData == null) {
				// TODO: alert
				console.log("latest data is null");
			}
			this.LatestDataMap[key] = latestData;
		}
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

		if(!hasMonitorInfo(nodeModel)) return true;

		this.MonitorManager.SetMonitor(nodeModel);

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
			if(nodeModel.Notes["Status"] == "Fail") {
				var fill: string = "#FF9999";   // FIXME: allow any color
				var stroke: string = "none";

				nodeView.SVGShape.SetColor(fill, stroke);
				blushAllAncestor(nodeModel, fill, stroke);
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
