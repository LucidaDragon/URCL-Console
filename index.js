function ValidateSource(runAfterCompile)
{
	const lines = CodeEditor.getValue().split("\n");
	const compiled = VirtualDevice.Compile(lines.join("\n"));

	let errorMap = {};
	for (let i = 0; i < compiled.Errors.length; i++) errorMap[compiled.Errors[i].Line] = compiled.Errors[i].Message;
	let warnMap = {};
	for (let i = 0; i < compiled.Warnings.length; i++) warnMap[compiled.Warnings[i].Line] = compiled.Warnings[i].Message;

	let annotations = [];
	for (let i = 0; i < lines.length; i++)
	{
		if (errorMap[i])
		{
			annotations.push({
				row: i,
				column: 0,
				text: errorMap[i],
				type: "error"
			});
		}
		else if (warnMap[i])
		{
			annotations.push({
				row: i,
				column: 0,
				text: warnMap[i],
				type: "warning"
			});
		}
	}
	CodeEditor.session.setAnnotations(annotations);

	if (runAfterCompile && compiled.Valid)
	{
		VirtualDevice.Execute(VirtualDevice.CreateContext(compiled.Program, VirtualDevice.API.Ports));
	}
}

function SetPopup(visible)
{
	if (visible)
	{
		document.getElementById("popup").className = "OpenPopup";
	}
	else
	{
		document.getElementById("popup").className = "ClosedPopup";
	}
}

document.addEventListener("vdapiloaded", function()
{
	const source = new URL(window.location).searchParams.get("source");

	let lines;
	if (source)
	{
		lines = source.split("\n");
	}
	else
	{
		lines = [
			"// Demo Program - Fill the screen with a color.",
			"imm R1, 0         //Set Index",
			"in R2, %X         //Get Display Width",
			"in R3, %Y         //Get Display Height",
			"mlt R4, R2, R3    //Determine Total Pixels",
			".loop             //Begin Loop",
			"mod R5, R1, R2    //X From Index",
			"div R6, R1, R3    //Y From Index",
			"out %X, R5        //Set Draw X",
			"out %Y, R6        //Set Draw Y",
			"out %COLOR, 11    //Set Pixel With Color 11",
			"add R1, R1, 1     //Increment Index",
			"brl .loop, R1, R4 //Loop Until Done",
			"hlt"
		];
	}

	CodeEditor.setValue(lines.join("\n"));
	CodeEditor.clearSelection();
	CodeEditor.moveCursorTo(lines.length, lines[lines.length - 1].length);
	
	ValidateSource(source ? true : false);
});