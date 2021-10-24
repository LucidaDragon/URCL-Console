define("ace/mode/urcl_highlight_rules", ["require", "exports", "ace/lib/oop", "ace/mode/text_hightlight_rules"], function(require, exports, module)
{
	"use strict";
	
	let oop = require("../lib/oop");
	let TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;
	
	const operators = Object.keys(URCL.Operators).join("|");

	let URCLHighlightRules = function()
	{
		this.$rules = {
			start: [
				{
					token: "keyword.control.urcl",
					regex: "\\b(?:" + operators + ")\\b",
					caseInsensitive: true
				},
				{
					token: "constant.character.decimal.urcl",
					regex: "\\b[0-9]+\\b"
				},
				{
					token: "constant.character.hexadecimal.urcl",
					regex: "\\b0x[A-F0-9]+\\b",
					caseInsensitive: true
				},
				{
					token: "constant.character",
					regex: "\\b0b[01]+\\b",
					caseInsensitive: true
				},
				{
					token: "string.urcl",
					regex: /'([^\\']|\\.)*'/
				},
				{
					token: "string.urcl",
					regex: /"([^\\"]|\\.)*"/
				},
				{
					token: "entity.name.function.urcl",
					regex: "\\.\\w+"
				},
				{
					token: "support.constant",
					regex: "\\%(\\w|\\d)+"
				},
				{
					token: "comment.urcl",
					regex: "\\/\\/.*$"
				},
				{
					token: "variable",
					regex: "(\\w|\\d)+",
					caseInsensitive: true
				}
			]
		};
		
		this.normalizeRules();
	};
	
	URCLHighlightRules.metaData = {
		fileTypes: [ "urcl" ],
		name: "URCL",
		scopeName: "source.urcl"
	};
	
	oop.inherits(URCLHighlightRules, TextHighlightRules);
	
	exports.URCLHighlightRules = URCLHighlightRules;
});

define("ace/mode/urcl", ["require", "exports", "ace/lib/oop", "ace/mode/text", "ace/mode/urcl_highlight_rules"], function(require, exports, module)
{
	"use strict";
	
	let oop = require("../lib/oop");
	let TextMode = require("./text").Mode;
	let URCLHighlightRules = require("ace/mode/urcl_highlight_rules").URCLHighlightRules;
	
	let Mode = function()
	{
		this.HighlightRules = URCLHighlightRules;
		this.$behaviour = this.$defaultBehaviour;
	};
	oop.inherits(Mode, TextMode);
	
	(function()
	{
		this.lineCommentStart = ["//"];
		this.$id = "ace/mode/urcl";
	}).call(Mode.prototype);
	
	exports.Mode = Mode;
});