/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/CaseViewer.ts" />
/// <reference path="../../src/PlugInManager.ts" />

class DScriptPlugIn extends AssureIt.PlugIn {

	constructor(public plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
		this.MenuBarContentsPlugIn = new DScriptMenuPlugIn(plugInManager);
	}

}

class DScriptMenuPlugIn extends AssureIt.MenuBarContentsPlugIn {
	IsEnabled(caseViewer: AssureIt.CaseViewer, caseModel: AssureIt.NodeModel) : boolean {
		return true;
	}

	Delegate(caseViewer: AssureIt.CaseViewer, caseModel: AssureIt.NodeModel, element: JQuery, serverApi: AssureIt.ServerAPI): boolean {
		console.log("Hello DScript");
		element.append('<a href="#" ><img id="dscript"  src="'+serverApi.basepath+'images/icon.png" title="DScript" alt="dscript" /></a>');
		return true;
	}
}
