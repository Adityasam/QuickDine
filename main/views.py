from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import *
import json
import os
from django.conf import settings
import shutil
import isodate
from django.forms.models import model_to_dict
from django.utils.timezone import now

# Create your views here.
MENU_ITEM_PREFIX = "MIT"
OPTION_GROUP_PREFIX = "OPG"
MENU_OPTION_PREFIX = "MOP"
ITEM_OPTION_PREFIX = "IOP"
ORDER_CODE_PREFIX = "ORD"

def index(request):
    return redirect("http://localhost:3000")

@csrf_exempt
def get_category(request):
    cats = Category.objects.filter(Active = True, Deleted = False)
    cats = list(cats.values())
    return JsonResponse(cats, safe=False)

def trimText(text):
    newtext = ""
    for t in text:
        newtext += str.strip(t)
    return newtext

@csrf_exempt
def save_menu_item(request):
    data = json.loads(request.POST.get("data"))
    code = data.get("code", "")
    name = data.get("name", "")
    available = data.get("available", False)
    category = data.get("category", "")
    description = data.get("description", "")
    price = data.get("price", 0)
    options = data.get("optionGroup", [])
    tags = data.get("tags", [])
    prepTime = data.get("prepTime", 0)
    images = request.FILES

    exists = MenuItem.objects.filter(Name = name)
    if len(exists) > 0 and code == "":
        return JsonResponse({"status": 400, "message": "Name already exists"})

    lastCode = 0
    lastItem = MenuItem.objects.last()
    if lastItem:
        lastCode = lastItem.Code
        lastCode = int(lastCode.split("-")[1])

    lastCode += 1
    iCode = MENU_ITEM_PREFIX + "-" + str(lastCode).zfill(5)
    menuItem = MenuItem.objects.filter(Code = code)
    if len(menuItem) == 0:
        menuItem = MenuItem()
        menuItem.Code = iCode
    else:
        menuItem = menuItem[0]
        iCode = menuItem.Code
    menuItem.Name = name
    menuItem.Available = available
    menuItem.CategoryCode = category
    menuItem.Description = description
    menuItem.Price = price
    menuItem.Tags = ",".join(tags)
    menuItem.PreparationTime = prepTime
    menuItem.save()

    #Saving images
    image_folder = os.path.join(settings.MENU_IMAGE_PATH, iCode)
    if os.path.exists(image_folder):
        try:
            shutil.rmtree(image_folder)
        except:
            pass
    for im in images:
        save_path = os.path.join(settings.MENU_IMAGE_PATH, iCode, images[im].name)

        # Ensure the directory exists
        os.makedirs(os.path.dirname(save_path), exist_ok=True)

        # Save the image to the path
        with open(save_path, 'wb') as f:
            for chunk in images[im].chunks():
                f.write(chunk)

    #Creating options group
    for o in options:
        items = o.get("items", [])
        opCode = o.get("code", "")
        maxSelection = o.get("maxSelection", 1)
        title = o.get("title", "")
        type = o.get("type", "single")

        lcode = 0
        litem = OptionGroup.objects.last()
        if litem:
            lcode = litem.Code
            lcode = int(lcode.split("-")[1])

        lcode += 1
        gCode = OPTION_GROUP_PREFIX + "-" + str(lcode).zfill(5)
        newOptionGroup = OptionGroup.objects.filter(Code = opCode)
        if len(newOptionGroup) == 0:
            newOptionGroup = OptionGroup()
            newOptionGroup.Code = gCode
        else:
            newOptionGroup = newOptionGroup[0]
            gCode = newOptionGroup.Code
        newOptionGroup.Name = title
        newOptionGroup.MaxSelection = maxSelection
        newOptionGroup.SelectionType = type
        newOptionGroup.ItemCode = code
        newOptionGroup.save()

        #Saving option group items
        for i in items:
            iCode = i.get("code", "")
            lastOpCode = 0
            lastOpItem = MenuOption.objects.last()
            if lastOpItem:
                lastOpCode = lastOpItem.Code
                lastOpCode = int(lastOpCode.split("-")[1])

            lastOpCode += 1
            option = MenuOption.objects.filter(Code = iCode)
            if len(option) == 0:
                option = MenuOption()
                option.Code = MENU_OPTION_PREFIX + "-" + str(lastOpCode).zfill(5)
            else:
                option = option[0]
            option.Name = i.get("name", "")
            option.Price = i.get("price", 0)
            option.GroupCode = gCode
            option.save()

    return JsonResponse({"status": 1})

@csrf_exempt
def get_menu_desktop(request):
    menus = MenuItem.objects.filter(Deleted = False).values()
    menus = list(menus)
    for m in menus:
        cat = m.get("CategoryCode", "")
        catData = Category.objects.get(Code = cat)
        m["CategoryName"] = catData.Name

        directory_path = os.path.join(settings.MENU_IMAGE_PATH, m["Code"])
        if os.path.isdir(directory_path):
            files = [f for f in os.listdir(directory_path) if os.path.isfile(os.path.join(directory_path, f))]
            m["Images"] = files

    return JsonResponse(menus, safe=False)

@csrf_exempt
def get_menu_mobile(request):
    menus = MenuItem.objects.filter(Available = True, Deleted = False).values()
    menus = list(menus)
    for m in menus:
        directory_path = os.path.join(settings.MENU_IMAGE_PATH, m["Code"])
        if os.path.isdir(directory_path):
            files = [f for f in os.listdir(directory_path) if os.path.isfile(os.path.join(directory_path, f))]
            m["Images"] = files

    return JsonResponse(menus, safe=False)

