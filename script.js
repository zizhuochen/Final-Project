// BEGIN FULL SCRIPT

// ✅ Restored: Voice recording + bubble logic

let recognition = null;
let isRecording = false;
let currentTranscript = '';
let bubbleCount = 0;

let scrolling = false;
let scrollInterval = null;


// Wait for DOM to be ready

document.addEventListener('DOMContentLoaded', function () {
    const helpButton = document.getElementById('helpButton');
    const overlay = document.getElementById('overlay');

    // Setup instruction panel toggle
    if (helpButton && overlay) {
        helpButton.addEventListener('click', event => {
            event.stopPropagation();
            overlay.classList.remove('hidden');
        });

        const modalInstructions = document.querySelector('.modal-instructions');
        if (modalInstructions) {
            modalInstructions.addEventListener('click', event => event.stopPropagation());
        }

        document.body.addEventListener('click', () => {
            overlay.classList.add('hidden');
        });
    }
    // Insert intro overlay
    const intro = document.createElement('div');
    intro.id = 'intro-overlay';
    intro.style.position = 'fixed';
    intro.style.top = 0;
    intro.style.left = 0;
    intro.style.width = '100%';
    intro.style.height = '100%';
    intro.style.background = 'black';
    intro.style.color = 'white';
    intro.style.zIndex = '10000';
    intro.style.display = 'flex';
    intro.style.flexDirection = 'column';
    intro.style.alignItems = 'center';
    intro.style.justifyContent = 'center';
    intro.style.fontFamily = 'inherit';
    intro.style.overflow = 'hidden';

    const title = document.createElement('h1');
    title.innerText = 'Into Deep Dream';
    title.style.fontSize = '2.5em';
    title.style.margin = '0 0 30px 0';

    const scrollWrapper = document.createElement('div');
    scrollWrapper.style.maxHeight = '60vh';
    scrollWrapper.style.overflow = 'hidden';
    scrollWrapper.style.position = 'relative';
    scrollWrapper.style.width = '100%';
    scrollWrapper.style.display = 'flex';
    scrollWrapper.style.justifyContent = 'center';

    const poem = document.createElement('div');
    poem.innerText = `The door of night opens quietly.
Fragments of the day—like fallen feathers—
float slowly in the mind.
Unfinished sentences, words never spoken,
a glance you didn’t write down, a sigh—
all return here to be rewoven.

You speak into this page.
Your voice becomes bubbles of text,
neatly aligned at first, like ink on paper.
Clear letters. Structured thoughts.
As if you controlled time.

But dreams obey no logic.
The more you speak,
the further you drift from what you meant.
The bubbles begin to float, spin, dissolve—
like consciousness slipping into the subconscious.

They say dreams are the soul’s own poetry.
Then perhaps these bubbles
are the residue of language
leaking at the edges of meaning.
You once tried to express.
But expression always fades, always distorts.

Did you know? A baby in the womb
already hears the outside world.
Sound passes through flesh and fluid,
blurred, fragmented—yet it builds the very first perception of reality.
We all learn to exist through echoes.

Now, like that infant,
you listen again—to your incomplete words.
You rebuild yourself through speech
that breaks apart.
You think you’re recording,
but really, you're being written.
You’re weaving the dream,
and being woven into it.

Keep speaking.
Let this page fall into deeper sleep.

—

This website is an interface where sound meets dream. Each voice recording appears as a bubble—initially ordered and stable. But as more recordings are added, the bubbles begin to drift, distort, and scatter, mirroring how the human mind reweaves fragmented daily memories into dreams—random, nonlinear, yet emotionally vivid.

Much like a fetus sensing the world through muffled external sounds, each recorded phrase—small and fragmentary—shapes a new field of perception. As the viewer scrolls downward, they too descend from clarity into a deep dreamscape.`;
    poem.style.whiteSpace = 'pre-wrap';
    poem.style.fontSize = '1.1em';
    poem.style.lineHeight = '1.8';
    poem.style.textAlign = 'center';
    poem.style.padding = '0 40px';
    poem.style.animation = 'scrollPoem 60s linear infinite';
    poem.style.fontFamily = 'inherit';
    poem.style.scrollbarWidth = 'none';
    poem.style.msOverflowStyle = 'none';
    poem.style.overflow = 'hidden';
    poem.style.position = 'relative';

    scrollWrapper.appendChild(poem);

    const enter = document.createElement('div');
    enter.innerText = 'Click to start recording your dream →';
    enter.style.marginTop = '40px';
    enter.style.fontSize = '0.9em';
    enter.style.opacity = '0.7';
    enter.style.cursor = 'pointer';
    enter.style.transition = 'opacity 0.3s ease';
    enter.addEventListener('mouseenter', () => {
        enter.style.opacity = '1';
        enter.style.textShadow = '0 0 8px white';
    });
    enter.addEventListener('mouseleave', () => {
        enter.style.opacity = '0.7';
        enter.style.textShadow = 'none';
    });
    enter.addEventListener('click', () => {
        intro.remove();
    });

    intro.appendChild(title);
    intro.appendChild(scrollWrapper);
    intro.appendChild(enter);
    document.body.appendChild(intro);

    // ✅ Resume rest of app setup
    const recordButton = document.getElementById('recordButton');
    const statusElement = document.getElementById('status');
    const transcriptsList = document.getElementById('transcriptsList');

    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        statusElement.textContent = 'Your browser does not support speech recognition.';
        recordButton.disabled = true;
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recordButton.addEventListener('click', toggleRecording);

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            scrolling = !scrolling;
            if (scrolling) {
                scrollInterval = setInterval(() => {
                    window.scrollBy(0, 1.5);
                }, 16);
            } else {
                clearInterval(scrollInterval);
            }
        }
    });

    function toggleRecording() {
        isRecording ? stopRecording() : startRecording();
    }

    function startRecording() {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        currentTranscript = '';

        recognition.onstart = () => {
            isRecording = true;
            recordButton.textContent = 'Stop Recording';
            recordButton.classList.add('recording');
            statusElement.textContent = 'Recording...';
        };

        recognition.onresult = function (event) {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    currentTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }
            statusElement.textContent = interimTranscript ? 'Recording: ' + interimTranscript : 'Recording...';
        };

        recognition.onerror = function (event) {
            console.error('Speech recognition error', event.error);
            statusElement.textContent = 'Error: ' + event.error;
            stopRecording();
        };

        recognition.onend = function () {
            if (isRecording) recognition.start();
        };

        recognition.start();
    }

    function stopRecording() {
        if (recognition) {
            recognition.stop();
            isRecording = false;
            recordButton.textContent = 'Start Recording';
            recordButton.classList.remove('recording');

            if (currentTranscript.trim() !== '') {
                addTranscript(currentTranscript);
                currentTranscript = '';
            }
            statusElement.textContent = 'Ready';
        }
    }

    function addTranscript(text) {
        if (!text || text.trim() === '') return;

        const now = new Date();
        const timeString = now.toLocaleTimeString() + ' ' + now.toLocaleDateString();

        const transcriptDiv = document.createElement('div');
        transcriptDiv.className = 'transcript';

        let scale = 1;
        let posX = 10;
        let posY = bubbleCount * 120 + 60;
        let floatIntensity = 0;

        if (bubbleCount < 4) {
            scale = 1;
            posX = 10;
            floatIntensity = 0;
        } else if (bubbleCount < 9) {
            const t = (bubbleCount - 4) / 5;
            scale = 1 + t * ((Math.random() * 1.2 + 0.4) - 1);
            posX = 10 + t * (Math.random() * 80);
            floatIntensity = t;
        } else {
            scale = (Math.random() * 1.2 + 0.4).toFixed(2);
            posX = Math.random() * 80 + 5;
            floatIntensity = 1;
        }

        transcriptDiv.style.left = `${posX}%`;
        transcriptDiv.style.top = `${posY}px`;
        transcriptDiv.style.fontSize = `${16 * scale}px`;

        if (floatIntensity > 0) {
            const duration = 6 + Math.random() * 6 * floatIntensity;
            const delay = Math.random() * 3;
            transcriptDiv.style.animation = `float ${duration}s ease-in-out ${delay}s infinite alternate`;
        } else {
            transcriptDiv.style.animation = 'none';
        }

        const timeElement = document.createElement('div');
        timeElement.className = 'transcript-time';
        timeElement.textContent = timeString;

        const textElement = document.createElement('div');
        textElement.className = 'transcript-text';
        textElement.textContent = text.trim();

        transcriptDiv.appendChild(timeElement);
        transcriptDiv.appendChild(textElement);
        transcriptsList.appendChild(transcriptDiv);
        bubbleCount++;

        setupDrag(transcriptDiv);
        setupClickExpand(transcriptDiv, text.trim());
    }

    function setupClickExpand(el, fullText) {
        const modal = document.getElementById('expandedModal');
        const backdrop = document.getElementById('backdrop');
        el.addEventListener('click', e => {
            e.stopPropagation();
            backdrop.style.display = 'block';
            modal.textContent = fullText;
            modal.style.display = 'flex';
        });

        document.body.addEventListener('click', () => {
            backdrop.style.display = 'none';
            modal.style.display = 'none';
        });
    }

    function setupDrag(el) {
        let isDragging = false, offsetX = 0, offsetY = 0;

        el.addEventListener('mousedown', e => {
            if (document.getElementById('expandedModal').style.display === 'flex') return;
            isDragging = true;
            offsetX = e.offsetX;
            offsetY = e.offsetY;
            el.style.transition = 'none';
            el.style.zIndex = 1000;
        });

        document.addEventListener('mousemove', e => {
            if (isDragging) {
                el.style.left = `${e.pageX - offsetX}px`;
                el.style.top = `${e.pageY - offsetY}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            el.style.transition = '';
            el.style.zIndex = '';
        });
    }
});

