
/**
 * Use this file to define custom functions and blocks.
 * Read more at https://makecode.microbit.org/blocks/custom
 */

/**
 * Custom blocks
 */

//% weight=200 color=#0fbc11 icon="\uf1b2"

namespace eniac {   
let key_callback:(key:number)=>void
let BUTTONS_ID = [Button.A, Button.B]
let NO_PRESS = 0
let SHORT_PRESS = 1
let LONG_PRESS = 2
let buttons = [0, 0]
let buttons_event = [NO_PRESS, NO_PRESS]
let idle_event =  false
let lastPress = -1

export const BUTTON_RELEASED = 0
export const BUTTON_A_SHORT = 1
export const BUTTON_A_LONG = 2
export const BUTTON_B_SHORT = 3
export const BUTTON_B_LONG = 4

function areAllButtonsReleased(): boolean {
    //  release 
    for (let i = 0; i < 2; i++) {
        if (buttons[i] > 0) return false
    }
    return true
}

function emitEvents() {
    if(idle_event) key_callback(BUTTON_RELEASED)
    if (buttons_event[0] == SHORT_PRESS) key_callback(BUTTON_A_SHORT)
    if (buttons_event[0] == LONG_PRESS) key_callback(BUTTON_A_LONG)
    if (buttons_event[1] == SHORT_PRESS) key_callback(BUTTON_B_SHORT)
    if (buttons_event[1] == LONG_PRESS) key_callback(BUTTON_B_LONG)
}

function process_keyboard() {
    idle_event = false
    let millis = control.millis()
    for (let j = 0; j < 2; j++) {
        buttons_event[j] = NO_PRESS
        //  currently released but was pressed
        if (input.buttonIsPressed(BUTTONS_ID[j])) {
            if (buttons[j] == 0) {
                buttons[j] = millis
            }
            
            lastPress = -1
        } else if (buttons[j] > 0) {
            let time_diff = millis - buttons[j]
            if (time_diff > 200) {
                buttons_event[j] = time_diff > 1000 ? LONG_PRESS : SHORT_PRESS
                buttons[j] = 0
                lastPress = 0
            }
        }
    }
   
    if (lastPress == 0 && areAllButtonsReleased()) {
        lastPress = millis
    }
    
    if (lastPress > 0 && millis - lastPress > 3000) {
        idle_event = true
        lastPress = -1
    }
    emitEvents()
}


    /**
     * TODO: Register callback function to receive keyboard events
     * @param fun function to be registered
     */
     //% subcategory="keyboard"
    //% block
    export function on_keyboard(fun : (key:number)=>void ): void {
        key_callback = fun
        control.setInterval(process_keyboard, 100, control.IntervalMode.Interval)
        // Add code here
    }

}
