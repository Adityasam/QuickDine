from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('get_category', views.get_category, name='get_category'),
    path('save_menu_item', views.save_menu_item, name='save_menu_item'),
    path('get_menu_desktop', views.get_menu_desktop, name='get_menu_desktop'),
    path('get_single_menu_item', views.get_single_menu_item, name='get_single_menu_item'),
    path('get_menu_mobile', views.get_menu_mobile, name='get_menu_mobile'),
    path('update_menu_item_staus', views.update_menu_item_staus, name='update_menu_item_staus'),
    path('save_order', views.save_order, name='save_order'),
    path('get_orders', views.getOrders, name='get_orders'),
    path('update_order_status', views.update_order_status, name='update_order_status'),
]