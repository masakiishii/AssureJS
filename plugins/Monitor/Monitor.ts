/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/CaseViewer.ts" />
/// <reference path="../../src/PlugInManager.ts" />

class MonitorHTMLRenderPlugIn extends HTMLRenderPlugIn {
	IsEnabled(caseViewer: CaseViewer, caseModel: CaseModel) : boolean {
		return true;
	}

	Delegate(caseViewer: CaseViewer, caseModel: CaseModel, element: JQuery) : boolean {
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

class MonitorSVGRenderPlugIn extends SVGRenderPlugIn {
	IsEnable(caseViewer: CaseViewer, element: JQuery) : boolean {
		return true;
	}

	Delegate(caseViewer: CaseViewer, elementShape: ElementShape) : boolean {
		var element: JQuery = elementShape.HTMLDoc.DocBase;
		if(element.data('monitor')) {
			elementShape.SVGShape.SetColor("red", "black");
		}
		return true;
	}
}
