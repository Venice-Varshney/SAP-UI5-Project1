sap.ui.define([
	"sap/m/Text"
], function (Text) {
	"use strict";
	return Text.extend("sap.ui.demo.walkthrough1.controls.CustomText", {
		metadata: {
			dnd: {
				droppable: true,
                draggable: true
			}
		},
		renderer: {}
	});
});