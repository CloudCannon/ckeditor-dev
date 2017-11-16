/* bender-tags: inlinetoolbar */
/* bender-ckeditor-plugins: toolbar,inlinetoolbar,basicstyles */

( function() {
	'use strict';
	// Please be aware that entire test suite has to use the same skin. That's why tests are separate between 2 files.

	bender.editors = {
		classic: {
			name: 'editor1',
			creator: 'replace',
			startupData: '<p>Hello World</p>',
			config: {
				skin: 'moono'
			}
		},
		divarea: {
			name: 'divarea',
			creator: 'replace',
			startupData: '<p>Hello World</p>',
			config: {
				skin: 'moono',
				extraPlugins: 'divarea'
			}
		},
		inline: {
			name: 'inline',
			creator: 'inline',
			startupData: '<p>Hello World</p>',
			config: {
				skin: 'moono'
			}
		}
	};

	// We need to set up skin at the very beginning befor files start to load.
	CKEDITOR.skinName = 'moono';

	var tests = {
		'test check default css usage': function( editor ) {

			var panel = new CKEDITOR.ui.inlineToolbar( editor );
			panel.addItems( {
				bold: new CKEDITOR.ui.button( {
					label: 'test',
					command: 'bold'
				} )
			} );
			panel.attach( editor.editable().findOne( 'p' ) );
			assert.areSame( 'rgba(0, 0, 0, 0)', panel._view.parts.panel.getComputedStyle( 'background-color' ),
				'Background color seems to be incorrect.' );
		}
	};

	tests = bender.tools.createTestsForEditors( CKEDITOR.tools.objectKeys( bender.editors ), tests );
	bender.test( tests );
} )();