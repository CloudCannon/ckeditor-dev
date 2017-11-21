// Simple override plugin to trigger event instead

(function () {
	CKEDITOR.plugins.add("cloudcannonimage", {
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
