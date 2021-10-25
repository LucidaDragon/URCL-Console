document.addEventListener("loadports", function()
{
	const Keys = {
		Escape: "KEYESC",
		Digit0: "KEY0",
		Digit1: "KEY1",
		Digit2: "KEY2",
		Digit3: "KEY3",
		Digit4: "KEY4",
		Digit5: "KEY5",
		Digit6: "KEY6",
		Digit7: "KEY7",
		Digit8: "KEY8",
		Digit9: "KEY9",
		KeyA: "KEYA",
		KeyB: "KEYB",
		KeyC: "KEYC",
		KeyD: "KEYD",
		KeyE: "KEYE",
		KeyF: "KEYF",
		KeyG: "KEYG",
		KeyH: "KEYH",
		KeyI: "KEYI",
		KeyJ: "KEYJ",
		KeyK: "KEYK",
		KeyL: "KEYL",
		KeyM: "KEYM",
		KeyN: "KEYN",
		KeyO: "KEYO",
		KeyP: "KEYP",
		KeyQ: "KEYQ",
		KeyR: "KEYR",
		KeyS: "KEYS",
		KeyT: "KEYT",
		KeyU: "KEYU",
		KeyV: "KEYV",
		KeyW: "KEYW",
		KeyX: "KEYX",
		KeyY: "KEYY",
		KeyZ: "KEYZ",
		ShiftLeft: "KEYSHIFT",
		ShiftRight: "KEYSHIFT",
		ControlLeft: "KEYCONTROL",
		ControlRight: "KEYCONTROL",
		AltLeft: "KEYALT",
		AltRight: "KEYALT",
		Backspace: "KEYBACKSPACE",
		Tab: "KEYTAB",
		Enter: "KEYENTER",
		BracketLeft: "KEYLEFTPAREN",
		BracketRight: "KEYRIGHRPAREN",
		Semicolon: "KEYSEMICOLON",
		Quote: "KEYQUOTE",
		Comma: "KEYCOMMA",
		Period: "KEYPERIOD",
		Slash: "KEYSLASH",
		Backslash: "KEYBACKSLASH",
		Space: "KEYSPACE"
	};

	let KeyStates = {};

	if (!VirtualDevice.API.Ports) VirtualDevice.API.Ports = {};

	function CreateKeyPort(portName)
	{
		VirtualDevice.API.Ports["%" + portName] = VirtualDevice.CreatePort(function()
		{
			return KeyStates[portName] ? 1 : 0;
		}, function(value) {});
	}

	{
		const jsKeys = Object.keys(Keys);

		for (let i = 0; i < jsKeys.length; i++)
		{
			CreateKeyPort(Keys[jsKeys[i]]);
		}

		console.log(VirtualDevice.API.Ports);
	}

	document.addEventListener("keydown", function(event)
	{
		if (event.code in Keys) KeyStates[Keys[event.code]] = true;
	});

	document.addEventListener("keyup", function(event)
	{
		if (event.code in Keys) KeyStates[Keys[event.code]] = false;
	});
});