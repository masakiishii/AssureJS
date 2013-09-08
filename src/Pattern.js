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
                return callback(Notes[key]);
            }
        }
        return false;
    };

    Pattern.prototype.Type = function (Type, callback) {
        if (this.caseModel.Type == Type) {
            return callback();
        }
        return false;
    };

    Pattern.prototype.ParentType = function (Type, callback) {
        var Parent = this.caseModel.Parent;
        if (Parent && Parent.Type == Type) {
            return callback(Parent);
        }
        return false;
    };
    return Pattern;
})();
