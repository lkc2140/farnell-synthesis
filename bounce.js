var audioCtx;
var sig;
var gainNode;
var bouncePeriod;
var decayTime;
var attackTime;
var modFrequency;
var amp;
var numBounces;
var numDecays;
var sepTime;
var carrierFrequency;

function initNote() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Create main signal
    var sig_opt = document.getElementsByName("type");
        for (i = 0; i < sig_opt.length; i++) {
            if (sig_opt[i].checked)
            sig_type = sig_opt[i].value;
    }
    sig = audioCtx.createOscillator();
    sig.type = 'sine';
    if (sig_type == 0){ // Rubber ball
        sig.frequency.value = 80.; 
        bouncePeriod = 0.6;
        decayTime = 0.5;
        attackTime = 0.001;
    }
    else if (sig_type == 1){ // Plastic ball
        sig.frequency.value = 800.;
        bouncePeriod = 0.5;
        decayTime = 0.3;
        attackTime = 0.001;
    }
    else if (sig_type == 2){ // Glass marble
        sig.frequency.value = 1500.;
        bouncePeriod = 0.5;
        decayTime = 0.1;
        attackTime = 0.001;
    }

    // GainNode to control amplitude of bounce
    gainNode = audioCtx.createGain();
    amp = 0.7;

    // FM Modulation to simulate "thudding" noise
    modFrequency = audioCtx.createOscillator();
    modFrequency.frequency.value = 130
    carrierFrequency = audioCtx.createOscillator();
    var modIndex = audioCtx.createGain();
    
    // Select mod index 
    if (sig_type == 0) 
        modIndex.gain.value = 200
    else if (sig_type == 1)
        modIndex.gain.value = 5;
    else if (sig_type == 2)
        modIndex.gain.value = 100;
    
    // Connect everything
    modFrequency.connect(modIndex);
    modIndex.connect(carrierFrequency.frequency)
    carrierFrequency.connect(gainNode)
    sig.connect(gainNode).connect(audioCtx.destination);
    modFrequency.start(audioCtx.currentTime)
    sig.start(audioCtx.currentTime);
    carrierFrequency.start(audioCtx.currentTime)

    // Start bounce
    numBounces = 1
    numDecays = 0
    sepTime = 0.
    decayFactor = 1
    bounce()
}



function bounce() {
    // Amplitude curve
    gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(amp, audioCtx.currentTime + attackTime); 
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + attackTime + decayTime);
    gainNode.gain.setValueAtTime(0.0, audioCtx.currentTime + attackTime + decayTime);
    modFrequency.frequency.setValueAtTime(80 + (130 * Math.pow(bouncePeriod/1., 4)), audioCtx.currentTime);

    sepTime = bouncePeriod * 1000

    // Decay parameters on every power of 2
    if (2 ** numDecays == numBounces) {
        decayFactor = 5 / 8
        if (sig_type == 1) // Plastic ball --> Faster decay
            decayFactor = 1 / 2
        ampDecayFactor = 1 / 2
        numDecays = numDecays + 1
    }
    else {
        decayFactor = 1.
    }

    // Adjust next bounce parameters
    numBounces = numBounces + 1
    decayTime = decayTime * decayFactor
    bouncePeriod = bouncePeriod * decayFactor
    amp = amp * ampDecayFactor

    // Start next bounce (as long as there have been only  less than 5 "decays")
    if (numDecays < 5) {
        setTimeout(bounce, sepTime)
    }
    else {
        sig.stop()
        modFrequency.stop()
        carrierFrequency.stop()
    }

}

const playButton = document.querySelector('button');
playButton.addEventListener('click', function() {
    if(!audioCtx)
        initNote()
    else if (audioCtx.state === 'running') {
        sig.stop()
        modFrequency.stop()
        initNote()
    }
    
}, false);
