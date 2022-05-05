#                IMG to GUI                 #
# A crappy IMG to Roblox GUI script I made. #
#                Written by                 #
#                split#1337                 #

# This script uses:
# Pillow
# tkinter
# ttkthemes
# Make sure you have these added.

THEMEV = 0
ScreenshotSizes = ["75x75","100x100","150x150","200x200","250x250","250x150","150x250"]
Themes = [["yaru","#f5f6f7"],["arc","#f5f6f7"],["plastik","#efefef"],["equilux","#464646"],["clearlooks","#efebe7"],["none","#f0f0f0"]]

try:
    from pathlib import Path
    import tkinter
    import tkinter.filedialog
    import tkinter.ttk
    import tempfile
    import pynput
    import tkinter.font
    import time
    import math
    import getpass
    import subprocess
    import threading
    import requests
    import sys
    import json
    from ttkthemes import ThemedTk
    import tkinter.simpledialog
    from PIL import ImageTk, Image
except:
    print("An error occured")
    window = tkinter.Tk()
    tkinter.ttk.Label(window,text="This script requires Pillow,\n Requests, Pynput\n and ttkthemes.\n If you have Python added to PATH, \nclick the button below:").place(relx=0.5,rely=0.5,anchor=tkinter.CENTER)
    def PATHINSTALLALL():
        subprocess.Popen("pip install pynput")
        subprocess.Popen("pip install requests")
        subprocess.Popen("pip install pillow")
        subprocess.Popen("pip install ttkthemes")
        subprocess.Popen("pip install pyautogui")
        exit()
    tkinter.ttk.Button(window,text="I have Python in PATH",command=PATHINSTALLALL).place(relx=0.5,rely=1,anchor=tkinter.S)
    window.protocol("WM_DELETE_WINDOW",exit)
    window.mainloop()


hasPyAutoGui = False

try:
    import pyautogui
except ImportError:
    print("lol")

typesZoom = {
    "None":1,
    "x2":2,
    "x3":3,
    "x4":4,
    "x6":6,
    "x8":8
}

# Load in settings
if not Path("C:/Users/{}/AppData/Local/I2G".format(getpass.getuser())).exists():
    Path("C:/Users/{}/AppData/Local/I2G".format(getpass.getuser())).mkdir(parents=True)

if not Path("C:/Users/{}/AppData/Local/I2G/screenshots".format(getpass.getuser())).exists():
    Path("C:/Users/{}/AppData/Local/I2G/screenshots".format(getpass.getuser())).mkdir(parents=True)

if not Path("C:/Users/{}/AppData/Local/Temp".format(getpass.getuser())).exists():
    Path("C:/Users/{}/AppData/Local/Temp".format(getpass.getuser())).mkdir(parents=True)

# Settings order
# 0 Theme index
# 1 Screenshot size table
# 2 Bool variable for if we should save the image to disk after using from screenshot
# 3 Roblox studio version cache, in case the current version of studio is out of date



TV = requests.get("http://setup.roblox.com/versionQTStudio")
RobloxStudioPath = Path("C:/Users/{}/AppData/Local/Roblox/Versions/{}".format(getpass.getuser(),TV.text))
DoSaveScreenshotsAuto = False

if Path("C:/Users/{}/AppData/Local/I2G/settings.json".format(getpass.getuser())).exists():
    Settings = json.loads(Path("C:/Users/{}/AppData/Local/I2G/settings.json".format(getpass.getuser())).read_text())
    THEMEV = Settings[0]
    ScreenshotSizes = Settings[1]
    if Settings[2] == 1:
        DoSaveScreenshotsAuto = True

    if not RobloxStudioPath.exists():
        RobloxStudioPath = Path("C:/Users/{}/AppData/Local/Roblox/Versions/{}".format(getpass.getuser(),Settings[3]))
