(function () {
	CKEDITOR.plugins.add("cloudcannonpreventunnecessarynbsp", {
		afterInit: function (editor) {
			if (editor.dataProcessor && editor.dataProcessor.htmlFilter) {
				editor.dataProcessor.htmlFilter.addRules(
					{
						text: function (text) {
							return text.replace(/([^\s])&nbsp;([^\s])/gi, "$1 $2");
						}
					},
					{
						applyToAll: true,
						excludeNestedEditable: true
					}
				);
			}
		}
	});
})();