from django.urls import path, re_path
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
    path('get_order_status_count', views.get_order_status_count, name='get_order_status_count'),
    path('save_table', views.save_table, name='save_table'),
    path('get_table_list', views.get_table_list, name='get_table_list'),
    path('get_settings', views.get_settings, name='get_settings'),
    path('get_my_orders', views.get_my_orders, name='get_my_orders'),
    path('delete_table', views.delete_table, name='delete_table'),
    path('submit_review', views.submit_review, name='submit_review'),
    path('get_single_order', views.get_single_order, name='get_single_order'),
    path('confirm_order_payment', views.confirm_order_payment, name='confirm_order_payment'),
    path('save_user', views.save_user, name='save_user'),
    path('get_user_list', views.getUserList, name='get_user_list'),
    path('get_user_detail', views.getUserDetail, name='get_user_detail'),
    path('get_review_list', views.get_review_list, name='get_review_list'),
    re_path(r"^.*$", views.index),
]