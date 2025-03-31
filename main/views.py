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
from django.utils.timezone import now, localtime

# Create your views here.
MENU_ITEM_PREFIX = "MIT"
OPTION_GROUP_PREFIX = "OPG"
MENU_OPTION_PREFIX = "MOP"
ITEM_OPTION_PREFIX = "IOP"
ORDER_CODE_PREFIX = "ORD"

def index(request):
    if settings.DEVMODE:
        return redirect("http://localhost:3000")
    else:
        return render(request, "index.html")
    
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
    menus = MenuItem.objects.filter(Deleted = False)
    alldata = []
    for m in menus:
        menudata, images, options, cat = single_item_detail(m.Code)
        menudata["CategoryName"] = cat
        menudata["Options"] = options
        menudata["Images"] = images

        alldata.append(menudata)

    return JsonResponse(alldata, safe=False)

@csrf_exempt
def get_menu_mobile(request):
    menus = MenuItem.objects.filter(Available = True, Deleted = False)
    alldata = []
    for m in menus:
        menudata, images, options, cat = single_item_detail(m.Code)
        menudata["CategoryName"] = cat
        menudata["Options"] = options
        menudata["Images"] = images

        alldata.append(menudata)

    return JsonResponse(alldata, safe=False)

def single_item_detail(itemcode):
    item = MenuItem.objects.filter(Code = itemcode)
    images = []
    categoryName = ""
    itemoptions = []
    if len(item) > 0:
        cat = item[0].CategoryCode
        if cat != "":
            catData = Category.objects.get(Code = cat)
            categoryName = catData.Name

        oGs = list(OptionGroup.objects.filter(ItemCode = itemcode).values())
        for og in oGs:
            ogCode = og.get("Code", "")
            options = list(MenuOption.objects.filter(GroupCode = ogCode).values())
            og["Options"] = options
        itemoptions = oGs

        #images
        directory_path = os.path.join(settings.MENU_IMAGE_PATH, itemcode)
        if os.path.isdir(directory_path):
            files = [f for f in os.listdir(directory_path) if os.path.isfile(os.path.join(directory_path, f))]
            images = files

    data = list(item.values())
    data = data[0] if len(data) > 0 else {}
    return data, images, itemoptions, categoryName

@csrf_exempt
def get_single_menu_item(request):
    itemcode = json.loads(request.body).get("code", "")
    item, images, io, cat = single_item_detail(itemcode)
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
    tableno = request.POST.get("tableno")
    body = json.loads(request.POST.get("data"))
    ordercode = body.get("code", "")
    items = body.get("items", {})
    note = body.get("note", "")
    paymentstatus = body.get("payment", "L")
    orderstatus = body.get("orderstatus", "P")

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

        todaysOrders = Order.objects.filter(OrderTime__date = localtime(now()).date()).last()
        if todaysOrders:
            lastcode = int(todaysOrders.ShortCode)
            order.ShortCode = (str(lastcode+1).zfill(4))
        else:
            order.ShortCode = "0001"
    
    customerid = request.POST.get("userid")
    
    order.CustomerId = customerid
    order.Note = note
    order.Status = orderstatus
    order.TableNo = tableno
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
        if "options" in items.get(item):
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

