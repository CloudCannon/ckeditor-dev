// Simple override plugin to trigger event instead

(function () {
	CKEDITOR.plugins.add("cloudcannonlink", {
		init: function (editor) {
			editor.addCommand("link", {
				exec: function (editor) {
					editor.fire("cloudcannon_link_click");
				}
			});

			editor.setKeystroke(CKEDITOR.CTRL + 76, "link");

			if (editor.ui.addButton) {
				editor.ui.addButton("Link", {
					label: "Link",
					command: "link",
					toolbar: "links,10"
				});
			}
		}
	});
})();
