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
        this.SVGRenderPlugIn = new MonitorSVGRenderPlugIn(plugInManager);
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
        var found = false;
        for (var i = 0; i < notes.length; ++i) {
            if (notes[i].Name == "Monitor") {
                found = true;
            }
        }
        if (!found) {
            return;
        }

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

        return true;
    };
    return MonitorHTMLRenderPlugIn;
})(AssureIt.HTMLRenderPlugIn);

var MonitorSVGRenderPlugIn = (function (_super) {
    __extends(MonitorSVGRenderPlugIn, _super);
    function MonitorSVGRenderPlugIn() {
        _super.apply(this, arguments);
    }
    MonitorSVGRenderPlugIn.prototype.IsEnable = function (caseViewer, element) {
        return true;
    };

    MonitorSVGRenderPlugIn.prototype.Delegate = function (caseViewer, nodeView) {
        var element = nodeView.HTMLDoc.DocBase;
        if (element.data('monitor')) {
            nodeView.SVGShape.SetColor("red", "black");
        }
        return true;
    };
    return MonitorSVGRenderPlugIn;
})(AssureIt.SVGRenderPlugIn);
