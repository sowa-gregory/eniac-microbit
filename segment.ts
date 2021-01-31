// Add your code here
namespace eniac 
{
    const TM1637_CMD1 = 0x40;
    const TM1637_CMD2 = 0xC0;
    const TM1637_CMD3 = 0x80;
    let _SEGMENTS = [0x3F, 0x06, 0x5B, 0x4F, 0x66, 0x6D, 0x7D, 0x07, 0x7F, 0x6F, 0x77, 0x7C, 0x39, 0x5E, 0x79, 0x71];

    const LED_COUNT = 4

    export class TM1637 {
        buf: Buffer;
        clk: DigitalPin;
        dio: DigitalPin;
        _ON: number;
        brightness: number;
        count: number;  // number of LEDs
        

        /**
         * initial TM1637
         */
        init(): void {
            pins.digitalWritePin(this.clk, 0);
            pins.digitalWritePin(this.dio, 0);
            this._ON = 8;
            this.buf = pins.createBuffer(this.count);
            this.clear();
        }

        /**
         * Start 
         */
        _start() {
            pins.digitalWritePin(this.dio, 0);
            pins.digitalWritePin(this.clk, 0);
        }

        /**
         * Stop
         */
        _stop() {
            pins.digitalWritePin(this.dio, 0);
            pins.digitalWritePin(this.clk, 1);
            pins.digitalWritePin(this.dio, 1);
        }

        /**
         * send command1
         */
        _write_data_cmd() {
            this._start();
            this._write_byte(TM1637_CMD1);
            this._stop();
        }

        /**
         * send command3
         */
        _write_dsp_ctrl() {
            this._start();
            this._write_byte(TM1637_CMD3 | this._ON | this.brightness);
            this._stop();
        }

        /**
         * send a byte to 2-wire interface
         */
        _write_byte(b: number) {
            for (let i = 0; i < 8; i++) {
                pins.digitalWritePin(this.dio, (b >> i) & 1);
                pins.digitalWritePin(this.clk, 1);
                pins.digitalWritePin(this.clk, 0);
            }
            pins.digitalWritePin(this.clk, 1);
            pins.digitalWritePin(this.clk, 0);
        }

        /**
         * set TM1637 intensity, range is [0-8], 0 is off.
         * @param val the brightness of the TM1637, eg: 7
         */
        //% blockId="TM1637_set_intensity" block="%tm|set intensity %val"
        //% weight=50 blockGap=8
        //% subcategory="TM1637"
        intensity(val: number = 7) {
            if (val < 1) {
                this.off();
                return;
            }
            if (val > 8) val = 8;
            this._ON = 8;
            this.brightness = val - 1;
            this._write_data_cmd();
            this._write_dsp_ctrl();
        }

        /**
         * set data to TM1637, with given bit
         */
        _dat(bit: number, dat: number) {
            this._write_data_cmd();
            this._start();
            this._write_byte(TM1637_CMD2 | (bit % this.count))
            this._write_byte(dat);
            this._stop();
            this._write_dsp_ctrl();
        }

        /**
         * show a number in given position. 
         * @param num number will show, eg: 5
         * @param pos the position of the LED, eg: 0
         */
        //% blockId="TM1637_showbit" block="%tm|show digit %num |at %pos"
        //% weight=90 blockGap=8
        //% subcategory="TM1637"
        showbit(num: number = 5, pos: number = 0) {
            this.buf[pos % this.count] = _SEGMENTS[num % 16]
            this._dat(pos, _SEGMENTS[num % 16])
        }

        /**
          * show array of decimal numbers-
          * for each digit modulo 10 is computed, digits lower than 0 are not displayed (empty char)
          * elements at array index larger than 3 are ignored, arrays shorted than 4 are suffixed with -1 
          * segment at blankpos is not shown
          *
          * @param arr is a 4 digits array, eg: [2,3,5,7]
          * @param blank_pos - position of segment not to be shown (allows for segment blinking), -1 - all segments are shown, eg: 0
          */
      
