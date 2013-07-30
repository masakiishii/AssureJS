var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var MonitorPlugin = (function (_super) {
    __extends(MonitorPlugin, _super);
    function MonitorPlugin() {
        _super.apply(this, arguments);
    }
    MonitorPlugin.prototype.IsEnabled = function (caseViewer, caseModel) {
        return true;
    };

    MonitorPlugin.prototype.Delegate = function (caseViewer, caseModel, element) {
        var notes = caseModel.Notes;
        var found = false;
        for (var i in notes) {
            if (notes[i].Name == "Monitor")
                found = true;
        }
        if (!found)
            return;

        var text = "";
        var p = element.position();

        for (var i = 0; i < caseModel.Annotations.length; i++) {
            text += "@" + caseModel.Annotations[i].Name + "<br>";
        }
        $.ajax({
            url: "http://live.assure-it.org/rec/api/1.0/",
            type: "POST",
            async: false,
            data: {
                jsonrpc: "2.0",
                method: "getMonitor",
                params: {
                    nodeID: "55"
                }
            },
            success: function (msg) {
                element.attr('data-monitor', msg.result[0]);
            },
            error: function (msg) {
                console.log("error");
            }
        });
    };
    return MonitorPlugin;
})(RenderPlugIn);
