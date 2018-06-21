// Simple override plugin to trigger event instead

(function () {
	CKEDITOR.plugins.add("cloudcannonimage", {
		icons: "image", // %REMOVE_LINE_CORE%
		hidpi: true, // %REMOVE_LINE_CORE%

		init: function (editor) {
			editor.addCommand("image", {
				exec: function (editor) {
					editor.fire("cloudcannon_image_click");
				}
			});

			if (editor.ui.addButton) {
				editor.ui.addButton("Image", {
					label: editor.lang.common.image,
					command: "image",
					toolbar: "insert,10"
				});
			}
		}
	});
})();
