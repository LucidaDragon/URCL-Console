URCL = {};

URCL.CreateState = function()
{
	return { IP: 0, Memory: {}, Registers: {}, Exit: false, Yield: false, Break: false, Ports: {} };
}

URCL.CreatePort = function(getter, setter)
{
	return function(value)
	{
		if (value === undefined)
		{
			return getter();
		}
		else
		{
			setter(value);
		}
	};
}

URCL.Operators = {
	HLT: {
		T: "Op",
		F: function(state)
		{
			state.Exit = true;
		}
	},
	ADD: {
		T: "L2OpS1",
		F: function(state)
		{
			state.O = state.A + state.B;
		}
	},
	SUB: {
		T: "L2OpS1",
		F: function(state)
		{
			state.O = state.A - state.B;
		}
	},
	MLT: {
		T: "L2OpS1",
		F: function(state)
		{
			state.O = state.A * state.B;
		}
	},
	DIV: {
		T: "L2OpS1",
		F: function(state)
		{
			state.O = state.A / state.B;
		}
	},
	MOD: {
		T: "L2OpS1",
		F: function(state)
		{
			state.O = state.A % state.B;
		}
	},
	AND: {
		T: "L2OpS1",
		F: function(state)
		{
			state.O = state.A & state.B;
		}
	},
	OR: {
		T: "L2OpS1",
		F: function(state)
		{
			state.O = state.A | state.B;
		}
	},
	XOR: {
		T: "L2OpS1",
		F: function(state)
		{
			state.O = state.A ^ state.B;
		}
	},
	BSL: {
		T: "L2OpS1",
		F: function(state)
		{
			state.O = state.A << state.B;
		}
	},
	BSR: {
		T: "L2OpS1",
		F: function(state)
		{
			state.O = state.A >> state.B;
		}
	},
	LSH: {
		T: "L1OpS1",
		F: function(state)
		{
			state.O = state.A << 1;
		}
	},
	RSH: {
		T: "L1OpS1",
		F: function(state)
		{
			state.O = state.A >> 1;
		}
	},
	INC: {
		T: "L1OpS1",
		F: function(state)
		{
			state.O = state.A + 1;
		}
	},
	DEC: {
		T: "L1OpS1",
		F: function(state)
		{
			state.O = state.A - 1;
		}
	},
	NOT: {
		T: "L1OpS1",
		F: function(state)
		{
			state.O = ~state.A;
		}
	},
	NEG: {
		T: "L1OpS1",
		F: function(state)
		{
			state.O = -state.A;
		}
	},
	MOV: {
		T: "L1OpS1",
		F: function(state)
		{
			state.O = state.A;
		}
	},
	IMM: {
		T: "L1OpS1",
		F: function(state)
		{
			state.O = state.A;
		}
	},
	LOD: {
		T: "L1OpS1",
		F: function(state)
		{
			state.O = state.Memory[(state.A + 0x100000000) & 0xFFFFFFFF] || 0;
		}
	},
	STR: {
		T: "L2Op",
		F: function(state)
		{
			state.Memory[(state.A + 0x100000000) & 0xFFFFFFFF] = (state.B + 0x100000000) & 0xFFFFFFFF;
		}
	},
	IN: {
		T: "P1OpS1",
		F: function(state)
		{
			if (state.O in state.Ports)
			{
				state.O = state.Ports[state.O]();
			}
			else
			{
				state.O = 0;
			}
		}
	},
	OUT: {
		T: "L1OpP1",
		F: function(state)
		{
			if (state.O in state.Ports)
			{
				state.Ports[state.O](state.A);
			}
		}
	},
	JMP: {
		T: "L1Op",
		F: function(state)
		{
			state.IP = state.A - 1;
		}
	},
	BRZ: {
		T: "L2Op",
		F: function(state)
		{
			if (state.B === 0) state.IP = state.A - 1;
		}
	},
	BNZ: {
		T: "L2Op",
		F: function(state)
		{
			if (state.B !== 0) state.IP = state.A - 1;
		}
	},
	BRE: {
		T: "L3Op",
		F: function(state)
		{
			if (state.A === state.B) state.IP = state.O - 1;
		}
	},
	BNE: {
		T: "L3Op",
		F: function(state)
		{
			if (state.A !== state.B) state.IP = state.O - 1;
		}
	},
	BRL: {
		T: "L3Op",
		F: function(state)
		{
			if (state.A < state.B) state.IP = state.O - 1;
		}
	},
	BRG: {
		T: "L3Op",
		F: function(state)
		{
			if (state.A > state.B) state.IP = state.O - 1;
		}
	},
	BLE: {
		T: "L3Op",
		F: function(state)
		{
			if (state.A <= state.B) state.IP = state.O - 1;
		}
	},
	BGE: {
		T: "L3Op",
		F: function(state)
		{
			if (state.A >= state.B) state.IP = state.O - 1;
		}
	},
	PSH: {
		T: "L1Op",
		F: function(state)
		{
			const sp = (((state.Registers["SP"] || 0) - 1) + 0x100000000) & 0xFFFFFFFF;
			state.Memory[sp] = (state.A + 0x100000000) & 0xFFFFFFFF;
			state.Registers["SP"] = sp;
		}
	},
	POP: {
		T: "OpS1",
		F: function(state)
		{
			state.O = state.Memory[state.Registers["SP"] || 0];
			state.Registers["SP"] = ((state.Registers["SP"] + 1) + 0x100000000) & 0xFFFFFFFF;
		}
	},
	CAL: {
		T: "L1Op",
		F: function(state)
		{
			const sp = (((state.Registers["SP"] || 0) - 1) + 0x100000000) & 0xFFFFFFFF;
			state.Memory[sp] = (state.IP + 0x100000000) & 0xFFFFFFFF;
			state.Registers["SP"] = sp;
			state.IP = ((state.A - 1) + 0x100000000) & 0xFFFFFFFF;
		}
	},
	RET: {
		T: "Op",
		F: function(state)
		{
			state.IP = state.Memory[state.Registers["SP"] || 0];
			state.Registers["SP"] = ((state.Registers["SP"] + 1) + 0x100000000) & 0xFFFFFFFF;
		}
	},
	YIELD: {
		T: "Op",
		F: function(state)
		{
			state.Yield = true;
		}
	}
};

