// /home/logan/Programming/Games/HKGuessr/src/js/main.js

// --- Firebase Initialization ---
import { firebaseConfig } from './firebaseConfig.js';
firebase.initializeApp(firebaseConfig);

const db = firebase.database();
const textRef = db.ref("liveText");

textRef.on("value", (snapshot) => {
    // I loooove html injection
    const magicTextElement = document.getElementById("magicText");
    const newText = snapshot.val() || "";

    // Only animate if there's new text and it's different from current
    if (newText && newText !== magicTextElement.innerHTML) {
        // Remove animation class first to reset
        magicTextElement.classList.remove("animate");

        // Force reflow to ensure class removal is processed
        void magicTextElement.offsetWidth;

        // Update text
        magicTextElement.innerHTML = newText;

        // Add animation class to trigger animation
        magicTextElement.classList.add("animate");

        // Remove animation class after animation completes
        setTimeout(() => {
            magicTextElement.classList.remove("animate");
        }, 800);
    } else if (!newText) {
        magicTextElement.innerHTML = "";
    }
});
