var DScriptGenerator = (function () {
    function DScriptGenerator(model) {
        this.model = model;
        this.indentToken = "\t";
    }
    DScriptGenerator.prototype.getMethodName = function (model) {
        return model.Label;
    };

    DScriptGenerator.prototype.goal = function (model) {
        var res = "";
        res = "int " + this.getMethodName(model) + "(Context c) {\n";
        res += this.indentToken + "return 1;\n";
        res += "}\n\n";
        return res;
    };

    DScriptGenerator.prototype.context = function (model) {
        var res = "";

        return res;
    };

    DScriptGenerator.prototype.strategy = function (model) {
        var res = "";

        return res;
    };

    DScriptGenerator.prototype.evidence = function (model) {
        var res = "";

        return res;
    };

    DScriptGenerator.prototype.codegen_ = function (model) {
        var res = "";
        switch (model.Type) {
            case AssureIt.NodeType.Goal:
                res += this.goal(model);
                break;
            case AssureIt.NodeType.Context:
                res += this.context(model);
                break;
            case AssureIt.NodeType.Strategy:
                res += this.strategy(model);
                break;
            case AssureIt.NodeType.Evidence:
                res += this.evidence(model);
                break;
            default:
                console.log("There's something wrong with NodeModel.");
        }
        for (var i in model.Children) {
            res += this.codegen_(model.Children[i]);
        }
        return res;
    };

    DScriptGenerator.prototype.codegen = function () {
        console.log("codegen");
        return this.codegen_(this.model);
    };
    return DScriptGenerator;
})();
