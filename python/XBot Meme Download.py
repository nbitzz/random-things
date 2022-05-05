import json
import math
import sys
from pathlib import Path
import subprocess
import time
import pkg_resources

installed = {pkg.key for pkg in pkg_resources.working_set}
required = {"requests"}
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
    else:
        print("You do not have all of the required packages installed.")
        print("You are about to install the following modules: {}".format(', '.join(missing_list)))
        opt = ask("Install?",["Yes","No"])
        if opt == 1:
            exit()
        else:
            print("Installing packages...")
            subprocess.check_call([sys.executable,"-m","pip","install",*missing_list],stdout=subprocess.DEVNULL)
            print("Packages installed.")
            subprocess.check_call([sys.executable,__file__])
            exit()

print("Loading...")
vT = json.loads(requests.get("https://gg-xbot.glitch.me/api/v1/memes/getURL").text)

find = {
    "video/quicktime":"mov"
}

folder = Path(__file__).parent / "XBot_MemeDump_{}".format(math.floor(time.time()))
print("Found {} URLs.\nWould you like to continue? (Items will be downloaded to {})".format(len(vT),folder.resolve()))
if ask("Continue?",["Yes","No"]) == 0:
    folder.mkdir()
    for x in range(len(vT)):
        v = vT[x]
        #print(v)
        print("Begin download: #{}".format(x))
        rq = requests.get(v)

        ext = rq.headers["Content-Type"].split("/")[1]

        if rq.headers["Content-Type"] in find:
            ext = find[rq.headers["Content-Type"]]
        
        print("#{} is a {} (Ext {})".format(x,rq.headers["Content-Type"],ext))

        if rq.headers["Content-Type"].startswith("plain") or rq.headers["Content-Type"].startswith("application"):
            print("#{} is an invalid type: {}".format(x,rq.headers["Content-Type"]))
        else:
            (folder / ("{}.{}".format(x,ext))).write_bytes(rq.content)
            print("Wrote {}".format((folder / ("{}.{}".format(x,ext))).resolve()))
        print("-------------------------------------")
else:
    exit()

print("Complete")