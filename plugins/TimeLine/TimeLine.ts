/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/ServerApi.ts" />
/// <reference path="../../src/PlugInManager.ts" />
/// <reference path="../Editor/Editor.ts" />

class TimeLine {
	timeline: JQuery;
	canvas: JQuery;
	container: JQuery;
	root: JQuery;

	constructor(public caseViewer: AssureIt.CaseViewer, public nodeModel: AssureIt.NodeModel, public element: JQuery, public serverApi: AssureIt.ServerAPI) {
	}

	CreateDOM():void {
		this.root = $(this.caseViewer.Screen.ControlLayer);

		this.container = $("<div></div>").css({
			position: "absolute", left: 0, top: 0,
		}).addClass("timeline-container").appendTo(this.root);
		this.timeline = $("<div></div>")
			.addClass("timeline").text("hogehogehoge")
			.appendTo(this.container);
		this.canvas = $("<canvas></canvas>")
			.css("position", "absolute")
			.appendTo(this.timeline);
	}

	Enable():void {
		this.CreateDOM();

		var commitCollection: AssureIt.CommitCollection = this.serverApi.GetCommitList(this.nodeModel.Case.CaseId);
		commitCollection.forEach((i:number, v:AssureIt.CommitModel):void => {
			console.log(v);
		});
	}

	Disable() {
		$(".timeline-container").remove();
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
				timeline.Enable();
				this.visible = false;
			}else {
				timeline.Disable();
				this.visible = true;
			}
		});
		return true;
	}
}
