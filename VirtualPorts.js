document.addEventListener("loadports", function()
{
	if (!VirtualDevice.API.Ports) VirtualDevice.API.Ports = {};

	VirtualDevice.API.Ports["%RNG"] = VirtualDevice.CreatePort(function() { return Math.floor(Math.random() * 0xFFFFFFFF) | 0; }, function(value) {});
	VirtualDevice.API.Ports["%WAIT"] = VirtualDevice.CreatePort(function()
	{
		return ((new Date() - VirtualDevice.Drivers.WAITTARGET) >= 0) ? 1 : 0;
	}, function(value)
	{
		VirtualDevice.Drivers.WAITTARGET = new Date();
		VirtualDevice.Drivers.WAITTARGET.setMilliseconds(VirtualDevice.Drivers.WAITTARGET.getMilliseconds() + value);
	});
	VirtualDevice.API.Ports["%TEXT"] = VirtualDevice.CreatePort(function() { return 0; }, function(value)
	{
		if (!VirtualDevice.Drivers.TEXTBUFFER) VirtualDevice.Drivers.TEXTBUFFER = "";
		if (value === 10)
		{
			console.log(VirtualDevice.Drivers.TEXTBUFFER);
			VirtualDevice.Drivers.TEXTBUFFER = "";
		}
		else
		{
			VirtualDevice.Drivers.TEXTBUFFER += String.fromCharCode(value);
		}
	});
});