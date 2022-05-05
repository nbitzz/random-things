import json
import sys
import subprocess
import pkg_resources
from pathlib import Path

installed = {pkg.key for pkg in pkg_resources.working_set}
required = {"requests","pynput"}
missing = required-installed

try:
    import requests
except: pass

def ask(prompt,options:list):
    print("-------------------------------------")
    for x in options:
        print("[{}] {}".format(options.index(x),x))
    got = str(input(prompt + " > "))
    try:
        int(got)
    except:
        return ask(prompt,options)  
    if (int(got) < len(options)):
        return int(got)
    else:
        return ask(prompt,options)

def InstallMissingPackages():
    missing_list = list(missing)
    if len(missing_list) == 0:
        print("You already have all of the required packages installed.")
        main()
    else:
        print("You are about to install the following modules: {}".format(', '.join(missing_list)))
        opt = ask("Install?",["Yes","No"])
        if opt == 1:
            main()
        else:
            print("Installing packages...")
            subprocess.check_call([sys.executable,"-m","pip","install",*missing_list],stdout=subprocess.DEVNULL)
            print("Packages installed. You can now start bwab.py.")

def Update_BadWords():
    if "requests" in list(installed):
        opt = ask("Install new bad words?",["Yes","No"])
        if opt == 0:
            print("Please wait, attempting to get words...")
            cont = requests.get("https://raw.githubusercontent.com/thisandagain/washyourmouthoutwithsoap/develop/data/build.json")
            data:dict = json.loads(cont.text)
            langs = list(data.keys())
            selectedLanguage = ask("Select a language.",langs)
            language_words = data[langs[selectedLanguage]]
            
            opt = ask("Install words from {} ({} words)?".format(langs[selectedLanguage],len(language_words)),["Yes","No"])

            if (opt == 0):
                tx = Path("./bad_words.txt").read_text().split("\n")
                end = [tx.pop(),tx.pop()]
                end.reverse()
                Path("./bad_words.txt").write_text('\n'.join(tx+language_words+end),"utf8")

            main()
        else:
            main()
    else:
        print("'requests' module not found. Please use the 'Install missing packages' option on the menu, then try again.")

def Change_Censor():
    possible_censors = ["█","#","▓","▒","░","♥",":troll:","*","\\*"]
    tx = Path("./bad_words.txt").read_text().split("\n")
    end = [tx.pop(),tx.pop()]
    end.reverse()
    end[0] = possible_censors[ask("What would you like to change the censor to?",possible_censors)]
    Path("./bad_words.txt").write_text('\n'.join(tx+end),"utf8")
    main()

def Add_Word():
    x = input("Type in a word to add > ").replace(" ","")
    if (x != ""):
        tx = Path("./bad_words.txt").read_text().split("\n")
        end = [tx.pop(),tx.pop()]
        end.reverse()
        tx.append(x.lower())
        Path("./bad_words.txt").write_text('\n'.join(tx+end),"utf8")

def Delete_Word():
    x = input("Type in a word to delete > ").replace(" ","")
    if (x != ""):
        tx = Path("./bad_words.txt").read_text().split("\n")
        end = [tx.pop(),tx.pop()]
        end.reverse()
        if (x.lower() in tx):
            tx.pop(tx.index(x.lower()))
            Path("./bad_words.txt").write_text('\n'.join(tx+end),"utf8")

def View_Words():
    tx = Path("./bad_words.txt").read_text().split("\n")
    end = [tx.pop(),tx.pop()]
    print("-------------------------------------")
    print('\n'.join(tx))

def Word_Manager():
    response = ask("What would you like to do?",["View words","Delete word","Add word","Back"])
    v = [View_Words,Delete_Word,Add_Word,main]
    v[response]()
    Word_Manager()
    
"""
def Change_Filter():
    tx = Path("./bad_words.txt").read_text().split("\n")
    end = [tx.pop(),tx.pop()]
    end[1] = ask("What filtering method would you like to use?",["Old (Could break with BWAB changes)","New"])
    Path("./bad_words.txt").write_text('\n'.join(tx+end))
    main()
"""

def Reset_To_Defaults():
    Path("./bad_words.txt").write_text(Path("./defaults.txt").read_text(),"utf8")
    print("Reset settings to content in ./defaults.txt")
    main()

def main():
    response = ask(
        "What would you like to do?",
            [
                "Install dependencies",
                "Update badwords list",
                "Change censor character",
                "Word Manager",
                "Reset to defaults",
                "Exit"
            ]
    )

    possible = [InstallMissingPackages,Update_BadWords,Change_Censor,Word_Manager,Reset_To_Defaults,exit]

    possible[response]()


main()