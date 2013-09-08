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

var ListPattern = (function (_super) {
    __extends(ListPattern, _super);
    function ListPattern() {
        _super.apply(this, arguments);
    }
    ListPattern.prototype.Match = function (model) {
        var _this = this;
        return this.Type(model, this.Context, function () {
            return _this.Note(model, "List", function (value) {
                _this.ListItem = value.split(",");
                for (var i in _this.ListItem) {
                    _this.ListItem[i] = _this.ListItem[i].replace(/[ ]$/g, "");
                }
                return _this.ParentType(model, _this.Goal, function (parentModel) {
                    return parentModel.Children.length == 1;
                });
            });
        });
    };

    ListPattern.prototype.Success = function (model) {
        console.log("List");
        console.log(this.ListItem);
    };
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
        this.InitPattern();
    }
    SimplePatternInnerPlugIn.prototype.InitPattern = function () {
        this.patternList = [];
        this.patternList.push(new ListPattern());
    };

    SimplePatternInnerPlugIn.prototype.IsEnabled = function (caseViewer, caseModel) {
        this.caseViewer = caseViewer;
        return true;
    };

    SimplePatternInnerPlugIn.prototype.InvokePattern = function (model, pattern) {
        var matched = false;
        if (pattern.Match(model)) {
            matched = true;
            pattern.Success(model);
        }
        return matched;
    };

    SimplePatternInnerPlugIn.prototype.Delegate = function (caseModel) {
        var matched = false;
        for (var i in this.patternList) {
            if (this.InvokePattern(caseModel, this.patternList[i])) {
                matched = true;
            }
        }
        if (matched) {
            this.ActionPlugIn.caseViewer.Draw();
        }
        return true;
    };
    return SimplePatternInnerPlugIn;
})(AssureIt.PatternPlugIn);
