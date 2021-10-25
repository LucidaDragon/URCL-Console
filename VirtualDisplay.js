function CreateVirtualDisplay(canvasId)
{
	const loadPortsEvent = new Event("loadports");
	const vdApiLoadedEvent = new Event("vdapiloaded");

	window.addEventListener("load", function(e)
	{
		const Width = 128;
		const DPP = 4;
		const Viewport = document.getElementById(canvasId);
		Viewport.width = Width * DPP;
		Viewport.height = Width * DPP;

		const GL = Viewport.getContext("webgl", { antialias: false });
		if (GL === null)
		{
			alert("WebGL is required to run this web application.");
			return;
		}

		const Colors = [ 0x000000, 0x1D2B53, 0x7E2553, 0x008751, 0xAB5236, 0x5F574F, 0xC2C3C7, 0xFFF1E8, 0xFF004D, 0xFFA300, 0xFFEC27, 0x00E436, 0x29ADFF, 0x83769C, 0xFF77A8, 0xFFCCAA ];

		const ShaderProgram = GL.createProgram();
		{
			function ColorTable(colors)
			{
				if (colors.length === 0) return "gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);";

				let result = "";

				for (let i = 0; i < colors.length; i++)
				{
					let r = ((colors[i] >> 16) & 0xFF) / 255;
					if (r === 0) r = "0.0";
					else if (r === 1) r = "1.0";

					let g = ((colors[i] >> 8) & 0xFF) / 255;
					if (g === 0) g = "0.0";
					else if (g === 1) g = "1.0";
					
					let b = (colors[i] & 0xFF) / 255;
					if (b === 0) b = "0.0";
					else if (b === 1) b = "1.0";

					if (i == 0) result += "if";
					else result += "else if";

					result += " (UV.x >= " + i + ".0 && UV.x < " + (i + 1) + ".0) { gl_FragColor = vec4(" + r + ", " + g + ", " + b + ", 1.0); } "
				}

				result += "else { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); }"

				return result;
			}

			const VertexShader = "attribute vec2 vertex; attribute vec2 inUV; varying highp vec2 UV; void main() { gl_Position = vec4(vec3(vec2(1.0, -1.0) * ((vertex / (" + Width + ".0 / 2.0)) - 1.0), 0.0), 1.0); UV = inUV; }";
			const FragmentShader = "varying highp vec2 UV; void main() { " + ColorTable(Colors) + " }";

			function CompileShader(type, shader)
			{
				const result = GL.createShader(type);
				GL.shaderSource(result, shader);
				GL.compileShader(result);

				if (!GL.getShaderParameter(result, GL.COMPILE_STATUS))
				{
					console.error("Shader Compile-Time Error: " + GL.getShaderInfoLog(result));
					GL.deleteShader(result);
					return;
				}

				GL.attachShader(ShaderProgram, result);
			}

			CompileShader(GL.VERTEX_SHADER, VertexShader);
			CompileShader(GL.FRAGMENT_SHADER, FragmentShader);
			GL.linkProgram(ShaderProgram);

			if (!GL.getProgramParameter(ShaderProgram, GL.LINK_STATUS))
			{
				console.error("Shader Link-Time Error: " + GL.getProgramInfoLog(ShaderProgram));
				return;
			}

			GL.useProgram(ShaderProgram);
		}

		let verticies = GL.createBuffer();
		{
			function CreatePixels(width)
			{
				function CreatePixel(x, y)
				{
					return [
						x, y,
						x, y + 1,
						x + 1, y,
						
						x, y + 1,
						x + 1, y + 1,
						x + 1, y
					];
				}

				let result = [];

				for (let y = 0; y < width; y++)
				{
					for (let x = 0; x < width; x++)
					{
						const verts = CreatePixel(x, y);

						for (let i = 0; i < verts.length; i++) result.push(verts[i]);
					}
				}

				return result;
			}

			GL.bindBuffer(GL.ARRAY_BUFFER, verticies);
			GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(CreatePixels(Width)), GL.STATIC_DRAW);
		}

		let uvs = GL.createBuffer();
		{
			function CreatePixels(width)
			{
				let result = [];

				for (let y = 0; y < width; y++)
				{
					for (let x = 0; x < width; x++)
					{
						result.push(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
					}
				}

				return result;
			}

			GL.bindBuffer(GL.ARRAY_BUFFER, uvs);
			GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(CreatePixels(Width)), GL.STATIC_DRAW);
		}

		GL.clearColor(0, 0, 0, 1);
		GL.clear(GL.COLOR_BUFFER_BIT);

		{
			const VertexAttribute = GL.getAttribLocation(ShaderProgram, "vertex");
			GL.bindBuffer(GL.ARRAY_BUFFER, verticies);
			GL.vertexAttribPointer(VertexAttribute, 2, GL.FLOAT, false, 0, 0);
			GL.enableVertexAttribArray(VertexAttribute);
		}

		{
			const UVAttribute = GL.getAttribLocation(ShaderProgram, "inUV");
			GL.bindBuffer(GL.ARRAY_BUFFER, uvs);
			GL.vertexAttribPointer(UVAttribute, 2, GL.FLOAT, false, 0, 0);
			GL.enableVertexAttribArray(UVAttribute);
		}

		GL.viewport(0, 0, Width * DPP, Width * DPP);

		if (!VirtualDevice.API) VirtualDevice.API = {};

		VirtualDevice.API.SetPixels = function(x, y, colors)
		{
			x = Math.floor(Math.max(0, Math.min(Width - 1, x)));
			y = Math.floor(Math.max(0, Math.min(Width - 1, y)));

			let buffer = [];
			for (let i = 0; i < colors.length; i++)
			{
				const c = Math.floor(Math.max(0, Math.min(Colors.length - 1, colors[i])));
				buffer.push(c, 0, c, 0, c, 0, c, 0, c, 0, c, 0);
			}

			GL.bindBuffer(GL.ARRAY_BUFFER, uvs);
			GL.bufferSubData(GL.ARRAY_BUFFER, ((y * Width) + x) * 48, new Float32Array(buffer));
		};

		VirtualDevice.API.Draw = function()
		{
			GL.drawArrays(GL.TRIANGLES, 0, Width * Width * 6);
		};

		for (let i = 0; i < Width * Width; i++)
		{
			const x = i % Width;
			const y = Math.floor(i / Width);
			VirtualDevice.API.SetPixels(x, y, [((i % (Width + 1)) / Width) * 16]);
		}

		VirtualDevice.API.Draw();

		if (!VirtualDevice.API.Ports) VirtualDevice.API.Ports = {}
		VirtualDevice.API.Ports["%X"] = VirtualDevice.CreatePort(function() { return Width; }, function(value) { VirtualDevice.Drivers.DRAWX = value; });
		VirtualDevice.API.Ports["%Y"] = VirtualDevice.CreatePort(function() { return Width; }, function(value) { VirtualDevice.Drivers.DRAWY = value; });
		VirtualDevice.API.Ports["%COLOR"] = VirtualDevice.CreatePort(function() { return 0; }, function(value) { VirtualDevice.API.SetPixels(VirtualDevice.Drivers.DRAWX || 0, VirtualDevice.Drivers.DRAWY || 0, [value]); });
		VirtualDevice.API.Ports["%BUFFER"] = VirtualDevice.CreatePort(function() { return 1; }, function(value)
		{
			switch (value)
			{
				case 0:
					VirtualDevice.API.Draw();
					VirtualDevice.Drivers.ISBUFFERED = false;
					break;
				case 1:
					VirtualDevice.Drivers.ISBUFFERED = true;
					break;
				case 2:
					VirtualDevice.API.Draw();
					VirtualDevice.Drivers.ISBUFFERED = true;
					break;
			}
		});

		document.dispatchEvent(loadPortsEvent);
		document.dispatchEvent(vdApiLoadedEvent);
	});
}