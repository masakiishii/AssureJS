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

		var node: JQuery = $("#"+this.nodeModel.Label);

		this.container = $("<div></div>").css({
			position: "absolute", left: node.position().left + (node.width() / 2), top: node.position().top + node.height() +  53
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
		var decoder   = new AssureIt.CaseDecoder();
		this.timeline.append($('<ul id="timeline-ul"></ul>'))
		commits.forEach((i:number, v:AssureIt.CommitModel):void => {
			$("#timeline-ul").append($('<a id="timeline'+i+'" href="#"></a>').text(v.toString()));
			$("#timeline"+i).click((e: Event)=>{
				var loc = this.serverApi.basepath + "case/" + this.nodeModel.Case.CaseId;
				location.href = loc + '/history/' + (i);
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
		this.ShortcutKeyPlugIn = new TimeLineKeyPlugIn(plugInManager);
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
		var loc = serverApi.basepath + "case/" + caseModel.Case.CaseId + "/history";
		element.append('<a href="'+ loc +'" ><img id="timeline" src="' + serverApi.basepath + 'images/icon.png" title="History" alt="history" /></a>');

		//$('#timeline').unbind('click');
		//$('#timeline').click((ev: Event) => {

		//	var timeline = new TimeLine(caseViewer, caseModel, element, serverApi);
		//	if(this.visible) {
		//		timeline.Enable(() => {this.visible = true; });
		//		this.visible = false;
		//	}else {
		//		timeline.Disable(() =>{
		//			this.visible = true;
		//		});
		//	}
		//	$('#background').click((ev: Event) => {
		//		timeline.Disable(() =>{
		//			this.visible = true;
		//		});
		//	});
		//});
		return true;
	}
}

class TimeLineKeyPlugIn extends AssureIt.ShortcutKeyPlugIn {

	constructor(public plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
	}

	IsEnabled(Case0: AssureIt.Case, serverApi: AssureIt.ServerAPI) : boolean {
		return true;
	}

	RegisterKeyEvents(Case0: AssureIt.Case, serverApi: AssureIt.ServerAPI) : boolean {
		$("body").keydown((e)=>{
			if(e.keyCode == 37/*left*/ && e.shiftKey) {
				this.ShowPreview(Case0, serverApi);
			}
			if(e.keyCode == 39/*right*/ && e.shiftKey) {
				this.ShowNext(Case0, serverApi);
			}
		});
		return true;
	}

	GetHistoryId(): number {
		var url: string = location.href;
		var matches: string[] = url.match(/history\/([0-9]*)/);
		if(matches != null) {
			return Number(matches[1]);
		}
		return -1;
	}

	ShowPreview(Case: AssureIt.Case, serverApi: AssureIt.ServerAPI): void {
		var historyId = this.GetHistoryId();
		if(historyId == -1/* Latest and Edit mode*/) {
			var commits: AssureIt.CommitCollection = serverApi.GetCommitList(Case.CaseId);
			historyId = commits.Size() -1;
		}
		if(historyId > 0/* not oldest*/) {
			historyId--;
			var loc = serverApi.basepath + "case/" + Case.CaseId;
			location.href = loc + '/history/' + (historyId);
		}
	}

	ShowNext(Case: AssureIt.Case, serverApi: AssureIt.ServerAPI): void {
		var historyId = this.GetHistoryId();
		if(historyId == -1/* Latest and Edit mode*/) {
			return
		}
		var commits: AssureIt.CommitCollection = serverApi.GetCommitList(Case.CaseId);
		var max = commits.Size() - 2;
		if(historyId >= 0 && historyId < max/* FIXME Latest*/) {
			historyId++;
			var loc = serverApi.basepath + "case/" + Case.CaseId;
			location.href = loc + '/history/' + (historyId);
		} else if(historyId == max) {
			location.href= serverApi.basepath + "case/" + Case.CaseId;
		}
	}

	DeleteFromDOM(): void { //TODO
	}

	DisableEvent(caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case, serverApi: AssureIt.ServerAPI)  : void {
	}

}
