module AssureIt {

	export class CaseAnnotation {
		constructor(public Name: string, public Body: any) {
		}
	}

	export class CaseNote {
		constructor(public Name: string, public Body: any) {
		}
	}

	export enum NodeType {
		Goal, Context, Strategy, Evidence
	}

	export class NodeModel {
		Case : Case;
		Type  : NodeType;
		Label : string;
		Statement: string;
		Annotations : CaseAnnotation[];
		Notes: CaseNote[];
		Parent : NodeModel;
		Children: NodeModel[];


		constructor(Case : Case, Parent : NodeModel, Type : NodeType, Label : string, Statement : string) {
			this.Case = Case;
			this.Type = Type;
			this.Label = (Label == null) ? Case.NewLabel(Type) : Label;
			this.Statement = (Statement == null) ? "" : Statement;
			this.Parent = Parent;
			if(Parent != null) {
				Parent.AppendChild(this);
			}
			this.Children = [];
			this.Annotations = [];
			this.Notes = [];

			Case.ElementMap[this.Label] = this; // TODO: ensure consistensy of labels
		}

		EnableEditFlag(): void {
			this.Case.SetModified(true);
		}

		AppendChild(Node : NodeModel) : void {
			this.Children.push(Node);
			this.EnableEditFlag();
		}

		RemoveChild(Node : NodeModel) : void {
			for (var i = 0; i < this.Children.length; i++) {
				if (this.Children[i].Label == Node.Label) {
					this.Children.splice(i, 1);
				}
			}
			this.EnableEditFlag();
		}

		UpdateChild(oldNode : NodeModel, newNode : NodeModel) : void {
			for (var i = 0; i < this.Children.length; i++) {
				if (this.Children[i].Label == oldNode.Label) {
					this.Children[i] = newNode;
				}
			}
			this.EnableEditFlag();
		}
	
		GetAnnotation(Name: string) : CaseAnnotation {
			for(var i: number = 0; i < this.Annotations.length; i++ ) {
				if(this.Annotations[i].Name == Name) {
					return this.Annotations[i];
				}
			}
			return null;
		}

		SetAnnotation(Name: string, Body : any) : void {
			for(var i: number = 0; i < this.Annotations.length; i++ ) {
				if(this.Annotations[i].Name == Name) {
					this.Annotations[i].Body = Body;
					return;
				}
			}
			this.Annotations.push(new CaseAnnotation(Name, Body));
			this.EnableEditFlag();
		}

		SetNote(Name: string, Body : any) : void {
			for(var i: number = 0; i < this.Notes.length; i++ ) {
				if(this.Notes[i].Name == Name) {
					this.Notes[i].Body = Body;
					return;
				}
			}
			this.Notes.push(new CaseNote(Name, Body));
			this.EnableEditFlag();
		}

		GetNote(Name: string) : CaseNote {
			for(var i: number = 0; i < this.Notes.length; i++ ) {
				if(this.Notes[i].Name == Name) {
					return this.Notes[i];
				}
			}
			return null;
		}

		eachChildren(f: (i: number, v: NodeModel) => void): void { //FIXME
			for(var i: number = 0; i < this.Children.length; i++) {
				f(i, this.Children[i]);
			}
		}

		traverse(f: (i: number, v: NodeModel) => void): void {
			function traverse_(n: NodeModel, f: (i: number, v: NodeModel) => void): void {
				n.eachChildren((i: number, v: NodeModel) => {
					f(i, v);
					traverse_(v, f)
				});
			}
			f(-1, this);
			traverse_(this, f);
		}

		/* plug-In */
		//InvokePlugInModifier(EventType : string, EventBody : any) : boolean {
		//	var recall = false;
		//	for(var a in this.Annotations) {
		//		var f = this.Case.GetPlugInModifier(a.Name);
		//		if(f != null) {
		//			recall = f(Case, this, EventType, EventBody) || recall;
		//		}
		//	}
		//	for(var a in this.Notes) {
		//		var f = this.Case.GetPlugInModifier(a.Name);
		//		if(f != null) {
		//			recall = f(Case, this, EventType, EventBody) || recall;
		//		}
		//	}
		//	return recall;
		//}
	}