else:
    # Do first setup
    Path("C:/Users/{}/AppData/Local/I2G/settings.json".format(getpass.getuser())).write_text(json.dumps([THEMEV,ScreenshotSizes,0,TV.text]))


baseProperties = '<Properties><bool name="Active">false</bool><Vector2 name="AnchorPoint"><X>0</X><Y>0</Y></Vector2><BinaryString name="AttributesSerialize"></BinaryString><bool name="AutoLocalize">true</bool><token name="AutomaticSize">0</token><Color3 name="BackgroundColor3"><R>{cR}</R><G>{cG}</G><B>{cB}</B></Color3><float name="BackgroundTransparency">0</float><Color3 name="BorderColor3"><R>0.105882362</R><G>0.164705887</G><B>0.207843155</B></Color3><token name="BorderMode">0</token><int name="BorderSizePixel">0</int><bool name="ClipsDescendants">false</bool><bool name="Draggable">false</bool><int name="LayoutOrder">0</int><string name="Name">Frame</string><Ref name="NextSelectionDown">null</Ref><Ref name="NextSelectionLeft">null</Ref><Ref name="NextSelectionRight">null</Ref><Ref name="NextSelectionUp">null</Ref><UDim2 name="Position"><XS>0</XS><XO>{xpos}</XO><YS>0</YS><YO>{ypos}</YO></UDim2><Ref name="RootLocalizationTable">null</Ref><float name="Rotation">0</float><bool name="Selectable">false</bool><Ref name="SelectionImageObject">null</Ref><UDim2 name="Size"><XS>0</XS><XO>{size}</XO><YS>0</YS><YO>{size}</YO></UDim2><token name="SizeConstraint">0</token><int64 name="SourceAssetId">-1</int64><token name="Style">0</token><BinaryString name="Tags"></BinaryString><bool name="Visible">true</bool><int name="ZIndex">1</int></Properties>'

def rgbtohex(r,g,b):
    return f'#{r:02x}{g:02x}{b:02x}'

Main = ThemedTk(theme=Themes[THEMEV][0])

Main.config(bg=Themes[THEMEV][1])

