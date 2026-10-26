# CrossTalk — Simple Netlify Version

A simple, mobile-friendly multilingual conversation demo.

## Features
- Choose Person A and Person B languages.
- Type any message; it is translated into the other person's language using the MyMemory public translation endpoint.
- Choose which person is speaking before sending.
- Use browser speech recognition for microphone input (Chrome/Edge support varies).
- Translated messages can be read aloud with browser speech synthesis.
- Interrupt adds a highlighted message from the currently selected speaker.
- The interface automatically switches the speaker selector after a message.

## Deploy to Netlify via GitHub
1. Upload the contents of this folder to the root of a GitHub repository.
2. In Netlify, choose **Add new project → Import an existing project**.
3. Select the GitHub repository.
4. Build command: leave blank.
5. Publish directory: `.` (root).
6. Deploy.

## Important limitations
This is a text-first prototype with optional browser voice input/output. It is not a live phone/video call and does not capture two people speaking simultaneously. Translation depends on an external public endpoint and is not guaranteed for every language or message. For production, connect a supported translation provider through a secure serverless function and never expose private API keys in frontend code.


## Two-way message rule
Every Person A message is translated to Person B's selected language directly underneath. Every Person B message is translated to Person A's selected language directly underneath. The speaker automatically switches after each send.
