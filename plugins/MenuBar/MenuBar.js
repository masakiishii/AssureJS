var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var MenuBar = (function () {
    function MenuBar(caseViewer, model, case0, node, serverApi, plugIn) {
        this.plugIn = plugIn;
        this.caseViewer = caseViewer;
        this.model = model;
        this.case0 = case0;
        this.node = node;
        this.serverApi = serverApi;
        this.Init();
    }
    MenuBar.prototype.Init = function () {
        var thisNodeType = this.model.Type;

        $('#menu').remove();
        this.menu = $('<div id="menu">' + '<a href="#" ><img id="scale"  src="' + this.serverApi.basepath + 'images/scale.png" title="Scale" alt="scale" /></a>' + '</div>');

        if (this.case0.IsEditable()) {
            this.menu.append('<a href="#" ><img id="commit" src="' + this.serverApi.basepath + 'images/commit.png" title="Commit" alt="commit" /></a>');
            if (this.node.children("h4").text() != this.case0.ElementTop.Label) {
                this.menu.append('<a href="#" ><img id="remove" src="' + this.serverApi.basepath + 'images/remove.png" title="Remove" alt="remove" /></a>');
            }
            var hasContext = false;

            for (var i = 0; i < this.model.Children.length; i++) {
                if (this.model.Children[i].Type == AssureIt.NodeType.Context) {
                    hasContext = true;
                }
            }
            switch (thisNodeType) {
                case AssureIt.NodeType.Goal:
                    if (!hasContext) {
                        this.menu.append('<a href="#" ><img id="context"  src="' + this.serverApi.basepath + 'images/context.png" title="Context" alt="context" /></a>');
                    }
                    this.menu.append('<a href="#" ><img id="strategy" src="' + this.serverApi.basepath + 'images/strategy.png" title="Strategy" alt="strategy" /></a>');
                    this.menu.append('<a href="#" ><img id="evidence" src="' + this.serverApi.basepath + 'images/evidence.png" title="Evidence" alt="evidence" /></a>');
                    break;
                case AssureIt.NodeType.Strategy:
                    this.menu.append('<a href="#" ><img id="goal"     src="' + this.serverApi.basepath + 'images/goal.png" title="Goal" alt="goal" /></a>');
                    if (!hasContext) {
                        this.menu.append('<a href="#" ><img id="context"  src="' + this.serverApi.basepath + 'images/context.png" title="Context" alt="context" /></a>');
                    }
                    break;
                case AssureIt.NodeType.Evidence:
                    if (!hasContext) {
                        this.menu.append('<a href="#" ><img id="context"  src="' + this.serverApi.basepath + 'images/context.png" title="Context" alt="context" /></a>');
                    }
                    break;
                default:
                    break;
            }
        }
    };

    MenuBar.prototype.AddNode = function (nodeType) {
        var thisNodeView = this.caseViewer.ViewMap[this.node.children("h4").text()];
        var newNodeModel = new AssureIt.NodeModel(this.case0, thisNodeView.Source, nodeType, null, null);
        this.case0.SaveIdCounterMax(this.case0.ElementTop);
        this.caseViewer.ViewMap[newNodeModel.Label] = new AssureIt.NodeView(this.caseViewer, newNodeModel);
        this.caseViewer.ViewMap[newNodeModel.Label].ParentShape = this.caseViewer.ViewMap[newNodeModel.Parent.Label];

        var parentLabel = newNodeModel.Parent.Label;
        var parentOffSet = $("#" + parentLabel).offset();
        this.caseViewer.Draw();

        var CurrentParentView = this.caseViewer.ViewMap[parentLabel];
        this.caseViewer.Screen.SetOffset(parentOffSet.left - CurrentParentView.AbsX, parentOffSet.top - CurrentParentView.AbsY);
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
        var parentLabel = thisNodeModel.Parent.Label;
        var parentOffSet = $("#" + parentLabel).offset();

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

        this.caseViewer.Draw();
        var CurrentParentView = this.caseViewer.ViewMap[parentLabel];
        this.caseViewer.Screen.SetOffset(parentOffSet.left - CurrentParentView.AbsX, parentOffSet.top - CurrentParentView.AbsY);
    };

    MenuBar.prototype.Commit = function () {
        ($('#modal')).dialog('open');
    };

    MenuBar.prototype.Center = function () {
        var thisLabel = this.node.children("h4").text();
        var thisNodeView = this.caseViewer.ViewMap[thisLabel];
        var screenManager = this.caseViewer.Screen;
        screenManager.SetCaseCenter(thisNodeView.AbsX, thisNodeView.AbsY, thisNodeView.HTMLDoc);
    };

    MenuBar.prototype.Scale = function () {
        var timers = [];
        var screenManager = this.caseViewer.Screen;
        var caseViewer = this.caseViewer;
        var editorIsActive = false;

        var svgwidth = screenManager.GetCaseWidth();
        var svgheight = screenManager.GetCaseHeight();
        var bodywidth = screenManager.GetWidth();
        var bodyheight = screenManager.GetHeight();

        var scaleWidth = bodywidth / svgwidth;
        var scaleHeight = bodyheight / svgheight;

        var scaleRate = Math.min(scaleWidth, scaleHeight);
        if (scaleRate >= 1.0) {
            return;
        }

        var startZoom = function (logicalOffsetX, logicalOffsetY, initialS, target, duration) {
            var cycle = 1000 / 30;
            var cycles = duration / cycle;
            var initialX = screenManager.GetLogicalOffsetX();
            var initialY = screenManager.GetLogicalOffsetY();
            var deltaS = (target - initialS) / cycles;
            var deltaX = (logicalOffsetX - initialX) / cycles;
            var deltaY = (logicalOffsetY - initialY) / cycles;

            var currentS = initialS;
            var currentX = initialX;
            var currentY = initialY;
            var count = 0;
            var zoom = function () {
                if (count < cycles) {
                    count += 1;
                    currentS += deltaS;
                    currentX += deltaX;
                    currentY += deltaY;
                    screenManager.SetLogicalOffset(currentX, currentY, currentS);
                    setTimeout(zoom, cycle);
                } else {
                    screenManager.SetLogicalOffset(logicalOffsetX, logicalOffsetY, target);
                }
            };
            zoom();
        };

        startZoom(screenManager.GetLogicalOffsetX(), screenManager.GetLogicalOffsetY(), 1.0, scaleRate, 500);

        $(".node").unbind();

        var ScaleDown = function (e) {
            if (!editorIsActive) {
                timers.push(setTimeout(function () {
                    var x = screenManager.CalcLogicalOffsetXFromPageX(e.pageX);
                    var y = screenManager.CalcLogicalOffsetYFromPageY(e.pageY);
                    startZoom(x, y, scaleRate, 1.0, 500);
                    $("#background").unbind("dblclick", ScaleDown);

                    caseViewer.Draw();
                }, 500));
            } else {
                editorIsActive = false;
            }
        };

        $("#background").dblclick(ScaleDown);
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
            $('#menu').remove();
        });

        $('#commit').click(function () {
            _this.Commit();
        });

        $('#scale').click(function () {
            _this.Scale();
        });

        $('#center').click(function () {
            _this.Center();
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
            var encoder = new AssureIt.CaseEncoder();
            var contents = encoder.ConvertToASN(case0.ElementTop, false);
            serverApi.Commit(contents, $("#message_box").val(), case0.CommitId);
            case0.SetModified(false);
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
})(AssureIt.PlugInSet);

var MenuBarActionPlugIn = (function (_super) {
    __extends(MenuBarActionPlugIn, _super);
    function MenuBarActionPlugIn(plugInManager) {
        _super.call(this, plugInManager);
    }
    MenuBarActionPlugIn.prototype.IsEnabled = function (caseViewer, case0) {
        return true;
    };

    MenuBarActionPlugIn.prototype.Delegate = function (caseViewer, case0, serverApi) {
        var self = this;

        $('.node').unbind('mouseenter').unbind('mouseleave');
        $('.node').hover(function () {
            var node = $(this);

            var label = node.children('h4').text();

            var model = case0.ElementMap[label];
            var menuBar = new MenuBar(caseViewer, model, case0, node, serverApi, self);
            menuBar.menu.appendTo($('#layer2'));
            menuBar.menu.css({ position: 'absolute', top: node.position().top + node.height() + 5, display: 'block', opacity: 0 });
            menuBar.menu.hover(function () {
                clearTimeout(self.timeoutId);
            }, function () {
                $(menuBar.menu).remove();
            });
            self.plugInManager.UseUILayer(self);
            menuBar.SetEventHandlers();

            var commitWindow = new CommitWindow();
            commitWindow.SetEventHandlers(caseViewer, case0, serverApi);
            self.plugInManager.InvokePlugInMenuBarContents(caseViewer, model, menuBar.menu, serverApi);

            var refresh = function () {
                menuBar.menu.css({ left: node.position().left + (node.outerWidth() - menuBar.menu.width()) / 2 });
            };
            (menuBar.menu).jqDock({
                align: 'bottom',
                fadeIn: 200,
                idle: 1500,
                size: 45,
                distance: 60,
                labels: 'tc',
                duration: 500,
                fadeIn: 1000,
                source: function () {
                    return this.src.replace(/(jpg|gif)$/, 'png');
                },
                onReady: refresh
            });
            menuBar.menu.click(refresh);
        }, function () {
            self.timeoutId = setTimeout(function () {
                $('#menu').remove();
            }, 10);
        });
        return true;
    };

    MenuBarActionPlugIn.prototype.DeleteFromDOM = function () {
        $('#menu').remove();
    };
    return MenuBarActionPlugIn;
})(AssureIt.ActionPlugIn);
