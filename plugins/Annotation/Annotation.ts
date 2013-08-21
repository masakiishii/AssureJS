/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/CaseViewer.ts" />
/// <reference path="../../src/PlugInManager.ts" />

class AnnotationPlugIn extends AssureIt.PlugInSet {

	constructor(public plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
		this.HTMLRenderPlugIn = new AnnotationHTMLRenderPlugIn(plugInManager);
	}

}

class AnnotationHTMLRenderPlugIn extends AssureIt.HTMLRenderPlugIn {
	IsEnabled(caseViewer: AssureIt.CaseViewer, caseModel: AssureIt.NodeModel) : boolean {
		return true;
	}

	Delegate(caseViewer: AssureIt.CaseViewer, caseModel: AssureIt.NodeModel, element: JQuery) : boolean {
		if(caseModel.Annotations.length == 0) return;

		var text : string = "";
		var p : {top: number; left: number} = element.position();

		for(var i : number = 0; i < caseModel.Annotations.length; i++) {
			text += "@" + caseModel.Annotations[i].Name + "<br>";
		}

		$('<div class="anno">' +
			'<p>' + text + '</p>' +
			'</div>')
			.css({position: 'absolute', 'font-size': 25, color: 'gray', top: p.top - 20, left: p.left + 80}).appendTo(element);

		return true;
	}
}
