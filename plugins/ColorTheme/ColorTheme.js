var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ColorThemePlugIn = (function (_super) {
    __extends(ColorThemePlugIn, _super);
    function ColorThemePlugIn() {
        _super.call(this);
        this.stroke = {
            "Goal": "none",
            "Strategy": "none",
            "Context": "none",
            "Evidence": "none"
        };
    }
    ColorThemePlugIn.prototype.IsEnable = function (caseViewer, element) {
        return true;
    };

    ColorThemePlugIn.prototype.Delegate = function (caseViewer, nodeView) {
        var thisNodeType = nodeView.Source.Type;

        switch (thisNodeType) {
            case AssureIt.NodeType.Goal:
                nodeView.SVGShape.SetColor(this.fill.Goal, this.stroke.Goal);
                break;
            case AssureIt.NodeType.Strategy:
                nodeView.SVGShape.SetColor(this.fill.Strategy, this.stroke.Strategy);
                break;
            case AssureIt.NodeType.Context:
                nodeView.SVGShape.SetColor(this.fill.Context, this.stroke.Context);
                break;
            case AssureIt.NodeType.Evidence:
                nodeView.SVGShape.SetColor(this.fill.Evidence, this.stroke.Evidence);
                break;
            default:
                break;
        }

        return true;
    };
    return ColorThemePlugIn;
})(AssureIt.SVGRenderPlugIn);

var DefaultColorThemePlugIn = (function (_super) {
    __extends(DefaultColorThemePlugIn, _super);
    function DefaultColorThemePlugIn() {
        _super.call(this);
        this.fill = {
            "Goal": "#E0E0E0",
            "Strategy": "#C0C0C0",
            "Context": "#B0B0B0",
            "Evidence": "#D0D0D0"
        };
    }
    return DefaultColorThemePlugIn;
})(ColorThemePlugIn);

var TiffanyBlueThemePlugIn = (function (_super) {
    __extends(TiffanyBlueThemePlugIn, _super);
    function TiffanyBlueThemePlugIn() {
        _super.call(this);
        this.fill = {
            "Goal": "#b4d8df",
            "Strategy": "#b4d8df",
            "Context": "#dbf5f3",
            "Evidence": "#dbf5f3"
        };
    }
    return TiffanyBlueThemePlugIn;
})(ColorThemePlugIn);

var SimpleColorThemePlugIn = (function (_super) {
    __extends(SimpleColorThemePlugIn, _super);
    function SimpleColorThemePlugIn() {
        _super.call(this);
        this.stroke = {
            "Goal": "#000000",
            "Strategy": "#000000",
            "Context": "#000000",
            "Evidence": "#000000"
        };
        this.fill = {
            "Goal": "#ffffff",
            "Strategy": "#ffffff",
            "Context": "#ffffff",
            "Evidence": "#ffffff"
        };
    }
    return SimpleColorThemePlugIn;
})(ColorThemePlugIn);
