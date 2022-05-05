// CURSE compiler
// A very, very bad language compiler.
// Written in Node.js

// Basic Curse information

const compName = "Curse Compiler 1.0.0"
const url      = "https://github.com/nbitzz/curse"

// CLI colors

const fs = require("fs")

color = {
    Reset : "\x1b[0m",
    Bold : "\x1b[1m",
    Dim : "\x1b[2m",
    Underscore : "\x1b[4m",
    Blink : "\x1b[5m",
    Reverse : "\x1b[7m",
    Hidden : "\x1b[8m",

    FgBlack : "\x1b[30m",
    FgRed : "\x1b[31m",
    FgGreen : "\x1b[32m",
    FgYellow : "\x1b[33m",
    FgBlue : "\x1b[34m",
    FgMagenta : "\x1b[35m",
    FgCyan : "\x1b[36m",
    FgWhite : "\x1b[37m",

    BgBlack : "\x1b[40m",
    BgRed : "\x1b[41m",
    BgGreen : "\x1b[42m",
    BgYellow : "\x1b[43m",
    BgBlue : "\x1b[44m",
    BgMagenta : "\x1b[45m",
    BgCyan : "\x1b[46m",
    BgWhite : "\x1b[47m",

    Header : "\x1b[0m\x1b[47m\x1b[30m",

}

// CLI

