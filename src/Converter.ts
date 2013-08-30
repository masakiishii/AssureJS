module AssureIt {

	export class Converter {
		NewNodeMap : { [index: string]: number};
		OldNodeMap : { [index: number]: string};
		
		constructor() {
			this.NewNodeMap = {};
			this.OldNodeMap = {};
		}

		ConvertOldNodeTypetoNewNodeType(newNodeListData : any, oldNodeListData : any) : void {
			if(oldNodeListData.NodeType == "Goal") {
				newNodeListData.NodeType = 0;
			}
			else if(oldNodeListData.NodeType == "Context") {
				newNodeListData.NodeType = 1;
			}
			else if(oldNodeListData.NodeType == "Strategy") {
				newNodeListData.NodeType = 2;
			}
			else { //Evidence
				newNodeListData.NodeType = 3;
			}
		}

		ConvertOldNodeListtoNewNodeList(newNodeListData : any, oldNodeListData : any) : void {
			var n : number = oldNodeListData.Children.length;
			for(var i : number = 0; i < n; i++) {
				newNodeListData.Children.push(this.OldNodeMap[oldNodeListData.Children[i]]);
			}
			if(oldNodeListData.Contexts != null && !(oldNodeListData.Contexts instanceof Array)) {
				newNodeListData.Children.push(this.OldNodeMap[oldNodeListData.Contexts]);
			}
			this.ConvertOldNodeTypetoNewNodeType(newNodeListData, oldNodeListData);
			newNodeListData.Statement = oldNodeListData.Description;
			newNodeListData.Label = this.OldNodeMap[oldNodeListData.ThisNodeId];
			//newNodeListData.Annotation = oldNodeListData.Contexts; //FIXME
			if(oldNodeListData.MetaData != null) {
				n = oldNodeListData.MetaData.length;
				for(var i : number = 0; i < n; i++) {
					var json : any = { 
						"Name" : "",
						"Body" : {}
					};

					var MetaDataKeys: string[] = Object.keys(oldNodeListData.MetaData[i]);
					for(var j: number = 0; j < MetaDataKeys.length; j++) {
						if(MetaDataKeys[j] == "Type") {
							json.Name = oldNodeListData.MetaData[i][MetaDataKeys[j]];
							continue;
						}
						json.Body[MetaDataKeys[j]] = oldNodeListData.MetaData[i][MetaDataKeys[j]];
					}
					newNodeListData.Notes.push(json);
				}
			}
		}

		SetOldNodeMap(oldJsonData : any) : void {
			var NodeList : any = oldJsonData.contents.NodeList;
			var n : number = NodeList.length;
			for(var i : number = 0; i < n; i++) {
				if(NodeList[i].NodeType == "Goal") {
					this.OldNodeMap[NodeList[i].ThisNodeId] = "G" + String(NodeList[i].ThisNodeId);
				}
				else if(NodeList[i].NodeType == "Context") {
					this.OldNodeMap[NodeList[i].ThisNodeId] = "C" + String(NodeList[i].ThisNodeId);
				}
				else if(NodeList[i].NodeType == "Strategy") {
					this.OldNodeMap[NodeList[i].ThisNodeId] = "S" + String(NodeList[i].ThisNodeId);
				}
				else {
					this.OldNodeMap[NodeList[i].ThisNodeId] = "E" + String(NodeList[i].ThisNodeId);
				}
			}
		}

		GetPrefix(id: number, list: any): string {
			for(var i : number = 0; i < list.length; i++) {
				if(list[i].ThisNodeId == id) {
					return list[i].NodeType.slice(0,1);
				}
			}
			return "G";
		}

		GenNewJson (oldJsonData : any) : any {
			oldJsonData.contents = JSON.parse(oldJsonData.contents);
			this.SetOldNodeMap(oldJsonData);
			var newJsonData = {
				"DCaseName": "",
				"NodeCount": 0,
				"TopGoalLabel": "",
				"NodeList": []
			}

			newJsonData["DCaseName"] = oldJsonData.contents.DCaseName;
			newJsonData["NodeCount"] = oldJsonData.contents.NodeCount;
			newJsonData["TopGoalLabel"] = this.GetPrefix(oldJsonData.contents.TopGoalId, oldJsonData.contents.NodeList) + String(oldJsonData.contents.TopGoalId);
			var n : number = oldJsonData.contents.NodeList.length;
			for(var i : number = 0; i < n; i++) {
				var NodeListData : any = {
					"Children": [],
					"Statement": "",
					"NodeType": 0,
					"Label": "",
					"Annotations": [],
					"Notes": []
				}
				newJsonData.NodeList.push(NodeListData);
				var newNodeListData : any = newJsonData.NodeList[i];
				var oldNodeListData : any = oldJsonData.contents.NodeList[i];
				this.ConvertOldNodeListtoNewNodeList(newNodeListData, oldNodeListData);
			}
			return newJsonData;
		}

		SetNewNodeMap(newJsonData : any) : void {
			var NodeList : any = newJsonData.NodeList
			var n : number = NodeList.length;
			for(var i : number = 0; i < n; i++) {
				this.NewNodeMap[NodeList[i].Label] = i+1;
			}
		}

		ConvertNewNodeTypetoOldNodeType(newNodeListData : any, oldNodeListData : any) : void {
			if(newNodeListData.Type == 0) {
				oldNodeListData.NodeType = "Goal";
			}
			else if(newNodeListData.Type == 1) {
				oldNodeListData.NodeType = "Context";
			}
			else if(newNodeListData.Type == 2) {
				oldNodeListData.NodeType = "Strategy";
			}
			else { //Evidence
				oldNodeListData.NodeType = "Evidence";
			}
		}

		ConvertNewNodeListtoOldNodeList(newNodeListData : any, oldNodeListData : any) : void {
			var n : number = newNodeListData.Children.length;
			for(var i : number = 0; i < n; i++) {
				oldNodeListData.Children.push(this.NewNodeMap[newNodeListData.Children[i]]);
			}
			this.ConvertNewNodeTypetoOldNodeType(newNodeListData, oldNodeListData);
			oldNodeListData.Description = newNodeListData.Statement;
			oldNodeListData.ThisNodeId = this.NewNodeMap[newNodeListData.Label];
			oldNodeListData.Contexts = newNodeListData.Annotation; //FIXME
			n = newNodeListData.Notes.length;
			for(var i : number = 0; i < n; i++) {
				var json : any = { 
					"Type" : ""
				};
				json.Type = newNodeListData.Notes[i].Name;
				var bodyKeys: string[] = Object.keys(newNodeListData.Notes[i].Body);
				for(var j: number = 0; j < bodyKeys.length; j++) {
					json[bodyKeys[j]] = newNodeListData.Notes[i].Body[bodyKeys[j]];
				}
				oldNodeListData.MetaData.push(json);
			}
		}

		GenOldJson (newJsonData : any) : any {
			this.SetNewNodeMap(newJsonData);
			var oldJsonData = {
				"NodeList": [],
				"TopGoalId":0,
				"NodeCount":0,
				"DCaseName":""
			}

			oldJsonData.DCaseName = newJsonData.DCaseName;
			oldJsonData.NodeCount = newJsonData.NodeCount;
			oldJsonData.TopGoalId = this.NewNodeMap[newJsonData.TopGoalLabel];
			var n : number = newJsonData.NodeList.length;
			for(var i : number = 0; i < n; i++) {
				var NodeListData : any = {
					"ThisNodeId": 0,
					"NodeType": "",
					"Description": "",
					"Children": [],
					"Contexts": [],
					"MetaData": []
				}
				oldJsonData.NodeList.push(NodeListData);
				var newNodeListData : any = newJsonData.NodeList[i];
				var oldNodeListData : any = oldJsonData.NodeList[i];
				this.ConvertNewNodeListtoOldNodeList(newNodeListData, oldNodeListData);
			}
			return oldJsonData;
		}
	}
}
