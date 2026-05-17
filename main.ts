/*
File:       github.com/ETmbit/et-tiltpad.ts
Version:	2026-1
Copyright:  ElecTricks, 2026
License:    GNU GPL 3 or later
Disclaimer: Distributed without any warranty
Depends on: None
*/
/*
File:       github.com/ETmbit/etbasic.ts
Version:	2026-1
Copyright:  ElecTricks, 2026
License:    GNU GPL 3 or later
Disclaimer: Distributed without any warranty
Depends on: None
*/

//////////////////
//  INCLUDE     //
//  etbasic.ts  //
//////////////////

const ET_LOW = 0
const ET_HIGH = 1

enum ETpins {
    //% block="pin P0"
    //% block.loc.nl="pin P0"
    P0 = DigitalPin.P0,
    //% block="pin P1"
    //% block.loc.nl="pin P1"
    P1 = DigitalPin.P1,
    //% block="pin P2"
    //% block.loc.nl="pin P2"
    P2 = DigitalPin.P2,
    //% block="pin P8"
    //% block.loc.nl="pin P8"
    P8 = DigitalPin.P8,
    //% block="pin P12"
    //% block.loc.nl="pin P12"
    P12 = DigitalPin.P12,
    //% block="pin P13"
    //% block.loc.nl="pin P13"
    P13 = DigitalPin.P13,
    //% block="pin P14"
    //% block.loc.nl="pin P14"
    P14 = DigitalPin.P14,
    //% block="pin P15"
    //% block.loc.nl="pin P15"
    P15 = DigitalPin.P15,
    //% block="pin P16"
    //% block.loc.nl="pin P16"
    P16 = DigitalPin.P16
}

enum ETstate {
    //% block="off"
    //% block.loc.nl="uit"
    Off,
    //% block="on"
    //% block.loc.nl="aan"
    On,
}

enum ETpace {
    //% block="slow"
    //% block.loc.nl="langzame"
    Slow,
    //% block="normal"
    //% block.loc.nl="normale"
    Normal,
    //% block="fast"
    //% block.loc.nl="snelle"
    Fast,
}

/*
The ETrotate, ETturn and ETmove... enumerations
have comparable values:

Start = -1
Stop = 0
Forward = 1
Backward = 2
Left, AntiClockwise = 3
Right, Clockwise = 4
Up = 5
Down = 6
*/

enum ETrotate {
    //% block="anticlockwise"
    //% block.loc.nl="linksom"
    AntiClockwise = 3,
    //% block="clockwise"
    //% block.loc.nl="rechtsom"
    Clockwise = 4,
}

enum ETturn {
    //% block="to the left"
    //% block.loc.nl="naar links"
    Left = 3,
    //% block="to the right"
    //% block.loc.nl="naar rechts"
    Right = 4,
}

enum ETmove {
    //% block="stop"
    //% block.loc.nl="stop"
    Stop = 0,
    //% block="start"
    //% block.loc.nl="start"
    Start = -1,

}

enum ETmoveX {
    //% block="to the left"
    //% block.loc.nl="naar links"
    Left = 3,
    //% block="to the right"
    //% block.loc.nl="naar rechts"
    Right = 4,
}

enum ETmoveY {
    //% block="forward"
    //% block.loc.nl="vooruit"
    Forward = 1,
    //% block="backward"
    //% block.loc.nl="achteruit"
    Backward = 2,
}

enum ETmoveZ {
    //% block="up"
    //% block.loc.nl="omhoog"
    Up = 5,
    //% block="down"
    //% block.loc.nl="omlaag"
    Down = 6,
}

enum ETmoveXY {
    //% block="forward"
    //% block.loc.nl="naar voren"
    Forward = 1,
    //% block="backward"
    //% block.loc.nl="naar achteren"
    Backward = 2,
    //% block="to the left"
    //% block.loc.nl="naar links"
    Left = 3,
    //% block="to the right"
    //% block.loc.nl="naar rechts"
    Right = 4,
}

enum ETmoveXZ {
    //% block="to the left"
    //% block.loc.nl="naar links"
    Left = 3,
    //% block="to the right"
    //% block.loc.nl="naar rechts"
    Right = 4,
    //% block="up"
    //% block.loc.nl="omhoog"
    Up = 5,
    //% block="down"
    //% block.loc.nl="omlaag"
    Down = 6,
}