let runArgs = process.argv.slice(2)
if (runArgs.length <= 0) {
    console.log(`${color.Header}    ${compName}    ${color.Reset}
${color.FgYellow}${url}${color.Reset}
${color.FgGreen}on Node.js ${color.Bold}${process.version}${color.Reset}
Run ${color.Bold}node curse help${color.Reset} for more information.${color.Reset}`)

} else {
    switch(runArgs[0]) {
        case "help":
            console.log(`
                ${color.Header}curse compile <INPUT> [OUTPUT] [MemSize]${color.Reset}
                curse compile will compile the code from INPUT to JS and output it to OUTPUT.
                If no OUTPUT is specified, the compiled code will be printed to console.
                Use run as output to run the script automatically after compiling instead.
                Use con as output to print the script to console.
                Set MemSize to the memory array size. Default 200.

                ${color.Header}curse lang [cmd]${color.Reset}
                Learn how to use the Curse language.

                ${color.Header}curse help${color.Reset}
                Shows this screen.

                ${color.Header}curse char${color.Reset}
                Shows a character table, consisting of 256 characters.

                ${color.Header}curse arrstr [strings, separated by |s]${color.Reset}
                A simple utility for writing an array of string characters to memory.
                New strings in this array will begin with →, or N8594.
                Returns Curse code that writes all of the string characters to memory.

                ${color.Header}curse highlight <INPUT>${color.Reset}
                Prints a syntax highlighted version of the file to console.
            `)
        break
        case "arrstr":
            runArgs.splice(0,1)
            let ccode = []
            runArgs.join(" ").split("|").forEach((a,l) => {
                Array.from(a).forEach((v,x) => {
                    ccode.push("set N"+v.charCodeAt(0).toString()+" ; "+v+"\nadd N1,CP ; Increment cursor position")
                })
                ccode.push("set N8594 ; Next in array\nadd N1,CP ; Increment cursor position")
            })
            ccode.push("cur N0")
            console.log(ccode.join("\n"))
        break
        case "char":
            for (let i = 0; i < 256; i++) {
                console.log(`${color.Header}${String.fromCharCode(i)}${color.Reset} N${i}`)
            }
        break
        case "compile":
            
            // Read file
            if (!runArgs[1]) {
                console.log(`${color.FgRed}No input file specified ${color.Reset}`)
                console.log(`Please specify an input file to compile.`)
                return
            }
            console.log(`${color.Header}                                                     .${color.Reset}`)
            console.log(`Reading file ${runArgs[1]}`)
            fs.readFile(runArgs[1].toString(),(err,buf) => {
                if (err) {
                    console.log(`${color.FgRed}An error occured during file read: ${color.Bold} ${err} ${color.Reset}`)
                    //console.log(`${color.Header}                                                     ${color.Reset}`)
                    return
                }
                let str = buf.toString()
                console.log(`${color.FgGreen}File read success, compiling ${color.Bold}${str.split("\n").length}${color.Reset}${color.FgGreen} lines... ${color.Reset}`)
                // Define api stuff
                let MemSize = parseInt(runArgs[2] || "200",10) || 200
                let compiled = [
                    `// File compiled via ${compName}`,
                    "const CURSE_COMPILED_SCRIPT = async function() {",
                    "process.stdout.write('\\n')",
                    "let BA = 0; // Buffer A",
                    "let BB = 0; // Buffer B",
                    "let BC = 0; // Buffer C",
                    "let BD = 0; // Buffer D",
                    "let BE = 0; // Buffer E",
                    "let CP = 0; // Cursor Position",
                    "let Memory = []; // Memory",
                    "// Fill memory",
                    `for (let i = 0; i < ${MemSize}; i++) {Memory.push(0)};`,
                    "// Populate memory with process.argv",
                    "process.argv.slice(2).forEach((v,x) => {Memory[x] = parseInt(v,10) || ({yes:1,no:-1,y:1,n:-1,t:1,f:-1,true:1,false:-1})[v] || v.charCodeAt(1)});"
                ]

                let funcAPI = {
                    compileValue: (v) => {
                        if (!v) {
                            funcAPI.compileFail(`No proper value supplied in compileValue (${v})`)
                        }
                        let tV = v.slice(1)
                        let removeSpacesFor = Array.from("NHI$BCLP")
                        tV.replace(/\r/g,"")
                        if (removeSpacesFor.find(e => e == v.slice(0,1))) {
                        while (tV.endsWith(" ") || tV.endsWith("\r")) {
                            //console.log("..."+tV.endsWith("\r").toString())
                            tV = tV.slice(0,tV.length-1)
                        }
                    }

                        switch(v.slice(0,1)) {
                            case "":
                                return
                            case "N":
                                return parseInt(tV,10)
                            break
                            case "H":
                                return parseInt(tV,16)
                            break
                            case "I":
                                return parseInt(tV,2)
                            break
                            case "$":
                                switch(tV) {
                                    case "rand":
                                        return "Math.random()"
                                    break
                                    default:
                                        funcAPI.compileFail(`Invalid special ${tV}`)
                                }
                            break
                            case "B":
                                if (({A:true,B:true,C:true,D:true,E:true})[tV]) {
                                    return v
                                } else {
                                    funcAPI.compileFail(`Invalid buffer ${tV}`)
                                }
                            break
                            case "C":
                                fs.writeFileSync("testlog.log",`v = "${v}", tV = "${tV}"`)
                                switch(tV) {
                                    case "V":
                                        return "Memory[CP]"
                                    break
                                    case "P":
                                        return "CP"
                                    break
                                    default:
                                    funcAPI.compileFail(`Invalid cursor information type ${v}`)
                                }
                            break
                            case "L":
                                // Logic example:
                                // L=BA BB
                                // Equivalent to
                                // BA == BB
                                let nLS = tV.slice(1)
                                let C1 = funcAPI.compileValue(nLS.split(" ")[0])
                                let C2 = funcAPI.compileValue(nLS.split(" ")[1] || "N0")
                                switch(tV.slice(0,1)) {
                                    case "?":
                                        return `${C1} || ${C2}`
                                    break
                                    case "!":
                                        return `({true:1,false:0})[!${funcAPI.compileValue(nLS)}]`
                                    break
                                    case "&":
                                        return  `${C1} && ${C2}`
                                    break
                                    case "=":
                                        return `${C1} == ${C2}`
                                    break
                                    case ">": 
                                    return `${C1} > ${C2}`
                                    break
                                    case "<": 
                                    return `${C1} < ${C2}`
                                    break
                                }
                            break
                            case "P":
                                if (v == "PS") {
                                    return "LP"  
                                } else {
                                    funcAPI.compileFail(`Invalid value ${v}`)
                                }
                            break
                            default:
                                funcAPI.compileFail(`Invalid value ${v}`)
                            
                        }
                    }
                }

                let compilerFunctions = {
                    nop: {noprepvar:true,action:() => {}},
                    cur: {noprepvar:false,action:(pos) => {
                        compiled.push(`CP = ${pos}`)
                    }},
                    out: {noprepvar:false,action:(value) => {
                        compiled.push(`process.stdout.write(String.fromCharCode(${value || "CP"}));`)
                    }},
                    oun: {noprepvar:false,action:(value) => {
                        compiled.push(`process.stdout.write(${value || "CP"}.toString());`)
                    }},
                    suc: {noprepvar:false,action:(value) => {
                        compiled.push(`if (${value}) {`)
                    }},
                    els: {noprepvar:false,action:() => {
                        compiled.push(`} else {`)
                    }},
                    eli: {noprepvar:false,action:(value) => {
                        compiled.push(`} else if (${value}) {`)
                    }},
                    cls: {noprepvar:true,action:() => {
                        compiled.push(`};`)
                    }},
                    clb: {noprepvar:true,action:() => {
                        compiled.push(`AA,AB,AC,AD,AE=0,0,0,0,0`)
                    }},
                    clr: {noprepvar:true,action:(value) => {
                        compiled.push(`Memory = [];for (let i = 0; i < ${MemSize}; i++) {Memory.push(0)};`)
                    }},
                    rep: {noprepvar:false,action:(value) => {
                        compiled.push(`for (let LP = 1; LP < ${value}+1; LP++) {`)
                    }},
                    whl: {noprepvar:false,action:(value) => {
                        compiled.push(`while (${value}) {`)
                    }},
                    add: {noprepvar:false,action:(v2,value) => {
                        compiled.push(`${value || "Memory[CP]"} += ${v2}`)
                    }},
                    sub: {noprepvar:false,action:(v2,value) => {
                        compiled.push(`${value || "Memory[CP]"} -= ${v2}`)
                    }},
                    mul: {noprepvar:false,action:(v2,value) => {
                        compiled.push(`${value || "Memory[CP]"} *= ${v2}`)
                    }},
                    div: {noprepvar:false,action:(v2,value) => {
                        compiled.push(`${value || "Memory[CP]"} /= ${v2}`)
                    }},
                    mod: {noprepvar:false,action:(v2,value) => {
                        compiled.push(`${value || "Memory[CP]"} %= ${v2}`)
                    }},
                    flr: {noprepvar:false,action:(value) => {
                        compiled.push(`${value || "Memory[CP]"} = Math.floor(${value || "Memory[CP]"})`)
                    }},
                    cll: {noprepvar:false,action:(value) => {
                        compiled.push(`${value || "Memory[CP]"} = Math.ceil(${value || "Memory[CP]"})`)
                    }},
                    set: {noprepvar:false,action:(value,v2) => {
                        compiled.push(`${v2 || "Memory[CP]"} = ${value}`)
                    }},
                    slp: {noprepvar:false,action:(ms) => {
                        compiled.push(`await new Promise(resolve => setTimeout(resolve,${ms}))`)
                    }},
                    cal: {noprepvar:true,action:(target) => {
                        compiled.push(`${target}()`)
                    }},
                    fnc: {noprepvar:true,action:(target) => {
                        compiled.push(`function ${target}() {`)
                    }},
                    inp: {noprepvar:false,action:(targetVariable) => {
                        compiled.push(`${targetVariable || "CV"} = await new Promise(resolve => {process.stdin.on('readable', () => {
                            let v = process.stdin.read().toString()
                            resolve(parseInt(v,10) || ({yes:1,no:-1,y:1,n:-1,t:1,f:-1,true:1,false:-1})[v] || v.charCodeAt(1))
                          })})`)
                    }},
                    njs: {noprepvar:true,action:() => {
                        let ar = []
                        for (let i = 0; i < arguments.length; i++) {
                            ar.push(arguments[i])
                        }
                        compiled.push(ar.join(","))
                    }},
                    prm: {noprepvar:true,action:() => {
                        compiled.push("setInterval(() => {},50)")
                    }}
                }
                
                // Compile code
                let now = Date.now();
                str.replace(/\r/g,"").split("\n").forEach((v,x) => {
                    //console.log(x)
                    let compileFail = (reason) => {
                        console.log(`${color.FgRed}Failed to compile (Ln${x+1}): ${color.Bold} ${reason} ${color.Reset}`)
                        process.exit(999)
                    }
                    funcAPI.compileFail = compileFail
                    let base = v.split(";")[0]
                    
                    let args = base.split(" ")
                    let cmd  = args.splice(0,1)

                    if (compilerFunctions[cmd]) {
                        let cF = compilerFunctions[cmd]
                        let passVariables = []
                        if (cF.noprepvar) {
                            passVariables = args.join(" ").split(",")
                        } else {
                            args.join(" ").split(",").forEach((A) => {
                                passVariables.push(funcAPI.compileValue(A))
                            })
                        }
                        cF.action(...passVariables)
                    } else {
                        compileFail(`Invalid function ${cmd}`)
                    }

                })
                compiled.push("}\nCURSE_COMPILED_SCRIPT()")
                console.log(`${color.FgGreen}Compiled in ${color.Bold}${Date.now()-now}${color.Reset}${color.FgGreen}ms${color.Reset}`)
                console.log(`${color.Header}                                                     .${color.Reset}`)

                // Output stuff

                switch(runArgs[2]) {
                    case "con":
                        console.log(compiled.join("\n"))
                        console.log(`${color.Header}                                                     .${color.Reset}`)
                    break
                    case "run":
                        let now = Date.now()
                        console.log(`Running compiled file`)
                        eval(compiled.join("\n"))
                        console.log(`\n${color.Header}                                                     .${color.Reset}`)
                        console.log(`${color.FgGreen}Successfully run in ${color.Bold}${Date.now()-now}${color.Reset}${color.FgGreen}ms${color.Reset}`)
                    break
                    default:
                        if (runArgs[2]) {
                            fs.writeFileSync(runArgs[2],compiled.join("\n"))
                        } else {
                            console.log(compiled.join("\n"))
                        console.log(`${color.Header}                                                     .${color.Reset}`)
                        console.log(`Not what you wanted?\nUse ${color.Bold}node curse compile ${runArgs[1].toString()} run${color.Reset} to run the script instead,\nor use a file name instead of run to write to a file.`)
                        console.log(`${color.Header}                                                     .${color.Reset}`)
                        }
                    }

            
            })

        break
        case "highlight":
            
            // Read file
            if (!runArgs[1]) {
                console.log(`${color.FgRed}No input file specified ${color.Reset}`)
                console.log(`Please specify an input file to highlight.`)
                return
            }
            console.log(`${color.Header}                                                     .${color.Reset}`)
            console.log(`Reading file ${runArgs[1]}`)
            fs.readFile(runArgs[1].toString(),(err,buf) => {
                if (err) {
                    console.log(`${color.FgRed}An error occured during file read: ${color.Bold} ${err} ${color.Reset}`)
                    console.log(`${color.Header}                                                     .${color.Reset}`)
                    //console.log(`${color.Header}                                                     ${color.Reset}`)
                    return
                }
                let str = buf.toString()
                console.log(`${color.FgGreen}File read success${color.Reset}`)
                console.log(`${color.Header}                                                     .${color.Reset}`)
                
                // Actually start compiling code.
                let highlights = {
                    // Dummy: Color.FgRed
                    "#nop":color.FgRed, // Do not do anything. Also useful for commenting.
                    ">;":color.FgRed, // Comment.
                    // Manipulation: Color.FgBlue
                    "#cur":color.FgBlue, // Move cursor position.
                    "#out":color.FgBlue, // Output value of cursor position or buffer as string.
                    "#oun":color.FgBlue, // Output value of cursor position or buffer.
                    "#suc":color.FgBlue, // Adds if statement
                    "#els":color.FgBlue, // Adds else statement.
                    "#eli":color.FgBlue, // Adds elseif statement.
                    "#rep":color.FgBlue, // Repeats code X amount of times.
                    "#whl":color.FgBlue, // While loop.
                    "#cls":color.FgBlue, // Close brackets
                    "#fnc":color.FgBlue, // Open function
                    "#inp":color.FgBlue, // Input
                    "#cal":color.FgBlue, // Call function
                    "#slp":color.FgBlue, // Sleep x milliseconds
                    // Advanced manipulation: Color.Bold+Color.FgBlue
                    "#clr":color.Bold+color.FgCyan, // Reset memory
                    "#clb":color.Bold+color.FgCyan, // Reset buffers
                    "#njs":color.Bold+color.FgCyan, // Run raw Node.JS code
                    // Mathematics: Color.FgMagenta
                    "#add":color.FgMagenta, // Add value to cursor or buffer (2nd arg)
                    "#sub":color.FgMagenta, // Subtract value from cursor or buffer (2nd arg)
                    "#mul":color.FgMagenta, // Multiply value from cursor or buffer (2nd arg) by X
                    "#div":color.FgMagenta, // Divide value from cursor or buffer (2nd arg) by X
                    "#mod":color.FgMagenta, // Modulus/get remainder of value from cursor or buffer (2nd arg) by X
                    "#flr":color.FgMagenta, // Floor
                    "#cll":color.FgMagenta, // Ceil
                    "#set":color.FgMagenta, // Set value of cursor or buffer (2nd arg) to X
                    // Numbers: Color.FgGreen
                    /*
                    "=1":color.FgGreen,
                    "=2":color.FgGreen,
                    "=3":color.FgGreen,
                    "=4":color.FgGreen,
                    "=5":color.FgGreen,
                    "=6":color.FgGreen,
                    "=7":color.FgGreen,
                    "=8":color.FgGreen,
                    "=9":color.FgGreen,
                    "=0":color.FgGreen,
                    */
                    "=N":color.FgGreen, // Defines a number (Base 10)
                    "=H":color.FgGreen, // Defines a number (Base 16, Hex)
                    "=I":color.FgGreen, // Defines a number (Base 2, Binary)
                    // Buffers: Color.FgYellow
                    /*
                    "=BA":color.FgYellow, // Buffer A
                    "=BB":color.FgYellow, // Buffer B
                    "=BC":color.FgYellow, // Buffer C
                    "=BD":color.FgYellow, // Buffer D
                    "=BE":color.FgYellow, // Buffer E
                    */
                   // Todo: fix buffer highlighting so we can bring that back.
                    "=CP":color.FgYellow, // Cursor position.
                    "=CV":color.FgYellow, // Cursor value.
                    "=PS":color.FgYellow, // Loop position.
                    // Logic: Color.FgCyan
                    "=>":color.FgCyan, // Greater than
                    "=<":color.FgCyan, // Less than
                    "==":color.FgCyan, // Equal
                    "=&":color.FgCyan, // And
                    "=?":color.FgCyan, // Or
                    "=!":color.FgCyan, // Not
                    "=L":color.FgCyan, // Logic value starter
                    "=:":color.FgCyan, // Logic value splitter.
                    
                    //"#tst":color.FgCyan, // Logic processing command. Arg 1 will be the logic string, and Arg 2 will be the output. If there is no buffer to output to, tst will output to CV instead.
                }
                let tabs = 0
                str.split("\n").forEach((v,x) => {
                    let HighlightedString = ""
                    let cmd = v.split(" ")
                        HighlightedString += highlights[`#${cmd[0]}`]
                        HighlightedString += cmd[0]
                        HighlightedString += color.Reset+" "
                        cmdr = cmd[0]
                    if (cmd[0] == "cls") {
                        tabs -= 1
                    }
                    cmd.splice(0,1)
                    
                    let fcmd = cmd.join(" ")
                    fcmd = fcmd.replace(/([0-9])/g, `${color.FgGreen}$1${color.Reset}`)
                    for (let [key,value] of Object.entries(highlights)) {
                        if (key.startsWith("=")) {
                            let tk = key.slice(1)
                            fcmd = fcmd.replace(new RegExp("\\"+tk,"g"),`${value}${tk}${color.Reset}`)
                        }
                    }
                   
                    for (let [key,value] of Object.entries(highlights)) {
                        if (key.startsWith(">")) {
                            let tk = key.slice(1)
                            fcmd = fcmd.replace(new RegExp("\\"+tk,"g"),`${value}${tk}`)
                        }
                    }
                    HighlightedString += fcmd
                    console.log(`${color.Bold}Ln${x+1}${color.Reset}${" ".repeat(str.split("\n").length.toString().length-((x+1).toString().length))} ${"|    ".repeat(tabs)}${HighlightedString}${color.Reset}`)
                    if ((["suc","els","eli","rep","whl"]).find(e => e == cmdr)) {
                        tabs += 1
                    }
                })
                console.log(`${color.Header}                                                     .${color.Reset}`)
            
            })

        break
        default:
            console.log(`${color.FgRed}Invalid type "${runArgs[0]}".${color.Reset}`)

    }
}