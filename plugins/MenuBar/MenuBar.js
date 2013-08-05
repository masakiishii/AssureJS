var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
function AddNode(caseViewer, case0, element, nodeType) {
    var thisNodeView = caseViewer.ViewMap[element.children("h4").text()];
    var newNodeModel = new AssureIt.NodeModel(case0, thisNodeView.Source, nodeType, null, null);
    case0.SaveIdCounterMax(case0.ElementTop);
    caseViewer.ViewMap[newNodeModel.Label] = new AssureIt.NodeView(caseViewer, newNodeModel);
    caseViewer.ViewMap[newNodeModel.Label].ParentShape = caseViewer.ViewMap[newNodeModel.Parent.Label];
    caseViewer.Resize();

    var backgroundlayer = document.getElementById("background");
    var shapelayer = document.getElementById("layer0");
    var contentlayer = document.getElementById("layer1");
    var controllayer = document.getElementById("layer2");

    var Screen = new AssureIt.ScreenManager(shapelayer, contentlayer, controllayer, backgroundlayer);
    caseViewer.Draw(Screen);
}

var MenuBarPlugIn = (function (_super) {
    __extends(MenuBarPlugIn, _super);
    function MenuBarPlugIn() {
        _super.apply(this, arguments);
    }
    MenuBarPlugIn.prototype.IsEnabled = function (caseViewer, case0) {
        return true;
    };

    MenuBarPlugIn.prototype.Delegate = function (caseViewer, case0, serverApi) {
        if (MenuBarPlugIn.DelegateInvoked)
            return;
        $('.node').hover(function () {
            var node = $(this);
            $('#menu').remove();
            var p = node.position();
            var j = $('<div id="menu">' + '<a href="#" ><img id="goal" src="images/icon.png" title="Goal" alt="goal" /></a>' + '<a href="#" ><img id="context" src="images/icon.png" title="Context" alt="context" /></a>' + '<a href="#" ><img id="strategy" src="images/icon.png" title="Strategy" alt="strategy" /></a>' + '<a href="#" ><img id="evidence" src="images/icon.png" title="Evidence" alt="evidence" /></a></div>');

            j.appendTo($('#layer2'));
            j.css({ position: 'absolute', top: p.top + 75, display: 'none', opacity: 0 });

            $('#goal').click(function () {
                AddNode(caseViewer, case0, node, AssureIt.NodeType.Goal);
            });

            $('#context').click(function () {
                AddNode(caseViewer, case0, node, AssureIt.NodeType.Context);
            });

            $('#strategy').click(function () {
                AddNode(caseViewer, case0, node, AssureIt.NodeType.Strategy);
            });

            $('#evidence').click(function () {
                AddNode(caseViewer, case0, node, AssureIt.NodeType.Evidence);
            });

            ($('#menu')).jqDock({
                align: 'bottom',
                fadeIn: 200,
                idle: 1500,
                size: 48,
                distance: 60,
                labels: 'tc',
                duration: 500,
                source: function () {
                    return this.src.replace(/(jpg|gif)$/, 'png');
                },
                onReady: function () {
                    $('#menu').css({ left: node.position().left + (node.outerWidth() - $('#menu').width()) / 2 });
                }
            });
            $('#menu').css({ display: 'block' }).hover(function () {
            }, function () {
                $(this).remove();
            });
        }, function () {
        });
        MenuBarPlugIn.DelegateInvoked = true;
        return true;
    };
    MenuBarPlugIn.DelegateInvoked = false;
    return MenuBarPlugIn;
})(AssureIt.ActionPlugIn);
