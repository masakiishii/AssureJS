/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/CaseViewer.ts" />
/// <reference path="../../src/PlugInManager.ts" />

class NoteHTMLRenderPlugIn extends HTMLRenderPlugIn {
	IsEnabled(caseViewer: CaseViewer, nodeModel: NodeModel) : boolean {
		return true;
	}

	Delegate(caseViewer: CaseViewer, nodeModel: NodeModel) : boolean {
		// TODO
		return true;
	}
}