def get_single_order_detail(order):
    neworder = model_to_dict(order)
    endtime = now() if not order.CompletionTime else localtime(order.CompletionTime)
    duration = endtime - order.OrderTime
    total_minutes = int(duration.total_seconds() // 60)
    neworder["TimeElapsed"] = total_minutes
    neworder["Time"] = localtime(order.OrderTime).strftime("%I:%M %p")
    neworder["OrderTime"] = localtime(order.OrderTime).strftime("%d/%m/%y %I:%M %p")
    neworder["CompletionTime"] = localtime(order.CompletionTime)
    items = list(OrderItem.objects.filter(OrderCode = order.Code).values())
    neworder["Items"] = []
    for item in items:
        itemdetail, images, io, cat = single_item_detail(item.get("OrderItemCode"))

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

    #ratings
    reviews = list(Review.objects.filter(OrderCode = order.Code).values())
    neworder["Reviews"] = reviews
    return neworder

@csrf_exempt
def get_single_order(request):
    code = json.loads(request.body).get("code", "")
    order = Order.objects.filter(Code = code)
    detail = {}
    if len(order) > 0:
        order = order[0]
        detail = get_single_order_detail(order)
    return JsonResponse({"status": 1, "detail": detail})

@csrf_exempt
def getOrders(request):
    status = json.loads(request.body).get("status", "A")
    orders = []
    temporders = Order.objects.filter(Status = status)
    for order in temporders:
        neworder = get_single_order_detail(order)
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
        if status == "S":
            order.CompletionTime = now()
        order.save()
        return JsonResponse({"status": 1, "message": "Order status updated"})
    else:
        return JsonResponse({"status": 0, "message": "Order not found"})
    
@csrf_exempt
def get_order_status_count(request):
    orders = Order.objects.all()
    status = {}
    for order in orders:
        if order.Status not in status:
            status[order.Status] = 1
        else:
            status[order.Status] += 1

    return JsonResponse({"status": 1, "data": status})

@csrf_exempt
def save_table(request):
    tableno = json.loads(request.body).get("tableno", "")
    old = Table.objects.filter(TableNo = tableno, Deleted = False)
    if len(old) > 0:
        return JsonResponse({"status": 2, "message": "Table no already exists"})
    tab = Table()
    tab.TableNo = tableno
    tab.save()
    return JsonResponse({"status": 1, "message": "Table created"})

@csrf_exempt
def save_user(request):
    userid = json.loads(request.body).get("userid", "")
    name = json.loads(request.body).get("name", "")
    password = json.loads(request.body).get("password", "")
    active = json.loads(request.body).get("active", "")

    old = MyUser.objects.filter(UserID = userid, Deleted = False)
    if len(old) > 0:
        old = old[0]
    else:
        old = MyUser()
    old.UserID = userid
    old.FullName = name
    old.Password = password
    old.Active = True if active == "1" else "0"
    old.save()
    return JsonResponse({"status": 1, "message": "User Saved"})

@csrf_exempt
def delete_table(request):
    tableno = json.loads(request.body).get("tableno", "")
    old = Table.objects.filter(TableNo = tableno)
    if len(old) > 0:
        old = old[0]
        old.Deleted = True
        old.save()

    return JsonResponse({"status": 1, "message": "Table Deleted"})

@csrf_exempt
def get_table_list(request):
    tables = list(Table.objects.filter(Deleted = False).order_by("TableNo").values())
    return JsonResponse({"data": tables})

@csrf_exempt
def get_settings(request):
    sett = list(AppSetting.objects.all().values())
    if len(sett) > 0:
      return JsonResponse({"settings": sett[0]})
    else:
      return JsonResponse({"settings": {}})
    
@csrf_exempt
def get_my_orders(request):
    userid = json.loads(request.body).get("userid", "")
    orders = Order.objects.filter(CustomerId = userid).order_by("-OrderTime")
    allorders = []
    for order in orders:
        neworder = get_single_order_detail(order)
        allorders.append(neworder)
    return JsonResponse({"status": 1, "data": allorders})

@csrf_exempt
def submit_review(request):
    code = json.loads(request.body).get("ordercode", "")
    remark = json.loads(request.body).get("remark", "")
    star = json.loads(request.body).get("star", "")
    
    review = Review()
    review.OrderCode = code
    review.Remark = remark
    review.Star = star
    review.save()
    return JsonResponse({"status": 1})

@csrf_exempt
def confirm_order_payment(request):
    code = json.loads(request.body).get("code")
    discount = json.loads(request.body).get("discount")
    order = Order.objects.filter(Code = code)
    if len(order) > 0:
        order = order[0]
        order.PaymentStatus = "P"
        order.Discount = float(discount)
        order.save()

    return JsonResponse({"status": 1})

@csrf_exempt
def getUserList(request):
    user = list(MyUser.objects.filter(Deleted = False).values())
    return JsonResponse({"status": 1, "users": user})

@csrf_exempt
def getUserDetail(request):
    userid = json.loads(request.body).get("userid", "")
    user = list(MyUser.objects.filter(UserID = userid).values())
    if len(user) > 0:
        return JsonResponse({"status": 1, "detail": user[0]})
    else:
        return JsonResponse({"status": 0, "message": "User not found"})
    
@csrf_exempt
def get_review_list(request):
    review = Review.objects.all()
    data = []
    for r in review:
        newr = model_to_dict(r)
        order = Order.objects.filter(Code = r.OrderCode)
        if len(order) > 0:
            order = order[0]
            newr["OrderTime"] = localtime(order.OrderTime).strftime("%d/%m/%y %I:%M %p")
        data.append(newr)
    return JsonResponse({"stauts": 1, "data": data})