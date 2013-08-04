/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/PlugInManager.ts" />

class MenuBarPlugIn extends AssureIt.ActionPlugIn {
	IsEnabled(caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case): boolean {
		return true;
	}

	static DelegateInvoked: boolean = false;

	Delegate(caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case, serverApi: AssureIt.ServerAPI): boolean {
		if (MenuBarPlugIn.DelegateInvoked) return;
		$('.node').hover(function () {
			var node = $(this);
			$('#menu').remove();
			var p = node.position();
			var j = $('<div id="menu">' +
				'<a href="#" ><img src="images/icon.png" alt="" /></a>' +
				'<a href="#" ><img src="images/icon.png" alt="" /></a>' +
				'<a href="#" ><img src="images/icon.png" alt="" /></a>' +
				'<a href="#" ><img src="images/icon.png" alt="" /></a>' +
				'<a href="#" ><img src="images/icon.png" alt="" /></a>' +
				'<a href="#" ><img src="images/icon.png" alt="" /></a></div>');

			j.appendTo($('#layer2'));
			j.css({ position: 'absolute', top: p.top + 75, display: 'none', opacity: 0 });
			(<any>$('#menu')).jqDock({
				align: 'bottom',
				fadeIn: 200,
				idle: 1500,
				size: 48,
				distance: 60,
				labels: 'hoge,fuga,foo,bar',
				duration: 500,
				source: function () { return this.src.replace(/(jpg|gif)$/, 'png'); },
				onReady: function () { $('#menu').css({ left: node.position().left + (node.outerWidth() - $('#menu').width()) / 2 }); },
			});
			$('#menu').css({ display: 'block' }).hover(function () { }, function () { $(this).remove(); });
		}, () => {
				//			if(menuFlag) {
				//				$('#menu').remove();
				//			}
			});
		MenuBarPlugIn.DelegateInvoked = true;
		return true;
	}
}
