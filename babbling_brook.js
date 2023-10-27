var audioCtx;
var highpass_gain;

function playBrook() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext);
    var brownNoise = create_brown_noise(audioCtx)

    // LPF.ar(BrownNoise.ar(), 400)
    const lowspass1 = audioCtx.createBiquadFilter();
    lowspass1.type = "lowpass"; 
    lowspass1.frequency.value = 100; 
    
    //const lowpass_gain1 = audioCtx.createGain();
    //lowpass_gain1.gain.value= 1.;

    // LPF.ar(BrownNoise.ar(), 14) * 400 + 500
    const lowpass2 = audioCtx.createBiquadFilter();
    lowpass2.type = "lowpass"; 
    lowpass2.frequency.value = 14; 
    
    const lowpass_mul_gain = audioCtx.createGain();
    lowpass_mul_gain.gain.value = 400; 

    const offset_source = audioCtx.createConstantSource();
    offset_source.offset.value = 500;
    //const lowpass_add_gain = audioCtx.createGain();
    //lowpass_add_gain.gain.value = 1.; 
    const lowpass_total_gain = audioCtx.createGain();
    lowpass_total_gain.gain.value= 1.;

    // RHPF.ar(...)
    const highpass = audioCtx.createBiquadFilter();
    highpass.type = "highpass"; 
    highpass.Q.value = 1 / 0.03; 

    highpass_gain = audioCtx.createGain();
    highpass_gain.gain.value = 0.1; 
    //highpass_gain.gain.setValueAtTime(0.001, audioCtx.currentTime)
    //highpass_gain.gain.exponentialRampToValueAtTime(0.1, audioCtx.currentTime + 0.2)


    brownNoise.connect(lowspass1)
    brownNoise.connect(lowpass2)
    brownNoise.start();


    lowspass1.connect(highpass);
    lowpass2.connect(lowpass_mul_gain).connect(lowpass_total_gain)
    offset_source.connect(lowpass_total_gain);
    //offset_source.connect(lowpass_add_gain).connect(lowpass_total_gain);
    lowpass_total_gain.connect(highpass.frequency);
    highpass.connect(highpass_gain);
    highpass_gain.connect(audioCtx.destination);
}

function create_brown_noise(audioCtx) {
    var bufferSize = 10 * audioCtx.sampleRate,
    noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate),
    output = noiseBuffer.getChannelData(0);

    var lastOut = 0;
    for (var i = 0; i < bufferSize; i++) {
        var brown = Math.random() * 2 - 1;
    
        output[i] = (lastOut + (0.02 * brown)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
    }

    brownNoise = audioCtx.createBufferSource();
    brownNoise.buffer = noiseBuffer;
    brownNoise.loop = true;
    return brownNoise
}

const playButton = document.querySelector('button');
playButton.addEventListener('click', function() {

    if(!audioCtx) {
        playBrook();
        return;
	}

    if (audioCtx.state === 'suspended') {
        highpass_gain.gain.setValueAtTime(0.001, audioCtx.currentTime)
        highpass_gain.gain.exponentialRampToValueAtTime(0.1, audioCtx.currentTime + 0.2)
        audioCtx.resume();
    }

    if (audioCtx.state === 'running') {
        highpass_gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03)
        audioCtx.suspend();
    }

}, false);
