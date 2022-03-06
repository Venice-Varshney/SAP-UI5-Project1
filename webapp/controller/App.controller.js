sap.ui.define([
    //calling the library which stores resources of the controller
    "sap/ui/core/mvc/Controller", //call controller from library
    "sap/m/MessageToast", 
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/resource/ResourceModel",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageStrip",
	"sap/ui/core/InvisibleMessage",
    "sap/ui/core/library"
    //calling the contructor and pass all that we will use
], function (Controller, MessageToast, JSONModel, ResourceModel, Fragment, Filter, FilterOperator, MessageStrip, InvisibleMessage, Library) {
    "use strict"; //running in strict mode
    //this constructor will return as below

    var InvisibleMessageMode = Library.InvisibleMessageMode;

    return Controller.extend("sap.ui.demo.walkthrough1", {
        // 
        onInit: function(){
            this.oInvisibleMessage = InvisibleMessage.getInstance();
            this.response();
        },
 
        //creating a function button click 
        onButtonClick: function () {
            //read message from i18n and show toast
            var oBundle = this.getView().getModel("i18n").getResourceBundle();
            var sRecipient = this.getView().getModel().getProperty("/recipient/firstName");
            var sMsg = oBundle.getText("showDetailsText", [sRecipient]);

            MessageToast.show(sMsg);
        },

        onSearchUtterances : function (oEvent) {
            // build filter array
            var aFilter = [];
            var sQuery = oEvent.getParameter("query");
            if (sQuery) {
                aFilter.push(new Filter("UtteranceName", FilterOperator.Contains, sQuery));
            }

            // filter binding
            var oTable = this.byId("utteranceTable");
            //get what is binded to the list ie our model
            var oBinding = oTable.getBinding("items");
            //and add our filter
            oBinding.filter(aFilter);
        },

        onEnterAdd: function (){
            var uttName = this.byId("addUtteranceEnter").getValue();
            if(/[a-zA-Z0-9]/i.test(uttName)){
                var oData = this.getView().getModel("utteranceJson").getData();
                var uttJson = oData.Utterances;
                var aInput={ 
                    UtteranceName: "",
                    editable: false,
                    Status: "New"
                };

                var duplicateFlag = $.map(uttJson, function(obj) {
                    if (obj.UtteranceName == uttName) {
                        return true;
                    } 
                });

                if (duplicateFlag[0] == true){
                    MessageToast.show("Utterance " + uttName + " already exists");
                    this.byId("addUtteranceEnter").setValue("");
                }
                else{
                    aInput={ 
                        UtteranceName: uttName,
                        editable: false,
                        Status: "New"
                    };
                    oData.Utterances.unshift(aInput);
                    this.getView().getModel("utteranceJson").setData(oData);
                    this.byId("addUtteranceEnter").setValue("");

                    MessageToast.show("Utterance " + "'" + uttName + "'" + " added Successfully");
                    this.showMsgStrip("Success", "Utterance has been added Successfully");
                }
            } 
            else{
                 MessageToast.show("Please enter valid a Utterance");   
            }        
        },

        onAddBulk: function() {
            var oView = this.getView();
            if(!this.byId("addDialog")){
                //ie if the dialog does not exist create it and load it
                Fragment.load({
                    id: oView.getId(),
                    name: "sap.ui.demo.walkthrough1.view.AddDialog",
                    controller: this
                }).then( function (oDialog){
                    //connect dialog to the root view of this component
                    oView.addDependent(oDialog);
                    oDialog.open();
                })
            } else {
                this.byId("addDialog").open();
            }
        },

        onSaveDialog: function (){
            var utt = this.byId("addUtteranceBulk").getValue();
            var uttArray = utt.split("\n");

            var oData = this.getView().getModel("utteranceJson").getData();
            var uttJson = oData.Utterances;
            var aInput={ 
                UtteranceName: "",
                editable: false,
                Status: "New"
             };
            var entriesAddedFlag = false;
            var tempAdd = [];

            $.map(uttArray, function(itm){
                if (/[a-zA-Z0-9]/i.test(itm) == true){
                    var duplicateFlag = $.map(uttJson, function(obj) {
                        if (obj.UtteranceName == itm) {
                            return true;
                        } 
                    });
                    if (duplicateFlag[0] != true){
                        aInput={ 
                            UtteranceName: itm,
                            editable: false,
                            Status: "New"
                         };
                         tempAdd.push(aInput);
                         //oData.Utterances.unshift(aInput);
                         entriesAddedFlag = true;
                    }
                }    
            });
            
            if (entriesAddedFlag == true){
                while(tempAdd.length){
                    oData.Utterances.unshift(tempAdd.pop());
                };
                this.getView().getModel("utteranceJson").setData(oData);
                this.byId("addUtteranceBulk").setValue("");
                MessageToast.show("Utterances have been Successfully Added");
                this.byId("addDialog").close();
            }else{
                MessageToast.show("Utterances could not be saved. Utterances are either not valid or already exist");
            }
            
        },

        onCloseDialog: function (){
            this.byId("addUtteranceBulk").setValue("");
            this.byId("addDialog").close();
        },

        onEdit: function() { 
            var oTable = this.getView().byId("utteranceTable");
            this.getView().byId("utteranceTable").getRows()[1].getCells()[0].setEditable(true);
            var arr = oTable.getSelectedIndices();

            arr.forEach(obj => {
                oTable.getRows()[obj].getCells()[0].setEditable(true);
            });
            oTable.setProperty("selectionMode","None");
            // var oTable = this.getView().byId("utteranceTable");
            // var oModel = oTable.getModel("utteranceJson");

            // var oThisObj = oTable.getContextByIndex(oTable.getSelectedIndex()).getObject();
            // oThisObj.editable = true;
            // oModel.refresh();

            var oButtonEdit = this.byId("editButton");
            oButtonEdit.setEnabled(false);
            var oButtonFilter = this.byId("filterButton");
            oButtonFilter.setEnabled(false);
            var oButtonDelete = this.byId("deleteButton");
            oButtonDelete.setEnabled(false);
            var oButtonSave = this.byId("saveButton");
            oButtonSave.setEnabled(true);
          },
  
        onDelete: function (oEvent){
            var oTable = this.byId("utteranceTable");
            var oModel = oTable.getModel("utteranceJson");
            var aRows = oModel.getData();
            var tempCount = 0;

            // Selected Rows
            var selectedIndicies = oTable.getSelectedIndices();
            selectedIndicies.sort((a,b)=>b-a);
            $.map(selectedIndicies, function(selIndex){
                var oThisObj = oTable.getContextByIndex(selIndex).getObject();
                var count = 0;   
                var index = $.map(aRows.Utterances, function(obj) {
                    if (obj.UtteranceID == oThisObj.UtteranceID) {
                        return count;
                    }
                    count = count + 1;
                });
                tempCount = index [0];
                aRows.Utterances.splice(tempCount, 1);
            });

            oModel.setData(aRows);
            oTable.clearSelection(true);
            //oTable.removeSelections(true);
            MessageToast.show("Utterance has been deleted");
            this.showMsgStrip("Error", "Utterance has been deleted");
        },

        onFilter: function (oEvent) {
			if (oEvent.getSource().getPressed()) {
                var aFilter = [];
                aFilter.push(new Filter("Status", FilterOperator.Contains, "New"));
                var oTable = this.byId("utteranceTable");
                var oBinding = oTable.getBinding("items");
                oBinding.filter(aFilter);
			} 
            else {
                var oTable = this.byId("utteranceTable");
                var oBinding = oTable.getBinding("items");
                oBinding.filter();
			}
		},

        onSave: function() {
            // var oTable = this.getView().byId("utteranceTable");
            // var oModel = oTable.getModel("utteranceJson");
            // var oThisObj = oTable.getContextByIndex(oTable.getSelectedIndex()).getObject();
            // oThisObj.editable = false;
            // oThisObj.Status = "New";
            // oModel.refresh();

            var oTable = this.getView().byId("utteranceTable");
            var arr = oTable.getSelectedIndices();

            arr.forEach(obj => {
                oTable.getRows()[obj].getCells()[0].setEditable(false);
            });
            oTable.setProperty("selectionMode","MultiToggle");

            MessageToast.show("Utterance has been saved");
            var oButtonEdit = this.byId("editButton");
            oButtonEdit.setEnabled(true);
            var oButtonFilter = this.byId("filterButton");
            oButtonFilter.setEnabled(true);
            var oButtonDelete = this.byId("deleteButton");
            oButtonDelete.setEnabled(true);
            var oButtonSave = this.byId("saveButton");
            oButtonSave.setEnabled(false);
        },

        onClearFilter: function(oEvent){

            var oTable = this.byId("utteranceTable");
			var oModel = oTable.getModel("utteranceJson");

            oTable.getBinding().sort(null);
			oModel.setProperty("/globalFilter", "");
            oTable.getBinding("rows").filter(null);
		
        },

        onWizard: function(){
            var oView = this.getView();
            if(!this.byId("wizardDialog")){
                //ie if the dialog does not exist create it and load it
                Fragment.load({
                    id: oView.getId(),
                    name: "sap.ui.demo.walkthrough1.view.WizardDialog",
                    controller: this
                }).then( function (oDialog){
                    //connect dialog to the root view of this component
                    oView.addDependent(oDialog);
                    oDialog.open();
                })
            } else {
                this.byId("wizardDialog").open();
            }
        },

        onCloseWizard: function(){
            this.byId("wizardDialog").close();
        },

        onResponseOpen: function(){
            
        },

        showMsgStrip: function (type, message) {
			var oMs = sap.ui.getCore().byId("msgStrip");

			if (oMs) {
				oMs.destroy();
			}
			// this._generateMsgStrip();
            var aTypes = ["Information", "Warning", "Error", "Success"],
				//sText = "This is a message strip",
				//sType = aTypes[Math.round(Math.random() * 3)],
				oVC = this.byId("oVerticalContent"),
				oMsgStrip = new MessageStrip("msgStrip", {
					text: message,
					showCloseButton: true,
					showIcon: true,
					type: type
				});

                this.oInvisibleMessage.announce("New Information Bar of type Error " + type, InvisibleMessageMode.Assertive);
                oVC.addContent(oMsgStrip);
		},

		_generateMsgStrip: function () {
			    
		},

        testJson: function (){

            this.byId("testButton").getMetadata().getAllAggregations().dragDropConfig.dnd.droppable = true;
            this.byId("testButton").getMetadata().getAllAggregations().dragDropConfig.dnd.draggable = true;
            let obj = 
            JSON.parse('{"card":{"title": "This is card title","subTitle": "This is sub title","description": "This is card desrciption","imageURL": "www.image.com/1.jpg","status": "In progress","statusState": "</none/information/error/success/warning>","sections": [{"title": "Section Title","attributes": [{ "lable": "Lable 1", "type": "<email/phonenumber/link/text>","value": "Value 1" },{ "lable": "Lable 1", "type": "<email/phonenumber/link/text>", "value": "Value 1" }]}],"buttons": [{ "title": "Button 1", "value": "BUTTON1" },{ "title": "Button 1", "value": "BUTTON1" }]}}');
            // JSON.parse('{"name":"John", "age":30, "city":{"city1":"Venice", "city2":"London"}}');
            let x = 1;
            let object = {child: []};
            this.formChild(obj, object.child, ".");
            var oJsonModel = new JSONModel(object);
			this.getView().setModel(oJsonModel, "jsmodel");
            var oTreeTable = this.byId("TreeTableBasic");
			oTreeTable.expandToLevel(1);
            
        },

        formChild: function(obj, parent, prevPath){
            let child = [];
            let path = "";
            for (var element in obj) {
                path = `${prevPath}/${element}`;
                if (Array.isArray(obj[element])){
                    this.formChild(obj[element][0], child, path);
                } else if (typeof obj[element] == "object"){
                    this.formChild(obj[element], child, path);
                };
                parent.push({ 
                    "name" : element,
                    "child" : child,
                    "path" : path
                });
                child = [];
                path = "";
            };
        },

        response: function(){
            let responseJson = new JSONModel({
                Response: [
                {
                    sequence: 1,
                    data: {
                                text: { text: "Hello User, you have 3 options" , visible: true },
                                buttons: { text: "Mutton", buttons: [], visible: false } ,
                                quickReply: { text: "QR", buttons: [], visible: false },
                                list: { title: "", subtitle: "", imageUrl: "", buttons: [],
                                elements: [], visible: false },
                                image: { content: "", visible: false}
                            }
                },
                {
                    sequence: 2,
                    data: {
                                text: { text: "Hello Venice" , visible: false },
                                buttons: { text: "This is a button", buttons: [{title: "Button1", value: "", type:"postback"}, 
                                                    {title: "Button2", value: "", type:"postback"},
                                                    {title: "Button3", value: "", type:"postback"}], visible: true },
                                quickReply: { text: "This is a QR", buttons: [{title: "QR1", value: "", type:"postback"}, 
                                                                            {title: "QR2", value: "", type:"postback"}], visible: false },
                                list: { title: "", subtitle: "", imageUrl: "", buttons: [],
                                elements: [], visible: false },
                                image: { content: "", visible: false}
                            }
                },
                {
                    sequence: 3,
                    data: {
                                text: { text: "" , visible: false },
                                buttons: { text: "", buttons: [], visible: false },
                                quickReply: { text: "This is a QR", buttons: [{title: "QR1", value: "", type:"postback"}, 
                                                                            {title: "QR2", value: "", type:"postback"}], visible: true },
                                list: { title: "", subtitle: "", imageUrl: "", buttons: [],
                                elements: [], visible: false },
                                image: { content: "", visible: false}
                            }
                },
                {
                    sequence: 4,
                    data: {
                                text: { text: "" , visible: false },
                                buttons: { text: "", buttons: [], visible: false },
                                quickReply: { text: "", buttons: [], visible: false },
                                list: { title: "List Title", subtitle: "List Subtitle", imageUrl: "Image here", buttons: [{title: "LT", value: "LV", type:"postback"}],
                                elements: [{ title: "List Title1", 
                                            subtitle: "List Subtitle1", 
                                            imageUrl: "Image here1", 
                                            status: "<CARD_STATUS>1",
                                            statusState: "<''/none/information/error/success/warning>",
                                            description: "<CARD_DESCRIPTION>1",
                                            buttons: [{title: "LT1", value: "LV", type:"postback"}]},
                                        { title: "List Title2", 
                                            subtitle: "List Subtitle2", 
                                            imageUrl: "Image here2", 
                                            status: "<CARD_STATUS>2",
                                            statusState: "<''/none/information/error/success/warning>",
                                            description: "<CARD_DESCRIPTION>2",
                                            buttons: [{title: "LT2", value: "LV", type:"postback"}]}
                                ], visible: true },
                                image: { content: "", visible: false}
                            }
                },
                {
                    sequence: 5,
                    data: {
                                text: { text: "" , visible: false },
                                buttons: { text: "", buttons: [], visible: false },
                                quickReply: { text: "", buttons: [], visible: false },
                                list: { title: "", subtitle: "", imageUrl: "", buttons: [],
                                elements: [], visible: false },
                                image: { content: "imageurl", visible: true}
                            }
                }


            ]});

            this.getView().setModel(responseJson, "responseJson");
        },

        formJson: function(){
            let json = '{"type": "quickReplies","delay": "<DELAY_IN_SEC>","markdown": "<true/false>","content": {"title": "<Sample Text>","buttons": [{"title": "<BUTTON_TITLE>","value": "<BUTTON_VALUE>"}]}}';
            let obj = JSON.parse(json);
            let data = {};
            switch ( obj.type ){
                case "text": 
                    data = {
                        text: { text: obj.content , visible: true },
                        buttons: { text: "", buttons: [], visible: false } ,
                        quickReply: { text: "", buttons: [], visible: false },
                        list: { title: "", subtitle: "", imageUrl: "", buttons: [],
                        elements: [], visible: false },
                        image: { content: "", visible: false} }; 
                        break;
                case "buttons": 
                    let buttons = []; 
                    let button = {};
                    obj.content.buttons.forEach(element => {
                        button = {title: element.title, value: element.value, type: element.type};
                        buttons.push(but);
                    });
                    data = {
                        text: { text: "" , visible: false },
                        buttons: { text: obj.content.title, buttons: buttons, visible: true } ,
                        quickReply: { text: "", buttons: [], visible: false },
                        list: { title: "", subtitle: "", imageUrl: "", buttons: [],
                        elements: [], visible: false },
                        image: { content: "", visible: false} }; 
                    break;
                case "quickReplies":
                    let buttons1 = []; 
                    let button1 = {};
                    obj.content.buttons.forEach(element => {
                        button1 = {title: element.title, value: element.value, type: element.type};
                        buttons1.push(but);
                    });
                    data = {
                        text: { text: "" , visible: false },
                        buttons: { text: "", buttons: [], visible: false } ,
                        quickReply: { text: obj.content.title, buttons: buttons1, visible: true },
                        list: { title: "", subtitle: "", imageUrl: "", buttons: [],
                        elements: [], visible: false },
                        image: { content: "", visible: false} };  
                    break;
                case "list": 
                    let elements = []; 
                    let element = {};
                    obj.content.elements.forEach(obj => {
                        element = {title: obj.title, subtitle: obj.subtitle, imageUrl: obj.imageUrl, 
                            status: obj.status, statusState: obj.statusState, description: obj.description,
                            buttons: [{ title: obj.buttons[0].title, value: obj.buttons[0].value, type: obj.buttons[0].type }]};
                        elements.push(element);
                    });
                    data = {
                        text: { text: "" , visible: false },
                        buttons: { text: "", buttons: [], visible: false } ,
                        quickReply: { text: "", buttons: [], visible: false },
                        list: { title: obj.content.title, subtitle: obj.content.subtitle, imageUrl: obj.content.imageUrl, 
                            buttons: [{ title: obj.content.buttons[0].title, value: obj.content.buttons[0].value, type: obj.content.buttons[0].type} ],
                        elements: [], visible: true },
                        image: { content: "", visible: false} };
                    break;
                case "picture": 
                    data = {
                        text: { text: "" , visible: false },
                        buttons: { text: "", buttons: [], visible: false } ,
                        quickReply: { text: "", buttons: [], visible: false },
                        list: { title: "", subtitle: "", imageUrl: "", buttons: [],
                        elements: [], visible: false },
                        image: { content: obj.content, visible: true} };
                    break;
            }
            let object = {child: []};
            this.formChild(json, object.child, ".");
        },

        recFunction: function(){

        },

        onDrag: function(){
            MessageToast.show("Dragged");
        },

        onDrop: function(){
            MessageToast.show("Dropped");
        }

    });
});