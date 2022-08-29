-- assets.lua

local Assets = {}

Assets.getAsset = getsynasset or getcustomasset
Assets.request = (syn or {}).request or request

function Assets.Logger(log)
    
end

function Assets.new(callsign)
    local pointer = string.format("%s.apt",callsign)

    local assets = table.clone(Assets)
    
    assets.pointer = pointer
    assets.callsign = callsign
    
    if (isfile(pointer)) then
        assets:update()
    else
        assets.AssetList = {}
    end

    return assets
end

function Assets:Get(url)
    if (self.AssetList[url]) then
        return Assets.getAsset(self.AssetList[url])
    else
        self.AssetList[url] = Assets.download(url)
        self:save()
        return self:Get(url)
    end
end

function Assets:save()
    writefile(self.pointer,game:GetService("HttpService"):JSONEncode(self.AssetList))
end

function Assets:update()
    self.AssetList = game:GetService("HttpService"):JSONDecode(readfile(self.pointer))
end

function Assets.roughMimeToExt(mime)
    local dict = {
        ["video/quicktime"]="mov"
    }

    local tmp = string.split(mime,"/")[2]:split("x-")

    return dict[mime] or tmp[#tmp]
end

function Assets.download(url)
    local guid = game:GetService("HttpService"):GenerateGUID(false)
    local asset = Assets.request({Url=url,Method="GET"})

    local ext = Assets.roughMimeToExt(asset.Headers["Content-Type"] or asset.Headers["content-type"])
    writefile(string.format("%s.%s",guid,ext),asset.Body)
    Assets.Logger(string.format("Downloaded %s (%sB)",url,asset.Body:len()))
    return string.format("%s.%s",guid,ext)
end

return Assets