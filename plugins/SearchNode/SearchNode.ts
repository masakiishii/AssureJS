/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/CaseEncoder.ts" />
/// <reference path="../../src/ServerApi.ts" />
/// <reference path="../../src/PlugInManager.ts" />
/// <reference path="../Editor/Editor.ts" />

class SearchNodePlugIn extends AssureIt.PlugInSet {

	constructor(plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
		//var plugin: SearchNodeActionPlugIn = new SearchNodeActionPlugIn(plugInManager);
		//this.ActionPlugIn = plugin;
		this.MenuBarContentsPlugIn = new SearchNodeMenuPlugIn(plugInManager);
	}

}

class SearchNodeMenuPlugIn extends AssureIt.MenuBarContentsPlugIn {
	element: JQuery;
	caseViewer: AssureIt.CaseViewer;
	constructor(plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
		this.element = null;
		this.caseViewer = null;
	}

	IsEnabled(caseViewer: AssureIt.CaseViewer, caseModel: AssureIt.NodeModel): boolean {
		return true;
	}

	Delegate(caseViewer: AssureIt.CaseViewer, caseModel: AssureIt.NodeModel, element: JQuery, serverApi: AssureIt.ServerAPI): boolean {
		this.caseViewer = caseViewer;
		this.element = element;
		element.append('<a href="#" ><img id="center" src="' + serverApi.basepath + 'images/scale.png" title="Search" alt="Search" /></a>');
		$('#center').unbind('click');
		$('#center').click(() => { this.Center(); });

		//element.append('<a href="#" ><img id="SearchNode-xml" src="' + serverApi.basepath + 'images/icon.png" title="SearchNode XML" alt="XML" /></a>');
		//$('#SearchNode-xml').unbind('click');
		//$('#SearchNode-xml').click(this.editorPlugIn.SearchNodeXml);
		return true;
	}

	Center() : void {
		var thisLabel: string = this.element.children('h4').text();
		var thisNodeView: AssureIt.NodeView = this.caseViewer.ViewMap[thisLabel];
		return;
	}
}

//class SearchNodeActionPlugIn extends AssureIt.ActionPlugIn {
//
//	constructor(plugInManager: AssureIt.PlugInManager) {
//		super(plugInManager);
//	}
//
//	IsEnabled (caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case) : boolean {
//		return true;
//	}
//
//	Delegate(caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case, serverApi: AssureIt.ServerAPI)  : boolean {
//		var self = this;
//
//		return true;
//	}
//
//	DeleteFromDOM(): void {
//	}
//}
