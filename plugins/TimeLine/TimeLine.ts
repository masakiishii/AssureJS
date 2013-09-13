/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/ServerApi.ts" />
/// <reference path="../../src/PlugInManager.ts" />
/// <reference path="../Editor/Editor.ts" />

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
