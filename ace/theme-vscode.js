ace.define("ace/theme/vscode", ["require", "exports", "module", "ace/lib/dom"], function(require, exports, module)
{
	exports.isDark = true;
	exports.cssClass = "ace-vscode";
	exports.cssText = ""; //External css file is used instead of string.
	
	require("../lib/dom").importCssString(exports.cssText, exports.cssClass);
});

(function()
{
	window.require(["ace/theme/vscode"], function(self)
	{
		if (typeof module == "object" && typeof exports == "object" && module)
		{
			module.exports = self;
		}
	});
})();