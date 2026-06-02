/*
File:       github.com/ETmbit/ettiltpad.ts
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
// the chunk format is: id|num|chunk
// the final chunk has num=-1 and chunk=ack_id
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
        for (let num = 0; num < ETgroupHandlers.length; num++)
            ETgroupHandlers[num](ETgroup)
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
    let num = +parts[1]
    let msg = parts[2]

    // create a buffer for id if not existing
    etradio.createBuffer(id)

    // EOM handling (receiver side)
    // (1) send ACK
    // (2) store message or call handler
    // see: etradio.send()
    if (num === ET_EOM) {
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
    if (num === ET_ACK) {
        if (ETradioMsg[id] && ((num = ETradioMsg[id].sent.indexOf(msg)) >= 0))
            // (1)
            ETradioMsg[id].sent.splice(num, 1)
        return
    }

    // CHUNK handling (receiver side)
    ETradioMsg[id].chunks[num] = msg
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
        let num = 0
        let chunk = ""
        let ack_id = control.millis().toString() + Math.randomRange(0, 999).toString()
        ack_id = ack_id.substr(0, len)

        // create a buffer for id if not existing
        createBuffer(id)

        // send message in chunks
        while (msg.length > 0) {
            chunk = id + "|" + num.toString() + "|" + msg.substr(0, len)
            msg = msg.substr(len)
            radio.sendString(chunk)
            basic.pause(1)
            num += 1
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
        if ((num = ETradioMsg[id].sent.indexOf(ack_id)) >= 0)
            ETradioMsg[id].sent.splice(num, 1)
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

///////////////////
//  INCLUDE      //
//  ettiltpad.ts //
///////////////////

const ET_TILTPADID = "TP"

const ETPITCH = "P"
const ETROLL = "R"
const ETYAW = "Y"
const ETBUTTON = "B"

enum ETtouchButton {
    //% block="left"
    //% block.loc.nl="linker"
    Left,
    //% block="a-"
    //% block.loc.nl="a-"
    A,
    //% block="b-"
    //% block.loc.nl="b-"
    B,
    //% block="c-"
    //% block.loc.nl="c-"
    C,
    //% block="d-"
    //% block.loc.nl="d-"
    D,
    //% block="right"
    //% block.loc.nl="rechter"
    Right,
}

enum ETtouchTilt {
    //% block="pitch"
    //% block.loc.nl="pitch"
    Pitch,
    //% block="roll"
    //% block.loc.nl="roll"
    Roll,
    //% block="yaw"
    //% block.loc.nl="yaw"
    Yaw,
}
function etTiltpadRadio(msg: string) {
    let parts = msg.split(";")
    if (parts.length != 3) return
    let num = +parts[0]
    let prm = parts[1]
    let val = +parts[2]
    EtTiltpad.handleTilt(num, prm, val)
}
etradio.registerMessageHandler(ET_TILTPADID, etTiltpadRadio)

//% color="#C4C80E" icon="\uf065"
//% block="Tiltpad"
//% block.loc.nl="Tiltpad"
namespace EtTiltpad {

    let onPitchHandler: ((value: number) => void)[] = []
    let onRollHandler: ((value: number) => void)[] = []
    let onYawHandler: ((value: number) => void)[] = []
    let onLeftHandler: (() => void)[] = []
    let onRightHandler: (() => void)[] = []
    let onAHandler: (() => void)[] = []
    let onBHandler: (() => void)[] = []
    let onCHandler: (() => void)[] = []
    let onDHandler: (() => void)[] = []

    let pitch: number[] = []
    let roll: number[] = []
    let yaw: number[] = []

    onPitchHandler.push(null)
    onRightHandler.push(null)
    onYawHandler.push(null)
    onLeftHandler.push(null)
    onRightHandler.push(null)
    onAHandler.push(null)
    onBHandler.push(null)
    onCHandler.push(null)
    onDHandler.push(null)

    pitch.push(999)
    roll.push(999)
    yaw.push(999)

    export function handleTilt(num: number, prm: string, val: number) {
        if (prm == ETPITCH) {
            if (num >= 0 && num < onPitchHandler.length && onPitchHandler[num])
                onPitchHandler[num](val)
        }
        else
        if (prm == ETROLL) {
            if (num >= 0 && num < onRollHandler.length && onRollHandler[num])
                onRollHandler[num](val)
        }
        else
        if (prm == ETYAW) {
            if (num >= 0 && num < onYawHandler.length && onYawHandler[num])
                onYawHandler[num](val)
        }
        else
        if (prm == ETBUTTON) {
            switch (val) {
                case ETtouchButton.Left:
                    if (num >= 0 && num < onLeftHandler.length && onLeftHandler[num])
                        onLeftHandler[num]()
                    break
                case ETtouchButton.Right:
                    if (num >= 0 && num < onRightHandler.length && onRightHandler[num])
                        onRightHandler[num]()
                    break
                case ETtouchButton.A:
                    if (num >= 0 && num < onAHandler.length && onAHandler[num])
                        onAHandler[num]()
                    break
                case ETtouchButton.B:
                    if (num >= 0 && num < onBHandler.length && onBHandler[num])
                        onBHandler[num]()
                    break
                case ETtouchButton.C:
                    if (num >= 0 && num < onCHandler.length && onCHandler[num])
                        onCHandler[num]()
                    break
                case ETtouchButton.D:
                    if (num >= 0 && num < onDHandler.length && onDHandler[num])
                        onDHandler[num]()
                    break
            }
        }
    }

    //% color="#802080"
    //% block="when button %but of touchpad %num is touched"
    //% block.loc.nl="wanneer de %but knop van tiltpad %num wordt aangeraakt"
    //% num.min=1 num.max=10
    export function onButton(but: ETtouchButton, num: number, code: () => void): void {
        if (num < 1 || num > 10) return
        num -= 1
        switch (but) {
            case ETtouchButton.Left: onLeftHandler[num] = code; break
            case ETtouchButton.A: onAHandler[num] = code; break
            case ETtouchButton.B: onBHandler[num] = code; break
            case ETtouchButton.C: onCHandler[num] = code; break
            case ETtouchButton.D: onDHandler[num] = code; break
            case ETtouchButton.Right: onRightHandler[num] = code; break
        }
    }

    //% color="#802080"
    //% block="when the %tilt of tiltpad %num changes"
    //% block.loc.nl="wanneer de %tilt van tiltpad %num wijzigt"
    export function onTilt(tilt: ETtouchTilt, num: number, code: () => void): void {
        if (num < 1 || num > 10) return
        num -= 1
        switch (tilt) {
            case ETtouchTilt.Pitch: onPitchHandler[num] = code; break
            case ETtouchTilt.Roll: onRollHandler[num] = code; break
            case ETtouchTilt.Yaw: onYawHandler[num] = code; break
        }
    }

    //% block="pitch"
    //% block.loc.nl="pitch"
    export function getPitch(): number {
        if (pitch.length) return pitch[0]
        return 999
    }

    //% block="roll"
    //% block.loc.nl="roll"
    export function getRoll(): number {
        if (roll.length) return roll[0]
        return 999
    }

    //% block="yaw"
    //% block.loc.nl="yaw"
    export function getYaw(): number {
        if (yaw.length) return yaw[0]
        return 999
    }

    //% subcategory="Meerdere pads"
    //% block="pitch of tiltpad %num"
    //% block.loc.nl="pitch van tiltpad %num"
    export function getTiltpadPitch(num: number): number {
        num -= 1
        if (num >= 0 && num < pitch.length)
            return pitch[num]
        return 999
    }

    //% subcategory="Meerdere pads"
    //% block="roll of tiltpad %num"
    //% block.loc.nl="roll van tiltpad %num"
    export function getTiltpadRoll(num: number): number {
        num -= 1
        if (num >= 0 && num < roll.length)
            return roll[num]
        return 999
    }

    //% subcategory="Meerdere pads"
    //% block="yaw of tiltpad %num"
    //% block.loc.nl="yaw van tiltpad %num"
    export function getTiltpadYaw(num: number): number {
        num -= 1
        if (num >= 0 && num < yaw.length)
            return yaw[num]
        return 999
    }


    //% subcategory="Meerdere pads"
    //% block="use %cnt tiltpads"
    //% block.loc.nl="gebruik %cnt tiltpads"
    //% cnt.min=1 cnt.max=10 cnt.defl=2
    export function setTiltpadCount(cnt: number) {

        if (cnt < 1) cnt = 1

        onPitchHandler.splice(0, onPitchHandler.length)
        onRollHandler.splice(0, onRollHandler.length)
        onYawHandler.splice(0, onYawHandler.length)
        onLeftHandler.splice(0, onLeftHandler.length)
        onRightHandler.splice(0, onRightHandler.length)
        onAHandler.splice(0, onAHandler.length)
        onBHandler.splice(0, onBHandler.length)
        onCHandler.splice(0, onCHandler.length)
        onDHandler.splice(0, onDHandler.length)

        for (let i = 0; i < cnt; i++) {
            onPitchHandler.push(null)
            onRightHandler.push(null)
            onYawHandler.push(null)
            onLeftHandler.push(null)
            onRightHandler.push(null)
            onAHandler.push(null)
            onBHandler.push(null)
            onCHandler.push(null)
            onDHandler.push(null)

            pitch.push(999)
            roll.push(999)
            yaw.push(999)
        }
    }
}

/////////////////
// END INCLUDE //
/////////////////