enum ETmoveYZ {
    //% block="forward"
    //% block.loc.nl="naar voren"
    Forward = 1,
    //% block="backward"
    //% block.loc.nl="naar achteren"
    Backward = 2,
    //% block="up"
    //% block.loc.nl="omhoog"
    Up = 5,
    //% block="down"
    //% block.loc.nl="omlaag"
    Down = 6,
}

enum ETmoveXYZ {
    //% block="forward"
    //% block.loc.nl="naar voren"
    Forward = 1,
    //% block="backward"
    //% block.loc.nl="naar achteren"
    Backward = 2,
    //% block="to the left"
    //% block.loc.nl="naar links"
    Left = 3,
    //% block="to the right"
    //% block.loc.nl="naar rechts"
    Right = 4,
    //% block="up"
    //% block.loc.nl="omhoog"
    Up = 5,
    //% block="down"
    //% block.loc.nl="omlaag"
    Down = 6,
}

enum ETcolor {
    //% block="red"
    //% block.loc.nl="rood"
    Red = 1,
    //% block="green"
    //% block.loc.nl="groen"
    Green = 2,
    //% block="blue"
    //% block.loc.nl="blauw"
    Blue = 3,
    //% block="yellow"
    //% block.loc.nl="geel"
    Yellow = 4,
    //% block="cyan"
    //% block.loc.nl="cyaan"
    Cyan = 5,
    //% block="magenta"
    //% block.loc.nl="magenta"
    Magenta = 6,
    //% block="black"
    //% block.loc.nl="zwart"
    Black = 7,
    //% block="dark grey"
    //% block.loc.nl="donkergrijs"
    DarkGrey = 8,
    //% block="grey"
    //% block.loc.nl="grijs"
    Grey = 9,
    //% block="light grey"
    //% block.loc.nl="lichtgrijs"
    LightGrey = 10,
    //% block="white"
    //% block.loc.nl="wit"
    White = 11,
    //% block="orange"
    //% block.loc.nl="oranje"
    Orange = 12,
    //% block="brown"
    //% block.loc.nl="bruin"
    Brown = 13,
    //% block="pink"
    //% block.loc.nl="roze"
    Pink = 14,
    //% block="indigo"
    //% block.loc.nl="indigo"
    Indigo = 15,
    //% block="violet"
    //% block.loc.nl="violet"
    Violet = 16,
    //% block="purple"
    //% block.loc.nl="paars"
    Purple = 17,
}

function etRgbValue(red: number, green: number, blue: number): number {
    let rgb = ((red & 0xFF) << 16) | ((green & 0xFF) << 8) | (blue & 0xFF)
    return rgb;
}

function etRedValue(rgb: number): number {
    let r = (rgb >> 16) & 0xFF
    return r;
}

function etGreenValue(rgb: number): number {
    let g = (rgb >> 8) & 0xFF
    return g;
}

function etBlueValue(rgb: number): number {
    let b = (rgb) & 0xFF
    return b;
}

function etFromColor(color: ETcolor): number {
    let val = 0
    switch (color) {
        case ETcolor.Red: val = 0xFF0000; break;
        case ETcolor.Green: val = 0x00FF00; break;
        case ETcolor.Blue: val = 0x0000FF; break;
        case ETcolor.Yellow: val = 0xFFFF00; break;
        case ETcolor.Cyan: val = 0x00FFFF; break;
        case ETcolor.Magenta: val = 0xFF00FF; break;
        case ETcolor.Black: val = 0x000000; break;
        case ETcolor.DarkGrey: val = 0xA9A9A9; break;
        case ETcolor.Grey: val = 0x808080; break;
        case ETcolor.LightGrey: val = 0xD3D3D3; break;
        case ETcolor.White: val = 0xFFFFFF; break;
        case ETcolor.Orange: val = 0xFFA500; break;
        case ETcolor.Brown: val = 0xA52A2A; break;
        case ETcolor.Pink: val = 0xFFC0CB; break;
        case ETcolor.Indigo: val = 0x4b0082; break;
        case ETcolor.Violet: val = 0x8a2be2; break;
        case ETcolor.Purple: val = 0x800080; break;
    }
    return val
}

