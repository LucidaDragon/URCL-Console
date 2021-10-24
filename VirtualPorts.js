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
});