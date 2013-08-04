///<reference path='../d.ts/jquery.d.ts'/>

module AssureIt {
	var default_success_callback = function(result) {
		// do nothing
	};

	var default_error_callback = function(req, stat, err) {
		alert("ajax error");
	};

	export class ServerAPI {
		uri : string;

		constructor(basepath : string) {
			this.uri = basepath + "/api/1.0/";
		}

		RemoteCall(method : string, params : any) {
			var cmd = {
				jsonrpc: "2.0",
				method: method,
				id: 1,
				params: params
			};
			var async = callback != null;
			var callback = default_success_callback;
			var error_callback = default_error_callback;
			var res = $.ajax({
				type: "POST",
				url: this.uri,
				async: async,
				data: JSON.stringify(cmd),
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				success: function(response) {
					callback(response.result);
				},
				error: error_callback
			});
			if(!async) {
				return JSON.parse(res.responseText).result;
			}
		}

		GetCase (ProjectName : string, CaseId : number) : Object {
			return <Object> this.RemoteCall("getDCase", { dcaseId: CaseId });
		}

		//-------------------------------------

		SearchDCase(pageIndex: any, tags?: string[]) {
			if(tags == null) {
				tags = [];
			}
			try{
				return this.RemoteCall("searchDCase", {page: pageIndex, tagList: tags});
			}catch(e){
				return [];
			}
		}

		CreateDCase(name, tree) {
			return this.RemoteCall("createDCase", {
				dcaseName: name, contents: tree });
		}

		GetCommitList(dcaseId) {
			return this.RemoteCall("getCommitList", { dcaseId:dcaseId }).commitList;
		}

		GetTagList() {
			return this.RemoteCall("getTagList", {});
		}

		Commit(tree, msg, commitId) {
			return this.RemoteCall("commit", {
				contents: tree,
				commitMessage: msg,
				commitId: commitId,
		//		userId: userId
			}).commitId;
		}


		EditDCase(dcaseId, name) {
			return this.RemoteCall("editDCase", {
				dcaseId: dcaseId,
				dcaseName: name
			});
		}

		DeleteDCase(dcaseId) {
			return this.RemoteCall("deleteDCase", { dcaseId: dcaseId });
		}

		GetNodeTree(commitId) {
			return JSON.parse(this.RemoteCall("getNodeTree", { commitId: commitId }).contents);
		}

		SearchNode(text) {
			return this.RemoteCall("searchNode", { text: text }).searchResultList;
		}

		SearchDCaseHistory(dcaseId, text) {
			return this.RemoteCall("searchDCaseHistory", {dcaseId: dcaseId, text: text});
		}
	}
}