def convert(img,pathname):
     #content = Path(n.name).read_text()

        tempwindow = ThemedTk(theme=Themes[THEMEV][0])
        
        tempwindow.config(bg=Themes[THEMEV][1])

        def askCancel():
            return

        tempwindow.protocol("WM_DELETE_WINDOW",askCancel)

        tempwindow.title("Converting " + pathname + " to GUI")
        prog = tkinter.ttk.Label(tempwindow,text="Starting conversion...")

        prog.pack()

        prog.update()

        progN = tkinter.ttk.Progressbar(tempwindow,orient = tkinter.HORIZONTAL, length = 300, mode = 'determinate')

        progN.pack()

        progN.update()

        tempwindow.geometry("500x200")

        tempwindow.update()

        List = []

        List.append( '<roblox xmlns:xmime="http://www.w3.org/2005/05/xmlmime" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.roblox.com/roblox.xsd" version="4"><Meta name="ExplicitAutoJoints">true</Meta><External>null</External><External>nil</External><Item class="{classname}"><Properties><BinaryString name="AttributesSerialize"></BinaryString><bool name="AutoLocalize">true</bool><int name="DisplayOrder">0</int><bool name="Enabled">true</bool><bool name="IgnoreGuiInset">false</bool><string name="Name">PNGtoGUI</string><bool name="ResetOnSpawn">true</bool><Ref name="RootLocalizationTable">null</Ref><int64 name="SourceAssetId">-1</int64><BinaryString name="Tags"></BinaryString><token name="ZIndexBehavior">1</token></Properties>'.format(classname=ConversionType.get()))
        width,height = img.size
        print(width,height)
        #preview = tkinter.ttk.Canvas(tempwindow,bg="gray",height=height,width=width)
        #preview.pack()
        #preview.update()
        for xp in range(width):
            for yp in range(height):
                colors = img.getpixel((xp,yp))
                List.append('<Item class="Frame">')
                List.append(baseProperties.format(xpos = xp*typesZoom[Zoom.get()], ypos = yp*typesZoom[Zoom.get()],size=typesZoom[Zoom.get()], cR = colors[0]/255, cG = colors[1]/255, cB = colors[2]/255))
                List.append('</Item>')
                #preview.create_line(xp,yp,xp+1,yp+1,fill=rgbtohex(colors[0],colors[1],colors[2]))
                #threading.Thread(target=preview.update,daemon=True)
            prog["text"] = str(math.floor(100*(xp/width))) + "% complete"
            prog.update()
            progN["value"] = math.floor(100*(xp/width))
            progN.update()
        List.append("	</Item></roblox>")
        result = "".join(List)
        def saveFile():
            ftaa = [("Roblox Model Files","*.rbxmx")]
            savedas = tkinter.filedialog.asksaveasfile(mode="w",filetypes=ftaa,defaultextension=".rbxmx")
            if savedas:
                savedas.write(result)
                savedas.close()
        prog["text"] = "Conversion completed!"
        progN["value"] = 100
        svbtn = tkinter.ttk.Button(tempwindow,text="Save", command=saveFile)
        svbtn.place(relx=0.5,rely=1,anchor=tkinter.S)
        tkinter.ttk.Button(tempwindow,text="Close window", command=tempwindow.destroy).place(relx=1,rely=1,anchor=tkinter.SE)
        def openStudio():
            tmpFile= "C:/Users/{}/AppData/Local/Temp/{}.rbxmx".format(getpass.getuser(),math.floor(time.time()))
            Path(tmpFile).write_text(result)
            cmd = '{}\\{}\\RobloxStudioBeta.exe "{}"'.format(str(RobloxStudioPath.parents[0]).replace("/","\\"),RobloxStudioPath.name,tmpFile)
            subprocess.Popen(cmd)
        tkinter.ttk.Button(tempwindow,text="Open in Roblox Studio", command=openStudio).place(relx=0,rely=1,anchor=tkinter.SW)

def ImportFile():
    global ConversionType
    global typesZoom
    global Zoom    
    n = tkinter.filedialog.askopenfile(mode="r")
    if n:
        filename = n.name
        img = Image.open(filename)
        convert(img,Path(n.name).name)
        
        

    
def Notes():
    newwin = ThemedTk(theme=Themes[THEMEV][0])
    newwin.config(bg=Themes[THEMEV][1])
    tkinter.ttk.Label(newwin,text="This works the fastest with images\n with a resolution of 150x150 or under.\n\nWritten by split#1337").place(relx=0.5,rely=0.5,anchor=tkinter.CENTER)
    newwin.title("Notes")
    newwin.geometry("250x250")

def Resize():
    n = tkinter.filedialog.askopenfile(mode="r")
    if n:
        img = None
        try:
            img = Image.open(n.name)
            width,height = img.size
            ask = ThemedTk(theme=Themes[THEMEV][0])
            ask.config(bg=Themes[THEMEV][1])
            ask.title("New Resolution")
            wV = tkinter.IntVar()
            hV = tkinter.IntVar()
            wV.set(width)
            hV.set(height)
            wTB = tkinter.ttk.Entry(ask,textvariable=wV)
            tkinter.ttk.Label(ask,text="Width").grid(column=0,row=0)
            wTB.insert(0,str(width))
            wTB.grid(column=1,row=0)
            hTB = tkinter.ttk.Entry(ask,textvariable=hV)
            hTB.insert(0,str(height))
            hTB.grid(column=1,row=1)
            tkinter.ttk.Label(ask,text="Height").grid(column=0,row=1)
            def finsize():
                savedas = tkinter.filedialog.asksaveasfile(mode="w",filetypes=[("All Files","*.*")])
                if savedas:
                    newFile = img.resize((int(wTB.get()),int(hTB.get())))
                    newFile.save(savedas.name)
                    ask.destroy()
            tkinter.ttk.Button(ask,text="OK",command=finsize).grid(column=2,row=0)
        except:
            print("Not an image")

