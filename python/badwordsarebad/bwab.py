# BWAB.py
# Use bad_words.txt for configuration.
# Last line for censor character, rest for words

import pathlib
from pynput import keyboard
from pathlib import Path
import os

words = Path("./bad_words.txt").read_text('utf8').split("\n")
censor = words[(len(words)-2)]
#p2 = words[(len(words)-1)]
p2 = words.pop()

KeyboardController = keyboard.Controller()
typedString = ""

def onType(key):
    global typedString
    if (key == keyboard.Key.backspace):
        typedString = typedString[0:len(typedString)-1]
    if (key == keyboard.Key.space or key == keyboard.Key.enter):
        typedString = ""
    try:
        typedString += key.char
    except:
        pass
    for x in range(0,len(words)-1):
        if typedString.lower().find(words[x]) != -1:
            typedString = ""
            KeyboardController.type("\b"*len(words[x])+censor*len(words[x]))
            if words[x] == "nigger": # hard r
                rac = Path("./racist.txt")
                rac.write_text("racist")
                os.popen("notepad.exe {}".format(str(rac.resolve())))
            break

with keyboard.Listener(
    on_press=onType
) as listener:
    listener.join()