def single_item_detail(itemcode):
    item = MenuItem.objects.filter(Code = itemcode)
    images = []
    if len(item) > 0:
        oGs = list(OptionGroup.objects.filter(ItemCode = itemcode).values())
        for og in oGs:
            ogCode = og.get("Code", "")
            options = list(MenuOption.objects.filter(GroupCode = ogCode).values())
            og["Options"] = options

        #images
        directory_path = os.path.join(settings.MENU_IMAGE_PATH, itemcode)
        if os.path.isdir(directory_path):
            files = [f for f in os.listdir(directory_path) if os.path.isfile(os.path.join(directory_path, f))]
            images = files

    data = list(item.values())
    data = data[0] if len(data) > 0 else {}
    return data, images

@csrf_exempt
def get_single_menu_item(request):
    itemcode = json.loads(request.body).get("code", "")
    item, images = single_item_detail(itemcode)
    if len(item) > 0:
        oGs = list(OptionGroup.objects.filter(ItemCode = itemcode).values())
        for og in oGs:
            ogCode = og.get("Code", "")
            options = list(MenuOption.objects.filter(GroupCode = ogCode).values())
            og["Options"] = options

        return JsonResponse({"status": 1, "data": item, "options": oGs, "images": images}, safe=False)
    else:
        return JsonResponse({"status": 0, "message": "Menu item not found"})
    
@csrf_exempt
def update_menu_item_staus(request):
    id = json.loads(request.body).get("id", None)
    status = json.loads(request.body).get("status", False)
    field = json.loads(request.body).get("field", "available")
    item = MenuItem.objects.filter(id = id)
    if len(item) > 0:
        item = item[0]
        if field == "available":
            item.Available = status
        elif field == "delete":
            item.Deleted = True
        item.LastModifiedBy = "admin"
        item.save()
        return JsonResponse({"status": 1, "message": "success"})
    else:
        return JsonResponse({"status": 0, "message": "Menu item not found"})
    
@csrf_exempt
def save_order(request):
    body = json.loads(request.POST.get("data"))
    ordercode = body.get("code", "")
    items = body.get("items", {})
    note = body.get("note", "")
    paymentstatus = body.get("payment", "L")

    #Creating main order
    order = Order()
    if ordercode != "":
        order = Order.objects.filter(Code = ordercode)
        if len(order) > 0:
            order = order[0]
    else:
        lastentry = Order.objects.last()
        if lastentry:
            lastcode = int(lastentry.Code.split("-")[1])
            order.Code = ORDER_CODE_PREFIX + "-"+(str(lastcode+1).zfill(10))
        else:
            order.Code = ORDER_CODE_PREFIX + "-0000000001"
    
    customerid = request.session["userid"] if "userid" in request.session else ""
    
    order.CustomerId = customerid
    order.Note = note
    order.Status = "P"
    order.PaymentStatus = paymentstatus
    order.save()

    newordercode = order.Code
    # Delete order items if any exists
    OrderItem.objects.filter(OrderCode = newordercode).delete()
    OrderOptions.objects.filter(OrderCode = newordercode).delete()

    # Creating order items
    for item in items:
        newitem = OrderItem()
        newitem.OrderItemCode = item
        newitem.OrderCode = newordercode
        newitem.Price = items.get(item).get("info").get("price")
        newitem.Quantity = items.get(item).get("info").get("quantity")
        newitem.save()

        # Creating extra options for each item
        options = items.get(item).get("options")
        for option in options:
            optiondata = options.get(option)
            for opitem in optiondata:
                newoption = OrderOptions()
                newoption.OrderCode = newordercode
                newoption.OrderItemCode = item
                newoption.GroupCode = option
                newoption.OptionCode = opitem
                newoption.Price = optiondata.get(opitem).get("price")
                newoption.save()

    return JsonResponse({"status": 1, "message": "success"})

@csrf_exempt
def getOrders(request):
    status = json.loads(request.body).get("status", "A")
    orders = []
    temporders = Order.objects.filter(Status = status)
    for order in temporders:
        neworder = model_to_dict(order)
        duration = now() - order.OrderTime
        total_minutes = int(duration.total_seconds() // 60)
        neworder["TimeElapsed"] = total_minutes
        neworder["Time"] = order.OrderTime.strftime("%I:%M %p")
        items = list(OrderItem.objects.filter(OrderCode = order.Code).values())
        neworder["Items"] = []
        for item in items:
            itemdetail, images = single_item_detail(item.get("OrderItemCode"))

            orderops = []
            options = OrderOptions.objects.filter(OrderCode = order.Code, OrderItemCode = item.get("OrderItemCode"))
            for option in options:
                op = MenuOption.objects.filter(Code = option.OptionCode)
                if len(op) > 0:
                    op = model_to_dict(op[0])
                    orderops.append(op)
            
            neworder["Items"].append({
                "data": itemdetail,
                "images": images,
                "orderitem": item,
                "addons": orderops
            })

        orders.append(neworder)
    return JsonResponse({"status": 1, "data": orders})

@csrf_exempt
def update_order_status(request):
    ordercode = json.loads(request.body).get("code")
    status = json.loads(request.body).get("status")
    order = Order.objects.filter(Code = ordercode)
    if len(order) > 0:
        order = order[0]
        order.Status = status
        order.save()
        return JsonResponse({"status": 1, "message": "Order status updated"})
    else:
        return JsonResponse({"status": 0, "message": "Order not found"})