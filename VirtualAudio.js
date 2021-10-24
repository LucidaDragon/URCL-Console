document.addEventListener("loadports", function()
{
	const NoteTypes = {
		SINE: 0,
		SAW: 1,
		TRIANGLE: 2,
		SQUARE: 3
	};
	const context = new AudioContext();

	function PlayFloats(sample)
	{
		const buffer = context.createBuffer(1, sample.length, context.sampleRate);
		buffer.copyToChannel(sample, 0);

		const source = context.createBufferSource();
		source.buffer = buffer;
		source.connect(context.destination);
		source.start(0);
	}

	if (!VirtualDevice.API.Ports) VirtualDevice.API.Ports = {};

	VirtualDevice.API.Ports["%NOTE"] = VirtualDevice.CreatePort(function()
	{
		return VirtualDevice.Drivers.NOTEPITCH || 0;
	}, function(value)
	{
		VirtualDevice.Drivers.NOTEPITCH = value;
	});

	VirtualDevice.API.Ports["%INSTR"] = VirtualDevice.CreatePort(function()
	{
		return VirtualDevice.Drivers.NOTETYPE || 0;
	}, function(value)
	{
		VirtualDevice.Drivers.NOTETYPE = value;
	});

	VirtualDevice.API.Ports["%NLEG"] = VirtualDevice.CreatePort(function()
	{
		return 0;
	}, function(value)
	{
		const volume = 0.5;
		const pitch = VirtualDevice.Drivers.NOTEPITCH || 0;
		const type = (VirtualDevice.Drivers.NOTETYPE || 0) | 0;
		const length = (value / 10) * context.sampleRate;

		function PlayWave(f)
		{
			let sample = new Float32Array(length);
			for (let i = 0; i < length; i++) sample[i] = f(i / context.sampleRate);
			PlayFloats(sample);
		}

		switch (type)
		{
			case NoteTypes.SINE:
				PlayWave(function(x) { return Math.sin(x * (Math.PI * 2) * pitch) * volume; });
				break;
			case NoteTypes.SAW:
				PlayWave(function(x) { return (((-(x * pitch) % 1) * 2) - 1) * volume; });
				break;
			case NoteTypes.TRIANGLE:
				PlayWave(function(x) { return ((Math.abs((((x * pitch) - 0.25) % 1) - 0.5) * 4) - 1) * volume; });
				break;
			case NoteTypes.SQUARE:
				PlayWave(function(x) { return ((Math.round((x * pitch) % 1) * 2) - 1) * volume; });
				break;
		}
	});
});