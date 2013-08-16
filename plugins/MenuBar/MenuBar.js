var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var MenuBar = (function () {
    function MenuBar(caseViewer, case0, node, serverApi, plugIn, reDraw) {
        this.plugIn = plugIn;
        this.caseViewer = caseViewer;
        this.case0 = case0;
        this.node = node;
        this.serverApi = serverApi;
        this.reDraw = reDraw;
        this.Init();
    }
    MenuBar.prototype.Init = function () {
        var self = this;

        var thisNodeLabel = self.node.children('h4').text();
        var thisNodeModel = self.case0.ElementMap[thisNodeLabel];
        var thisNodeType = thisNodeModel.Type;

        $('#menu').remove();
        var menu = $('<div id="menu">' + '<a href="#" ><img id="commit" src="' + this.serverApi.basepath + 'images/commit.png" title="Commit" alt="commit" /></a>' + '<a href="#" ><img id="remove" src="' + this.serverApi.basepath + 'images/remove.png" title="Remove" alt="remove" /></a>' + '<a href="#" ><img id="scale"  src="' + this.serverApi.basepath + 'images/scale.png" title="Scale" alt="scale" /></a>' + '</div>');

        var hasContext = false;

        for (var i = 0; i < thisNodeModel.Children.length; i++) {
            if (thisNodeModel.Children[i].Type == AssureIt.NodeType.Context) {
                hasContext = true;
            }
        }
        switch (thisNodeType) {
            case AssureIt.NodeType.Goal:
                if (!hasContext) {
                    menu.append('<a href="#" ><img id="context"  src="' + this.serverApi.basepath + 'images/context.png" title="Context" alt="context" /></a>');
                }
                menu.append('<a href="#" ><img id="strategy" src="' + this.serverApi.basepath + 'images/strategy.png" title="Strategy" alt="strategy" /></a>');
                menu.append('<a href="#" ><img id="evidence" src="' + this.serverApi.basepath + 'images/evidence.png" title="Evidence" alt="evidence" /></a>');
                break;
            case AssureIt.NodeType.Strategy:
                menu.append('<a href="#" ><img id="goal"     src="' + this.serverApi.basepath + 'images/goal.png" title="Goal" alt="goal" /></a>');
                if (!hasContext) {
                    menu.append('<a href="#" ><img id="context"  src="' + this.serverApi.basepath + 'images/context.png" title="Context" alt="context" /></a>');
                }
                break;
            case AssureIt.NodeType.Evidence:
                if (!hasContext) {
                    menu.append('<a href="#" ><img id="context"  src="' + this.serverApi.basepath + 'images/context.png" title="Context" alt="context" /></a>');
                }
                break;
            default:
                break;
        }

        menu.css({ position: 'absolute', top: self.node.position().top + self.node.height() + 5, display: 'block', opacity: 0 });
        menu.hover(function () {
        }, function () {
            $(this).remove();
        });
        (menu).jqDock({
            align: 'bottom',
            fadeIn: 200,
            idle: 1500,
            size: 45,
            distance: 60,
            labels: 'tc',
            duration: 500,
            source: function () {
                return this.src.replace(/(jpg|gif)$/, 'png');
            },
            onReady: function () {
                menu.css({ left: self.node.position().left + (self.node.outerWidth() - menu.width()) / 2 });
            }
        });
        menu.appendTo($('#layer2'));
        this.plugIn.plugInManager.UseUILayer(this.plugIn);
    };

    MenuBar.prototype.AddNode = function (nodeType) {
        var thisNodeView = this.caseViewer.ViewMap[this.node.children("h4").text()];
        var newNodeModel = new AssureIt.NodeModel(this.case0, thisNodeView.Source, nodeType, null, null);
        this.case0.SaveIdCounterMax(this.case0.ElementTop);
        this.caseViewer.ViewMap[newNodeModel.Label] = new AssureIt.NodeView(this.caseViewer, newNodeModel);
        this.caseViewer.ViewMap[newNodeModel.Label].ParentShape = this.caseViewer.ViewMap[newNodeModel.Parent.Label];
        this.caseViewer.Resize();
        this.reDraw();
    };

    MenuBar.prototype.GetDescendantLabels = function (labels, children) {
        for (var i = 0; i < children.length; i++) {
            labels.push(children[i].Label);
            this.GetDescendantLabels(labels, children[i].Children);
        }
        return labels;
    };

    MenuBar.prototype.RemoveNode = function () {
        var thisLabel = this.node.children("h4").text();
        var thisNodeView = this.caseViewer.ViewMap[thisLabel];
        var thisNodeModel = thisNodeView.Source;
        var brotherNodeModels = thisNodeModel.Parent.Children;

        for (var i = 0; i < brotherNodeModels.length; i++) {
            if (brotherNodeModels[i].Label == thisLabel) {
                brotherNodeModels.splice(i, 1);
            }
        }

        var labels = [thisLabel];
        labels = this.GetDescendantLabels(labels, thisNodeModel.Children);

        for (var i = 0; i < labels.length; i++) {
            delete this.case0.ElementMap[labels[i]];
            var nodeView = this.caseViewer.ViewMap[labels[i]];
            nodeView.DeleteHTMLElementRecursive(null, null);
            delete this.caseViewer.ViewMap[labels[i]];
        }

        this.caseViewer.Resize();
        this.reDraw();
    };

    MenuBar.prototype.Commit = function () {
        ($('#modal')).dialog('open');
    };

    MenuBar.prototype.Scale = function () {
        var $svg = $('#layer0');
        var $layer1 = $('#layer1');
        var scale = 1.0;
        var top = Number($layer1.css('top').replace("px", ""));
        var left = Number($layer1.css('left').replace("px", ""));
        var offset = 10;
        if (this.plugIn.isLargeScale) {
            this.plugIn.isLargeScale = false;
            top = top - offset * (0.1 / 1.0);
            left = left - offset * (0.1 / 1.0);
        } else {
            scale = 0.1;
            top = top - offset * (1.0 / 0.1);
            left = left - offset * (1.0 / 0.1);
            this.plugIn.isLargeScale = true;
        }
        console.log(top + ":" + left);
        $svg.attr("transform", "scale(" + scale + ")");
        $layer1.css("transform", "scale(" + scale + ")");
        $layer1.css("-moz-transform", "scale(" + scale + ")");
        $layer1.css("-webkit-transform", "scale(" + scale + ")");
        $layer1.css({ top: 0 + "px", left: 0 + "px" });
        this.reDraw();
    };

    MenuBar.prototype.SetEventHandlers = function () {
        var _this = this;
        $('#goal').click(function () {
            _this.AddNode(AssureIt.NodeType.Goal);
        });

        $('#context').click(function () {
            _this.AddNode(AssureIt.NodeType.Context);
        });

        $('#strategy').click(function () {
            _this.AddNode(AssureIt.NodeType.Strategy);
        });

        $('#evidence').click(function () {
            _this.AddNode(AssureIt.NodeType.Evidence);
        });

        $('#remove').click(function () {
            _this.RemoveNode();
        });

        $('#commit').click(function () {
            _this.Commit();
        });

        $('#scale').click(function () {
            _this.Scale();
        });
    };
    return MenuBar;
})();

