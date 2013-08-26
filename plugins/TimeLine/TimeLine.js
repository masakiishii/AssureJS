var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TimeLine = (function () {
    function TimeLine(caseViewer, nodeModel, element, serverApi) {
        this.caseViewer = caseViewer;
        this.nodeModel = nodeModel;
        this.element = element;
        this.serverApi = serverApi;
    }
    TimeLine.prototype.CreateDOM = function () {
        this.root = $(this.caseViewer.Screen.ControlLayer);

        this.container = $("<div></div>").css({
            position: "absolute",
            left: 0,
            top: 0
        }).addClass("timeline-container").appendTo(this.root);
        this.timeline = $("<div></div>").addClass("timeline").text("hogehogehoge").appendTo(this.container);
        this.canvas = $("<canvas></canvas>").css("position", "absolute").appendTo(this.timeline);
    };

    TimeLine.prototype.Enable = function () {
        this.CreateDOM();

        var commitCollection = this.serverApi.GetCommitList(this.nodeModel.Case.CaseId);
        commitCollection.forEach(function (i, v) {
            console.log(v);
        });
    };

    TimeLine.prototype.Disable = function () {
        $(".timeline-container").remove();
    };
    return TimeLine;
})();

var TimeLinePlugIn = (function (_super) {
    __extends(TimeLinePlugIn, _super);
    function TimeLinePlugIn(plugInManager) {
        _super.call(this, plugInManager);
        this.MenuBarContentsPlugIn = new TimeLineMenuPlugIn(plugInManager);
    }
    return TimeLinePlugIn;
})(AssureIt.PlugInSet);

var TimeLineMenuPlugIn = (function (_super) {
    __extends(TimeLineMenuPlugIn, _super);
    function TimeLineMenuPlugIn(plugInManager) {
        _super.call(this, plugInManager);
        this.visible = true;
    }
    TimeLineMenuPlugIn.prototype.IsEnabled = function (caseViewer, caseModel) {
        return true;
    };

    TimeLineMenuPlugIn.prototype.Delegate = function (caseViewer, caseModel, element, serverApi) {
        var _this = this;
        element.append('<a href="#" ><img id="timeline" src="' + serverApi.basepath + 'images/icon.png" title="TimeLine" alt="timeline" /></a>');
        $('#timeline').unbind('click');
        $('#timeline').click(function (ev) {
            var timeline = new TimeLine(caseViewer, caseModel, element, serverApi);
            if (_this.visible) {
                timeline.Enable();
                _this.visible = false;
            } else {
                timeline.Disable();
                _this.visible = true;
            }
        });
        return true;
    };
    return TimeLineMenuPlugIn;
})(AssureIt.MenuBarContentsPlugIn);
