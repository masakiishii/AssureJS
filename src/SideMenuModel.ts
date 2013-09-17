module AssureIt {

	export class SideMenuModel {
		constructor(public href: string, public value:string, public id: string, public callback: (ev: Event)=> void) {
		}

	}

	export class SideMenu {
		constructor() {
		}

		static Create(models: SideMenuModel[]) {
			for(var i: number = 0; i < models.length; i++) {
				var model:SideMenuModel = models[i];
				$('<li id="'+model.id+'"><a href="'+model.href+'">'+model.value+'</>').prepend($("#drop-menu"));
				$("#"+model.id).click(model.callback);
			}
		}
	}
}