var CommitWindow = (function () {
    function CommitWindow() {
        this.defaultMessage = "Type your commit message...";
        this.Init();
    }
    CommitWindow.prototype.Init = function () {
        $('#modal').remove();
        var modal = $('<div id="modal" title="Commit Message" />');
        (modal).dialog({
            autoOpen: false,
            modal: true,
            resizable: false,
            draggable: false,
            show: "clip",
            hide: "fade"
        });

        var messageBox = $('<p align="center"><input id="message_box" type="text" size="30" value="' + this.defaultMessage + '" /></p>');
        messageBox.css('color', 'gray');

        var commitButton = $('<p align="right"><input id="commit_button" type="button" value="commit"/></p>');
        modal.append(messageBox);
        modal.append(commitButton);
        modal.appendTo($('layer2'));
    };

    CommitWindow.prototype.SetEventHandlers = function (caseViewer, case0, serverApi) {
        var self = this;

        $('#message_box').focus(function () {
            if ($(this).val() == self.defaultMessage) {
                $(this).val("");
                $(this).css('color', 'black');
            }
        });

        $('#message_box').blur(function () {
            if ($(this).val() == "") {
                $(this).val(self.defaultMessage);
                $(this).css('color', 'gray');
            }
        });

        $('#commit_button').click(function () {
            var encoder = new AssureIt.CaseEncoderDeprecated();
            var converter = new AssureIt.Converter();
            var contents = converter.GenOldJson(encoder.ConvertToOldJson(case0));
            serverApi.Commit(contents, $(this).val, case0.CommitId);
            window.location.reload();
        });
    };
    return CommitWindow;
})();

var MenuBarPlugIn = (function (_super) {
    __extends(MenuBarPlugIn, _super);
    function MenuBarPlugIn(plugInManager) {
        _super.call(this, plugInManager);
        this.ActionPlugIn = new MenuBarActionPlugIn(plugInManager);
    }
    return MenuBarPlugIn;
})(AssureIt.PlugIn);

var MenuBarActionPlugIn = (function (_super) {
    __extends(MenuBarActionPlugIn, _super);
    function MenuBarActionPlugIn(plugInManager) {
        _super.call(this, plugInManager);
        this.isLargeScale = false;
    }
    MenuBarActionPlugIn.prototype.IsEnabled = function (caseViewer, case0) {
        return true;
    };

    MenuBarActionPlugIn.prototype.Delegate = function (caseViewer, case0, serverApi) {
        var self = this;

        $('.node').unbind('mouseenter').unbind('mouseleave');
        $('.node').hover(function () {
            var node = $(this);

            self.timeoutId = setTimeout(function () {
                var menuBar = new MenuBar(caseViewer, case0, node, serverApi, self, function () {
                    caseViewer.ReDraw();
                });
                menuBar.SetEventHandlers();

                var commitWindow = new CommitWindow();
                commitWindow.SetEventHandlers(caseViewer, case0, serverApi);
            }, 1000);
        }, function () {
            clearTimeout(self.timeoutId);
        });
        return true;
    };

    MenuBarActionPlugIn.prototype.DeleteFromDOM = function () {
        $('#menu').remove();
        console.log(this.timeoutId);
        clearTimeout(this.timeoutId);
    };
    return MenuBarActionPlugIn;
})(AssureIt.ActionPlugIn);
