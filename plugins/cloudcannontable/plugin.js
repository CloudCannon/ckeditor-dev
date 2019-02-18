// Based on code from https://github.com/ckeditor/ckeditor-dev/pull/92

(function () {
	CKEDITOR.plugins.add("cloudcannontable", {
		requires: "table,panelbutton,floatpanel",

		afterInit: function (editor) {
			var options = editor.config.tableOptions || {
				rows: 5,
				columns: 5,
				hoverBackground: "#ebebeb"
			};

			function insertTable(rows, columns, clickOptionsFn) {
				var table = new CKEDITOR.dom.element("table", editor.document),
					options = clickOptionsFn();

				if (options.headers === "both" || options.headers === "top") {
					var thead = table.append(new CKEDITOR.dom.element("thead", editor.document)),
						theadRow = thead.append(new CKEDITOR.dom.element("tr", editor.document));

					for (var k = 0; k < columns; k++) {
						var theadCell = theadRow.append(new CKEDITOR.dom.element("th", editor.document));
						theadCell.setAttribute("scope", "col");
						theadCell.appendBogus();
					}
				}

				var tbody = table.append(new CKEDITOR.dom.element("tbody", editor.document));

				for (var i = 0; i < rows; i++) {
					var row = tbody.append(new CKEDITOR.dom.element("tr", editor.document));

					for (var j = 0; j < columns; j++) {
						var cell;

						if (j === 0 && (options.headers === "both" || options.headers === "left")) {
							cell = row.append(new CKEDITOR.dom.element("th", editor.document));
							cell.setAttribute("scope", "row");
						} else {
							cell = row.append(new CKEDITOR.dom.element("td", editor.document));
						}

						cell.appendBogus();
					}
				}

				editor.insertElement(table);
			}

			function renderQuickTable(clickOptionsFn) {
				var clickFn = CKEDITOR.tools.addFunction(function (i, j) {
					insertTable(parseInt(i, 10) + 1, parseInt(j, 10) + 1, clickOptionsFn);
				});

				var output = "<a class='cke_table_grid'><table>";

				for (var i = 0; i < options.rows; i++) {
					output += "<tr>";

					for (var j = 0; j < options.columns; j++) {
						output += "<td data-row='" + (i + 1) + "' " +
							"data-column='" + (j + 1) + "' " +
							"onclick='CKEDITOR.tools.callFunction(" + clickFn + ", " + i + ", " + j + "); return false;'></td>";
					}

					output += "</tr>";
				}

				var headerSelectHtml =
					"<select>" +
						"<option value='none' selected>No headers</option>" +
						"<option value='top'>Top row</option>" +
						"<option value='left'>Left column</option>" +
						"<option value='both'>Both</option>" +
					"</select>";

				return output + "</table>" + headerSelectHtml + "</a>";
			}

			var selection = {
				row: -1,
				column: -1
			};

			function updateSelection(table, row, column) {
				var rows = table.$.tBodies[0].rows;

				for (var i = 0; i < rows.length; i++) {
					for (var j = 0; j < rows[i].cells.length; j++) {
						rows[i].cells[j].style.background = (i < row && j < column) ? options.hoverBackground : "";
						rows[i].cells[j].style["border-color"] = (i < row && j < column) ? "#bbb" : "";
					}
				}

				selection.row = row - 1;
				selection.column = column - 1;
			}

			editor.ui.add("Table", CKEDITOR.UI_PANELBUTTON, {
				hasArrow: false,
				label: editor.lang.table.toolbar,
				command: "table",
				modes: {wysiwyg: 1},
				editorFocus: 0,
				toolbar: "insert,30",
				caption: null,
				table: null,
				panel: {
					css: CKEDITOR.skin.getPath("editor"),
					attributes: {role: "listbox", "aria-label": ""}
				},

				onBlock: function (panel, block) {
					block.autoSize = true;
					block.element.addClass("cke_colorblock");

					var select;
					function clickOptionsFn() {
						return {headers: select.getValue()};
					}

					var tableWrapper = CKEDITOR.dom.element.createFromHtml(renderQuickTable(clickOptionsFn));
					var table = this.table = tableWrapper.getFirst();
					select = tableWrapper.findOne("select");

					select.on("input", function () {
						table.removeClass("highlighted-none")
							.removeClass("highlighted-top")
							.removeClass("highlighted-left")
							.removeClass("highlighted-both")
							.addClass("highlighted-" + select.getValue());
					});

					table.on("mouseleave", function () {
						updateSelection(table, 1, 1);
					});

					table.on("mousemove", function (e) {
						var target = e.data.getTarget();
						if (target.getName() === "td") {
							var row = parseInt(target.getAttribute("data-row"), 10),
								column = parseInt(target.getAttribute("data-column"), 10);

							updateSelection(table, row, column);
						}
					});

					block.element.append(tableWrapper);
					CKEDITOR.ui.fire("ready", this);
				},

				onOpen: function () {
					updateSelection(this.table, 1, 1);
				}
			});
		}
	});
})();