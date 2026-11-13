var e=`trs80-audio-processor`,t=.6,n=`
const VOLUME = 0.10;

// Generates the TRS-80 sound.
class Trs80SoundProcessor extends AudioWorkletProcessor {
    // This parameter is the audio itself. We just pass it on.
    static get parameterDescriptors() {
        return [
            {
                name: "leftValue",
                defaultValue: 0,
            },
            {
                name: "rightValue",
                defaultValue: 0,
            }
        ];
    }

    constructor() {
        super();
    }

    // Send the value to the channel.
    processChannel(channel, audioValue) {
        if (audioValue.length === 1) {
            const value = audioValue[0]*VOLUME;

            for (let i = 0; i < channel.length; i++) {
                channel[i] = value;
            }
        } else {
            for (let i = 0; i < channel.length; i++) {
                channel[i] = audioValue[i]*VOLUME;
            }
        }
    }

    // Process 128 audio samples at a time.
    process(inputs, outputs, parameters) {
        // We only have one output.
        const output = outputs[0];

        if (output.length >= 1) {
            this.processChannel(output[0], parameters.leftValue);
        }
        if (output.length >= 2) {
            this.processChannel(output[1], parameters.rightValue);
        }

        // Keep going.
        return true;
    }
}

// Register ourselves by name.
registerProcessor("${e}", Trs80SoundProcessor);
`,r=30,i=class{constructor(){this.muted=!0,this.audioContext=void 0,this.leftValue=void 0,this.rightValue=void 0,this.floppyMotorOn=!1,this.floppySpinAudioBuffer=void 0,this.floppySpinSourceNode=void 0,this.floppySpinGainNode=void 0,this.trackAudioBuffer=void 0,this.adjustment=0,this.lastAudioTime=0,this.isSuspended=!1}resumeAudio(){this.isSuspended&&this.audioContext!==void 0&&(this.audioContext.resume(),this.isSuspended=!1)}setAudioValue(e,t,n,r){if(!this.muted&&this.audioContext!==void 0&&this.leftValue!==void 0&&this.rightValue!==void 0){this.resumeAudio();let i=n/r,a=this.audioContext.currentTime,o=i-a,s=o-this.adjustment;(s<0||s>.05)&&(this.adjustment=o-.025),this.leftValue.setValueAtTime(e,i-this.adjustment),this.rightValue.setValueAtTime(t,i-this.adjustment),this.lastAudioTime=a}}mute(){this.muted||(this.muted=!0,this.audioContext!==void 0&&(this.audioContext.suspend(),this.isSuspended=!0))}unmute(){this.muted&&(this.audioContext===void 0&&this.enableAudio(),this.muted=!1,this.audioContext!==void 0&&(this.audioContext.resume(),this.isSuspended=!1))}setFloppyMotorOn(e){this.floppyMotorOn=e,this.updateFloppySpin()}updateFloppySpin(){if(!this.floppyMotorOn&&this.floppySpinSourceNode!==void 0&&this.floppySpinGainNode!==void 0&&this.audioContext!==void 0){let e=this.audioContext.currentTime+.2;this.floppySpinGainNode.gain.setValueAtTime(t,this.audioContext.currentTime),this.floppySpinGainNode.gain.linearRampToValueAtTime(0,e),this.floppySpinSourceNode.stop(e),this.floppySpinSourceNode=void 0,this.floppySpinGainNode=void 0}else this.floppyMotorOn&&this.floppySpinSourceNode===void 0&&this.floppySpinAudioBuffer!==void 0&&this.audioContext!==void 0&&(this.resumeAudio(),this.floppySpinGainNode=this.audioContext.createGain(),this.floppySpinGainNode.connect(this.audioContext.destination),this.floppySpinGainNode.gain.setValueAtTime(0,this.audioContext.currentTime),this.floppySpinGainNode.gain.linearRampToValueAtTime(t,this.audioContext.currentTime+.2),this.floppySpinSourceNode=this.audioContext.createBufferSource(),this.floppySpinSourceNode.buffer=this.floppySpinAudioBuffer,this.floppySpinSourceNode.connect(this.floppySpinGainNode),this.floppySpinSourceNode.loop=!0,this.floppySpinSourceNode.start(),this.lastAudioTime=this.audioContext.currentTime)}playTrackSound(){if(this.audioContext!==void 0&&this.trackAudioBuffer!==void 0){this.resumeAudio();let e=this.audioContext.createGain();e.connect(this.audioContext.destination),e.gain.setValueAtTime(.3,this.audioContext.currentTime);let t=this.audioContext.createBufferSource();t.buffer=this.trackAudioBuffer,t.connect(e),t.start(),this.lastAudioTime=this.audioContext.currentTime}}trackMoved(e){this.playTrackSound()}isMuted(){return this.muted}checkAutoSuspend(){this.audioContext!==void 0&&!this.isSuspended&&this.floppySpinSourceNode===void 0&&this.audioContext.currentTime-this.lastAudioTime>=r&&(this.audioContext.suspend(),this.isSuspended=!0)}enableAudio(){this.audioContext=new AudioContext({latencyHint:`interactive`});let t=this.audioContext;if(window.AudioWorkletNode!==void 0){let r=`data:text/javascript;base64,`+btoa(n);this.audioContext.audioWorklet.addModule(r).then(()=>{let n=t.createConstantSource();class r extends AudioWorkletNode{constructor(t){super(t,e)}}let i=new r(t);if(i.channelCountMode=`explicit`,i.channelCount=2,this.leftValue=i.parameters.get(`leftValue`),this.leftValue===void 0)throw Error(`Unknown param leftValue`);if(this.rightValue=i.parameters.get(`rightValue`),this.rightValue===void 0)throw Error(`Unknown param rightValue`);setInterval(()=>this.checkAutoSuspend(),1e3),n.connect(i).connect(t.destination),n.start()})}fetch(`https://raw.githubusercontent.com/lkesteloot/trs80-emulator/83e7fabd7d26f3e197329ee05a7c8ffc4063362c/sounds/spin.mp3`).then(e=>e.status===200?e.blob():Promise.reject(`fetch failed: `+e.statusText)).then(e=>e.arrayBuffer()).then(e=>t.decodeAudioData(e)).then(e=>{this.floppySpinAudioBuffer=e,this.updateFloppySpin()}).catch(e=>{console.error(e)}),fetch(`https://raw.githubusercontent.com/lkesteloot/trs80-emulator/83845b15b3c99daa8237e22b48f00426fcdc0cbf/sounds/track.mp3`).then(e=>e.status===200?e.blob():Promise.reject(`fetch failed: `+e.statusText)).then(e=>e.arrayBuffer()).then(e=>t.decodeAudioData(e)).then(e=>{this.trackAudioBuffer=e}).catch(e=>{console.error(e)})}};export{i as WebSoundPlayer};