def fromScreenshot():
    global ScreenshotSize
    scrw = int(ScreenshotSize.get().split("x")[0])
    scrh = int(ScreenshotSize.get().split("x")[1])
    if not "pyautogui" in sys.modules:
        windowaa = ThemedTk(theme=Themes[THEMEV][0])
        windowaa.config(bg=Themes[THEMEV][1])
        tkinter.ttk.Label(windowaa,text="From Screenshot uses pyautogui.\n\nPlease install pyautogui with pip\n(pip install pyautogui)\nand restart to use\nthis feature.").place(relx=0.5,rely=0.5,anchor=tkinter.CENTER)
    else:
        Show = tkinter.Toplevel()
        Show.attributes("-topmost",True)
        Show.config(bg="#22272e")
        Show.overrideredirect(1)
        Show.attributes("-alpha",0.25)
        Show.geometry(ScreenshotSize.get())
        Doco = tkinter.BooleanVar()
        Doco.set(True)
        def SetDocoFalse():
            Doco.set(False)
        Canv = tkinter.Canvas(Show,width=scrw,height=scrh)
        Canv.config(bg="#22272e")
        FB = Canv.create_rectangle((0,0,scrw+3,scrh+3),fill="#22272e")
        Canv.tag_bind(FB,"<Button-1>",lambda event: SetDocoFalse())
        Canv.place(x=-2,y=-2)
        while Doco.get():
            mpXa,mpYa = pyautogui.position()
            Show.geometry("+{}+{}".format(int(mpXa-(scrw/2)),int(mpYa-(scrh/2))))
            Show.update()
            time.sleep(1/60)
        Show.destroy()
        mpX,mpY = pyautogui.position()
        print(mpX,mpY)
        scrsht = pyautogui.screenshot(region=(mpX-(scrw/2),mpY-(scrh/2),scrw,scrh))
        if DoSaveScreenshotsAuto:
            scrsht.save("C:/Users/{}/AppData/Local/I2G/screenshots/{}.png".format(getpass.getuser(),math.floor(time.time())))
        sX,sY = scrsht.size
        ask = ThemedTk(theme=Themes[THEMEV][0])
        ask.config(bg=Themes[THEMEV][1])
        tkinter.ttk.Label(ask,text="Is this OK?").pack()
        pic = tkinter.Canvas(ask,bg="gray",height=sY,width=sX)
        print(sX,sY)
        for xp in range(sX):
            for yp in range(sY):
                colors = scrsht.getpixel((xp,yp))
                pic.create_line(xp+2,yp+2,xp+3,yp+3,fill=rgbtohex(colors[0],colors[1],colors[2]))
        pic.pack()
        def convertt():
            ask.destroy()
            convert(scrsht, "Screenshot")
        tkinter.ttk.Button(ask,text="Yes",command=convertt).pack()
        tkinter.ttk.Button(ask,text="No",command=ask.destroy).pack()
        ask.geometry("350x350")
        ask.title("Is this OK?")


