/// <reference path="../d.ts/jquery.d.ts" />
/// <reference path='ServerApi.ts'/>

module AssureIt {
	export class SelectCaseModel {
		constructor(public id: number, public name: string, public user: string, public lastDate: any, public lastUser: any, public isLogin: bool, public api: ServerAPI) {
		}

		toHtml(callback: (id: number, name: string, user: string, lastDate: any, lastUser: any, isLogin: bool) => JQuery) : JQuery {
			return callback(this.id, this.name, this.user, this.lastDate, this.lastUser, this.isLogin);
		}

		setEvent() : void {
			if(this.isLogin) {
				$("a#e"+this.id).click((e)=>{
					var msg = prompt("Case名を入力して下さい");
					if(msg != null) {
						if(this.api.EditCase(this.id, msg) != null) {
							alert("変更しました");
							location.reload();
						}
					}
				});
				$("a#d"+this.id).click((e)=>{
					if(window.confirm('dcaseを削除しますか?')) {
						if(this.api.DeleteCase(this.id) != null) {
							alert("削除しました");
							location.reload();
						}
					}
				});
			}
		}
	}

	export class SelectCaseManager {
		contents: SelectCaseModel[] = [];

		constructor(public api: ServerAPI) {}
		clear() : void {}
		updateContentsOrZeroView():void {}

		add(s: SelectCaseModel): void {
			this.contents.push(s);
		}

		_updateContentsOrZeroView($tbody: JQuery, zeroStr: string, callback: (id: number, name: string, user: string, lastDate: any, lastUser: any, isLogin: bool) => JQuery):void {
			if(this.contents.length == 0) {
				$(zeroStr).appendTo($tbody);
			}
			$.each(this.contents, (i, s) => {
				s.toHtml(callback).appendTo($tbody);
				s.setEvent();
			});
		}
	}
	
	export class ThumnailView {
		static toThumnail(id: number, name: string, user: string, lastDate: any, lastUser: any, isLogin: bool): JQuery {
			var html = '<ul class="thumbnails"><li class="span4"><a href="#" class="thumbnail">'+name+'</a></li></ul>';
			return $('<div></div>').html(html);
		}
	}
	
	export class SelectCaseThumbnailManager extends SelectCaseManager{
		constructor(public api: ServerAPI) {
			super(api);
		}
	
		clear() : void {
			$("#select-case *").remove();
			$("#select-case").append('<div class="row-fluid"></div>');
		}
	
		updateContentsOrZeroView():void {
			super._updateContentsOrZeroView($('#select-case .row-fluid'), "<font color=gray>Caseがありません</font>", ThumnailView.toThumnail);
		}
	}
	
	export class TableView {
		static toTable(id: number, name: string, user: string, lastDate: any, lastUser: any, isLogin: bool): JQuery {
			//FIXME
			var Config = { BASEPATH: "FIXME"};
			var html = '<td><a href="' + Config.BASEPATH + '/dcase/' + id + '">' + name +
					"</a></td><td>" + user + "</td><td>" + lastDate + "</td><td>" +
					lastUser + "</td>";
			if(isLogin) {
				html += "<td><a id=\"e"+ id +"\" href=\"#\">Edit</a></td>"
					+ "<td><a id=\"d"+ id +"\" href=\"#\">Delete</a></td>";
			}
			return $("<tr></tr>").html(html);
		}
	}
	
	export class SelectCaseTableManager extends SelectCaseManager{
		constructor(public api: ServerAPI) {
			super(api);
		}

		clear() : void {
			$("tbody#dcase-select-table *").remove();
		}
	
		updateContentsOrZeroView():void {
			super._updateContentsOrZeroView($('#case-select-table'), "<tr><td><font color=gray>Caseがありません</font></td><td></td><td></td><td></td></tr>", TableView.toTable);
		}
	}
	
	export class SelectCaseView {
		pageIndex: number;
		maxPageSize: number;
		manager: SelectCaseManager;
	
		constructor(public api:ServerAPI) {
			this.pageIndex = 1;
			this.maxPageSize = 2;
			this.manager = new SelectCaseTableManager(api);
		}
	
		clear(): void {
			this.manager.clear();
		}
	
		addElements(userId, pageIndex?: any, tags?: string[]): void {
			if(pageIndex == null || pageIndex < 1) pageIndex = 1;
			if(tags == null) tags = [];
			this.pageIndex = pageIndex - 0;
			var searchResults: any = this.api.SearchCase(this.pageIndex, tags);
			var dcaseList : any = searchResults.dcaseList;
			this.maxPageSize  = searchResults.summary.maxPage;
	
			var isLogin = userId != null;
			$.each(dcaseList, (i, dcase)=>{
				var s:SelectCaseModel = new SelectCaseModel(dcase.dcaseId, dcase.dcaseName, dcase.userName, dcase.latestCommit.dateTime, dcase.latestCommit.userName, isLogin, this.api);
				this.manager.add(s);
			});
			this.manager.updateContentsOrZeroView();
		}
	
		initEvents() {
			var Config = { BASEPATH: "FIXME"}; //FIXME
			$("#prev-page").click((e) => {
				var i = this.pageIndex - 0;
				if(i > 1) {
					this.pageIndex = i - 1;
					location.href = Config.BASEPATH + "/page/" + this.pageIndex;
				}
				e.preventDefault();
			});
	
			$("#next-page").click((e) => {
				var i = this.pageIndex - 0;
				if(this.maxPageSize >= i + 1) {
					this.pageIndex = i + 1;
					location.href = Config.BASEPATH + "/page/" + this.pageIndex;
				}
				e.preventDefault();
			});
		}
	
	}
}