        //% blockId="TM1637_showNumArray" block="%tm|showNumArray %arr %blank_pos"
        //% weight=91 blockGap=8
        //% subcategory="TM1637"
        showNumArray(arr: number[], blank_pos:number = -1) {
            while (arr.length()<4) arr.push(-1)
            for(let pos=0;pos<4;pos++)
            {
                if(arr[pos]>=0 && arr[pos]<=9 ) 
                    this.showbit(arr[pos], pos)
                else
                    this._dat(pos, 64)
            }
        }

        /**
          * directly sets value of one segment's bits 
          *
          * @param pos is segment number eg: 1
          * @param value is segment value (bits) to be displayed eg: 65 
          */

        //% blockId="TM1637_showSeg" block="%tm|showSeg %pos %value"
        //% weight=92 blockGap=8
        //% subcategory="TM1637"
        showSeg(pos: number, value :number) {
                this._dat(pos, value)
        }

         /**
          * directly shows array of segments values 
          * each byte is a sum of segment's bits  
          *
          * @param arr is a 4 bytes array, eg: [0x25,0x06,0x27,0x18]
          */

        //% blockId="TM1637_showsegarray" block="%tm|showSegArray %arr"
        //% weight=92 blockGap=8
        //% subcategory="TM1637"
        showSegArray(arr: number[]) {
            while (arr.length()<4) arr.push(0)
            for(let pos=0;pos<4;pos++)
                this._dat(pos, arr[pos])
        }

        /**
          * show a hex number. 
          * @param num is a hex number, eg: 0
          */
        //% blockId="TM1637_showhex" block="%tm|show hex number %num"
        //% weight=90 blockGap=8
        
        showHex(num: number) {
            this.showbit((num >> 12) % 16)
            this.showbit(num % 16, 3)
            this.showbit((num >> 4) % 16, 2)
            this.showbit((num >> 8) % 16, 1)
        }

        /**
         * show or hide dot point. 
         * @param bit is the position, eg: 1
         * @param show is show/hide dp, eg: true
         */
        //% blockId="TM1637_showDP" block="%tm|DotPoint at %bit|show %show"
        //% weight=70 blockGap=8
        //% subcategory="TM1637"
        showDP(bit: number = 1, show: boolean = true) {
            bit = bit % this.count
            if (show) this._dat(bit, this.buf[bit] | 0x80)
            else this._dat(bit, this.buf[bit] & 0x7F)
        }

        /**
         * clear LED. 
         */
        //% blockId="TM1637_clear" block="clear %tm"
        //% weight=80 blockGap=8
        //% subcategory="TM1637"
        clear() {
            for (let i = 0; i < this.count; i++) {
                this._dat(i, 0)
                this.buf[i] = 0
            }
        }

        /**
         * turn on LED. 
         */
        //% blockId="TM1637_on" block="turn on %tm"
        //% weight=86 blockGap=8
        //% parts="TM1637"
        on() {
            this._ON = 8;
            this._write_data_cmd();
            this._write_dsp_ctrl();
        }

        /**
         * turn off LED. 
         */
        //% blockId="TM1637_off" block="turn off %tm"
        //% weight=85 blockGap=8
        //% parts="TM1637"
        off() {
            this._ON = 0;
            this._write_data_cmd();
            this._write_dsp_ctrl();
        }
    }

    /**
     * create a TM1637 object.
     * @param clk the CLK pin for TM1637, eg: DigitalPin.P1
     * @param dio the DIO pin for TM1637, eg: DigitalPin.P2
     * @param intensity the brightness of the LED, eg: 7
     * @param count the count of the LED, eg: 4
     */
    //% subcategory="TM1637"
    //% weight=200 blockGap=8
    //% blockId="createTM1637" block="CLK %clk|DIO %dio"
    export function createTM1637(clk: DigitalPin=DigitalPin.P1, dio: DigitalPin=DigitalPin.P2): TM1637 {
        let tm = new TM1637();
        tm.clk = clk;
        tm.dio = dio;
        tm.count = LED_COUNT
        tm.brightness = 7
        tm.init();
        return tm;
    }

}