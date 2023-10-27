# Farnell Synthesis

### Part 1: Recreating Babbling Brook
[insert url]

### Part 2: Designing sound - Bouncing Ball
[insert url]

**Code Walkthrough:**
I aimed to recreate the sound of bouncing, inspired by "Pratical 7: Bouncing" in Farnell's *Designing Sound Part IV*.
Below, is an explanantion of a simplified (more generalized) version of my code.

First, I initialized a sine wave oscillator. The important attributes here are:
- Frequency: Alters the pitch of a bounce
- Bounce Period: Affects the duration of one bounce
- Decay Time: Duration of time it takes to reach 0 amplitude from the attack time
- Attack Time: The time it takes to reach the peak amplitude - for bouncing, we want a short/sudden attack time.
- Gain: Affects the volume a bounce - louder bounce = higher

```
sig = audioCtx.createOscillator();
sig.type = 'sine';   
sig.frequency.value = 200.; 
bouncePeriod = 0.6;
decayTime = 0.5;
attackTime = 0.001;

gainNode = audioCtx.createGain();
amp = 0.7;
```

Next, I implemented frequency modulation. The carrier frequency will eventually be added to the original signal to simulate the "thud" of the bounce (Farnell, 385). I found (after experimenting a bit) that a higher modulation index tends to make the bouncing sound more elastic or "springy".
```
modFrequency = audioCtx.createOscillator();
modFrequency.frequency.value = 130
carrierFrequency = audioCtx.createOscillator();
var modIndex = audioCtx.createGain();
modIndex.gain.value = 100;
```
This covers the initial settings of the first bounce. Next I wrote a function to handle all subsequent bounces.

The first portion handles the amplitude curve of each bounce. We first raise the amplitude to ~1 during the attack time. Then decay to 0.
At the same time, we change the modulation frequency according to a 4th power law decay relative to the bounce period (Farnell, 385). Again, this line is what adds the the deeper "thud" into the bouncing noise.
```
function bounce() {
    // Bounce envelope
    gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(amp, audioCtx.currentTime + attackTime); 
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + attackTime + decayTime);
    modFrequency.frequency.setValueAtTime(80 + (210 * Math.pow(bouncePeriod, 4)), audioCtx.currentTime);
```
I then adjust decay time, bounce period, and amplitude. On later bounces, these parameters should all decrease due to the decreasing height over time. I initiate a "decay" in these attrobutes on every power of two bounce. This implementation, although a bit different, is meant to recreate Farnell's use of a "line" to incrementally increase the number of bounces per bounce period. 
```
    sepTime = bouncePeriod * 1000

    // Decay parameters on every power of 2
    if (2 ** numDecays == numBounces) {
        decayFactor = 5 / 8
        ampDecayFactor = 1 / 2
        numDecays = numDecays + 1
    }
    else {
        decayFactor = 1.
    }
    numBounces = numBounces + 1
    decayTime = decayTime * decayFactor
    bouncePeriod = bouncePeriod * decayFactor
    amp = amp * ampDecayFactor
```
After the completion of one bounce, I call bounce() again, with a separation time equivalent to the bounce period. I end the cycle after 5 decays - this was just an experimental choice. 
```
    // Start next bounce (as long as there have been only  less than 5 "decays")
    if (numDecays < 5) {
        setTimeout(bounce, sepTime)
    }
    else {
        sig.stop()
        modFrequency.stop()
    }
}
```
