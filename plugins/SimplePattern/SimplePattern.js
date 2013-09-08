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
    function Pattern(caseModel) {
        this.caseModel = caseModel;
        this.Goal = AssureIt.NodeType.Goal;
        this.Context = AssureIt.NodeType.Context;
        this.Strategy = AssureIt.NodeType.Strategy;
        this.Evidence = AssureIt.NodeType.Evidence;
    }
    Pattern.prototype.Match = function () {
        return false;
    };

    Pattern.prototype.Success = function () {
    };

    Pattern.prototype.Note = function (key, callback) {
        var Notes = this.caseModel.Notes;
        if (!Notes)
            return;
        for (var keystring in Notes) {
            var value = Notes[keystring];
            if (keystring == key) {
                callback();
            }
        }
    };

    Pattern.prototype.Type = function (Type, callback) {
        if (this.caseModel.Type == Type) {
            callback();
        }
    };

    Pattern.prototype.ParentType = function (Type, callback) {
        var Parent = this.caseModel.Parent;
        if (Parent && Parent.Type == Type) {
            callback();
        }
    };
    return Pattern;
})();

var ListPattern = (function (_super) {
    __extends(ListPattern, _super);
    function ListPattern() {
        _super.apply(this, arguments);
    }
    ListPattern.prototype.Match = function () {
        var _this = this;
        this.Type(this.Context, function () {
            _this.Note("List", function () {
                _this.ParentType(_this.Goal, function () {
                });
            });
        });
        return false;
    };

    ListPattern.prototype.Success = function () {
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
    }
    SimplePatternInnerPlugIn.prototype.InitPattern = function (caseModel) {
        this.patternList = [];
        this.patternList.push(new ListPattern(caseModel));
    };

    SimplePatternInnerPlugIn.prototype.IsEnabled = function (caseViewer, caseModel) {
        this.caseViewer = caseViewer;
        return true;
    };

    SimplePatternInnerPlugIn.prototype.InvokePattern = function (caseModel, pattern) {
        var matched = false;
        if (pattern.Match()) {
            matched = true;
            pattern.Success();
        }
        return matched;
    };

    SimplePatternInnerPlugIn.prototype.Delegate = function (caseModel) {
        this.InitPattern(caseModel);
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