cicon = """
iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACG0lEQVR4nL3W3YuNURQG8N+ZD18l46tGKB3kQiFDSBguJEku5M9wISW516TkQv4NkpJGyYxJiCmmXEpNIRMzDCVjZlzsc+p4z37NPjPnPU+tetvvXns9e+21n73Ix2JsQ+d/5hSKffiGYdzCOZTR1ioCFzGbsUm8wA2cwcYiCdyLEMjaBIbQh5NY12iQUs54F97OY8EveIMnGKx8jzVKCg5hxtwZmMs+4QEuV9ZcmUrgShOCx2wUd3FBKPIleQT6CyJQa9+xJRZ8DT63gMArdMbu9C6szUtNEzGEqRiBIy0IDgPUq1pJqNai8QMvYz+68VXaGf5JnBezZyqb78gQ6JF2V38JUrwKR3EAm7E0wZdw/jOxH9cSdzDiXxVdJEjxVKL/qapjbQ20ST//p5WFqviNFeozGsOEcAXrCKzH9kQC/ZGx44m+I4JE1xHYg+UJC0zhp9CwVNGO/YkEBtVkrzZlvYkLdOIO3gnV/EiQ1XKi/0BssF04l/leq+nEeWNyVLYspLVo/X+YDVytgb1YFk1YczGYR6C3BcFnYwQIIvJa8en/KKKybcL5p1bwQjCM8exgB97jGA4KT3GPYtrtx6kTuypkLuE+Plh4+qeFB6sOeW15LVZjBw4Lb8VOoW1rBKOCzE826BdFN07gqtD/j5s7A7ebETgPG3Aa1/FckOUsgfNFEqhFCZtwFjeFtmscu1tFIIsObBW0Joq/88FEMErAWM0AAAAASUVORK5CYII=
"""

def SettingsFunc():
    windowaa = ThemedTk(theme=Themes[THEMEV][0])
    windowaa.config(bg=Themes[THEMEV][1])
    windowaa.title("Settings")
    Names = []
    SelectedThemeVar = tkinter.StringVar()
    TSS = ScreenshotSizes
    for x in Themes:
        print(x[0])
        Names.append(x[0])
    def scrshtSizes():
        editora = ThemedTk(theme=Themes[THEMEV][0])
        editora.config(bg=Themes[THEMEV][1])
        editora.title("Screenshot Size Workshop")
        ButtonsS = []
        def Update_Screenshot_Sizes():
            for x in ButtonsS:
                x.destroy()
            
            def make(v):
                lVar = v
                def delSelf():
                    TSS.remove(lVar)
                    Update_Screenshot_Sizes()
                Btn = tkinter.ttk.Button(editora,text=x,command=delSelf)
                ButtonsS.append(Btn)
                Btn.grid(column=1,row=TSS.index(lVar),padx=(10,10))

            for x in TSS:
                make(x)
            
            Btn = tkinter.ttk.Button(editora,text="New...",command=MkNew)
            ButtonsS.append(Btn)
            bottom = len(TSS)-1
            if bottom < 0:
                bottom = 0
            Btn.grid(column=2,row=bottom)
            Txt = tkinter.ttk.Label(editora,text="Click on a size to\nremove it.\n\nCreate a new size\n by clicking on the\n\"New...\" button.")
            ButtonsS.append(Txt)
            Txt.grid(column=2,row=bottom+1,padx=(10,10))
                

        def MkNew():
            try:
                ask = ThemedTk(theme=Themes[THEMEV][0])
                ask.config(bg=Themes[THEMEV][1])
                ask.title("Add")
                wVa = tkinter.StringVar()
                hVa = tkinter.StringVar()
                wV = tkinter.ttk.Entry(ask,textvariable=wVa)
                wV.grid(column=1,row=0)
                tkinter.ttk.Label(ask,text="Width").grid(column=0,row=0)
                hV = tkinter.ttk.Entry(ask,textvariable=hVa)
                hV.grid(column=1,row=1)
                tkinter.ttk.Label(ask,text="Height").grid(column=0,row=1)
                def finsize():
                    if int(wV.get()) and int(hV.get()):
                        TSS.append(str(wV.get()) + "x" + str(hV.get()))
                        Update_Screenshot_Sizes()
                    ask.destroy()
                tkinter.ttk.Button(ask,text="OK",command=finsize).grid(column=2,row=0)
            except:
                print("ERR!")

    
        Update_Screenshot_Sizes()
    def saveSettings():
        pos = 0
        for x in Themes:
            if x[0] == SelectedThemeVar.get():
                pos = Themes.index(x)
        Path("C:/Users/{}/AppData/Local/I2G/settings.json".format(getpass.getuser())).write_text(json.dumps([pos,TSS,ilikeurcutg,RobloxStudioPath.name]))
        exit()
    tkinter.ttk.Label(windowaa,text="Theme").pack()
    SelectedThemeVar.set(Themes[THEMEV][0])
    tkinter.ttk.OptionMenu(windowaa,SelectedThemeVar,0,*Names).pack()
    tkinter.ttk.Label(windowaa,text="Screenshot Settings").pack()
    tkinter.ttk.Button(windowaa,text="Size Workshop",command=scrshtSizes).pack()
    ilikeurcutg = 0
    def CB():
        nonlocal ilikeurcutg
        if ilikeurcutg == 0:
            ilikeurcutg = 1
        else:
            ilikeurcutg = 0
    DSB = tkinter.ttk.Checkbutton(windowaa,command=CB,text="Save screenshots to folder")
    DSB.pack()
    if DoSaveScreenshotsAuto:
        DSB.invoke()
    command = 'explorer "{}"'.format("C:\\Users\\{}\\AppData\\Local\\I2G\\screenshots".format(getpass.getuser()))
    tkinter.ttk.Button(windowaa,text="Open screenshots folder",command=lambda: subprocess.Popen(command)).pack()
    #tkinter.ttk.Label(windowaa,text="Keybinds").pack()
   
    tkinter.ttk.Button(windowaa,text="Save & Exit App",command = saveSettings).place(relx=0.5,rely=1,anchor=tkinter.S)
    windowaa.geometry("250x250")
    

