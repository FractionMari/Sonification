/*
 * C S O U N D
 *
 * L I C E N S E
 *
 * This software is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 */
/** Csound global AudioContext
 */
 var CSOUND_AUDIO_CONTEXT = CSOUND_AUDIO_CONTEXT || 
 (function() {
     try {
         var AudioContext = window.AudioContext || window.webkitAudioContext;
         return new AudioContext();      
     }
     catch(error) {
         console.log('Web Audio API is not supported in this browser');
     }
     return null;
 }());
// Global singleton variables
var AudioWorkletGlobalScope = AudioWorkletGlobalScope || {};
var CSOUND_NODE_SCRIPT;
/* SETUP NODE TYPE */
if(typeof AudioWorkletNode !== 'undefined' &&
CSOUND_AUDIO_CONTEXT.audioWorklet !== null) {
 console.log("Using WASM + AudioWorklet Csound implementation");
 CSOUND_NODE_SCRIPT = 'CsoundNode.js';
 CSOUND_AUDIO_CONTEXT.hasAudioWorklet = true;
} else {
 console.log("Using WASM + ScriptProcessorNode Csound implementation");
 CSOUND_NODE_SCRIPT = 'CsoundScriptProcessorNode.js';
 CSOUND_AUDIO_CONTEXT.hasAudioWorklet = false;  
}
const csound_load_script = function(src, callback) {
 var script = document.createElement('script');
 script.src = src;
 script.onload = callback;
 document.head.appendChild(script);
}
/** This ES6 Class provides an interface to the Csound
* engine running on a node (an AudioWorkletNode where available,
* ScriptProcessorNode elsewhere)
* This class is designed to be compatible with
* the previous ScriptProcessorNode-based CsoundObj
*/
class CsoundObj {
 /** Create a CsoundObj
  * @constructor 
  */
 constructor() {
     this.audioContext = CSOUND_AUDIO_CONTEXT;
     // exposes node as property, user may access to set port onMessage callback
     // or we can add a setOnMessage(cb) method on CsoundObj...
     this.node = CsoundObj.createNode();
     this.node.connect(this.audioContext.destination);
     this.microphoneNode = null;
 }
 /** Returns the underlying Csound node
     running the Csound engine.
 */
 getNode() {
     return this.node;
 }
 /** Writes data to a file in the WASM filesystem for
  *  use with csound.
  *
  * @param {string} filePath A string containing the path to write to.
  * @param {blob}   blobData The data to write to file.
  */
 writeToFS(filePath, blobData) {
     this.node.writeToFS(filePath, blobData);
 }
 
 /** Compiles a CSD, which may be given as a filename in the
  *  WASM filesystem or a string containing the code
  *
  * @param {string} csd A string containing the CSD filename or the CSD code.
  */
 compileCSD(csd) {
     this.node.compileCSD(csd);
 }
 /** Compiles Csound orchestra code.
  *
  * @param {string} orcString A string containing the orchestra code.
  */
 compileOrc(orcString) {
     this.node.compileOrc(orcString);
 }
 /** Sets a Csound engine option (flag)
  *  
  *
  * @param {string} option The Csound engine option to set. This should
  * not contain any whitespace.
  */
 setOption(option) {
     this.node.setOption(option);  
 }
 render(filePath) {
 }
 
 /** Evaluates Csound orchestra code.
  *
  * @param {string} codeString A string containing the orchestra code.
  */   
 evaluateCode(codeString) {
     this.node.evaluateCode(codeString);
 }
 /** Reads a numeric score string.
  *
  * @param {string} scoreString A string containing a numeric score.
  */     
 readScore(scoreString) {
     this.node.readScore(scoreString);
 }
 /** Sets the value of a control channel in the software bus
  *
  * @param {string} channelName A string containing the channel name.
  * @param {number} value The value to be set.
  */   
 setControlChannel(channelName, value) {
     this.node.setControlChannel(channelName, value);
 }
 /** Sets the value of a string channel in the software bus
  *
  * @param {string} channelName A string containing the channel name.
  * @param {string} stringValue The string to be set.
  */     
 setStringChannel(channelName, stringValue) {
     this.node.setStringChannel(channelName, stringValue);
 }
 /** Starts the node containing the Csound engine.
  */
 start() {
     if(this.microphoneNode != null) {
         this.microphoneNode.connect(this.node);
     }
     this.node.start();
 }
 /** Resets the Csound engine.
  */
 reset() {
     this.node.reset();
 }
 destroy() {
 }
 /** Starts performance, same as start()
  */
 play() {
     this.node.play();
 }
 /** Stops (pauses) performance
  */
 stop() {
     this.node.stop();
 }
 /** Sets a callback to process Csound console messages.
  *
  * @param {function} msgCallback A callback to process messages 
  * with signature function(message), where message is a string
  * from Csound.
  */    
 setMessageCallback(msgCallback) {
     this.node.setMessageCallback(msgCallback);
 }
 /** Sends a MIDI channel message to Csound
  *
  * @param {number} byte1 MIDI status byte
  * @param {number} byte2 MIDI data byte 1
  * @param {number} byte1 MIDI data byte 2
  *
  */
 midiMessage(byte1, byte2, byte3) {
     this.node.midiMessage(byte1, byte2, byte3);
 }
 /** Enables microphone (external audio) input in browser
  *
  * @param {function} audioInputCallback A callback with a signature
  * function(result), with result set to true in the event of success
  * or false if the microphone cannot be enabled
  */ 
 enableAudioInput(audioInputCallback) {
     navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || null;
     let that = this;
     if (navigator.getUserMedia === null) {
         //Module['print']("Audio Input not supported in this browser");
         audioInputCallback(false);
     } else {
         let onSuccess = function(stream) {
             that.microphoneNode = CSOUND_AUDIO_CONTEXT.createMediaStreamSource(stream);
             audioInputCallback(true);
         };
         let onFailure = function(error) {
             that.microphoneNode = null;
             audioInputCallback(false);
             //Module['print']("Could not initialise audio input, error:" + error);
         };
         navigator.getUserMedia({
             audio: true, 
             video: false
         }, onSuccess, onFailure);
     }
 }
 
 /** 
  * This static method is used to asynchronously setup the Csound
  *  engine node.
  *
  * @param {string} script_base A string containing the base path to scripts
  */
 static importScripts(script_base='./') {
     return new Promise((resolve) => {
         csound_load_script(script_base + CSOUND_NODE_SCRIPT, () => {
             if(CSOUND_AUDIO_CONTEXT.hasAudioWorklet) CSOUND_AUDIO_CONTEXT.factory = CsoundNodeFactory;
             else CSOUND_AUDIO_CONTEXT.factory = CsoundScriptProcessorNodeFactory;
             CSOUND_AUDIO_CONTEXT.factory.importScripts(script_base).then(() => {
                 resolve();
             })
         })
     }) 
 }
 /** 
  * This static method creates a new Csound Engine node unattached
  * to a CsoundObj object. It can be used in scenarios where 
  * CsoundObj is not needed (ie. WebAudio API programming)
  *
  *  @param {number} InputChannelCount number of input channels
  *  @param {number} OutputChannelCount number of output channels
  *  @return A new Csound Engine Node (CsoundNode or CsoundScriptProcessorNode)
  */
 static createNode(inputChannelCount=1, outputChannelCount=2) {
     return CSOUND_AUDIO_CONTEXT.factory.createNode(inputChannelCount,outputChannelCount);
 }
}