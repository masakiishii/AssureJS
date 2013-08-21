/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/CaseViewer.ts" />
/// <reference path="../../src/PlugInManager.ts" />

class DefaultStatementRenderPlugIn extends AssureIt.PlugIn {

	constructor(public plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
		this.HTMLRenderPlugIn = new DefaultStatementHTMLRenderPlugIn(plugInManager);
	}

}

class DefaultStatementHTMLRenderPlugIn extends AssureIt.HTMLRenderPlugIn {
	IsEnabled(caseViewer: AssureIt.CaseViewer, caseModel: AssureIt.NodeModel) : boolean {
		return true;
	}

	Delegate(caseViewer: AssureIt.CaseViewer, caseModel: AssureIt.NodeModel, element: JQuery) : boolean {

		var statements: string[] = caseModel.Statement.split("\n");
		var content: string = "";
		for(var i:number = 0; i < statements.length; i++) {
			content += statements[i] + "<br>";
		}
		$('<p>' + content + '</p>').appendTo(element);
		return true;
	}
}
