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

		constructor(public basepath: string) {
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

		SearchCase(pageIndex: any, tags?: string[]) {
			if(tags == null) {
				tags = [];
			}
			try{
				return this.RemoteCall("searchDCase", {page: pageIndex, tagList: tags});
			}catch(e){
				return [];
			}
		}

		CreateCase(name: string, tree: any) {
			return this.RemoteCall("createDCase", {
				dcaseName: name, contents: tree });
		}

		GetCommitList(dcaseId: number) {
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

		EditCase(dcaseId, name) {
			return this.RemoteCall("editDCase", {
				dcaseId: dcaseId,
				dcaseName: name
			});
		}

		DeleteCase(dcaseId) {
			return this.RemoteCall("deleteDCase", { dcaseId: dcaseId });
		}

		GetNodeTree(commitId) {
			return JSON.parse(this.RemoteCall("getNodeTree", { commitId: commitId }).contents);
		}

		SearchNode(text: string) {
			return this.RemoteCall("searchNode", { text: text }).searchResultList;
		}

		SearchCaseHistory(dcaseId: number, text: string) {
			return this.RemoteCall("searchDCaseHistory", {dcaseId: dcaseId, text: text});
		}

		GetProjectList(userId: number) {
			return this.RemoteCall("getProjectList", { userId:userId });
		}

		CreateProject(name: string, userId: number) {
			return this.RemoteCall("createProject", {
				name: name, userId: userId });
		}

		EditProject(name: string, projectId: number) {
			return this.RemoteCall("EditProject", {
				name: name, projectId: projectId });
		}
	}
}
