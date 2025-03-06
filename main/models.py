from django.db import models

# Create your models here.

class Category(models.Model):
  Code = models.CharField(max_length = 20, default=None, null = True, blank = True)
  Name = models.CharField(max_length = 200, default=None, null = True, blank = True)
  Active = models.BooleanField(default = True)
  Deleted = models.BooleanField(default = False)
  CreatedBy = models.CharField(max_length = 200, default=None, null = True, blank = True)
  CreatedDate = models.DateTimeField(auto_now_add = True)
  LastModifiedBy = models.CharField(max_length = 200, default=None, null = True, blank = True)
  LastModified = models.DateTimeField(auto_now = True)

class MenuItem(models.Model):
  Code = models.CharField(max_length = 20, default=None, null = True, blank = True)
  Name = models.CharField(max_length = 200, default=None, null = True, blank = True)
  Image = models.CharField(max_length = 200, default=None, null = True, blank = True)
  Description = models.TextField(default=None)
  Tags = models.TextField(default=None, null = True, blank = True)
  PreparationTime = models.PositiveIntegerField(default=0)
  CategoryCode = models.CharField(max_length = 20, default=None, null = True, blank = True)
  Price = models.FloatField(default=0.0)
  Available = models.BooleanField(default = True)
  Deleted = models.BooleanField(default = False)
  CreatedBy = models.CharField(max_length = 200, default=None, null = True, blank = True)
  CreatedDate = models.DateTimeField(auto_now_add = True)
  LastModifiedBy = models.CharField(max_length = 200, default=None, null = True, blank = True)
  LastModified = models.DateTimeField(auto_now = True)

class MenuOption(models.Model):
  Code = models.CharField(max_length = 20, default=None, null = True, blank = True)
  Name = models.CharField(max_length = 200, default=None, null = True, blank = True)
  Price = models.FloatField(default=0)
  GroupCode = models.CharField(max_length = 20, default=None, null = True, blank = True)
  Active = models.BooleanField(default = True)
  Deleted = models.BooleanField(default = False)
  CreatedBy = models.CharField(max_length = 200, default=None, null = True, blank = True)
  CreatedDate = models.DateTimeField(auto_now_add = True)
  LastModifiedBy = models.CharField(max_length = 200, default=None, null = True, blank = True)
  LastModified = models.DateTimeField(auto_now = True)

class OptionGroup(models.Model):
  Code = models.CharField(max_length = 20, default=None, null = True, blank = True)
  ItemCode = models.CharField(max_length = 20, default=None, null = True, blank = True)
  Name = models.CharField(max_length = 200, default=None, null = True, blank = True)
  SelectionType = models.CharField(max_length = 20, default=None, null = True, blank = True)
  MaxSelection = models.PositiveIntegerField(default = 1)
  Active = models.BooleanField(default = True)
  Deleted = models.BooleanField(default = False)
  CreatedBy = models.CharField(max_length = 200, default=None, null = True, blank = True)
  CreatedDate = models.DateTimeField(auto_now_add = True)
  LastModifiedBy = models.CharField(max_length = 200, default=None, null = True, blank = True)
  LastModified = models.DateTimeField(auto_now = True)

class Order(models.Model):
  Code = models.CharField(max_length = 20, default=None, null = True, blank = True)
  ShortCode = models.CharField(max_length = 20, default=None, null = True, blank = True)
  CustomerId = models.CharField(max_length = 100, default=None, null = True, blank = True)
  TableNo = models.PositiveIntegerField(default = 0, null = True, blank = True)
  Note = models.TextField(default=None, null = True, blank = True)
  Status = models.CharField(max_length = 10, default=None, null = True, blank = True) # Status Codes P = Pending, A = Accepted, R = Ready, S = Served
  PaymentStatus = models.CharField(max_length = 10, default=None, null = True, blank = True) # Payment Status L = Pay Later, P = Paid, R = Received
  Discount = models.FloatField(default = 0, null = True, blank = True)
  OrderTime = models.DateTimeField(auto_now_add = True)
  CompletionTime = models.DateTimeField(default = None,  null = True, blank = True)

class OrderItem(models.Model):
  OrderCode = models.CharField(max_length = 20, default=None, null = True, blank = True)
  OrderItemCode = models.CharField(max_length = 20, default=None, null = True, blank = True)
  Price = models.FloatField(default = 0)
  Quantity = models.PositiveIntegerField(default = 1)

class OrderOptions(models.Model):
  OrderCode = models.CharField(max_length = 20, default=None, null = True, blank = True)
  OrderItemCode = models.CharField(max_length = 20, default=None, null = True, blank = True)
  GroupCode = models.CharField(max_length = 20, default=None, null = True, blank = True)
  OptionCode = models.CharField(max_length = 20, default=None, null = True, blank = True)
  Price = models.FloatField(default = 0)

class Table(models.Model):
  TableNo = models.CharField(max_length = 200, default=None, null = True, blank = True)
  Deleted = models.BooleanField(default = False)

class AppSetting(models.Model):
  AppURL = models.CharField(max_length = 500, default=None, null = True, blank = True)
  PaymentEnable = models.BooleanField(default = False)

class Review(models.Model):
  OrderCode = models.CharField(max_length = 20, default=None, null = True, blank = True)
  Star = models.PositiveIntegerField(default = 0, null = True, blank = True)
  Remark = models.TextField(default = None, null = True, blank = True)

class MyUser(models.Model):
  UserID = models.CharField(max_length = 20, default=None, null = True, blank = True) 
  FullName = models.CharField(max_length = 200, default=None, null = True, blank = True) 
  Password = models.CharField(max_length = 100, default=None, null = True, blank = True) 
  Active = models.BooleanField(default=True, null = True, blank = True) 
  Deleted = models.BooleanField(default=False, null = True, blank = True) 