icon = tkinter.PhotoImage(data=cicon)
Main.iconphoto(icon,icon)

Main.protocol("WM_DELETE_WINDOW",exit)

tkinter.ttk.Button(text="Click to convert an image file", command=ImportFile).place(relx=0.5,rely=0.5,anchor=tkinter.CENTER)
tkinter.ttk.Button(text="Notes", command=Notes).place(relx=0,rely=1,anchor=tkinter.SW)
tkinter.ttk.Button(text="Settings", command=SettingsFunc).place(relx=0.5,rely=1,anchor=tkinter.S)
tkinter.ttk.Button(text="Resize image", command=Resize).place(relx=1,rely=1,anchor=tkinter.SE)
tkinter.ttk.Button(text="From screenshot", command=fromScreenshot).place(relx=1,rely=1,y=-30,anchor=tkinter.SE)
tkinter.ttk.Label(text="Image to Roblox GUI").place(relx=0,rely=0,anchor=tkinter.NW)
Main.geometry("350x350")
Main.title("I2RG Plus")

ConversionType = tkinter.StringVar()
ConversionType.set("ScreenGui") # default value

Zoom = tkinter.StringVar()
Zoom.set("None") # default value

ScreenshotSize = tkinter.StringVar()
ScreenshotSize.set("150x150") # default value

#PreviewEnabled = tkinter.ttk.IntVar()

tkinter.ttk.OptionMenu(Main, ConversionType, "Frame", "ScreenGui","Frame","Folder","SurfaceGui","BillboardGui").place(relx=1,rely=0,anchor=tkinter.NE)
tkinter.ttk.OptionMenu(Main, Zoom, "None", "None","x2","x3","x4","x6","x8").place(relx=1,rely=0,y=30,anchor=tkinter.NE)
tkinter.ttk.OptionMenu(Main, ScreenshotSize,"150x150", *ScreenshotSizes).place(relx=1,rely=0,y=60,anchor=tkinter.NE)
#tkinter.ttk.Checkbutton(Main,text="Preview (SLOW!)", variable = PreviewEnabled, onvalue = 1, offvalue = 0, height=0, width=12).place(relx=1,rely=0,y=60,anchor=tkinter.ttk.NE)

Main.mainloop()