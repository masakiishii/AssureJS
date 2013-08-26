/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/ServerApi.ts" />
/// <reference path="../../src/PlugInManager.ts" />
/// <reference path="../Editor/Editor.ts" />

class TimeLine {
	constructor(public caseViewer: AssureIt.CaseViewer, public nodeModel: AssureIt.NodeModel, public element: JQuery, public serverApi: AssureIt.ServerAPI) {

	}

	enable() {
		var commitCollection: AssureIt.CommitCollection = AssureIt.CommitCollection.FromJson(this.serverApi.GetCommitList(this.nodeModel.Case.CaseId));
		commitCollection.forEach((i:number, v:AssureIt.CommitModel):void => {
			console.log(v);
		});
	}

	disable() {
		console.log("disable");
	}
}

class TimeLinePlugIn extends AssureIt.PlugInSet {

	constructor(plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
		this.MenuBarContentsPlugIn = new TimeLineMenuPlugIn(plugInManager);
	}

}

class TimeLineMenuPlugIn extends AssureIt.MenuBarContentsPlugIn {
	visible: boolean = true;
	constructor(plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
	}

	IsEnabled(caseViewer: AssureIt.CaseViewer, caseModel: AssureIt.NodeModel): boolean {
		return true;
	}

	Delegate(caseViewer: AssureIt.CaseViewer, caseModel: AssureIt.NodeModel, element: JQuery, serverApi: AssureIt.ServerAPI): boolean {
		element.append('<a href="#" ><img id="timeline" src="' + serverApi.basepath + 'images/icon.png" title="TimeLine" alt="timeline" /></a>');
		$('#timeline').unbind('click');
		$('#timeline').click((ev: Event) => {

			var timeline = new TimeLine(caseViewer, caseModel, element, serverApi);
			if(this.visible) {
				timeline.enable();
				this.visible = false;
			}else {
				timeline.disable();
				this.visible = true;
			}
		});
		return true;
	}
}
