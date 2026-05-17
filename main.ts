/*
File:       github.com/ETmbit/et-tiltpad.ts
Version:	2026-1
Copyright:  ElecTricks, 2026
License:    GNU GPL 3 or later
Disclaimer: Distributed without any warranty
Depends on: None
*/

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

enum ETtiltDir {
    //% block=""
    //% block.loc.nl="niet"
    None,
    //% block="up"
    //% block.loc.nl="omhoog"
    Up,
    //% block="down"
    //% block.loc.nl="omlaag"
    Down,
    //% block="left"
    //% block.loc.nl="naar links"
    Left,
    //% block="right"
    //% block.loc.nl="naar rechts"
    Right,
}

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
let etPitchUpHandler: () => void
let etPitchDownHandler: () => void
let etRollLeftHandler: () => void
let etRollRightHandler: () => void
let etInBalancedHandler: () => void

let etTiltpad0Handler: () => void
let etTiltpad1Handler: () => void
let etTiltpad2Handler: () => void
let etTiltpad3Handler: () => void
let etTiltpad4Handler: () => void
let etTiltpad5Handler: () => void
let etTiltpad6Handler: () => void
let etTiltpad7Handler: () => void
let etTiltpad8Handler: () => void
let etTiltpad9Handler: () => void

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
        // angle values are divided by 10, ranging from -18 to +18
        // transformed by +20 to range from 2 to 38
        // hi'byte' 40 is for pitch, lo'byte' 40 is for roll
        // thus the values of a single tiltpad range to 40*40 = 1600
        // tilpads offset from id * 2000 therefore

        curid = Math.floor(value / 2000)
        if (curid < 0 || curid >= ETtilt.length) return
        value -= curid * 2000
        let pitch = Math.floor(value / 40) - 20
        let roll = value - (pitch * 40) - 20
        ETtilt[curid] = {Pitch: pitch, Roll: roll}

        switch (curid) {
            case 0: if (etTiltpad0Handler) etTiltpad0Handler(); break
            case 1: if (etTiltpad1Handler) etTiltpad1Handler(); break
            case 2: if (etTiltpad2Handler) etTiltpad2Handler(); break
            case 3: if (etTiltpad3Handler) etTiltpad3Handler(); break
            case 4: if (etTiltpad4Handler) etTiltpad4Handler(); break
            case 5: if (etTiltpad5Handler) etTiltpad5Handler(); break
            case 6: if (etTiltpad6Handler) etTiltpad6Handler(); break
            case 7: if (etTiltpad7Handler) etTiltpad7Handler(); break
            case 8: if (etTiltpad8Handler) etTiltpad8Handler(); break
            case 9: if (etTiltpad9Handler) etTiltpad9Handler(); break
        }
        
        if ((pitch < 0) && etPitchDownHandler) etPitchDownHandler()
        if ((pitch > 0) && etPitchUpHandler) etPitchUpHandler()
        if ((roll < 0) && etRollLeftHandler) etRollLeftHandler()
        if ((roll > 0) && etRollRightHandler) etRollRightHandler()
    }

    //% color="#802080"
    //% block="when tiltpad %id tilts"
    //% block.loc.nl="wanneer tiltpad %id helt"
    //% id.min=1 id.max=10 id.defl=1
    export function onTiltpad(id: number, code: () => void): void {
        switch (id) {
            case 1: etTiltpad0Handler = code; break
            case 2: etTiltpad1Handler = code; break
            case 3: etTiltpad2Handler = code; break
            case 4: etTiltpad3Handler = code; break
            case 5: etTiltpad4Handler = code; break
            case 6: etTiltpad5Handler = code; break
            case 7: etTiltpad6Handler = code; break
            case 8: etTiltpad7Handler = code; break
            case 9: etTiltpad8Handler = code; break
            case 10: etTiltpad9Handler = code; break
        }
    }

    //% color="#802080"
    //% block="when the tiltpad tilts %dir"
    //% block.loc.nl="wanneer de tiltpad %dir helt"
    export function onTilt(dir: ETtiltDir, code: () => void): void {
        switch (dir) {
            case ETtiltDir.Up: etPitchUpHandler = code; break
            case ETtiltDir.Down: etPitchDownHandler = code; break
            case ETtiltDir.Up: etPitchUpHandler = code; break
            case ETtiltDir.Down: etPitchDownHandler = code; break
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
