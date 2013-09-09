/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/CaseViewer.ts" />
/// <reference path="../../src/PlugInManager.ts" />

var LatestDataMap: { [index: string]: any };

function extractTypeFromCondition(condition: string): string {
	var text: string = condition
						.replace(/\{/g, " ")
						.replace(/\}/g, " ")
						.replace(/\(/g, " ")
						.replace(/\)/g, " ")
						.replace(/<=/g, " ")
						.replace(/>=/g, " ")
						.replace(/</g, " ")
						.replace(/>/g, " ");

	var words: string[] = text.split(" ");
	var types: string[] = [];

	for(var i: number = 0; i < words.length; i++) {
		if(words[i] != "" && !$.isNumeric(words[i])) {
			types.push(words[i]);
		}
	}

	if(types.length != 1) {
		// TODO: alert
	}

	return types[0];
}

function isContextNode(nodeModel: AssureIt.NodeModel): boolean {
	if(nodeModel.Type == AssureIt.NodeType.Context) {
		return true;
	}

	return false;
}

function getContextNode(nodeModel: AssureIt.NodeModel): AssureIt.NodeModel {
	for(var i: number = 0; i < nodeModel.Children.length; i++) {
		if(isContextNode(nodeModel.Children[i])) return nodeModel.Children[i];
	}

	return null;
}

function isMonitorNode(nodeModel: AssureIt.NodeModel): boolean {
	if(nodeModel.Type != AssureIt.NodeType.Evidence) return false;
	if(!("Monitor" in nodeModel.Notes)) return false

	var contextNode = getContextNode(nodeModel.Parent);
	if(contextNode == null) return false;
	if(!("Location" in contextNode.Notes)) return false;

	return true;
}

function appendNode(caseViewer: AssureIt.CaseViewer, nodeModel: AssureIt.NodeModel, type: AssureIt.NodeType): AssureIt.NodeModel {
	var viewMap: { [index: string]: AssureIt.NodeView } = caseViewer.ViewMap;
	var view: AssureIt.NodeView = viewMap[nodeModel.Label];
	var case0: AssureIt.Case = caseViewer.Source;
	var newNodeModel = new AssureIt.NodeModel(case0, nodeModel, type, null, null);
	case0.SaveIdCounterMax(case0.ElementTop);
	viewMap[newNodeModel.Label] = new AssureIt.NodeView(caseViewer, newNodeModel);
	viewMap[newNodeModel.Label].ParentShape = viewMap[nodeModel.Label];
	return newNodeModel;
}

function showNode(caseViewer: AssureIt.CaseViewer, nodeModel: AssureIt.NodeModel, HTMLRenderFunction: Function, SVGRenderFunction: Function) {
	var element: JQuery = caseViewer.ViewMap[nodeModel.Label].HTMLDoc.DocBase;
	var view: AssureIt.NodeView = caseViewer.ViewMap[nodeModel.Label];
	HTMLRenderFunction(caseViewer, nodeModel, element);
	SVGRenderFunction(caseViewer, view);
}

function blushAllAncestor(caseViewer: AssureIt.CaseViewer, nodeModel: AssureIt.NodeModel, fill: string, stroke: string) {
	if(nodeModel == null) return;

	caseViewer.ViewMap[nodeModel.Label].SVGShape.SetColor(fill, stroke);

	var contextNode = getContextNode(nodeModel);

	if(contextNode != null) {
		caseViewer.ViewMap[contextNode.Label].SVGShape.SetColor(fill, stroke);
	}

	blushAllAncestor(caseViewer, nodeModel.Parent, fill, stroke);
}


class MonitorNode {

	Location: string;
	Type: string;
	Condition: string;
	LatestData: any;
	Status: boolean;
	EvidenceNode: AssureIt.NodeModel;

	constructor(Location: string, Type: string, Condition: string, EvidenceNode: AssureIt.NodeModel) {
		this.Location = Location;
		this.Type = Type;
		this.Condition = Condition;
		this.LatestData = null;
		this.Status = true;
		this.EvidenceNode = EvidenceNode;
	}

	SetLocation(location: string) {
		this.Location = location;
	}

	SetType(type: string) {
		this.Type = type;
	}

	SetCondition(condition: string) {
		this.Condition = condition;
	}

	UpdateLatestData() {
		if(this.Status == true) {
			this.LatestData = LatestDataMap[this.Type+"@"+this.Location];
		}
	}