function etFromRgbValues(red: number, green: number, blue: number, clearch?: number): ETcolor {

    let max = Math.max(red, Math.max(green, blue))
    let min = Math.min(red, Math.min(green, blue))

    if (Math.abs(max - min) < 60) {
        if (clearch == undefined) {
            let bright = Math.round(0.21 * red + 0.72 * green + 0.07 * blue)
            if (bright > 100) return ETcolor.White
            if (bright < 90) return ETcolor.Black
            return ETcolor.Grey
        }
        else {
            if (clearch > 75) return ETcolor.White
            if (clearch < 30) return ETcolor.Black
            return ETcolor.Grey
        }
    }

    let hue: number
    if (red == max) hue = (0 + (green - blue) / (max - min)) * 60
    if (green == max) hue = (2 + (blue - red) / (max - min)) * 60
    if (blue == max) hue = (4 + (red - green) / (max - min)) * 60

    if (hue < 0) hue += 360

    // translate hue to color names
    if (hue < 20) return ETcolor.Red
    if (hue < 50) return ETcolor.Orange
    if (hue < 100) return ETcolor.Yellow
    if (hue < 190) return ETcolor.Green
    if (hue < 206) return ETcolor.Cyan
    if (hue < 230) return ETcolor.Blue
    if (hue < 272) return ETcolor.Purple
    if (hue < 300) return ETcolor.Magenta

    return ETcolor.Red
}

function etFromRgb(rgb: number): ETcolor {
    let red = etRedValue(rgb)
    let green = etGreenValue(rgb)
    let blue = etBlueValue(rgb)
    return etFromRgbValues(red, green, blue)
}

//% color="#61CBF4" icon="\uf075"
//% block="General"
//% block.loc.nl="Algemeen"
namespace etbasic {

    //% color="#008800"
    //% block="comment: %dummy"
    //% block.loc.nl="uitleg: %dummy"
    //% dummy.defl="schrijf hier je uitleg"
    export function comment(dummy: string) {
    }

    //% block="a number from %min upto %max"
    //% block.loc.nl="een getal van %min t/m %max"
    //% min.defl=0 max.defl=10
    export function randomInt(min: number, max: number): number {
        let i = 0
        if (min > max) {
            i = min
            min = max
            max = i
        }
        i = max - min + 1
        i = min + Math.floor(Math.random() * i)
        return i
    }

    //% block="wait %sec seconds"
    //% block.loc.nl="wacht %sec seconden"
    export function wait(sec: number) {
        basic.pause(sec * 1000)
    }
}

///////////////////
//  END INCLUDE  //
///////////////////

//////////////////
//  INCLUDE     //
//  etradio.ts  //
//////////////////

// the micro:bit radio buffer size is 19 bytes only
// therefore, messages are sent in chunks
// the chunk format is: id|ix|chunk
// the final chunk has ix=-1 and chunk=ack_id
// a receiver 

//##### GROUP HANDLING #####\\

const ET_EVENT = 200 + Math.randomRange(0, 100) // semi-unique id

let ETgroup = 1
let ETgroupTimer = 0
let ETgroupSet = false
let ETgroupHandlers: ((group: number) => void)[] = []

function etHandleGroup() {
    basic.showNumber(ETgroup)
    if (ETgroupHandlers.length) {
        for (let ix = 0; ix < ETgroupHandlers.length; ix++)
            ETgroupHandlers[ix](ETgroup)
    }
    else
        basic.showIcon(IconNames.Yes)
}

control.onEvent(ET_EVENT, 0, function () {
    while (ETgroupTimer > control.millis()) { basic.pause(1) }
    etHandleGroup()
    ETgroupTimer = 0
    ETgroupSet = false
})

input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    if (ETgroupSet) {
        ETgroup++
        if (ETgroup > 9) ETgroup = 1
        radio.setGroup(ETgroup)
    }
    else
        ETgroupSet = true
    basic.showNumber(ETgroup)
    if (!ETgroupTimer) {
        ETgroupTimer = control.millis() + 1000
        control.raiseEvent(ET_EVENT, 0)
    }
    else
        ETgroupTimer = control.millis() + 1000
})

