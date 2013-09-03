var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var MonitorPlugIn = (function (_super) {
    __extends(MonitorPlugIn, _super);
    function MonitorPlugIn(plugInManager) {
        _super.call(this, plugInManager);
        this.plugInManager = plugInManager;
        this.HTMLRenderPlugIn = new MonitorHTMLRenderPlugIn(plugInManager);
    }
    return MonitorPlugIn;
})(AssureIt.PlugInSet);

var MonitorHTMLRenderPlugIn = (function (_super) {
    __extends(MonitorHTMLRenderPlugIn, _super);
    function MonitorHTMLRenderPlugIn() {
        _super.apply(this, arguments);
    }
    MonitorHTMLRenderPlugIn.prototype.IsEnabled = function (caseViewer, caseModel) {
        return true;
    };

    MonitorHTMLRenderPlugIn.prototype.Delegate = function (caseViewer, caseModel, element) {
        var notes = caseModel.Notes;
        var locations = [];
        var conditions = [];

        for (var i = 0; i < notes.length; i++) {
            var body = notes[i].Body;

            if ("Location" in body && "Monitor" in body) {
                locations.push(notes[i].Body.Location);
                conditions.push(notes[i].Body.Monitor);
            }
        }

        function extractVariableFromCondition(condtion) {
            var text = condition;
            text.replace(/<=/g, " ");
            text.replace(/>=/g, " ");
            text.replace(/</g, " ");
            text.replace(/>/g, " ");

            var words = text.split(" ");
            var variables = [];

            for (var i = 0; i < words.length; i++) {
                if (!$.isNumeric(words[i])) {
                    variables.push(words[i]);
                }
            }

            if (variables.length != 1) {
            }

            return variables[0];
        }

        var api = new AssureIt.RECAPI("http://54.250.206.119/rec");

        for (var i = 0; i < locations.length; i++) {
            var location = locations[i];

            for (var j = 0; i < conditions.length; i++) {
                var condition = conditions[j];
                var variable = extractVariableFromCondition(condition);

                var response = api.getLatestData(location, variable);
                var script = "var " + variable + "=" + response.data + ";";
                script += condition + ";";
                var result = eval(script);
                console.log(result);
                console.log(caseModel);
            }
        }

        return true;
    };
    return MonitorHTMLRenderPlugIn;
})(AssureIt.HTMLRenderPlugIn);
