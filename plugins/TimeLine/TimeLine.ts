/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/ServerApi.ts" />
/// <reference path="../../src/PlugInManager.ts" />
/// <reference path="../Editor/Editor.ts" />

class TimeLine {
	timeline: JQuery;
	container: JQuery;
	root: JQuery;

	constructor(public caseViewer: AssureIt.CaseViewer, public nodeModel: AssureIt.NodeModel, public element: JQuery, public serverApi: AssureIt.ServerAPI) {
	}

	CreateDOM():void {
		this.root = $(this.caseViewer.Screen.ControlLayer);

		this.container = $("<div></div>").css({
			position: "absolute", left: 0, top: 0, width: 50, height: 100, background: "#eee"
		}).addClass("timeline-container").appendTo(this.root);
		this.timeline = $("<div></div>")
			.addClass("timeline")
			.appendTo(this.container);
	}

	Enable(callback: () => void):void {
		this.CreateDOM();

		var commits: AssureIt.CommitCollection = this.serverApi.GetCommitList(this.nodeModel.Case.CaseId);
		var Case: AssureIt.Case = this.nodeModel.Case;
		var TopLabel = Case.ElementTop.Label;
		var converter = new AssureIt.Converter();
		var decoder   = new AssureIt.CaseDecoder();
		commits.forEach((i:number, v:AssureIt.CommitModel):void => {
			this.timeline.append($('<a id="timeline'+i+'" href="#"></a>').text(v.toString()));
			$("#timeline"+i).click((e: Event)=>{
				var oldData = this.serverApi.GetNodeTree(v.CommitId);
				var j = {contents: JSON.stringify(oldData)};
				var JsonData = converter.GenNewJson(j);
				Case.ClearNodes();
				var ElementTop:AssureIt.NodeModel = decoder.ParseJson(Case, JsonData);
				Case.SetElementTop(ElementTop);
				this.caseViewer.DeleteViewsRecursive(this.caseViewer.ViewMap[TopLabel]);
				this.caseViewer.InitViewMap(Case);
				this.caseViewer.Draw();
				this.Disable(callback);
			});
		});
	}

	Disable(callback: ()=>void) {
		$(".timeline-container").remove();
		callback();
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
				timeline.Enable(() => {this.visible = true; });
				this.visible = false;
			}else {
				timeline.Disable(() =>{
					this.visible = true;
				});
			}
		});
		return true;
	}
}
