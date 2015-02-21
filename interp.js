"use strict";

/* Repurposing the jslinux CPU as an x86 interpreter */
function runX86(program, regs, memsize)
{
    // Ensure termination at program end
    program.push(0xF4);
    // Read program
    var len = program.length;
    var binary = new ArrayBuffer(len * 8);
    var binary_bytes = new Uint8Array(binary);
    var i;
    for (i=0; i < len; i++) {
      binary_bytes[i] = program[i];
    }

    // Init CPU
    var cpu = new CPU_X86();

    // memory size (in KB)
    cpu.phys_mem_resize(1024 * memsize);

    // start at 0 because why not :)
    var start_addr = 0;
    cpu.load_binary(binary, start_addr);

    cpu.eip = start_addr;

    // arguments
    for (i=0; i < regs.length && i < 8; i++) {
      cpu.regs[i] = regs[i];
    }

    // Maximum runtime
    var Ncycles = 10000000;

    // Run the program!
    var exit_status = cpu.exec(Ncycles);

    // Check for HALT code (opcode F4)
    if (exit_status !== 257) {
      return null;
    }

    return cpu.regs;
}

/* For working with user input */
function stringToBytes(str) {
  var newBytes = [];
  // Remove comments
  str = str.replace(/;.*$/gm, '');
  // Remove whitespace
  str = str.replace(/\s*/g, '');
  var len = str.length;
  // Make sure length even
  if (len & 1)
    return null;
  var i, b;
  for (i=0; i<len; i+=2) {
    b = Number('0x' + str.substr(i,2));
    if (isNaN(b))
      return null;
    newBytes.push(b)
  }
  return newBytes;
}