	export class Case {
		IdCounters : number[];
		ElementTop : NodeModel;
		ElementMap : { [index: string]: NodeModel};

		private isModified : boolean = false;
		isEditable : boolean = false;
		isLatest   : boolean = true;

		constructor(public CaseName: string, public CaseId: number, public CommitId: number) {
			this.IdCounters = [0, 0, 0, 0, 0];
			this.ElementMap = {};
		}

		DeleteNodesRecursive(root : NodeModel) : void {
			var Children = root.Children;
			delete this.ElementMap[root.Label];
			for (var i = 0; i < Children.length; i++) {
				this.DeleteNodesRecursive(Children[i]);
			}
			this.SetModified(true);
		}

		/* Deprecated */
		SetElementTop(ElementTop : NodeModel) : void{
			this.ElementTop = ElementTop;
			this.SaveIdCounterMax(ElementTop);
		}
		SaveIdCounterMax(Element : NodeModel) : void {
			for (var i = 0; i < Element.Children.length; i++) {
				this.SaveIdCounterMax(Element.Children[i]);
			}
			var m = Element.Label.match(/^[GCSE][0-9]+$/);
			if(m == null) {
				return; //FIXME Label which not use this Id rule
			}
			if (m.length == 1) {
				var prefix = m[0][0];
				var count = Number(m[0].substring(1));
				switch (prefix) {
				case "G":
					if (this.IdCounters[NodeType["Goal"]] < count) this.IdCounters[NodeType["Goal"]] = count;
					break;
				case "C":
					if (this.IdCounters[NodeType["Context"]] < count) this.IdCounters[NodeType["Context"]] = count;
					break;
				case "S":
					if (this.IdCounters[NodeType["Strategy"]] < count) this.IdCounters[NodeType["Strategy"]] = count;
					break;
				case "E":
					if (this.IdCounters[NodeType["Evidence"]] < count) this.IdCounters[NodeType["Evidence"]] = count;
					break;
				default:
					console.log("invalid label prefix :" + prefix);
				}
			}
		}
		NewLabel(Type : NodeType) : string {
			this.IdCounters[Type] += 1;
			return NodeType[Type].charAt(0) + this.IdCounters[Type];
		}

		IsLogin(): boolean {
			var matchResult = document.cookie.match(/userId=(\w+);?/);
			var userId = matchResult ? parseInt(matchResult[1]) : null;
			return userId != null;
		}

		SetEditable(flag?: boolean): void {
			if(flag == null) {
				this.isEditable = this.IsLogin();
				return;
			}
			this.isEditable = flag;
			if(!this.IsLogin()) {
				this.isEditable = false;
			}
			return;
		}

		IsEditable(): boolean {
			if(!this.IsLogin()) {
				this.isEditable = false;
			}
			return this.isEditable;
		}

		IsModified(): boolean {
			return this.isModified;
		}

		SetModified(s: boolean): void {
			this.isModified = s;
		}

		IsLatest(): boolean {
			return this.isLatest;
		}
	}

	//TODO Split file "CommitModel.ts"
	export class CommitModel {
		constructor(public CommitId: number, public CaseId: number, public Message:string, public LatestFlag: boolean) {
		}
	}

	export class CommitCollection {
		CommitModels: CommitModel[] = [];

		constructor() {
		}

		Append(COModel: CommitModel): void {
			this.CommitModels.push(COModel);
		}

		FromJson(json: any): void {
		}

		Iterator(): CommitIterator {
			return new CommitIterator(this.CommitModels);
		}
	}

	export class CommitIterator {
		it: number;

		constructor(public CommitModels: CommitModel[]) {
			this.it = 0;
		}

		HasNext(): boolean {
			return this.it < this.CommitModels.length;
		}

		Next(): CommitModel {
			return this.CommitModels[this.it++];
		}
	}
}
