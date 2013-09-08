var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var SimplePatternPlugIn = (function (_super) {
    __extends(SimplePatternPlugIn, _super);
    function SimplePatternPlugIn(plugInManager) {
        _super.call(this, plugInManager);
        this.plugInManager = plugInManager;
        var PlugIn = new SimplePatternActionPlugIn(plugInManager);
        this.ActionPlugIn = PlugIn;
        this.PatternPlugIn = new SimplePatternInnerPlugIn(plugInManager, PlugIn);
    }
    return SimplePatternPlugIn;
})(AssureIt.PlugInSet);

var Pattern = (function () {
    function Pattern() {
    }
    Pattern.prototype.match = function (caseModel) {
        return true;
    };

    Pattern.prototype.success = function () {
    };
    return Pattern;
})();

var ListPattern = (function (_super) {
    __extends(ListPattern, _super);
    function ListPattern() {
        _super.apply(this, arguments);
    }
    return ListPattern;
})(Pattern);

var SimplePatternActionPlugIn = (function (_super) {
    __extends(SimplePatternActionPlugIn, _super);
    function SimplePatternActionPlugIn(plugInManager) {
        _super.call(this, plugInManager);
    }
    SimplePatternActionPlugIn.prototype.IsEnabled = function (caseViewer, case0) {
        return true;
    };

    SimplePatternActionPlugIn.prototype.Delegate = function (caseViewer, case0, serverApi) {
        this.caseViewer = caseViewer;
        return true;
    };
    return SimplePatternActionPlugIn;
})(AssureIt.ActionPlugIn);

var SimplePatternInnerPlugIn = (function (_super) {
    __extends(SimplePatternInnerPlugIn, _super);
    function SimplePatternInnerPlugIn(plugInManager, ActionPlugIn) {
        _super.call(this, plugInManager);
        this.ActionPlugIn = ActionPlugIn;
        this.caseViewer = null;
        this.caseModel = null;
        this.patternList = [];
        this.patternList.push(new Pattern());
    }
    SimplePatternInnerPlugIn.prototype.IsEnabled = function (caseViewer, caseModel) {
        this.caseViewer = caseViewer;
        return true;
    };

    SimplePatternInnerPlugIn.prototype.InvokePattern = function (pattern) {
        if (pattern.match(this.caseModel)) {
            pattern.success();
            this.ActionPlugIn.caseViewer.Draw();
        }
    };

    SimplePatternInnerPlugIn.prototype.Delegate = function (caseModel) {
        for (var i in this.patternList) {
            this.InvokePattern(this.patternList[i]);
        }
        return true;
    };
    return SimplePatternInnerPlugIn;
})(AssureIt.PatternPlugIn);
