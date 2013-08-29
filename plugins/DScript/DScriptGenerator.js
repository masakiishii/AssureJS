/// <reference path="../../src/Casemodel.ts" />
/// <reference path="../../src/PlugInManager.ts" />
var DScriptGenerator = (function () {
    function DScriptGenerator() {
        this.indent = "\t";
        this.linefeed = "\n";
    }
    DScriptGenerator.prototype.getMethodName = function (model) {
        return model.Label;
    };

    DScriptGenerator.prototype.Generate = function (model, Flow) {
        switch (model.Type) {
            case AssureIt.NodeType.Goal:
                return this.GenerateGoal(model, Flow);
            case AssureIt.NodeType.Context:
                return this.GenerateContext(model, Flow);
            case AssureIt.NodeType.Strategy:
                return this.GenerateStrategy(model, Flow);
            case AssureIt.NodeType.Evidence:
                return this.GenerateEvidence(model, Flow);
        }
        return this.GenerateDefault(model, Flow);
    };

    DScriptGenerator.prototype.GenerateFunctionHeader = function (model) {
        return "boolean " + model.Label + "()";
    };

    DScriptGenerator.prototype.GenerateDefault = function (model, Flow) {
        var program = "";
        program += this.GenerateFunctionHeader(model) + " {" + this.linefeed;
        var statement = model.Statement.replace(/\n+$/g, '').trim();
        if (statement.length > 0) {
            var description = statement.split(this.linefeed);
            program += this.indent + "/*" + this.linefeed;
            for (var i = 0; i < description.length; ++i) {
                program += this.indent + this.indent + description[i] + this.linefeed;
            }
            program += this.indent + " */" + this.linefeed;
        }
        var child = Flow[model.Label];
        program += this.indent + "return ";
        if (child.length > 0) {
            for (var i = 0; i < child.length; ++i) {
                var node = child[i];
                if (i != 0) {
                    program += " && ";
                }
                program += node.Label + "()";
            }
        } else {
            program += "true";
        }
        program += ";" + this.linefeed;
        program += "}";
        return program;
    };

    DScriptGenerator.prototype.GenerateGoal = function (model, Flow) {
        return this.GenerateDefault(model, Flow);
    };

    DScriptGenerator.prototype.GenerateContext = function (model, Flow) {
        return this.GenerateDefault(model, Flow);
    };

    DScriptGenerator.prototype.GenerateStrategy = function (model, Flow) {
        return this.GenerateDefault(model, Flow);
    };

    DScriptGenerator.prototype.GenerateEvidence = function (model, Flow) {
        return this.GenerateDefault(model, Flow);
    };

    DScriptGenerator.prototype.GenerateCode = function (rootNode, Flow) {
        var queue = [];
        var program = [];
        var flow = "";
        queue.push(rootNode);
        while (queue.length != 0) {
            var node = queue.pop();
            var child = Flow[node.Label];
            program.push(this.Generate(node, Flow));
            Flow[node.Label] = [];
            flow += "// " + node.Label + " =>";
            for (var i = 0; i < child.length; ++i) {
                queue.push(child[i]);
                if (i != 0) {
                    flow += ",";
                }
                flow += " " + child[i].Label;
            }
            flow += this.linefeed;
        }
        return flow + this.linefeed + program.reverse().join(this.linefeed);
    };

    DScriptGenerator.prototype.CreateControlFlow = function (rootmodel) {
        var queue = [];
        var map = {};
        queue.push(rootmodel);
        while (queue.length != 0) {
            var model = queue.pop();
            var childList = [];
            for (var i = 0; i < model.Children.length; ++i) {
                queue.push(model.Children[i]);
                childList.push(model.Children[i]);
            }
            map[model.Label] = childList;
        }
        return map;
    };

    DScriptGenerator.prototype.codegen_ = function (model) {
        var res = "";
        var flow = this.CreateControlFlow(model);

        res += this.GenerateCode(model, flow) + this.linefeed;
        res += "@Export int main() {" + this.linefeed;
        res += this.indent + "if(" + model.Label + "()) { return 0; }" + this.linefeed;
        res += this.indent + "return 1;" + this.linefeed;
        res += "}" + this.linefeed;
        return res;
    };

    DScriptGenerator.prototype.codegen = function (model) {
        return this.codegen_(model);
    };
    return DScriptGenerator;
})();