URCL.Compile = function(source)
{
	let result = { Errors: [], Warnings: [], Program: [] };
	result.error = function(message)
	{
		result.Errors.push({ Message: message, Line: result.Line });
	};
	result.warn = function(message)
	{
		result.Warnings.push({ Message: message, Line: result.Line });
	};

	function IsString(value)
	{
		return typeof value === "string" || value instanceof String;
	}

	function Validate(array, allowPorts)
	{
		for (let i = 0; i < array.length; i++) if (array[i] === undefined || (!allowPorts && IsString(array[i]) && array[i].startsWith("%"))) return false;
		return true;
	}

	function GetLoad(target, type)
	{
		const LoadA = {
			REG: function(state, source)
			{
				state.A = state.Registers[source] || 0;
			},
			IMM: function(state, source)
			{
				state.A = source;
			},
			ZERO: function(state, source)
			{
				state.A = 0;
			},
			PORT: function(state, source)
			{
				state.A = source;
			}
		};

		const LoadB = {
			REG: function(state, source)
			{
				state.B = state.Registers[source] || 0;
			},
			IMM: function(state, source)
			{
				state.B = source;
			},
			ZERO: function(state, source)
			{
				state.B = 0;
			},
			PORT: function(state, source)
			{
				state.B = source;
			}
		};

		const LoadO = {
			REG: function(state, source)
			{
				state.O = state.Registers[source] || 0;
			},
			IMM: function(state, source)
			{
				state.O = source;
			},
			ZERO: function(state, source)
			{
				state.O = 0;
			},
			PORT: function(state, source)
			{
				state.O = source;
			}
		};

		let load;
		switch (target)
		{
			case "A":
				load = LoadA[type];
				break;
			case "B":
				load = LoadB[type];
				break;
			case "O":
				load = LoadO[type];
				break;
			default:
				result.error("URCL Compiler Bug: Unknown load target. \"" + target + "\"");
				return null;
		}

		if (load === undefined)
		{
			result.error("Invalid URCL operand type: Expected one of " + JSON.stringify(Object.keys(LoadA)) + " but got \"" + type + "\"");
			return null;
		}
		else
		{
			return load;
		}
	}

	function GetStore(type)
	{
		const Store = {
			REG: function(state, target)
			{
				state.Registers[target] = ((state.O || 0) + 0x100000000) & 0xFFFFFFFF;
			},
			ZERO: function(state, target) {}
		};

		let store = Store[type];

		if (store === undefined)
		{
			result.error("Invalid URCL operand type: Expected one of " + JSON.stringify(Object.keys(Store)) + " but got \"" + type + "\"");
			return null;
		}
		else
		{
			return store;
		}
	}

	const OpTypes = {
		L2OpS1: function(op, o, a, b)
		{
			if (!Validate([o, a, b]))
			{
				result.error("Invalid URCL Operands: Expected \"" + op + " OUT IN IN\".");
				return null;
			}

			const l0 = a.Value;
			const l1 = b.Value;
			const s0 = o.Value;
			const f0 = GetLoad("A", a.Type);
			const f1 = GetLoad("B", b.Type);
			const f2 = URCL.Operators[op].F;
			const f3 = GetStore(o.Type);

			return function(state)
			{
				f0(state, l0);
				f1(state, l1);
				f2(state);
				f3(state, s0);
			};
		},
		L1OpS1: function(op, o, a)
		{
			if (!Validate([o, a]))
			{
				result.error("Invalid URCL Operands: Expected \"" + op + " OUT IN\".");
				return null;
			}

			const l0 = a.Value;
			const s0 = o.Value;
			const f0 = GetLoad("A", a.Type);
			const f1 = URCL.Operators[op].F;
			const f2 = GetStore(o.Type);

			return function(state)
			{
				f0(state, l0);
				f1(state);
				f2(state, s0);
			};
		},
		L1Op: function(op, a)
		{
			if (!Validate([a]))
			{
				result.error("Invalid URCL Operands: Expected \"" + op + " IN\".");
				return null;
			}

			const l0 = a.Value;
			const f0 = GetLoad("A", a.Type);
			const f1 = URCL.Operators[op].F;

			return function(state)
			{
				f0(state, l0);
				f1(state);
			};
		},
		L2Op: function(op, a, b)
		{
			if (!Validate([a, b]))
			{
				result.error("Invalid URCL Operands: Expected \"" + op + " IN IN\".");
				return null;
			}

			const l0 = a.Value;
			const l1 = b.Value;
			const f0 = GetLoad("A", a.Type);
			const f1 = GetLoad("B", b.Type);
			const f2 = URCL.Operators[op].F;

			return function(state)
			{
				f0(state, l0);
				f1(state, l1);
				f2(state);
			};
		},
		L3Op: function(op, o, a, b)
		{
			if (!Validate([o, a, b]))
			{
				result.error("Invalid URCL Operands: Expected \"" + op + " IN IN IN\".");
				return null;
			}

			const l0 = a.Value;
			const l1 = b.Value;
			const l2 = o.Value;
			const f0 = GetLoad("A", a.Type);
			const f1 = GetLoad("B", b.Type);
			const f2 = GetLoad("O", o.Type);
			const f3 = URCL.Operators[op].F;

			return function(state)
			{
				f0(state, l0);
				f1(state, l1);
				f2(state, l2);
				f3(state);
			};
		},
		OpS1: function(op, o)
		{
			if (!Validate([o]))
			{
				result.error("Invalid URCL Operands: Expected \"" + op + " OUT\".");
				return null;
			}

			const s0 = o.Value;
			const f0 = URCL.Operators[op].F;
			const f1 = GetStore(o.Type);

			return function(state)
			{
				f0(state);
				f1(state, s0);
			};
		},
		Op: function(op)
		{
			return URCL.Operators[op].F;
		},
		L1OpP1: function(op, p, a)
		{
			if (!(Validate([a]) && Validate([p], true)))
			{
				result.error("Invalid URCL Operands: Expected \"" + op + " OUTPORT IN\".");
				return null;
			}

			const l0 = a.Value;
			const p0 = p.Value;
			const f0 = GetLoad("A", a.Type);
			const f1 = GetLoad("O", p.Type);
			const f2 = URCL.Operators[op].F;

			return function(state)
			{
				f0(state, l0);
				f1(state, p0);
				f2(state);
			};
		},
		P1OpS1: function(op, o, p)
		{
			if (!(Validate([o]) && Validate([p], true)))
			{
				result.error("Invalid URCL Operands: Expected \"" + op + " OUT INPORT\".");
				return null;
			}

			const p0 = p.Value;
			const s0 = o.Value;
			const f0 = GetLoad("O", p.Type);
			const f1 = URCL.Operators[op].F;
			const f2 = GetStore(o.Type);

			return function(state)
			{
				f0(state, p0);
				f1(state);
				f2(state, s0);
			};
		}
	};

	function ParseOperand(operand, labels)
	{
		if (operand === undefined) return undefined;
		if (operand.length === 0)
		{
			result.error("Invalid URCL operand: Empty operand.");
			return null;
		}

		let operandResult = { Type: null, Value: null };

		if ("0123456789".includes(operand[0]))
		{
			const isHex = operand.toUpperCase().startsWith("0X");
			const isBin = operand.toUpperCase().startsWith("0B");
			const filter = isHex ? "0123456789ABCDEFabcdef" : (isBin ? "01" : "0123456789");

			let invalid = false;
			for (let i = 1; i < operand.length; i++)
			{
				if (!(filter.includes(operand[i]) || ((isHex | isBin) && i === 1)))
				{
					invalid = true;
					break;
				}
			}

			operandResult.Type = "IMM";
			operandResult.Value = parseInt((isHex || isBin) ? operand.substr(2, operand.length - 2) : operand, isHex ? 16 : (isBin ? 2 : 10));
			if (isNaN(operandResult.Value) || invalid)
			{
				result.error("Invalid URCL operand: Immediate is invalid. \"" + operand + "\"");
				return null;
			}
		}
		else if (operand[0] === ".")
		{
			operandResult.Type = "IMM";
			operandResult.Value = labels[operand];
			if (operandResult.Value === undefined)
			{
				result.error("Invalid URCL operand: Label is undefined. \"" + operand + "\"");
				return null;
			}
		}
		else if (operand[0] === "%")
		{
			operandResult.Type = "PORT";
			operandResult.Value = operand.toUpperCase();
		}
		else
		{
			operandResult.Type = "REG";
			operandResult.Value = operand.toUpperCase();
			const index = parseInt(operand.substr(1, operand.length - 1));

			if ((operand[0] !== "R" && operand[0] !== "r") || isNaN(index) || index < 0)
			{
				result.warn("URCL warning: Using non-standard register. \"" + operand + "\"");
			}
			else if (operand === "R0")
			{
				operandResult.Type = "ZERO";
				operandResult.Value = 0;
			}
		}

		return operandResult;
	}

	function ParseInstruction(instruction, labels)
	{
		const args = instruction.replace(/\,/g, " ").replace(/\s+/g, " ").split(" ");
		const op = args[0].toUpperCase();
		const arg1 = ParseOperand(args[1], labels);
		const arg2 = ParseOperand(args[2], labels);
		const arg3 = ParseOperand(args[3], labels);
		if (arg1 === null || arg2 === null || arg3 === null) return null;
		const operator = URCL.Operators[op];
		if (operator === undefined)
		{
			result.error("URCL Instruction Error: Undefined instruction. \"" + op + "\"");
			return null;
		}
		const opType = OpTypes[operator.T];
		if (opType === undefined)
		{
			result.error("URCL Compiler Bug: Unknown OpType produced. Consider reporting this error. \"" + opType + "\"");
			return null;
		}
		return opType(op, arg1, arg2, arg3);
	}

	let labels = {};
	const lines = source.split("\n");

	for (let i = 0; i < lines.length; i++)
	{
		let line = lines[i];
		const comment = line.indexOf("//");
		if (comment >= 0) line = line.substr(0, comment);
		line = line.trim();

		if (line.length === 0) continue;

		if (line.startsWith(".") && !line.includes(" "))
		{
			labels[line] = result.Program.length;
		}
		else
		{
			result.Program.push({ Source: line, Line: i });
		}
	}

	let invalid = false;
	for (let i = 0; i < result.Program.length; i++)
	{
		result.Line = result.Program[i].Line;
		const inst = ParseInstruction(result.Program[i].Source, labels);
		
		if (inst === null)
		{
			invalid = true;
		}
		else
		{
			result.Program[i] = inst;
		}
	}
	result.Line = undefined;

	result.Valid = result.Errors.length === 0 && !invalid;

	return result;
};