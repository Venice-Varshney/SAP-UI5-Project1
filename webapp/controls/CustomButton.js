sap.ui.define([
	"sap/m/Button"
], function (Button) {
	"use strict";
	return Button.extend("sap.ui.demo.walkthrough1.controls.CustomButton", {
		metadata: {
			dnd: {
				droppable: true,
                draggable: true
			}
		},
		renderer: {}
	});
});