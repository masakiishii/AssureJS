class CaseAnnotation {
	constructor(public Name: string, public Body: any) {
	}
}

class CaseNote {
	constructor(public Name: string, public Body: any) {
	}
}

enum NodeType {
	Goal, Context, Strategy, Evidence
}

class NodeModel {
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

	AppendChild(Node : NodeModel) : void {
		this.Children.push(Node);
	}
	
	GetAnnotation(Name: string) : CaseAnnotation {
		for(var a in this.Annotations) {
			if(a.Name == Name) {
				return a;
			}
		}
		return a;
	}

	SetAnnotation(Name: string, Body : any) : CaseAnnotation {
		for(var a in this.Annotations) {
			if(a.Name == Name) {
				a.Body = Body;
				return a;
			}
		}
		this.Annotations.push(new CaseAnnotation(Name, Body));
	}
	
	/* plug-In */
	InvokePlugInModifier(EventType : string, EventBody : any) : boolean {
		var recall = false;
		for(var a in this.Annotations) {
			var f = this.Case.GetPlugInModifier(a.Name);
			if(f != null) {
				recall = f(Case, this, EventType, EventBody) || recall;
			}
		}
		for(var a in this.Notes) {
			var f = this.Case.GetPlugInModifier(a.Name);
			if(f != null) {
				recall = f(Case, this, EventType, EventBody) || recall;
			}
		}
		return recall;
	}
}

class CaseModifiers {
	PlugInMap : { [index: string]: (Case, NodeModel, string, any) => boolean};

	constructor() {
		this.PlugInMap = {};
	}
	
	AddPlugInModifier(key: string, f : (Case, NodeModel, string, any) => boolean) {
		this.PlugInMap[key] = f;
	}
	
	GetPlugInModifier(key : string) : (Case, NodeModel, string, any) => boolean {
		return this.PlugInMap[key];
	}
}

var CaseModifierConfig = new CaseModifiers();

class Case {
	CaseId : number;  // TODO
	IdCounters : number[];
	ElementTop : NodeModel;
	ElementMap : { [index: string]: NodeModel};

	IsModified : boolean;
	//TopGoalLabel : string;

	constructor() {
		this.IdCounters = [0, 0, 0, 0, 0];
		this.IsModified = false;
		this.ElementMap = {};
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
		
	GetPlugInModifier(key : string) : (Case, NodeModel, string, any) => boolean {
		return CaseModifierConfig.PlugInMap[key];
	}
}