//##### DATA HANDLING #####\\

const ET_EOM = -1
const ET_ACK = -2

interface ETradioMessages {
    sent: string[]  // id's of sent messages that have no ACK yet
    received: string[]	// received messages that have not been read yet
    chunks: string[]	// temporary buffer for received chunks
    handler: (message: string) => void // will be called when a radio message is received
}

let ETradioMsg: { [id: string]: ETradioMessages } = {}

radio.onReceivedString(function (chunk: string) {

    let parts = chunk.split("|")
    if (parts.length != 3) return
    let id = parts[0]
    let ix = +parts[1]
    let msg = parts[2]

    // create a buffer for id if not existing
    etradio.createBuffer(id)

    // EOM handling (receiver side)
    // (1) send ACK
    // (2) store message or call handler
    // see: etradio.send()
    if (ix === ET_EOM) {
        // (1) msg contains msg id
        msg = id + "|" + ET_ACK.toString() + "|" + msg
        radio.sendString(msg)
        // (2)
        msg = ETradioMsg[id].chunks.join("")
        if (ETradioMsg[id].handler)
            ETradioMsg[id].handler(msg)
        else
            ETradioMsg[id].received.push(msg)
        ETradioMsg[id].chunks = []
        return
    }

    // ACK handling (sender side)
    // (1) clear the ACK flag when acknowledged
    // see: etradio.send()
    if (ix === ET_ACK) {
        if (ETradioMsg[id] && ((ix = ETradioMsg[id].sent.indexOf(msg)) >= 0))
            // (1)
            ETradioMsg[id].sent.splice(ix, 1)
        return
    }

    // CHUNK handling (receiver side)
    ETradioMsg[id].chunks[ix] = msg
})

namespace etradio {

    export function createBuffer(id: string) {
        if (!ETradioMsg[id])
            ETradioMsg[id] = { sent: [], received: [], chunks: [], handler: null }
    }

    export function clearBuffer(id: string) {
        if (ETradioMsg[id])
            delete ETradioMsg[id]
    }

    export function send(id: string, msg: string, timeout: number = 0) {
        // messages are broadcasted

        let len = Math.max(1, 15 - id.length)
        let ix = 0
        let chunk = ""
        let ack_id = control.millis().toString() + Math.randomRange(0, 999).toString()
        ack_id = ack_id.substr(0, len)

        // create a buffer for id if not existing
        createBuffer(id)

        // send message in chunks
        while (msg.length > 0) {
            chunk = id + "|" + ix.toString() + "|" + msg.substr(0, len)
            msg = msg.substr(len)
            radio.sendString(chunk)
            basic.pause(1)
            ix += 1
        }

        // (1) raise ACK flag
        // (2) sent ack_id so that receiver can ACK
        // (3) wait for ACK flag being cleared by radio.onReceivedString
        // (4) clear ACK flag in case of timeout
        // Not fully fail save, but best in terms of successfull transmission
        // Timeout is the savety net
        // After timeout clear the ACK flag anyway

        // (1)
        ETradioMsg[id].sent.push(ack_id)

        // (2)
        chunk = id + "|" + ET_EOM.toString() + "|" + ack_id
        radio.sendString(chunk)

        // (3)
        let tm = control.millis() + timeout
        while (control.millis() < tm && ETradioMsg[id].sent.indexOf(ack_id) >= 0)
            basic.pause(1)

        // (4)
        if ((ix = ETradioMsg[id].sent.indexOf(ack_id)) >= 0)
            ETradioMsg[id].sent.splice(ix, 1)
    }

    export function available(id: string): boolean {
        return !!(ETradioMsg[id] && (ETradioMsg[id].received.length > 0))
    }

    export function read(id: string): string {
        if (!ETradioMsg[id] || !ETradioMsg[id].received.length)
            return ""
        let msg = ETradioMsg[id].received.shift()
        return msg
    }

    export function registerMessageHandler(id: string, handler: (msg: string) => void) {
        createBuffer(id)
        ETradioMsg[id].handler = handler
    }

    export function registerGroupHandler(handler: (group: number) => void) {
        ETgroupHandlers.push(handler)
    }
}

