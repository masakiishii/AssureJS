var AssureIt;
(function (AssureIt) {
    var Converter = (function () {
        function Converter() {
            this.NodeMap = {};
        }
        Converter.prototype.ConvertOldNodeTypetoNewNodeType = function (newNodeListData, oldNodeListData) {
            if (oldNodeListData.NodeType == "Goal") {
                newNodeListData.NodeType = 0;
            } else if (oldNodeListData.NodeType == "Context") {
                newNodeListData.NodeType = 1;
            } else if (oldNodeListData.NodeType == "Strategy") {
                newNodeListData.NodeType = 2;
            } else {
                newNodeListData.NodeType = 3;
            }
        };

        Converter.prototype.ConvertOldNodeListtoNewNodeList = function (newNodeListData, oldNodeListData) {
            var n = oldNodeListData.Children.length;
            for (var i = 0; i < n; i++) {
                newNodeListData.Children.push(String(oldNodeListData.Children[i]));
            }
            this.ConvertOldNodeTypetoNewNodeType(newNodeListData, oldNodeListData);
            newNodeListData.Statement = oldNodeListData.Description;
            newNodeListData.Label = String(oldNodeListData.ThisNodeId);
            newNodeListData.Annotation = oldNodeListData.Contexts;
            n = oldNodeListData.MetaData.length;
            for (var i = 0; i < n; i++) {
                var json = {
                    "Name": "",
                    "Body": {}
                };
                json.Name = oldNodeListData.MetaData[i].Type;
                json.Body = oldNodeListData.MetaData[i];
                console.log(oldNodeListData.MetaData[i].Type);
                newNodeListData.Notes.push(json);
            }
        };

        Converter.prototype.GenNewJson = function (oldJsonData) {
            oldJsonData.contents = JSON.parse(oldJsonData.contents);
            var newJsonData = {
                "DCaseName": "",
                "NodeCount": 0,
                "TopGoalLabel": "",
                "NodeList": []
            };

            newJsonData["DCaseName"] = oldJsonData.contents.DCaseName;
            newJsonData["NodeCount"] = oldJsonData.contents.NodeCount;
            newJsonData["TopGoalLabel"] = String(oldJsonData.contents.TopGoalId);
            var n = oldJsonData.contents.NodeList.length;
            for (var i = 0; i < n; i++) {
                var NodeListData = {
                    "Children": [],
                    "Statement": "",
                    "NodeType": 0,
                    "Label": "",
                    "Annotations": [],
                    "Notes": []
                };
                newJsonData.NodeList.push(NodeListData);
                var newNodeListData = newJsonData.NodeList[i];
                var oldNodeListData = oldJsonData.contents.NodeList[i];
                this.ConvertOldNodeListtoNewNodeList(newNodeListData, oldNodeListData);
            }
            console.log(newJsonData.NodeList);
            return newJsonData;
        };

        Converter.prototype.SetNodeMap = function (newJsonData) {
            var NodeList = newJsonData.NodeList;
            var n = NodeList.length;
            for (var i = 0; i < n; i++) {
                this.NodeMap[NodeList[i].Label] = i + 1;
            }
        };

        Converter.prototype.ConvertNewNodeTypetoOldNodeType = function (newNodeListData, oldNodeListData) {
            if (newNodeListData.Type == 0) {
                oldNodeListData.NodeType = "Goal";
            } else if (newNodeListData.Type == 1) {
                oldNodeListData.NodeType = "Context";
            } else if (newNodeListData.Type == 2) {
                oldNodeListData.NodeType = "Strategy";
            } else {
                oldNodeListData.NodeType = "Evidence";
            }
        };

        Converter.prototype.ConvertNewNodeListtoOldNodeList = function (newNodeListData, oldNodeListData) {
            var n = newNodeListData.Children.length;
            for (var i = 0; i < n; i++) {
                oldNodeListData.Children.push(this.NodeMap[newNodeListData.Children[i]]);
            }
            this.ConvertNewNodeTypetoOldNodeType(newNodeListData, oldNodeListData);
            oldNodeListData.Description = newNodeListData.Statement;
            oldNodeListData.ThisNodeId = this.NodeMap[newNodeListData.Label];
            oldNodeListData.Contexts = newNodeListData.Annotation;
            n = newNodeListData.Notes.length;
            for (var i = 0; i < n; i++) {
                oldNodeListData.MetaData.push(newNodeListData.Notes[i].Body);
            }
        };

        Converter.prototype.GenOldJson = function (newJsonData) {
            this.SetNodeMap(newJsonData);
            var oldJsonData = {
                "NodeList": [],
                "TopGoalId": 0,
                "NodeCount": 0,
                "DCaseName": ""
            };

            oldJsonData.DCaseName = newJsonData.DCaseName;
            oldJsonData.NodeCount = newJsonData.NodeCount;
            oldJsonData.TopGoalId = this.NodeMap[newJsonData.TopGoalLabel];
            var n = newJsonData.NodeList.length;
            for (var i = 0; i < n; i++) {
                var NodeListData = {
                    "ThisNodeId": 0,
                    "NodeType": "",
                    "Description": "",
                    "Children": [],
                    "Contexts": [],
                    "MetaData": []
                };
                oldJsonData.NodeList.push(NodeListData);
                var newNodeListData = newJsonData.NodeList[i];
                var oldNodeListData = oldJsonData.NodeList[i];
                this.ConvertNewNodeListtoOldNodeList(newNodeListData, oldNodeListData);
            }
            console.log(oldJsonData);
            return oldJsonData;
        };
        return Converter;
    })();
    AssureIt.Converter = Converter;
})(AssureIt || (AssureIt = {}));