	UpdateStatus() {
		if(this.Status = true) {
			var script: string = "var "+this.Type+"="+this.LatestData.data+";";
			script += this.Condition+";";
			this.Status = eval(script);   // FIXME: don't use eval()
		}
	}

	Show(caseViewer: AssureIt.CaseViewer, HTMLRenderFunction: Function, SVGRenderFunction: Function) {
		var contextNode: AssureIt.NodeModel = getContextNode(this.EvidenceNode);

		if(contextNode == null) {
			contextNode = appendNode(caseViewer, this.EvidenceNode, AssureIt.NodeType.Context);
		}

		if(this.Status == true) { /* success */
			contextNode.Notes["Status"] = "Success";
			contextNode.Notes[this.Type] = this.LatestData.data;
			contextNode.Notes["Timestamp"] = this.LatestData.timestamp;
		}
		else { /* fail */
			contextNode.Notes["Status"] = "Fail";
			contextNode.Notes[this.Type] = this.LatestData.data;
			contextNode.Notes["Timestamp"] = this.LatestData.timestamp;
			contextNode.Notes["Manager"] = this.LatestData.authid;

		}

		showNode(caseViewer, contextNode, HTMLRenderFunction, SVGRenderFunction);
	}

}


class MonitorManager {

	RECAPI: AssureIt.RECAPI;
	Timer: number;
	MonitorNodeMap: { [index: string]: MonitorNode };
	CaseViewer: AssureIt.CaseViewer;
	HTMLRenderFunction: Function;
	SVGRenderFunction: Function;

	constructor(caseViewer: AssureIt.CaseViewer) {
		this.RECAPI = new AssureIt.RECAPI("http://54.250.206.119/rec");
		this.MonitorNodeMap = {};
		this.CaseViewer = caseViewer;
		this.HTMLRenderFunction = this.CaseViewer.GetPlugInHTMLRender("note");
		this.SVGRenderFunction = this.CaseViewer.GetPlugInSVGRender("monitor");
	}

	StartMonitors(interval: number) {
		var self = this;

		this.Timer = setInterval(function() {
			self.CollectLatestData();

			for(var key in self.MonitorNodeMap) {
				var monitorNode = self.MonitorNodeMap[key];

				monitorNode.UpdateLatestData();
				if(monitorNode.LatestData == null) continue;

				monitorNode.UpdateStatus();
				monitorNode.Show(self.CaseViewer, self.HTMLRenderFunction, self.SVGRenderFunction);

			}

			self.CaseViewer.Draw();

		}, interval);
	}

	StopMonitors() {
		clearTimeout(this.Timer);
	}

	SetMonitor(evidenceNode: AssureIt.NodeModel) {
		var location: string = getContextNode(evidenceNode.Parent).Notes["Location"];
		var condition: string = evidenceNode.Notes["Monitor"];
		var type: string = extractTypeFromCondition(condition);
		LatestDataMap[type+"@"+location] = null;
		var monitorNode = this.MonitorNodeMap[evidenceNode.Label];

		if(monitorNode == null) {
			this.MonitorNodeMap[evidenceNode.Label] = new MonitorNode(location, type, condition, evidenceNode);
		}
		else {
			monitorNode.SetLocation(location);
			monitorNode.SetType(type);
			monitorNode.SetCondition(condition);
		}
	}

	CollectLatestData() {
		for(var key in LatestDataMap) {
			var type: string = key.split("@")[0];
			var location: string = key.split("@")[1];
			var latestData = this.RECAPI.getLatestData(location, type);
			if(latestData == null) {
				// TODO: alert
				console.log("latest data is null");
			}
			LatestDataMap[key] = latestData;
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
			LatestDataMap = {};
			this.MonitorManager = new MonitorManager(caseViewer);
			this.MonitorManager.StartMonitors(5000);
			this.IsFirstCalled = false;
		}

		if(isMonitorNode(nodeModel)) {
			this.MonitorManager.SetMonitor(nodeModel);
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

		if(isMonitorNode(nodeModel)) {
			var contextNode = getContextNode(nodeModel);

			if(contextNode != null && contextNode.Notes["Status"] == "Fail") {
				var fill: string = "#FF9999";   // FIXME: allow any color
				var stroke: string = "none";

				blushAllAncestor(caseViewer, nodeModel, fill, stroke);
			}
		}

		return true;
	}

}
