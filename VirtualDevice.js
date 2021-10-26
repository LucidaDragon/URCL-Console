VirtualDevice = {};
VirtualDevice.Contexts = [];
VirtualDevice.Substeps = 1000000;
VirtualDevice.Drivers = {};
VirtualDevice.Active = false;
VirtualDevice.NextPID = 0;
VirtualDevice.CreatePort = URCL.CreatePort;
VirtualDevice.CreateState = URCL.CreateState;
VirtualDevice.Compile = URCL.Compile;

VirtualDevice.NewPID = function()
{
	const result = VirtualDevice.NextPID;
	VirtualDevice.NextPID = (result + 1) & 0xFFFFFFFF;
	return result;
};

VirtualDevice.CreateContext = function(program, ports)
{
	if (ports === undefined || ports === null) ports = {};

	let result = {};
	result.PID = VirtualDevice.NewPID();
	result.Program = program;
	result.State = VirtualDevice.CreateState();
	result.State.Ports = ports;
	return result;
};

VirtualDevice.ExecuteStep = function(context)
{
	try
	{
		context.Program[context.State.IP](context.State);
		context.State.IP++;
		return !(context.State.Exit || context.State.Yield || context.State.Break);
	}
	catch (error)
	{
		console.error("Error during execution: " + error);
		console.error(context);
		context.State.Exit = true;
		return false;
	}
};

VirtualDevice.ExecuteContexts = function()
{
	VirtualDevice.Active = true;

	for (let i = 0; i < VirtualDevice.Contexts.length; i++)
	{
		const context = VirtualDevice.Contexts[i];

		if (!context.State.Break && !context.State.Exit)
		{
			for (let j = 0; j < VirtualDevice.Substeps; j++)
			{
				if (!VirtualDevice.ExecuteStep(context))
				{
					if (context.State.Exit)
					{
						console.log("Context " + context.PID + " finished in " + (new Date() - context.StartTime) + "ms");
						VirtualDevice.Contexts.splice(i, 1);
						i--;
					}
					else
					{
						context.State.Yield = false;
					}
					break;
				}
			}
		}
	}

	if (VirtualDevice.API && VirtualDevice.API.Draw && !VirtualDevice.Drivers.ISBUFFERED)
	{
		VirtualDevice.API.Draw();
	}

	if (VirtualDevice.Contexts.length === 0)
	{
		VirtualDevice.Active = false;
		console.log("VM is now idle");
	}
	else
	{
		setTimeout(VirtualDevice.ExecuteContexts, 0);
	}
};

VirtualDevice.Execute = function(context)
{
	if (!VirtualDevice.Contexts.includes(context))
	{
		context.StartTime = new Date();
		VirtualDevice.Contexts.push(context);

		if (!VirtualDevice.Active)
		{
			VirtualDevice.Active = true;
			setTimeout(VirtualDevice.ExecuteContexts, 0);
		}

		console.log(VirtualDevice.Contexts.length + " active contexts");
	}
};

VirtualDevice.CompileAndExecute = function(source)
{
	const compiled = VirtualDevice.Compile(source);
	if (!compiled.Valid) return false;
	VirtualDevice.Execute(VirtualDevice.CreateContext(compiled.Program));
	return true;
};

VirtualDevice.KillAll = function()
{
	VirtualDevice.Contexts = [];
};