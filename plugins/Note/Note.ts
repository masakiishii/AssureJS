/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/CaseViewer.ts" />
/// <reference path="../../src/PlugInManager.ts" />

class NotePlugIn extends AssureIt.PlugIn {

	constructor() {
		super();
		this.HTMLRenderPlugIn = new NoteHTMLRenderPlugIn();
	}

}

class NoteHTMLRenderPlugIn extends AssureIt.HTMLRenderPlugIn {
	IsEnabled(caseViewer: AssureIt.CaseViewer, nodeModel: AssureIt.NodeModel) : boolean {
		return true;
	}

	Delegate(caseViewer: AssureIt.CaseViewer, nodeModel: AssureIt.NodeModel) : boolean {
		// TODO
		return true;
	}
}
