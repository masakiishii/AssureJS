/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/CaseViewer.ts" />
/// <reference path="../../src/PlugInManager.ts" />

class MonitorPlugin extends RenderPlugIn {
	IsEnabled(caseViewer: CaseViewer, caseModel: CaseModel) : boolean {
		return true;
	}

	Delegate(caseViewer: CaseViewer, caseModel: CaseModel, element: JQuery) : void {
		console.log("hi");
		var notes : CaseNote[] = caseModel.Notes;
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
			data: {
				jsonrpc: "2.0",
				method: "getMonitor",
				params: {
						nodeID: "55",
					},
				},
			success: function(msg) {
				/* FIXME currently, status code cannot get on this ajax call */ 
				// TODO @okamoto
				// filling monitor node w/ red or green depending on its status
				// but at the moment, always filling green is preferred.
			},
			error: function(msg) {
				console.log("error");
			}
		});
	}
}
