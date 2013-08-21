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
	IsEnabled(caseViewer: AssureIt.CaseViewer, caseModel: AssureIt.NodeModel) : boolean {
		return true;
	}

	Delegate(caseViewer: AssureIt.CaseViewer, caseModel: AssureIt.NodeModel, element: JQuery) : boolean {
		var notes : AssureIt.CaseNote[] = caseModel.Notes;
		var found : boolean = false;
		for (var i in notes) {
			if (notes[i].Name == "Monitor") found = true;
		}
		if (!found) return;

		var text : string = "";
		var p : {top: number; left: number} = element.position();

		for(var i : number = 0; i < caseModel.Annotations.length; i++) {
			text += "@" + caseModel.Annotations[i].Name + "<br>";
		}
		$.ajax({
			url: "http://live.assure-it.org/rec/api/1.0/",
			type: "POST",
			async : false,
			data: {
				jsonrpc: "2.0",
				method: "getMonitor",
				params: {
						nodeID: "55",
					},
				},
			success: function(msg) {
				element.attr('data-monitor', msg.result[0]);
			},
			error: function(msg) {
				console.log("error");
			}
		});

		return true;
	}
}

class MonitorSVGRenderPlugIn extends AssureIt.SVGRenderPlugIn {
	IsEnable(caseViewer: AssureIt.CaseViewer, element: JQuery) : boolean {
		return true;
	}

	Delegate(caseViewer: AssureIt.CaseViewer, nodeView: AssureIt.NodeView) : boolean {
		var element: JQuery = nodeView.HTMLDoc.DocBase;
		if(element.data('monitor')) {
			nodeView.SVGShape.SetColor("red", "black");
		}
		return true;
	}
}