///////////////////
//  END INCLUDE  //
///////////////////

/////////////////
//  INCLUDE    //
//  tiltpad.ts //
/////////////////

const ET_TILTPADID = "TP"

type handler = () => void

type Tilt = { Pitch: number, Roll: number }
let ETtilt: Tilt[] = []
ETtilt.push({Pitch : 0, Roll : 0})

function fromAngle(angle: number): number {
    // identical calculation to: et-heading.ts
    while (angle < 0) angle += 360
    while (angle >= 360) angle -= 360
    let hd = Math.round(angle / 10) * 10
    if (hd === 360) hd = 0
    return hd
}

// balance handlers
let etPitchUpHandler: handler
let etPitchDownHandler: handler
let etRollLeftHandler: handler
let etRollRightHandler: handler
let etInBalancedHandler: handler
let etTiltpadHandler: handler

function ETtiltpadRadio(msg: string) {
    let val = +msg
    EtTiltpad.handleTilt(val)
}
etradio.registerMessageHandler(ET_TILTPADID, ETtiltpadRadio)

//% color="#C4C80E" icon="\uf11b"
//% block="Tiltpad"
//% block.loc.nl="Tiltpad"
namespace EtTiltpad {

    let curid = 0

    export function handleTilt(value: number) {
        curid = value - Math.floor(value / 500)
        if (curid < 0 || curid >= ETtilt.length) return
        value -= curid * 500
        let pitch = value - Math.floor(value / 400) - 200
        let roll = value - (pitch * 400) - 200
        ETtilt[curid] = {Pitch: pitch, Roll: roll}
        if (etTiltpadHandler) etTiltpadHandler()
        if ((pitch < 0) && etPitchDownHandler) etPitchDownHandler()
        if ((pitch > 0) && etPitchUpHandler) etPitchUpHandler()
        if ((roll < 0) && etRollLeftHandler) etRollLeftHandler()
        if ((roll > 0) && etRollRightHandler) etRollRightHandler()
    }

    //% color="#802080"
    //% block="when tiltpad %id tilts"
    //% block.loc.nl="wanneer tiltpad %id helt"
    export function onTiltpad(id: number, code: (_id: number) => void): void {
        
    }

    //% color="#802080"
    //% block="when the tiltpad tilts %dir"
    //% block.loc.nl="wanneer de tiltpad %dir helt"
    export function onTilt(dir: ETmoveXZ, code: () => void): void {
        switch (dir) {
            case ETmoveXZ.Up: etPitchUpHandler = code; break
            case ETmoveXZ.Down: etPitchDownHandler = code; break
            case ETmoveXZ.Up: etPitchUpHandler = code; break
            case ETmoveXZ.Down: etPitchDownHandler = code; break
        }
    }

    //% block="roll of tiltpad %id"
    //% block.loc.nl="roll van tiltpad %id"
    export function readTiltpadRoll(id: number): number {
        if (id < ETtilt.length)
            return ETtilt[id].Roll
        return 999
    }

    //% block="pitch of tiltpad %id"
    //% block.loc.nl="pitch van tiltpad %id"
    export function readTiltpadPitch(id: number): number {
        if (id < ETtilt.length)
            return ETtilt[id].Pitch
        return 999
    }

    //% block="roll"
    //% block.loc.nl="roll"
    export function readRoll(): number {
        return ETtilt[0].Roll
    }

    //% block="pitch"
    //% block.loc.nl="pitch"
    export function readPitch(): number {
        return ETtilt[0].Pitch
    }

    //% block="recent tiltpad"
    //% block.loc.nl="laatste tiltpad"
    export function readTiltpad(): number {
        return curid
    }

    //% block="the number of tiltpads is %cnt"
    //% block.loc.nl="het aantal tiltpads is %cnt"
    //% cnt.min=1 cnt.max=10 cnt.defl=1
    export function setTiltpadCount(cnt: number) {
        if (cnt < 1) cnt = 1
        ETtilt = []
        for (let i = 0; i < cnt; i++)
            ETtilt.push({Pitch: 0, Roll: 0})
    }
}

/////////////////
// END INCLUDE //
/////////////////
