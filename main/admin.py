from django.contrib import admin
from .models import *

class CategoryAdmin(admin.ModelAdmin):
    list_display = ['Code','Name']

admin.site.register(Category, CategoryAdmin)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ['Code','Name']

admin.site.register(MenuItem, MenuItemAdmin)
class MenuOptionAdmin(admin.ModelAdmin):
    list_display = ['Code','Name']

admin.site.register(MenuOption, MenuOptionAdmin)
class OptionGroupAdmin(admin.ModelAdmin):
    list_display = ['Code','Name']

admin.site.register(OptionGroup, OptionGroupAdmin)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['Code','OrderTime']

admin.site.register(Order, OrderAdmin)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['OrderCode','OrderItemCode']

admin.site.register(OrderItem, OrderItemAdmin)
class OrderOptionsAdmin(admin.ModelAdmin):
    list_display = ['OrderCode','OrderItemCode', 'OptionCode']

admin.site.register(OrderOptions, OrderOptionsAdmin)